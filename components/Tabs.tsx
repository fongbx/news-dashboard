"use client";

import type { LaneId } from "@/lib/types";
import { LANES } from "@/lib/types";

export function Tabs({
  active,
  onChange,
}: {
  active: LaneId;
  onChange: (lane: LaneId) => void;
}) {
  return (
    <div className="flex border-b border-border md:hidden">
      {LANES.map((lane) => (
        <button
          key={lane.id}
          onClick={() => onChange(lane.id)}
          className={`flex-1 py-3 font-sans text-sm font-medium ${
            active === lane.id
              ? "border-b-2 border-ink text-ink"
              : "text-muted"
          }`}
        >
          {lane.label}
        </button>
      ))}
    </div>
  );
}
