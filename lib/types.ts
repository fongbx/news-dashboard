export type LaneId = "sg" | "world" | "ai";

export interface Story {
  id: string;
  laneId: LaneId;
  title: string;
  summary: string;
  url: string;
  sources: string[];
  publishedAt: string;
  imageUrl?: string;
  isBlogPost?: boolean;
}

export type Digest = Record<LaneId, Story[]> & {
  generatedAt: string;
};

export const LANES: { id: LaneId; label: string }[] = [
  { id: "sg", label: "Singapore" },
  { id: "world", label: "World" },
  { id: "ai", label: "AI" },
];
