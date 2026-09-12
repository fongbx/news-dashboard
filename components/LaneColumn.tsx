"use client";

import type { LaneId, Story } from "@/lib/types";
import { StoryCard } from "./StoryCard";
import { CaughtUpFooter } from "./CaughtUpFooter";

const LANE_BORDER: Record<LaneId, string> = {
  sg: "border-lane-sg",
  world: "border-lane-world",
  ai: "border-lane-ai",
};

export function LaneColumn({
  laneId,
  label,
  stories,
  readIds,
  onRead,
}: {
  laneId: LaneId;
  label: string;
  stories: Story[];
  readIds: Set<string>;
  onRead: (id: string) => void;
}) {
  const allRead = stories.length > 0 && stories.every((s) => readIds.has(s.id));

  return (
    <section className="flex-1 min-w-0">
      <h2
        className={`border-b-2 pb-2 font-sans text-sm font-semibold uppercase tracking-wide text-ink ${LANE_BORDER[laneId]}`}
      >
        {label}
      </h2>
      <div>
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            isRead={readIds.has(story.id)}
            onRead={onRead}
          />
        ))}
      </div>
      {allRead && <CaughtUpFooter />}
      {stories.length === 0 && (
        <p className="py-6 font-sans text-sm text-muted">No stories yet.</p>
      )}
    </section>
  );
}
