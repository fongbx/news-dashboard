import type { Story } from "./types";

interface TheNewsApiArticle {
  uuid: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  image_url?: string;
}

interface TheNewsApiResponse {
  data: TheNewsApiArticle[];
}

// Reputable Singapore news domains. TheNewsAPI's `top` endpoint doesn't
// carry Singapore-specific outlets on this plan, and keyword search
// ("Singapore") returns loosely related global stories, so the SG lane
// is filtered by domain on the broader `all` endpoint instead.
const SG_DOMAINS = "channelnewsasia.com,straitstimes.com,todayonline.com,mothership.sg";

export async function fetchSgStories(): Promise<Story[]> {
  return fetchFromEndpoint("all", { domains: SG_DOMAINS, language: "en" }, "sg");
}

// AP only publishes stories that clear a real significance bar, which
// filters out the mix of local/soft-news items that TheNewsAPI's generic
// "top"/"general" category otherwise includes. Reuters is excluded because
// it returns zero results on this plan's `top` endpoint (tested directly);
// CNN is a backup source that only surfaces if AP is thin at request time,
// since results are sorted by recency and AP fills the slots first.
const WORLD_DOMAINS = "apnews.com,cnn.com";

export async function fetchWorldStories(): Promise<Story[]> {
  return fetchFromEndpoint("top", { domains: WORLD_DOMAINS, language: "en" }, "world");
}

async function fetchFromEndpoint(
  endpoint: "top" | "all",
  extraParams: Record<string, string>,
  laneId: "sg" | "world"
): Promise<Story[]> {
  const apiKey = process.env.THENEWSAPI_KEY;
  if (!apiKey) {
    throw new Error("THENEWSAPI_KEY is not set");
  }

  const params = new URLSearchParams({
    api_token: apiKey,
    limit: "3",
    sort: "published_at",
    ...extraParams,
  });

  const res = await fetch(
    `https://api.thenewsapi.com/v1/news/${endpoint}?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`TheNewsAPI request failed for lane ${laneId}: ${res.status}`);
  }

  const json = (await res.json()) as TheNewsApiResponse;

  return json.data.map((article) => ({
    id: article.uuid,
    laneId,
    title: article.title,
    summary: article.description ?? "",
    url: article.url,
    sources: [article.source],
    publishedAt: article.published_at,
    imageUrl: article.image_url,
  }));
}
