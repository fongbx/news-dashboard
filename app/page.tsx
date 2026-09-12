"use client";

import { useEffect, useState } from "react";
import { LANES, type Digest } from "@/lib/types";
import { LaneColumn } from "@/components/LaneColumn";
import { useReadState } from "@/hooks/useReadState";

export default function Home() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { readIds, markAsRead } = useReadState();

  useEffect(() => {
    fetch("/api/digest")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? "Failed to load digest");
        }
        return res.json();
      })
      .then(setDigest)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-2">
        <h1 className="font-serif text-3xl text-ink">News Dashboard</h1>
        {digest && (
          <p className="mt-1 font-sans text-xs text-muted">
            Last updated {new Date(digest.generatedAt).toLocaleString()}
          </p>
        )}
      </header>

      {error && <p className="font-sans text-sm text-muted">{error}</p>}

      {digest && (
        <div className="divide-y divide-border">
          {LANES.map((lane) => (
            <LaneColumn
              key={lane.id}
              laneId={lane.id}
              label={lane.label}
              stories={digest[lane.id]}
              readIds={readIds}
              onRead={markAsRead}
            />
          ))}
        </div>
      )}
    </main>
  );
}
