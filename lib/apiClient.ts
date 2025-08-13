import { AppError, mapStatus } from "./errors";

export async function apiFetch<T>(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), init.timeoutMs ?? 20000);
  try {
    const res = await fetch(url, { ...init, signal: c.signal });
    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) throw new AppError(mapStatus(res.status), (data && data.message) || "요청 실패", res.status);
    return data as T;
  } catch (e: any) {
    if (e?.name === "AbortError") throw new AppError("TIMEOUT", "응답이 지연됩니다.");
    if (e instanceof AppError) throw e;
    throw new AppError("NETWORK", "네트워크 오류가 발생했습니다.");
  } finally {
    clearTimeout(id);
  }
}
