import * as cheerio from "cheerio";
import type { Story } from "./types";

const CODECUT_URL = "https://codecut.ai/";
const MARKTECHPOST_API =
  "https://www.marktechpost.com/wp-json/wp/v2/posts?per_page=5&_fields=id,link,title,excerpt,date,jetpack_featured_media_url";

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
  const res = await fetch(CODECUT_URL, { cache: "no-store" });
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

interface MarktechpostPost {
  id: number;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  jetpack_featured_media_url?: string;
}

async function scrapeMarktechpost(): Promise<Story[]> {
  const res = await fetch(MARKTECHPOST_API, {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch marktechpost.com: ${res.status}`);
  }

  const posts = (await res.json()) as MarktechpostPost[];

  return posts.map((post) => ({
    id: post.link,
    laneId: "ai",
    title: stripHtml(post.title.rendered),
    summary: stripHtml(post.excerpt.rendered),
    url: post.link,
    sources: ["marktechpost.com"],
    publishedAt: post.date,
    imageUrl: post.jetpack_featured_media_url,
    isBlogPost: true,
  }));
}

export async function scrapeAiBlogPosts(): Promise<Story[]> {
  const results = await Promise.allSettled([scrapeCodecut(), scrapeMarktechpost()]);

  const posts = results.flatMap((result) => {
    if (result.status === "fulfilled") return result.value;
    console.error("AI blog scrape failed", result.reason);
    return [];
  });

  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
