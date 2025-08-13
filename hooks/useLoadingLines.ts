import { useEffect, useState } from "react";

export function useLoadingLines(active: boolean, total: number, intervalMs = 2000) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active) return;
    setIdx(0);
    const id = setInterval(() => setIdx((i) => (i + 1) % total), intervalMs);
    return () => clearInterval(id);
  }, [active, total, intervalMs]);
  return idx;
}
