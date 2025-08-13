"use client";

import { useEffect } from "react";
import type { Toast } from "@/hooks/useToast";

export function ToastRegion({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`px-4 py-2 rounded shadow text-white ${
        toast.type === "error" ? "bg-red-600" : "bg-gray-800"
      }`}
    >
      {toast.message}
    </div>
  );
}
