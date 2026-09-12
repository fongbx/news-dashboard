import * as cheerio from "cheerio";
import type { Story } from "./types";

const CODECUT_URL = "https://codecut.ai/";
const RUNDOWN_GUIDES_URL = "https://www.therundown.ai/guides";

const HTML_ENTITIES: Record<string, string> = {
  "&#8217;": "’",
  "&#8216;": "‘",
  "&#8220;": "“",
  "&#8221;": "”",
  "&#8211;": "–",
  "&#8212;": "—",
  "&amp;": "&",
  "&nbsp;": " ",
};

function stripHtml(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, "").trim();
  return withoutTags.replace(
    /&#8217;|&#8216;|&#8220;|&#8221;|&#8211;|&#8212;|&amp;|&nbsp;/g,
    (match) => HTML_ENTITIES[match]
  );
}

async function scrapeCodecut(): Promise<Story[]> {
  const res = await fetch(CODECUT_URL, { next: { revalidate: 1800 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch codecut.ai: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const posts: Story[] = [];

  $("article").each((_, el) => {
    const titleEl = $(el).find("h2 a, h3 a").first();
    const title = titleEl.text().trim();
    const url = titleEl.attr("href");
    const summary = $(el).find("p").first().text().trim();
    const imageUrl = $(el).find("img").first().attr("src");

    const isRealPost = url && !url.replace(CODECUT_URL, "").match(/^blog\/?$/);

    if (title && url && isRealPost) {
      posts.push({
        id: url,
        laneId: "ai",
        title,
        summary,
        url,
        sources: ["codecut.ai"],
        publishedAt: new Date().toISOString(),
        imageUrl,
        isBlogPost: true,
      });
    }
  });

  return posts.slice(0, 5);
}

// therundown.ai/guides is a static Next.js page: each card is an <a> whose
// child <h3> holds the title and whose child <img> holds the thumbnail.
async function scrapeRundownGuides(): Promise<Story[]> {
  const res = await fetch(RUNDOWN_GUIDES_URL, {
    next: { revalidate: 1800 },
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch therundown.ai/guides: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const posts: Story[] = [];
  const seen = new Set<string>();

  $("h3").each((_, el) => {
    const anchor = $(el).closest("a");
    const title = $(el).text().trim();
    const href = anchor.attr("href");
    const imageUrl = anchor.find("img").first().attr("src");

    if (title && href && !seen.has(href)) {
      seen.add(href);
      posts.push({
        id: href,
        laneId: "ai",
        title,
        summary: "",
        url: href,
        sources: ["therundown.ai"],
        publishedAt: new Date().toISOString(),
        imageUrl,
        isBlogPost: true,
      });
    }
  });

  return posts.slice(0, 5);
}

interface SubstackPost {
  title: string;
  subtitle?: string;
  description?: string;
  cover_image?: string;
  canonical_url: string;
  post_date: string;
}

// Both aiadopters.club and oneusefulthing.org are Substack newsletters.
// Substack exposes a public JSON API at /api/v1/posts even on custom
// domains, which is far more reliable than scraping their React-rendered
// HTML (which returns empty markup to a plain fetch).
async function scrapeSubstack(baseUrl: string, sourceName: string): Promise<Story[]> {
  const res = await fetch(`${baseUrl}/api/v1/posts?limit=5`, {
    next: { revalidate: 1800 },
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${sourceName}: ${res.status}`);
  }

  const posts = (await res.json()) as SubstackPost[];

  return posts.map((post) => ({
    id: post.canonical_url,
    laneId: "ai",
    title: post.title,
    summary: post.subtitle ?? post.description ?? "",
    url: post.canonical_url,
    sources: [sourceName],
    publishedAt: post.post_date,
    imageUrl: post.cover_image,
    isBlogPost: true,
  }));
}

// codecut.ai and therundown.ai don't expose reliable per-post dates on
// their listing pages, so posts are interleaved round-robin across
// sources rather than sorted by (partly fabricated) publishedAt — that
// guarantees every source is represented instead of the undated sources
// silently crowding out the genuinely-dated Substack posts.
function interleave(lists: Story[][]): Story[] {
  const result: Story[] = [];
  const maxLength = Math.max(0, ...lists.map((list) => list.length));

  for (let i = 0; i < maxLength; i++) {
    for (const list of lists) {
      if (list[i]) result.push(list[i]);
    }
  }

  return result;
}

export async function scrapeAiBlogPosts(): Promise<Story[]> {
  const results = await Promise.allSettled([
    scrapeCodecut(),
    scrapeRundownGuides(),
    scrapeSubstack("https://aiadopters.club", "aiadopters.club"),
    scrapeSubstack("https://www.oneusefulthing.org", "oneusefulthing.org"),
  ]);

  const lists = results.map((result) => {
    if (result.status === "fulfilled") return result.value;
    console.error("AI blog scrape failed", result.reason);
    return [];
  });

  return interleave(lists);
}
