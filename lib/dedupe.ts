import type { Story } from "./types";

function normalizeTitle(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((word) => b.has(word)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

const SIMILARITY_THRESHOLD = 0.5;

export function dedupeStories(stories: Story[]): Story[] {
  const kept: { story: Story; tokens: Set<string> }[] = [];

  for (const story of stories) {
    const tokens = normalizeTitle(story.title);
    const match = kept.find(
      (entry) => jaccardSimilarity(entry.tokens, tokens) >= SIMILARITY_THRESHOLD
    );

    if (match) {
      for (const source of story.sources) {
        if (!match.story.sources.includes(source)) {
          match.story.sources.push(source);
        }
      }
    } else {
      kept.push({ story: { ...story, sources: [...story.sources] }, tokens });
    }
  }

  return kept.map((entry) => entry.story);
}
