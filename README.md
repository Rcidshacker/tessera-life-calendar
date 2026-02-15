# Tessera - Your Life in Dots

Personal life calendar visualizing your 4,680 weeks with AI-powered journaling.

## Features

- 📊 Life visualization grid (weeks lived vs remaining)
- 📝 Personal journaling with mood tracking
- 🤖 AI-powered life coaching (OpenRouter/Llama 3.3)
- 🎯 Custom milestone tracking
- 🔄 Multi-device sync (Supabase)
- 🔐 Google OAuth authentication

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS + Shadcn/UI
- Supabase (Auth + PostgreSQL)
- OpenRouter AI
- Deployed on [Netlify](https://tessera-life-calendar.netlify.app)

## Setup

```bash
git clone https://github.com/Rcidshacker/tessera-life-calendar
cd tessera-life-calendar
npm install
cp .env.example .env.local
# Add your environment variables
npm run dev
```

## Environment Variables

See .env.example for required variables.

## License

MIT
