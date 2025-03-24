import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState<{ title: string; description?: string; type: "success" | "error" }[]>([]);

  const toast = (options: { title: string; description?: string; type: "success" | "error" }) => {
    setToasts(prev => [...prev, options]);
    setTimeout(() => setToasts(prev => prev.slice(1)), 3000);
  };

  return { toast, toasts };
}