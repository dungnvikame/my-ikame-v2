import type { AgentMessage } from './agent-replies';

/**
 * Lịch sử hội thoại Trợ lý AI — lưu localStorage để người dùng xem lại các
 * cuộc trò chuyện và kết quả tác vụ cũ (kể cả receipt đã thực thi).
 * Chỉ lưu khi lượt trả lời đã "settle" (hết processing) nên bản ghi luôn sạch.
 */
export type ThreadMessage = AgentMessage & {
  id: string;
  actionDone?: boolean;
  actionRunning?: boolean;
  receiptId?: string;
  /** Staged reveal cho demo: tick từng AI step trước rồi mới lộ câu trả lời. */
  processing?: boolean;
  revealedSteps?: number;
};

export type StoredSession = {
  id: string;
  title: string;
  savedAt: number;
  messages: ThreadMessage[];
};

const STORAGE_KEY = 'my-ikame-assistant-history';
const MAX_SESSIONS = 20;

export function loadSessions(): StoredSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is StoredSession =>
      !!item && typeof item === 'object' && typeof (item as StoredSession).id === 'string' && Array.isArray((item as StoredSession).messages));
  } catch {
    return [];
  }
}

export function saveSessions(sessions: StoredSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch { /* private mode / quota — lịch sử là tiện ích phụ, bỏ qua */ }
}

export function clearSessions(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/** Bỏ cờ transient để phiên mở lại luôn render ở trạng thái đã hoàn tất. */
export function sanitizeForStorage(messages: ThreadMessage[]): ThreadMessage[] {
  return messages.map(({ processing: _p, actionRunning: _r, revealedSteps: _s, ...rest }) => rest);
}

export function sessionTimeLabel(savedAt: number): string {
  return new Date(savedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

export function questionCount(session: StoredSession): number {
  return session.messages.filter((message) => message.role === 'user').length;
}
