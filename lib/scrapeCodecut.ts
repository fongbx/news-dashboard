import * as cheerio from "cheerio";
import type { Story } from "./types";

const CODECUT_URL = "https://codecut.ai/";

export async function scrapeCodecutPosts(): Promise<Story[]> {
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
        isBlogPost: true,
      });
    }
  });

  return posts.slice(0, 5);
}
