import React from "react";

export function ActionsBar({
  onHome,
  onRestart,
  onCopy,
  onShare,
  disabled,
}: {
  onHome: () => void;
  onRestart: () => void;
  onCopy: () => void;
  onShare: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rsb-actions rsb-actions-grid">
      <button className="rsb-btn" onClick={onHome} disabled={disabled}>홈으로</button>
      <button className="rsb-btn" onClick={onRestart} disabled={disabled}>다시하기</button>
      <button className="rsb-btn" onClick={onCopy} disabled={disabled}>결과 복사</button>
      <button className="rsb-btn" onClick={onShare} disabled={disabled}>결과 공유</button>
    </div>
  );
}
