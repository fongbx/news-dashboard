import { NextResponse } from "next/server";
import { fetchLaneStories } from "@/lib/newsApi";
import { scrapeCodecutPosts } from "@/lib/scrapeCodecut";
import { dedupeStories } from "@/lib/dedupe";
import { LANES, type Digest } from "@/lib/types";

export const dynamic = "force-dynamic";

const STORIES_PER_LANE = 8;

export async function GET() {
  try {
    const laneResults = await Promise.all(
      LANES.map(async (lane) => {
        const stories = await fetchLaneStories(lane.id);
        return [lane.id, dedupeStories(stories).slice(0, STORIES_PER_LANE)] as const;
      })
    );

    const codecutPosts = await scrapeCodecutPosts();

    const digest: Digest = {
      sg: [],
      world: [],
      ai: [],
      codecut: codecutPosts,
      generatedAt: new Date().toISOString(),
    };

    for (const [laneId, stories] of laneResults) {
      digest[laneId] = stories;
    }

    return NextResponse.json(digest);
  } catch (error) {
    console.error("Failed to build digest", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
