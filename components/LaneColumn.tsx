"use client";

import type { LaneId, Story } from "@/lib/types";
import { StoryCard } from "./StoryCard";
import { CaughtUpFooter } from "./CaughtUpFooter";

const LANE_ACCENT: Record<LaneId, string> = {
  sg: "bg-lane-sg",
  world: "bg-lane-world",
  ai: "bg-lane-ai",
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
    <section className="py-6">
      <div className="mb-4 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${LANE_ACCENT[laneId]}`} />
        <h2 className="font-sans text-sm font-semibold uppercase tracking-wide text-ink">
          {label}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
