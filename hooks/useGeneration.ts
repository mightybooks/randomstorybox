// /hooks/useGeneration.ts
import { useCallback, useRef, useState } from "react";

type Phase = "idle" | "writing" | "done";

export function useGeneration() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const isSubmitting = useRef(false); // 중복 제출 방지 가드

  const generate = useCallback(async (payload: any) => {
    if (isSubmitting.current) return; // 이미 진행 중이면 막기
    isSubmitting.current = true;
    setError("");
    setPhase("writing");
    setText("");

    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`요청 실패: ${res.status}`);
      const data = await res.json();
      // 최소: data.text만 사용 (검증은 나중 단계)
      setText(data.text ?? "");
      setPhase("done");
    } catch (e: any) {
      setError(e?.message ?? "알 수 없는 오류");
      setPhase("idle");
    } finally {
      isSubmitting.current = false;
    }
  }, []);

  return { phase, text, error, isSubmitting: isSubmitting.current, generate };
}
