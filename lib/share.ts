export async function copyFallback(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

export function encodeStoryBase64(text: string) {
  return typeof window === "undefined" ? "" : btoa(unescape(encodeURIComponent(text)));
}
export function decodeStoryBase64(b64: string) {
  return typeof window === "undefined" ? "" : decodeURIComponent(escape(atob(b64)));
}
export function buildShareUrlFromStory(story: string) {
  if (typeof window === "undefined" || !story) return "";
  const s = encodeURIComponent(encodeStoryBase64(story));
  return `${window.location.origin}/play?s=${s}`;
}
export async function shareResult(story: string) {
  const url = buildShareUrlFromStory(story);
  if (!url) return;
  try { await copyFallback(url); } catch {}
  if (navigator.share) {
    try { await navigator.share({ title: "랜덤서사박스 결과", url }); return; } catch {}
  }
  alert("공유 링크를 클립보드에 복사했습니다. 원하는 앱에 붙여넣기 해주세요.");
}
