"use client";

import type { Story } from "@/lib/types";

const LANE_BG: Record<string, string> = {
  sg: "bg-lane-sg",
  world: "bg-lane-world",
  ai: "bg-lane-ai",
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
      className={`group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:shadow-md ${
        isRead ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-border">
        {story.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${LANE_BG[story.laneId]}`}>
            <span className="font-serif text-2xl text-white/90">
              {story.sources[0]?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {story.sources.length > 1 && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 font-sans text-xs font-medium text-white ${LANE_BG[story.laneId]}`}
          >
            {story.sources.length} sources
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg leading-snug text-ink">
          {story.title}
        </h3>
        {story.summary && (
          <p className="mt-1.5 font-sans text-sm text-muted line-clamp-2">
            {story.summary}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-3 font-sans text-xs text-muted">
          <span className="font-mono">{formatTimestamp(story.publishedAt)}</span>
          <span>&middot;</span>
          <span className="truncate">{story.sources[0]}</span>
          {isRead && <span className="ml-auto text-read">✓ read</span>}
        </div>
      </div>
    </a>
  );
}
