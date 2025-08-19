import React, { useEffect, useMemo, useRef, KeyboardEvent } from "react";

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

  const items = useMemo(() => q.options.map((o) => o.value), [q.options]);
  const selectedIndex = Math.max(0, items.findIndex((v) => v === selected));
  const focusIndexRef = useRef<number>(selectedIndex >= 0 ? selectedIndex : 0);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // 초기 포커스 인덱스 세팅(로빙 탭인덱스: 하나만 0, 나머지는 -1)
  useEffect(() => {
    focusIndexRef.current = selectedIndex >= 0 ? selectedIndex : 0;
    spanRefs.current.forEach((el, idx) => {
      if (!el) return;
      el.tabIndex = disabled ? -1 : (idx === focusIndexRef.current ? 0 : -1);
    });
  }, [selectedIndex, disabled, items.length]);

  const moveFocus = (next: number) => {
    const len = items.length;
    const clamped = Math.max(0, Math.min(next, len - 1));
    focusIndexRef.current = clamped;
    spanRefs.current.forEach((el, idx) => {
      if (!el) return;
      el.tabIndex = disabled ? -1 : (idx === clamped ? 0 : -1);
    });
    spanRefs.current[clamped]?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLSpanElement>, idx: number, value: string) => {
    // Tab은 기본 동작 그대로 두어 그룹에서 빠져나가게 함
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!disabled) onSelect(value);
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      moveFocus(idx + 1);
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(idx - 1);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      moveFocus(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      moveFocus(items.length - 1);
      return;
    }
  };

  return (
    <section>
      <div className="rsb-qhead">
        <span className="rsb-qno">Q{q.id}</span>
        <span id={labelId} className="rsb-qtext">{q.text}</span>
      </div>

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
              {/* 스크린리더/폼 제출용(탭 순서에서 제외) */}
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

              {/* 실제 키보드 포커스 대상(로빙 탭인덱스) */}
<span
  ref={(el) => { spanRefs.current[i] = el; }}
  className="rsb-option-visual"
  role="radio"
  aria-checked={isActive}
  aria-disabled={isDisabled || undefined}
  // tabIndex는 useEffect에서 0/-1로 설정
  onKeyDown={(e) => handleKey(e, i, opt.value)}
  onClick={() => !isDisabled && onSelect(opt.value)}
  data-testid={`option-${groupName}-${toSlug(opt.value)}`}
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
