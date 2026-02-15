import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenRouter client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Tessera",
  }
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings, stats, journalEntries } = body;

    // Validate required data
    if (!settings?.birthdate || !journalEntries) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Filter entries with actual journal content
    const entriesWithContent = journalEntries.filter(
      (entry: any) => entry.journal && entry.journal.trim().length > 0
    );

    if (entriesWithContent.length === 0) {
      return NextResponse.json({
        insights: "Start journaling to receive personalized insights!",
        patterns: ["No journal entries yet"],
        suggestions: ["Begin by reflecting on your current week"],
        encouragement: "Your life story is waiting to be written."
      });
    }

    // Prepare context for AI
    const journalSummary = entriesWithContent
      .slice(-10) // Last 10 entries
      .map((e: any) =>
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

    // Call OpenRouter API
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct:free", // Free tier, 70B parameters
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
      response_format: { type: "json_object" }, // Force JSON response
    });

    // Parse response
    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Clean and parse JSON (remove markdown if present)
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let insightData;
    try {
      insightData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON response", cleanedText);
      throw new Error("Invalid JSON response from AI");
    }

    return NextResponse.json({
      ...insightData,
      model: completion.model,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('AI Insights Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        details: error.message
      },
      { status: 500 }
    );
  }
}
