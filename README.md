# News Dashboard

A calm, curated daily digest of Singapore news, world news, and AI news — built to reduce information overload rather than add to it.

## How it works

Loading the page calls `/api/digest`, a single server-side route that assembles three lanes:

- **Singapore** — [TheNewsAPI](https://www.thenewsapi.com/), filtered to Channel NewsAsia, The Straits Times, TODAY, and Mothership.
- **World** — TheNewsAPI, filtered to AP and CNN (wire-service-style sources, to keep out regional/soft-news noise).
- **AI** — scraped directly from four blogs/newsletters: [codecut.ai](https://codecut.ai), [therundown.ai/guides](https://www.therundown.ai/guides), [aiadopters.club](https://aiadopters.club), and [oneusefulthing.org](https://www.oneusefulthing.org) (the last two are Substack newsletters, read via Substack's public JSON API).

Each lane's fetch fails independently — if TheNewsAPI is unavailable, the AI lane (which doesn't depend on it) still loads normally.

Other notable behavior:

- Your `THENEWSAPI_KEY` is only ever read inside `lib/newsApi.ts`, on the server — it never reaches the browser.
- Requests are cached for 30 minutes using Next.js's built-in Data Cache (persists across requests on Vercel, no separate database needed). This keeps repeated page loads from burning through TheNewsAPI's usage quota.
- Read/seen state is stored in your browser's `localStorage`. Once every story in a lane is read, that lane shows a "You're caught up" footer.
- Cards are laid out as an image-forward tile grid (Flipboard-style), one section per lane.

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

4. Deploy: push to GitHub, then import the repo into [Vercel](https://vercel.com) ("Add New → Project"). In the Vercel project's **Settings → Environment Variables**, add `THENEWSAPI_KEY`. No other services need provisioning.

## Known limitations

- TheNewsAPI's free tier caps every query at 3 results and enforces an account-wide usage limit — if you see empty Singapore/World lanes, check your usage on TheNewsAPI's dashboard.
- `lib/scrapeAiBlogs.ts` scrapes codecut.ai and therundown.ai by matching their current HTML structure. If either site's markup changes, that source may silently return nothing (each source fails independently, so it won't break the others).
- codecut.ai and therundown.ai don't expose real per-post publish dates, so AI-lane posts are interleaved round-robin across all four sources rather than sorted by recency.
