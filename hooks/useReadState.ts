"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllReadIds, markRead } from "@/lib/readState";

export function useReadState() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadIds(getAllReadIds());
  }, []);

  const markAsRead = useCallback((id: string) => {
    setReadIds(markRead(id));
  }, []);

  return { readIds, markAsRead };
}
