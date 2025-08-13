import { useState, useCallback } from "react";

export type Toast = {
  id: number;
  message: string;
  type?: "info" | "error";
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
