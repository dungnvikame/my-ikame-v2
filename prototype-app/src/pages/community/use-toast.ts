import { useCallback, useRef, useState } from 'react';

type ToastAction = { label: string; onClick: () => void };
type ToastEntry = { id: number; message: string; action?: ToastAction };

/**
 * Local-only toast host for the Cộng đồng feed (F1 — no global toast in shared files).
 * Auto-dismisses after ~2.5s; `show()` can carry an action (e.g. "Xem bài viết") that
 * scrolls to the post it refers to.
 */
export function useToast() {
  const [toast, setToast] = useState<ToastEntry | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, action?: ToastAction) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const id = Date.now();
    setToast({ id, message, action });
    timeoutRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2500);
  }, []);

  return { toast, show };
}
