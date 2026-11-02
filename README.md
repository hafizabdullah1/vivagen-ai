# VivaGen AI

AI-assisted technical interview workspace — generate questions, score answers, get hire recommendations, and export PDF reports.

## Live demo

[https://vivagen-ai.vercel.app](https://vivagen-ai.vercel.app)

## Key features

- Supabase auth (signup/login) with RLS on interview data
- Create interviews by candidate, role, level, and language
- Gemini-powered question generation and regeneration
- Live scoring (0–10) + notes; running totals and percentage
- AI summary: strengths, weaknesses, hire recommendation
- PDF export of interview reports (`jspdf`)
- Usage tracking by month; admin page for oversight
- Product scope + SaaS launch notes in-repo

## Tech stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 + React 19 + TypeScript |
| UI | Tailwind + Radix/shadcn-style components |
| Auth / DB | Supabase (Postgres + RLS) |
| AI | Google Gemini (`@google/generative-ai`) |
| Hosting | Vercel |

## Architecture (brief)

```
Next.js pages (dashboard, interview/[id], summary)
    │
    ├─ API: /api/generate-questions | regenerate-question | generate-summary
    │         └─ Gemini (GEMINI_API_KEY)
    └─ Supabase client (SSR + RLS)
              └─ interviews, interview_questions, interview_summary, usage_tracking
```

Schema references: `supabase-schema.sql`, `supabase-admin-schema.sql`.

## Getting started

### Prerequisites

- Node.js 18+
- Supabase project
- Google AI Studio / Gemini API key

### Install

```bash
git clone https://github.com/hafizabdullah1/vivagen-ai.git
cd vivagen-ai
npm install
```

### Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `GEMINI_API_KEY` | Yes | Server-only Gemini key |

Run SQL from `supabase-schema.sql` (and admin schema if needed), then:

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Deployment

- Deploy on Vercel; set all three env vars (keep `GEMINI_API_KEY` server-only).
- Homepage field already points at the Vercel app.

## Roadmap

- [ ] Stripe billing / plan limits from `saas_launch_plan.md`
- [ ] Team seats and shared scorecards
- [ ] Add tests, CI, MIT license
- [ ] Social preview image and richer README on GitHub

## Author

**Hafiz Abdullah** — [GitHub](https://github.com/hafizabdullah1) · [hafizabdullah.site](https://hafizabdullah.site)
