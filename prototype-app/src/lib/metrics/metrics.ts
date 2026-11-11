/**
 * Đo hiệu quả sử dụng My iKame: ai mở, luồng nào làm xong, có dễ không, góp ý gì.
 *
 * Lưu ở đâu:
 * - Bản artifact: kho dữ liệu dùng chung của artifact (`db`), mỗi người một tài liệu `metrics/<id>`.
 *   Mỗi người chỉ đọc/ghi tài liệu của mình; người có quyền sửa artifact đọc được tất cả để xem
 *   trang Hiệu quả (luật truy cập khai báo lúc xuất bản artifact).
 * - Bản web (Vercel) hoặc khi kho không dùng được: localStorage của trình duyệt này.
 *
 * Không lưu tên, email hay nội dung công việc — chỉ ngày mở, tên luồng, điểm dễ dùng và lời góp ý.
 */
export const FLOWS = {
  today: 'Xử lý việc hôm nay',
  request: 'Tạo đề xuất',
  ack: 'Xác nhận đã đọc',
  event: 'Đăng ký sự kiện',
  assistant: 'Hỏi Trợ lý',
  live: 'Nối dữ liệu thật',
} as const;
export type FlowId = keyof typeof FLOWS;
export type FlowStep = 'start' | 'done' | 'exit';
export type FeedbackKind = 'bug' | 'idea' | 'hard';
export const FEEDBACK_KIND_LABEL: Record<FeedbackKind, string> = { bug: 'Lỗi', idea: 'Ý tưởng', hard: 'Khó dùng' };

export type FlowCount = { start: number; done: number; exit: number };
export type EaseRating = { flow: FlowId; score: number; at: string };
export type FeedbackItem = { kind: FeedbackKind; text: string; page: string; lens: string; at: string };
export type UserMetrics = {
  /** Các ngày đã mở app (yyyy-mm-dd). */
  days: string[];
  flows: Partial<Record<FlowId, FlowCount>>;
  ease: EaseRating[];
  feedback: FeedbackItem[];
  updatedAt: string;
};

const EMPTY: UserMetrics = { days: [], flows: {}, ease: [], feedback: [], updatedAt: '' };
const LOCAL_KEY = 'my-ikame-metrics';
const COLLECTION = 'metrics';
const MAX_EASE = 50;
const MAX_FEEDBACK = 50;

type DocSnapshot = { id: string; exists: boolean; data(): Record<string, unknown> | undefined };
type DocRef = { get(): Promise<DocSnapshot>; set(data: Record<string, unknown>): Promise<void> };
type Db = { doc(path: string): DocRef; collection(path: string): { get(): Promise<{ docs: DocSnapshot[] }> } };
type UserCap = { id(): Promise<string | null>; canEdit(): Promise<boolean> };
type ClaudeRuntime = { use(name: string): Promise<unknown> };

const pad = (value: number) => String(value).padStart(2, '0');
export const dayKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function normalize(raw: unknown): UserMetrics {
  const data = (raw ?? {}) as Partial<UserMetrics>;
  return {
    days: Array.isArray(data.days) ? data.days.slice() : [],
    flows: { ...(data.flows ?? {}) },
    ease: Array.isArray(data.ease) ? data.ease.slice() : [],
    feedback: Array.isArray(data.feedback) ? data.feedback.slice() : [],
    updatedAt: data.updatedAt ?? '',
  };
}

function readLocal(): UserMetrics {
  try {
    return normalize(JSON.parse(localStorage.getItem(LOCAL_KEY) ?? 'null'));
  } catch {
    return normalize(null);
  }
}

function writeLocal(metrics: UserMetrics) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(metrics));
  } catch {
    // Không lưu được (chế độ riêng tư, bị chặn): số đo chỉ còn trong phiên này.
  }
}

/** Kho dùng chung của artifact; `null` khi không có (bản web, chưa đăng nhập, chưa được cấp). */
let remote: Promise<{ db: Db; me: string; canEdit: boolean } | null> | undefined;
function getRemote() {
  if (remote) return remote;
  const runtime = __ARTIFACT__ ? (window as unknown as { claude?: ClaudeRuntime }).claude : undefined;
  if (!runtime) {
    remote = Promise.resolve(null);
    return remote;
  }
  remote = (async () => {
    try {
      const [db, user] = await Promise.all([runtime.use('db') as Promise<Db | null>, runtime.use('user') as Promise<UserCap | null>]);
      const me = user ? await user.id() : null;
      if (!db || !user || !me) return null;
      return { db, me, canEdit: await user.canEdit().catch(() => false) };
    } catch {
      return null;
    }
  })();
  return remote;
}

let state: UserMetrics = { ...EMPTY };
let loaded: Promise<void> | undefined;
let saving = false;
let dirty = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Nạp số đo của chính mình một lần; các lần ghi sau cộng dồn lên bản đã nạp. */
function ensureLoaded(): Promise<void> {
  if (!loaded) {
    loaded = (async () => {
      const store = await getRemote();
      if (!store) {
        state = readLocal();
        return;
      }
      try {
        const snapshot = await store.db.doc(`${COLLECTION}/${store.me}`).get();
        state = normalize(snapshot.exists ? snapshot.data() : null);
      } catch {
        state = readLocal();
      }
    })().then(emit);
  }
  return loaded;
}

/** Ghi tuần tự: mỗi lúc chỉ một lần ghi; thay đổi đến trong lúc ghi được gộp vào lần kế tiếp. */
async function flush() {
  if (saving) {
    dirty = true;
    return;
  }
  saving = true;
  try {
    do {
      dirty = false;
      const snapshot = { ...state, updatedAt: new Date().toISOString() };
      const store = await getRemote();
      if (store) {
        await store.db.doc(`${COLLECTION}/${store.me}`).set(snapshot as unknown as Record<string, unknown>).catch(() => writeLocal(snapshot));
      } else {
        writeLocal(snapshot);
      }
    } while (dirty);
  } finally {
    saving = false;
  }
}

async function change(mutate: (current: UserMetrics) => UserMetrics | undefined) {
  await ensureLoaded();
  const next = mutate(state);
  if (!next) return;
  state = next;
  emit();
  void flush();
}

/** Ghi nhận hôm nay có mở app (mỗi ngày một lần). */
export function trackOpen() {
  void change((current) => {
    const today = dayKey();
    return current.days.includes(today) ? undefined : { ...current, days: [...current.days, today].slice(-120) };
  });
}

const startedThisSession = new Set<FlowId>();
let lastDone: FlowId | undefined;

/** Ghi một bước của luồng. `start` chỉ tính một lần mỗi phiên để tỷ lệ hoàn tất không bị pha loãng. */
export function trackFlow(flow: FlowId, step: FlowStep) {
  if (step === 'start') {
    if (startedThisSession.has(flow)) return;
    startedThisSession.add(flow);
  }
  if (step === 'done') {
    // Làm xong mà chưa có bước bắt đầu (vào thẳng hành động) thì vẫn tính một lượt bắt đầu.
    if (!startedThisSession.has(flow)) trackFlow(flow, 'start');
    startedThisSession.delete(flow);
    lastDone = flow;
  }
  if (step === 'exit') {
    if (!startedThisSession.has(flow)) return;
    startedThisSession.delete(flow);
  }
  void change((current) => {
    const count = current.flows[flow] ?? { start: 0, done: 0, exit: 0 };
    return { ...current, flows: { ...current.flows, [flow]: { ...count, [step]: count[step] + 1 } } };
  });
}

const easeAsked = new Set<FlowId>();
/** Luồng vừa làm xong mà chưa hỏi mức dễ dùng trong phiên này (mỗi luồng hỏi một lần). */
export function pendingEaseFlow(): FlowId | undefined {
  return lastDone && !easeAsked.has(lastDone) ? lastDone : undefined;
}

export function rateEase(flow: FlowId, score: number | null) {
  easeAsked.add(flow);
  if (lastDone === flow) lastDone = undefined;
  if (score === null) {
    emit();
    return;
  }
  void change((current) => ({ ...current, ease: [...current.ease, { flow, score, at: new Date().toISOString() }].slice(-MAX_EASE) }));
}

export function addFeedback(kind: FeedbackKind, text: string, page: string, lens: string) {
  const trimmed = text.trim().slice(0, 1000);
  if (!trimmed) return;
  void change((current) => ({
    ...current,
    feedback: [...current.feedback, { kind, text: trimmed, page, lens, at: new Date().toISOString() }].slice(-MAX_FEEDBACK),
  }));
}

export function subscribeMetrics(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function myMetrics(): UserMetrics {
  return state;
}

export type MetricsScope = 'everyone' | 'me-only' | 'this-browser';
/**
 * Số đo để hiện ở trang Hiệu quả.
 * - `everyone`: bản artifact và người xem có quyền sửa → đọc tài liệu của mọi người.
 * - `me-only`: bản artifact nhưng không có quyền sửa → chỉ thấy của mình.
 * - `this-browser`: bản web → số đo của trình duyệt này.
 */
export async function loadAllMetrics(): Promise<{ scope: MetricsScope; users: UserMetrics[] }> {
  await ensureLoaded();
  const store = await getRemote();
  if (!store) return { scope: 'this-browser', users: [state] };
  if (!store.canEdit) return { scope: 'me-only', users: [state] };
  try {
    const snapshot = await store.db.collection(COLLECTION).get();
    const users = snapshot.docs.filter((doc) => doc.exists).map((doc) => normalize(doc.data()));
    return { scope: 'everyone', users: users.length > 0 ? users : [state] };
  } catch {
    return { scope: 'me-only', users: [state] };
  }
}

export type MetricsSummary = {
  users: number;
  activeToday: number;
  activeWeek: number;
  flows: { id: FlowId; label: string; start: number; done: number; exit: number; rate: number | null }[];
  easeAverage: number | null;
  easeCount: number;
  feedback: FeedbackItem[];
};

export function summarize(users: UserMetrics[], now = new Date()): MetricsSummary {
  const today = dayKey(now);
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 6);
  const weekStart = dayKey(weekAgo);
  const ease = users.flatMap((user) => user.ease);
  return {
    users: users.filter((user) => user.days.length > 0).length,
    activeToday: users.filter((user) => user.days.includes(today)).length,
    activeWeek: users.filter((user) => user.days.some((day) => day >= weekStart && day <= today)).length,
    flows: (Object.keys(FLOWS) as FlowId[]).map((id) => {
      const total = users.reduce((sum, user) => {
        const count = user.flows[id];
        return count ? { start: sum.start + count.start, done: sum.done + count.done, exit: sum.exit + count.exit } : sum;
      }, { start: 0, done: 0, exit: 0 });
      return { id, label: FLOWS[id], ...total, rate: total.start > 0 ? Math.round((total.done / total.start) * 100) : null };
    }),
    easeAverage: ease.length > 0 ? Math.round((ease.reduce((sum, item) => sum + item.score, 0) / ease.length) * 10) / 10 : null,
    easeCount: ease.length,
    feedback: users.flatMap((user) => user.feedback).sort((left, right) => right.at.localeCompare(left.at)),
  };
}

/** Xoá số đo của chính mình (dùng khi đặt lại demo). */
export function resetMyMetrics() {
  startedThisSession.clear();
  easeAsked.clear();
  lastDone = undefined;
  void change(() => ({ ...EMPTY, days: [dayKey()] }));
}
