import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';
import { toast, Toaster } from '@coreds/react';

type ToastAction = { label: string; onClick: () => void };
type ToastValue = { showToast: (message: string, action?: ToastAction) => void };

const ToastContext = createContext<ToastValue | null>(null);

/**
 * Toast toàn cục duy nhất của app. Nơi gọi vẫn dùng `showToast(message, action?)`; phần hiển thị
 * giờ là `Toaster` của Core DS (tự xếp chồng, tự ẩn, đọc được bằng trình đọc màn hình).
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const showToast = useCallback((message: string, action?: ToastAction) => {
    toast(message, action ? { action: { label: action.label, onClick: action.onClick } } : undefined);
  }, []);
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster position="bottom-center" />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used within ToastProvider');
  return value;
}
