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
    // fieldset/legend는 페이지에서 감싸고 있으므로 여기선 section 유지
    <section>
      <div className="rsb-qhead">
        <span className="rsb-qno">Q{q.id}</span>
        <span className="rsb-qtext">{q.text}</span>
      </div>

      <div className="rsb-options">
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
              {/* 시각적으로만 숨기되, 포커스와 탭 이동은 유지 */}
              <input
                id={id}
                type="radio"
                name={groupName}
                value={opt.value}
                checked={isActive}
                onChange={() => onSelect(opt.value)}
                disabled={isDisabled}
                className="rsb-radio-input"
              />

              <span className="rsb-option-label">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
