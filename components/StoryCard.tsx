"use client";

import type { Story } from "@/lib/types";

const LANE_ACCENT: Record<string, string> = {
  sg: "text-lane-sg",
  world: "text-lane-world",
  ai: "text-lane-ai",
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function StoryCard({
  story,
  isRead,
  onRead,
}: {
  story: Story;
  isRead: boolean;
  onRead: (id: string) => void;
}) {
  return (
    <a
      href={story.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onRead(story.id)}
      className={`block border-b border-border py-4 transition-opacity ${
        isRead ? "opacity-50" : "opacity-100"
      }`}
    >
      <h3 className="font-serif text-lg leading-snug text-ink">
        {story.title}
      </h3>
      {story.summary && (
        <p className="mt-1 font-sans text-sm text-muted line-clamp-2">
          {story.summary}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 font-sans text-xs text-muted">
        <span className="font-mono">{formatTimestamp(story.publishedAt)}</span>
        <span>&middot;</span>
        <span>{story.sources[0]}</span>
        {story.sources.length > 1 && (
          <span
            className={`ml-1 rounded-full border border-border px-2 py-0.5 ${LANE_ACCENT[story.laneId]}`}
          >
            covered by {story.sources.length} sources
          </span>
        )}
        {isRead && <span className="text-read">✓ read</span>}
      </div>
    </a>
  );
}
