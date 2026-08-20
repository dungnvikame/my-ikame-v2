import { createContext, useCallback, useContext, useRef, useState, type PropsWithChildren } from 'react';

type ToastAction = { label: string; onClick: () => void };
type ToastEntry = { id: number; message: string; action?: ToastAction };
type ToastValue = { showToast: (message: string, action?: ToastAction) => void };

const ToastContext = createContext<ToastValue | null>(null);

/**
 * Toast toàn cục duy nhất của app (trước đây Feed / handoff / receipt mỗi nơi
 * một kiểu). role="status" (aria-live polite) — không cướp focus; tự ẩn ~3s.
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastEntry | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, action?: ToastAction) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const id = Date.now();
    setToast({ id, message, action });
    timeoutRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="app-toast" role="status">
          <span>{toast.message}</span>
          {toast.action && <button type="button" onClick={toast.action.onClick}>{toast.action.label}</button>}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
