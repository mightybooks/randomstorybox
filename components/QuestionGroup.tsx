import React from "react";

type QOption = { label: string; value: string };
export type QItem = { id: number; text: string; options: QOption[] };

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

  return (
    <section>
      <div className="rsb-qhead">
        <span className="rsb-qno">Q{q.id}</span>
        {/* 질문 텍스트에 id를 달아서 라디오 그룹과 연결 */}
        <span id={labelId} className="rsb-qtext">{q.text}</span>
      </div>

      {/* radiogroup 역할 명시 + 라벨 연결 */}
      <div className="rsb-options" role="radiogroup" aria-labelledby={labelId}>
        {q.options.map((opt) => {
          const id = `${groupName}-${opt.value}`;
          const isActive = selected === opt.value;
          const isDisabled = !!disabled;

          return (
            <label
              key={id}
              htmlFor={id}
              className={`rsb-option ${isActive ? "active" : ""} ${isDisabled ? "is-disabled" : ""}`}
              aria-disabled={isDisabled || undefined}
            >
              {/* ✅ 포커스 가능한 진짜 라디오 (시각적으로만 숨김) */}
              <input
                id={id}
                type="radio"
                name={groupName}
                value={opt.value}
                checked={isActive}
                onChange={() => onSelect(opt.value)}
                disabled={isDisabled}
                className="rsb-radio-input sr-only"
              />

              {/* ✅ 시각적 카드(여기에 포커스 링을 표시) */}
              <span className="rsb-option-visual">
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
