import type { LaneId, Story } from "./types";

interface TheNewsApiArticle {
  uuid: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
}

interface TheNewsApiResponse {
  data: TheNewsApiArticle[];
}

interface LaneQuery {
  endpoint: "top" | "all";
  params: Record<string, string>;
}

// The free plan caps `limit` at 3 and the `top` endpoint ignores `locale`
// filtering reliably, so Singapore news is fetched via `/all` with a
// keyword search instead.
function queryForLane(laneId: LaneId): LaneQuery {
  switch (laneId) {
    case "sg":
      return {
        endpoint: "all",
        params: { search: "Singapore", language: "en" },
      };
    case "world":
      return {
        endpoint: "top",
        params: { language: "en", categories: "general" },
      };
    case "ai":
      return {
        endpoint: "top",
        params: { language: "en", search: "artificial intelligence" },
      };
  }
}

export async function fetchLaneStories(laneId: LaneId): Promise<Story[]> {
  const apiKey = process.env.THENEWSAPI_KEY;
  if (!apiKey) {
    throw new Error("THENEWSAPI_KEY is not set");
  }

  const { endpoint, params: laneParams } = queryForLane(laneId);

  const params = new URLSearchParams({
    api_token: apiKey,
    limit: "3",
    sort: "published_at",
    ...laneParams,
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
  }));
}
