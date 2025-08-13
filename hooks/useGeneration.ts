import { useCallback, useRef, useState } from "react";
import { GenerateRequest, GenerateResponse } from "../lib/schemas";
import { apiFetch } from "../lib/apiClient";

export type GenPhase = "idle" | "writing" | "done";

export function useGeneration() {
  const [phase, setPhase] = useState<GenPhase>("idle");
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const isSubmitting = useRef(false);

  const generate = useCallback(async (raw: unknown) => {
    if (isSubmitting.current) return; // 중복제출 방지
    isSubmitting.current = true;
    setError("");
    setText("");
    setPhase("writing");

    try {
      const payload = GenerateRequest.parse(raw); // ✅ 요청 검증
      const data = await apiFetch<unknown>("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        timeoutMs: 20000,
      });
      const parsed = GenerateResponse.parse(data); // ✅ 응답 검증
      setText(parsed.result);
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
