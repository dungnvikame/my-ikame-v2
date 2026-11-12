import { useSyncExternalStore } from 'react';

/**
 * Trạng thái cá nhân của Trang chủ, lưu localStorage (bọc try/catch):
 * việc đã xử lý trong ngày, việc đã hoãn/bỏ qua và khối "Tập trung" của hôm nay.
 */
export type SnoozeEntry = { until: number; kind: 'snooze' | 'skip' };
export type FocusBlock = { start: number; end: number };
export type HomeState = {
  day: string;
  handled: string[];
  snoozed: Record<string, SnoozeEntry>;
  focus?: FocusBlock;
};

const KEY = 'ikame.home.v3';
const dayKey = (date = new Date()) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

function load(): HomeState {
  const fresh: HomeState = { day: dayKey(), handled: [], snoozed: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw) as Partial<HomeState>;
    const snoozed: Record<string, SnoozeEntry> = {};
    // Việc hoãn còn hiệu lực vẫn giữ qua ngày; mục hết hạn bị loại.
    for (const [id, entry] of Object.entries(parsed.snoozed ?? {})) {
      if (entry && typeof entry.until === 'number' && entry.until > Date.now()) snoozed[id] = entry;
    }
    if (parsed.day !== fresh.day) return { ...fresh, snoozed };
    return {
      day: fresh.day,
      handled: Array.isArray(parsed.handled) ? parsed.handled.filter((id): id is string => typeof id === 'string') : [],
      snoozed,
      focus: parsed.focus && typeof parsed.focus.start === 'number' && typeof parsed.focus.end === 'number' ? parsed.focus : undefined,
    };
  } catch {
    return fresh;
  }
}

let state: HomeState = load();
const listeners = new Set<() => void>();

function commit(next: HomeState) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* bộ nhớ đầy hoặc bị chặn: giữ trong phiên */ }
  listeners.forEach((listener) => listener());
}

function current(): HomeState {
  // Qua nửa đêm khi tab còn mở: làm mới sang ngày mới.
  if (state.day !== dayKey()) state = load();
  return state;
}

export function useHomeState(): HomeState {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    current,
  );
}

export const homeActions = {
  markHandled(id: string) {
    const s = current();
    if (!s.handled.includes(id)) commit({ ...s, handled: [...s.handled, id] });
  },
  snooze(id: string, until: Date, kind: SnoozeEntry['kind']) {
    const s = current();
    commit({ ...s, snoozed: { ...s.snoozed, [id]: { until: until.getTime(), kind } } });
  },
  unsnooze(id: string) {
    const s = current();
    const { [id]: _removed, ...rest } = s.snoozed;
    commit({ ...s, snoozed: rest });
  },
  /** Bỏ mọi việc đã hoãn/bỏ qua (nút "Hiện lại"). */
  clearSnoozed() {
    commit({ ...current(), snoozed: {} });
  },
  setFocus(focus: FocusBlock | undefined) {
    commit({ ...current(), focus });
  },
};

/** Việc đang ẩn vì hoãn/bỏ qua tại thời điểm `now`. */
export function isSnoozed(s: HomeState, id: string, now: number): boolean {
  const entry = s.snoozed[id];
  return !!entry && entry.until > now;
}

/** Việc đã xử lý = đã bấm hành động, hoặc đang hoãn/bỏ qua. */
export function isDone(s: HomeState, id: string, now: number): boolean {
  return s.handled.includes(id) || isSnoozed(s, id, now);
}

/** Số việc (trong `ids`) đã xử lý — cho hero và tổng kết cuối ngày. */
export function handledCount(ids: string[], s: HomeState, now: number): number {
  return ids.filter((id) => isDone(s, id, now)).length;
}
