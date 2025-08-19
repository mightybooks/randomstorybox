// 변경/추가 포인트만 발췌
import React, { useEffect, useMemo, useRef, useCallback } from "react";

export function QuestionGroup({ q, selected, onSelect, disabled }: { /* ... */ }) {
  const selectedIndex = useMemo(() => {
    const i = q.options.findIndex(o => o.value === selected);
    return i >= 0 ? i : 0;
  }, [q.options, selected]);

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const focusIndexRef = useRef<number>(selectedIndex);

  // ★ 질문 바뀔 때 refs 초기화
  useEffect(() => {
    itemRefs.current = [];
    focusIndexRef.current = selectedIndex;
  }, [q.id, selectedIndex]);

  // ★ 로빙 탭인덱스 재계산
  useEffect(() => {
    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      el.tabIndex = disabled ? -1 : idx === focusIndexRef.current ? 0 : -1;
    });
  }, [q.id, disabled, q.options.length, selectedIndex]);

  // ★ 최초 진입(또는 질문 전환) 시 옵션으로 자동 포커스
  useEffect(() => {
    if (disabled) return;
    // 마운트가 끝난 뒤 안전하게 포커스
    requestAnimationFrame(() => {
      const el = itemRefs.current[focusIndexRef.current];
      if (el) el.focus();
    });
  }, [q.id, disabled]);

  const moveFocus = useCallback((delta: number) => {
    if (disabled) return;
    const count = q.options.length;
    const next = (focusIndexRef.current + delta + count) % count;
    focusIndexRef.current = next;
    const el = itemRefs.current[next];
    if (el) {
      el.tabIndex = 0;
      el.focus();
    }
  }, [disabled, q.options.length]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, idx: number, opt: { value: string }) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault(); moveFocus(1); break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault(); moveFocus(-1); break;
      case "Home":
        e.preventDefault(); focusIndexRef.current = 0; itemRefs.current[0]?.focus(); break;
      case "End":
        e.preventDefault(); {
          const last = q.options.length - 1;
          focusIndexRef.current = last;
          itemRefs.current[last]?.focus();
        }
        break;
      case " ":
      case "Enter":
        e.preventDefault(); onSelect(opt.value); break;
      default:
        // Tab, Shift+Tab은 막지 않습니다 → 자연스러운 그룹 탈출/복귀
        break;
    }
  }, [disabled, moveFocus, onSelect, q.options.length]);

  return (
    <section className="rsb-qsection" key={q.id}>
      {/* ... 헤더 ... */}
      <div className="rsb-options" role="radiogroup" aria-labelledby={`q${q.id}-label`}>
        <span id={`q${q.id}-label`} className="sr-only">Q{q.id} 보기 선택</span>
        {q.options.map((opt, idx) => {
          const checked = selected === opt.value;
          return (
            <div
              key={opt.value}
              ref={(el) => (itemRefs.current[idx] = el)}
              className={`rsb-option ${checked ? "active" : ""} ${disabled ? "is-disabled" : ""}`}
              role="radio"
              aria-checked={checked}
              aria-disabled={disabled || undefined}
              tabIndex={-1}
              onKeyDown={(e) => onKeyDown(e, idx, opt)}
              onClick={() => { if (!disabled) { focusIndexRef.current = idx; onSelect(opt.value); } }}
            >
              <input type="radio" name={`q${q.id}`} value={opt.value} checked={checked} readOnly className="sr-only" />
              <span>{opt.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
