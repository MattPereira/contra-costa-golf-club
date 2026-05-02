# Rebuild Plan

## Build Order

### 1. Schema design (on paper, no code)
- Sketch core tables: `players`, `courses`, `holes`, `rounds`, `scores`, `tournaments`.
- Extract from old repo: existing schema shape + handicap/points formulas. Ignore old patterns.
- Goal: a clean, normalized Postgres schema before writing a single line of code.

### 2. Project scaffold
- `create-next-app` (App Router, TypeScript).
- Wire up Drizzle + Neon (dev branch + prod branch).
- Configure Auth.js v5 with Google OAuth + Resend magic links.
- Push initial schema with `drizzle-kit`.
- Deploy a "hello world" to Vercel to confirm the pipeline works.

### 3. Vertical slice: manual score entry
- Auth-gated form to enter a round by hand.
- Server Action → Drizzle insert → DB.
- Basic list/detail view of rounds.
- Proves the full stack end-to-end with zero AI. Also serves as the manual fallback path.

### 4. Vertical slice: handicap & points calculation
- Port scoring math from the old app as pure functions.
- Unit tests on the formulas (these are the one place tests really pay off).
- Render a leaderboard/results table.

### 5. Vertical slice: scorecard photo upload (AI #1)
- Upload to Vercel Blob.
- Vercel AI SDK `generateObject` with vision + Zod schema for scorecard structure.
- Show parsed result side-by-side with the original photo for human confirmation before saving.
- Persist both the image URL and the parsed scores.

### 6. Vertical slice: chat over the database (AI #2)
- Vercel AI SDK `streamText` with tool-calling.
- Tools: `queryRounds`, `queryPlayers`, `queryCourses`, etc. — each hits Drizzle directly.
- No RAG, no vector store. Schema is relational, tools are the right pattern.

### 7. Course images & polish
- Course photo uploads to Vercel Blob.
- Mobile-first UI pass.
- README focused on portfolio narrative: structured-output OCR, tool-calling chat, Neon DB branching, type-safe Server Actions.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript |
| Database | Neon (serverless Postgres, scales to zero, branching per PR) |
| ORM | Drizzle + drizzle-kit |
| Auth | Auth.js v5 — Google OAuth + email magic links |
| Email (magic links) | Resend |
| AI SDK | Vercel AI SDK |
| LLM (vision + chat) | Claude Sonnet 4.6 or GPT-4o |
| Image storage | Vercel Blob |
| Hosting | Vercel |
| Styling | Tailwind CSS + shadcn/ui |
| Validation | Zod (schemas for Server Actions + AI structured output) |
