# Reddit Lead Radar

Describe what you sell, pick a subreddit, and AI scores each recent post **0 to 10 for buying intent**, with the reason, the exact words that show intent, and a reply angle that helps instead of spamming.

## What makes it more than a prompt

- **One batched call.** Up to 20 posts are scored in a single Gemini request with a JSON schema (`src/lib/scorer.ts`).
- **Validated output.** The response is parsed with Zod, scores are clamped, and posts the model skipped are flagged, not silently dropped.
- **Quotes checked in code.** Every evidence quote must appear word for word in the post; otherwise the UI marks it *unverified*.
- **Untrusted input.** Post text is fenced in `<post>` tags and the model is told to ignore instructions inside it.
- **Per-visitor limit** (Upstash Redis when configured, in-memory otherwise).
- **Works without Reddit.** A built-in set of sample posts covers every intent type, and Reddit OAuth is used when credentials are set, because Reddit often blocks anonymous requests from cloud hosts.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Google Gemini via `@google/genai` (structured output) · Zod · Reddit API · Vercel

## Run locally

```bash
cp .env.example .env.local   # add GEMINI_API_KEY (and optionally Reddit credentials)
npm install
npm run dev
```

Built by [Shah Sawar](https://shahsawar.dev). It is the lead-scoring step for a Reddit monitoring SaaS I built in Node.js with a Redis queue and real-time matching.
