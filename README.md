# News Dashboard

A calm, curated daily digest of Singapore news, world news, AI news, and posts from [codecut.ai](https://codecut.ai) — built to reduce information overload rather than add to it.

## How it works

- When you load the page, the frontend calls `/api/digest`, a server-side route that fetches Singapore/World/AI stories from [TheNewsAPI](https://www.thenewsapi.com/), scrapes recent posts from codecut.ai, deduplicates near-identical stories, and trims each lane to the top 8.
- Your API key is only ever read inside that server-side route — it never reaches the browser.
- Read/seen state is stored in your browser's `localStorage`. Once every story in a lane is read, that lane shows a "You're caught up" footer.

This is the simple version: no database, no caching, no scheduled jobs. Each page load fetches fresh data directly, which is fine for a personal dashboard you open a handful of times a day. The tradeoff is a couple seconds of load time per visit, and using a bit more of your TheNewsAPI daily quota per refresh.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` (or `.env.local`) and add your key:
   ```
   THENEWSAPI_KEY=your_key_here
   ```

3. Run locally:
   ```
   npm run dev
   ```

4. Deploy: push this repo to GitHub, then import it into [Vercel](https://vercel.com) ("Add New → Project"). In the Vercel project's **Settings → Environment Variables**, add `THENEWSAPI_KEY`. That's it — no other services to provision.

## Known follow-ups

- `lib/scrapeCodecut.ts` targets codecut.ai's current HTML structure (`<article>` elements with `h2/h3 > a` headlines). Verify the selectors still match if the blog's theme changes.
- Two low-priority npm audit findings remain, both inside Next.js's own bundled dev-only PostCSS dependency (source-map path traversal, dev server only) — resolving them requires upgrading to Next.js 16, which is a breaking change left for a deliberate follow-up.
- If TheNewsAPI's free-tier rate limit ever becomes a problem from frequent page reloads, revisit adding a cache (e.g. Upstash Redis + a cron refresh) — the code was structured so `lib/newsApi.ts`, `lib/scrapeCodecut.ts`, and `lib/dedupe.ts` can be reused as-is by a scheduled job later.
