import { useEffect, useState } from "react";

/** 시스템 설정(prefers-reduced-motion)을 감지합니다. */
export function useReducedMotion(defaultValue: boolean = false) {
  const [reduced, setReduced] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return reduced;
}
