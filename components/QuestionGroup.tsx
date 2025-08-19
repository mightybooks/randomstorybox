"use client";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

export type QOption = { label: string; value: string };
export type QItem = { id: number; text: string; options: QOption[] };

type Props = {
  q: QItem;
  selected?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
};

function QuestionGroup({ q, selected, onSelect, disabled }: Props) {
  // 현재 선택 인덱스
  const selectedIndex = useMemo(() => {
    const idx = q.options.findIndex((o) => o.value === selected);
    return idx >= 0 ? idx : 0;
  }, [q.options, selected]);

  // 로빙 탭인덱스용 refs
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const focusIndexRef = useRef<number>(selectedIndex);

  // 질문 바뀔 때 포커스 인덱스만 동기화 (refs 배열은 그대로 유지)
  useEffect(() => {
    focusIndexRef.current = selectedIndex;
  }, [q.id, selectedIndex]);

  // roving tabindex 적용
  useLayoutEffect(() => {
    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      el.tabIndex = disabled ? -1 : idx === focusIndexRef.current ? 0 : -1;
    });
  }, [q.id, disabled, q.options.length, selectedIndex]);

  // 문항 진입 시(또는 전환 시) 옵션에 자동 포커스
  useLayoutEffect(() => {
    if (disabled) return;
    const id = requestAnimationFrame(() => {
      const el = itemRefs.current[focusIndexRef.current];
      if (el) el.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [q.id, disabled]);

  const moveFocus = useCallback(
    (delta: number) => {
      if (disabled) return;
      const count = q.options.length;
      const next = (focusIndexRef.current + delta + count) % count;
      focusIndexRef.current = next;
      const el = itemRefs.current[next];
      if (el) {
        el.tabIndex = 0;
        el.focus();
      }
    },
    [disabled, q.options.length]
  );

  const onKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLDivElement>,
      idx: number,
      opt: QOption
    ) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          moveFocus(1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          moveFocus(-1);
          break;
        case "Home":
          e.preventDefault();
          focusIndexRef.current = 0;
          itemRefs.current[0]?.focus();
          break;
        case "End": {
          e.preventDefault();
          const last = q.options.length - 1;
          focusIndexRef.current = last;
          itemRefs.current[last]?.focus();
          break;
        }
        case " ":
        case "Enter":
          e.preventDefault();
          onSelect(opt.value);
          break;
        default:
          // Tab/Shift+Tab은 막지 않습니다 → 자연스러운 그룹 탈출 허용
          break;
      }
    },
    [disabled, moveFocus, onSelect, q.options.length]
  );

  // 선택값이 바뀌면 포커스 인덱스도 동기화(UX 안정)
  useEffect(() => {
    const idx = q.options.findIndex((o) => o.value === selected);
    if (idx >= 0) {
      focusIndexRef.current = idx;
      const el = itemRefs.current[idx];
      if (el) el.tabIndex = 0;
    }
  }, [selected, q.options]);

  return (
    <section className="rsb-qsection" key={q.id}>
      <div className="rsb-qhead">
        <span className="rsb-qno">Q{q.id}</span>
        <span id={`q${q.id}-label`} className="rsb-qtext">
          {q.text}
        </span>
      </div>

      <div
        className="rsb-options"
        role="radiogroup"
        aria-labelledby={`q${q.id}-label`}
      >
        {q.options.map((opt, idx) => {
          const checked = selected === opt.value;
          return (
            <div
              key={opt.value}
              ref={(el: HTMLDivElement | null) => { itemRefs.current[idx] = el; }}
              className={`rsb-option ${checked ? "active" : ""} ${
                disabled ? "is-disabled" : ""
              }`}
              role="radio"
              aria-checked={checked}
              aria-disabled={disabled || undefined}
              tabIndex={-1}
              onKeyDown={(e) => onKeyDown(e, idx, opt)}
              onClick={() => {
                if (!disabled) {
                  focusIndexRef.current = idx;
                  onSelect(opt.value);
                }
              }}
            >
              {/* 실제 폼 연동용(시각 숨김) */}
              <input
                type="radio"
                name={`q${q.id}`}
                value={opt.value}
                checked={checked}
                onChange={() => onSelect(opt.value)}
                style={{ display: "none" }}
                tabIndex={-1}
                aria-hidden="true"
              />
              <span>{opt.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default QuestionGroup;
