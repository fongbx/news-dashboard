import { NextResponse } from "next/server";
import { fetchSgStories, fetchWorldStories } from "@/lib/newsApi";
import { scrapeAiBlogPosts } from "@/lib/scrapeAiBlogs";
import { dedupeStories } from "@/lib/dedupe";
import type { Digest, LaneId, Story } from "@/lib/types";

export const dynamic = "force-dynamic";

const STORIES_PER_LANE = 8;
// Higher cap for AI: posts are interleaved across 4 blog sources, so this
// needs to be a multiple of 4 to give each source equal representation.
const AI_STORIES_PER_LANE = 12;

// Each lane's data source is independent (two different TheNewsAPI queries,
// four scraped blogs), so one failing (e.g. an exhausted API quota) must
// not take down the lanes that succeeded — settle them separately instead
// of a single Promise.all.
async function safeFetch(laneId: LaneId, fetcher: () => Promise<Story[]>): Promise<Story[]> {
  try {
    return await fetcher();
  } catch (error) {
    console.error(`Failed to load lane ${laneId}`, error);
    return [];
  }
}

export async function GET() {
  const [sgStories, worldStories, aiPosts] = await Promise.all([
    safeFetch("sg", fetchSgStories),
    safeFetch("world", fetchWorldStories),
    safeFetch("ai", scrapeAiBlogPosts),
  ]);

  const digest: Digest = {
    sg: dedupeStories(sgStories).slice(0, STORIES_PER_LANE),
    world: dedupeStories(worldStories).slice(0, STORIES_PER_LANE),
    ai: aiPosts.slice(0, AI_STORIES_PER_LANE),
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(digest);
}
