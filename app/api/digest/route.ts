import { NextResponse } from "next/server";
import { fetchSgStories, fetchWorldStories } from "@/lib/newsApi";
import { scrapeAiBlogPosts } from "@/lib/scrapeAiBlogs";
import { dedupeStories } from "@/lib/dedupe";
import type { Digest } from "@/lib/types";

export const dynamic = "force-dynamic";

const STORIES_PER_LANE = 8;

export async function GET() {
  try {
    const [sgStories, worldStories, aiPosts] = await Promise.all([
      fetchSgStories(),
      fetchWorldStories(),
      scrapeAiBlogPosts(),
    ]);

    const digest: Digest = {
      sg: dedupeStories(sgStories).slice(0, STORIES_PER_LANE),
      world: dedupeStories(worldStories).slice(0, STORIES_PER_LANE),
      ai: aiPosts.slice(0, STORIES_PER_LANE),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(digest);
  } catch (error) {
    console.error("Failed to build digest", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
