# WJ.IA — Multi-Model AI Platform

**Collaborative multi-model AI system with debate, code generation, images, video, and audio.**

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **State:** Zustand + React Query
- **Animations:** Framer Motion + GSAP
- **Database:** PostgreSQL + Prisma
- **Cache:** Redis (Upstash)
- **Auth:** NextAuth.js (Google, GitHub, Discord, Email)
- **AI:** Groq, OpenAI, Anthropic APIs
- **Editor:** Monaco Editor

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your API keys
npm run db:push
npm run dev
```

## Features

- **Multi-Model Debate** — "Council of Sages" system with intelligent routing, parallel responses, judge evaluation, and synthesis
- **Code Editor** — Monaco editor with multi-language support
- **Image Generation** — Flux, Stable Diffusion, DALL-E
- **Video Generation** — Text-to-video, image-to-video
- **Audio** — TTS, music generation, voice cloning
- **Document Analysis** — PDF, Word, Excel chat
- **BYOK** — Bring your own API keys

## Project Structure

```
src/
├── app/            # Next.js App Router pages & API routes
├── components/     # UI, layout, chat, tools components
├── lib/            # Prisma, auth, AI model clients, debate system
├── store/          # Zustand stores
├── types/          # TypeScript types & model definitions
└── middleware.ts   # Auth middleware
```

## License

MIT
