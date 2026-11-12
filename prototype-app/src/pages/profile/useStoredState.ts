import { useCallback, useEffect, useState } from 'react';

/** State lưu localStorage (try/catch — chế độ riêng tư hoặc đầy dung lượng vẫn chạy bằng state thường). */
export function readStored<T>(key: string, initial: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? initial : (JSON.parse(raw) as T);
  } catch {
    return initial;
  }
}

export function writeStored(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStored(key, initial));
  // Đổi key (đổi lăng kính người dùng) thì đọc lại giá trị của key mới.
  useEffect(() => { setValue(readStored(key, initial)); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      writeStored(key, resolved);
      return resolved;
    });
  }, [key]);
  return [value, update] as const;
}
