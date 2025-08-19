import React from "react";

export function ResultView({
  text,
  isWriting,
  loadingLines,
  loadingIdx,
  error,
}: {
  text: string;
  isWriting: boolean;
  loadingLines: string[];
  loadingIdx: number;
  error?: string;
}) {
  return (
    <section className="rsb-result">
      <article className="rsb-story whitespace-pre-line">
        {text ? (
          text.split("\n").map((raw, i) => {
            const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw; // CRLF 대응
            return line.trim() ? <p key={i}>{line}</p> : <br key={i} />;
          })
        ) : isWriting ? (
          // ✅ 여기서 role/aria-live 적용
          <div role="status" aria-live="polite">
            <p className="rsb-wip">
              {loadingLines[loadingIdx % loadingLines.length]}
            </p>
          </div>
        ) : (
          <p className="rsb-wip">이야기를 정리하는 중…</p>
        )}
      </article>

      {error && (
        <p role="alert" className="rsb-notice" style={{ color: "crimson" }}>
          {error}
        </p>
      )}
    </section>
  );
}
