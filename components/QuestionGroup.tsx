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

  return (
    <section>
      {/* 시각적 제목은 그대로 두되, 실제 그룹 레이블은 page.tsx의 legend가 담당 */}
      <div className="rsb-qhead">
        <span className="rsb-qno">Q{q.id}</span>
        <span className="rsb-qtext">{q.text}</span>
      </div>

      {/* fieldset/legend는 page.tsx에 이미 있음 */}
      <div className="rsb-options">
        {q.options.map((opt) => {
          const id = `${groupName}-${opt.value}`;
          return (
            <label
              key={opt.label}
              htmlFor={id}
              className={`rsb-option ${selected === opt.value ? "active" : ""}`}
            >
              <input
                id={id}
                type="radio"
                name={groupName}
                value={opt.value}                 {/* ✅ value 명시 */}
                checked={selected === opt.value}
                onChange={() => onSelect(opt.value)}
                disabled={disabled}
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
