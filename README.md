# Tessera - Your Life in Dots

Tessera is a personal life calendar application that visualizes an individual's 4,680 weeks (based on an 80-year lifespan) with integrated AI-powered journaling. 

## Development Methodology: Vibe Coding

This repository was engineered utilizing a **Vibe Coding** methodology—an AI-assisted, natural-language-driven development paradigm. By orchestrating advanced Large Language Models (LLMs) to handle boilerplate and implementation details in a flow state, development velocity was significantly increased, allowing engineering focus to remain purely on system architecture, data flow, and product design.

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
