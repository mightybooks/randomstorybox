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
  return (
    <section>
      <div className="rsb-qhead">
        <span className="rsb-qno">Q{q.id}</span>
        <span className="rsb-qtext">{q.text}</span>
      </div>
      <div className="rsb-options">
        {q.options.map((opt) => (
          <label key={opt.label} className={`rsb-option ${selected === opt.value ? "active" : ""}`}>
            <input
              type="radio"
              name={`q${q.id}`}
              checked={selected === opt.value}
              onChange={() => onSelect(opt.value)}
              disabled={disabled}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
