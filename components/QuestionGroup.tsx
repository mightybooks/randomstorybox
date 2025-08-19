import React, { KeyboardEvent } from "react";

type QOption = { label: string; value: string };
export type QItem = { id: number; text: string; options: QOption[] };

const toSlug = (s: string) =>
  s.toString().trim().toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

export function QuestionGroup({
  q,
  selected,
  onSelect,
  disabled,
}: {
  q: QItem;
  selected?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}) {
  const groupName = `q${q.id}`;
  const labelId = `lbl-${groupName}`;

  // 화살표키로 같은 그룹 내 이전/다음 포커스 이동
  const handleKey = (e: KeyboardEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    const rg = el.getAttribute("data-rg");
    if (!rg) return;

    const items = Array.from(
      document.querySelectorAll<HTMLSpanElement>(`.rsb-option-visual[data-rg="${rg}"]`)
    );
    const idx = Number(el.getAttribute("data-idx") || "0");

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      el.click(); // 라벨 클릭 트리거 → onSelect 호출
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[Math.min(idx + 1, items.length - 1)];
      next?.focus();
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[Math.max(idx - 1, 0)];
      prev?.focus();
      return;
    }
  };

  return (
    <section>
      <div className="rsb-qhead">
        <span className="rsb-qno">Q{q.id}</span>
        <span id={labelId} className="rsb-qtext">{q.text}</span>
      </div>

      {/* 질문–옵션 의미 연결 */}
      <div className="rsb-options" role="radiogroup" aria-labelledby={labelId}>
        {q.options.map((opt, i) => {
          const id = `${groupName}-${toSlug(opt.value)}`;
          const isActive = selected === opt.value;
          const isDisabled = !!disabled;

          return (
            <label
              key={id}
              htmlFor={id}
              className={`rsb-option ${isActive ? "active" : ""} ${isDisabled ? "is-disabled" : ""}`}
              aria-disabled={isDisabled || undefined}
            >
              {/* 스크린리더/폼용: 탭 순서에서는 제외 */}
              <input
                id={id}
                type="radio"
                name={groupName}
                value={opt.value}
                checked={isActive}
                onChange={() => onSelect(opt.value)}
                disabled={isDisabled}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />

              {/* 실제 포커스 받는 시각 요소 */}
              <span
                className="rsb-option-visual"
                role="radio"
                aria-checked={isActive}
                aria-disabled={isDisabled || undefined}
                tabIndex={isDisabled ? -1 : 0}
                data-rg={groupName}
                data-idx={i}
                onKeyDown={handleKey}
                onClick={() => !isDisabled && onSelect(opt.value)}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
