import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: false,
    })
  : null;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Tessera",
  }
});

const JournalEntrySchema = z.object({
  weekNumber: z.number(),
  age: z.number(),
  lifePhase: z.string().max(50),
  mood: z.string().max(20).optional(),
  journal: z.string().max(5000),
});

const InsightsRequestSchema = z.object({
  settings: z.object({
    birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    lifeExpectancy: z.number().min(1).max(150),
    name: z.string().max(100).optional(),
  }),
  stats: z.object({
    lifeScore: z.number().min(0).max(100),
  }),
  journalEntries: z.array(JournalEntrySchema).max(100),
});

const InsightsResponseSchema = z.object({
  insights: z.string(),
  patterns: z.array(z.string()),
  suggestions: z.array(z.string()),
  encouragement: z.string(),
});

export async function POST(request: Request) {
  try {
    // Auth check — must be authenticated to call OpenRouter
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 requests/minute per user IP
    if (ratelimit) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    }

    const rawBody = await request.json();
    const parsed = InsightsRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 422 });
    }

    const { settings, stats, journalEntries } = parsed.data;

    const entriesWithContent = journalEntries.filter(
      (entry) => entry.journal && entry.journal.trim().length > 0
    );

    if (entriesWithContent.length === 0) {
      return NextResponse.json({
        insights: "Start journaling to receive personalized insights!",
        patterns: ["No journal entries yet"],
        suggestions: ["Begin by reflecting on your current week"],
        encouragement: "Your life story is waiting to be written."
      });
    }

    const journalSummary = entriesWithContent
      .slice(-10)
      .map((e) =>
        `Week ${e.weekNumber} (Age ${e.age}, ${e.lifePhase}): Mood: ${e.mood || 'not rated'} - "${e.journal}"`
      )
      .join('\n');

    const prompt = `You are a wise and compassionate AI life coach analyzing a person's life journey through their "Life in Dots" - a visual calendar where each week of their life is represented as a dot.

**User Profile:**
- Name: ${settings.name || 'User'}
- Born: ${settings.birthdate}
- Life Expectancy: ${settings.lifeExpectancy} years
- Current Life Score: ${stats.lifeScore}/100

**Recent Journal Entries:**
${journalSummary}

Based on this data, provide a thoughtful analysis in JSON format with these exact keys:
{
  "insights": "A 2-3 paragraph reflection on their life patterns, growth, and journey",
  "patterns": ["pattern1", "pattern2", "pattern3"],
  "suggestions": ["actionable suggestion1", "suggestion2", "suggestion3"],
  "encouragement": "A single inspiring closing thought"
}

Be personal, insightful, and constructive. Focus on their unique story.`;

    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [
        {
          role: 'system',
          content: 'You are a wise life coach AI that provides thoughtful, personalized insights. Always respond with valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch {
      console.error('AI Insights: failed to parse JSON response');
      throw new Error('Invalid JSON response from AI');
    }

    const validated = InsightsResponseSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.error('AI Insights: unexpected response shape', validated.error.issues);
      return NextResponse.json({ error: 'Unexpected response from AI service' }, { status: 502 });
    }

    return NextResponse.json({
      ...validated.data,
      model: completion.model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Insights Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
