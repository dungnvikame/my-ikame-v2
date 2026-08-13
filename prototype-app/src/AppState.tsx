import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  attentionItems,
  contractInfo,
  eksObjectives,
  initialApprovals,
  equipment,
  initialBirthdays,
  initialCheckInReports,
  initialDailyCheckIn,
  initialEvents,
  initialGoals,
  initialMilestones,
  initialNews,
  initialNotifications,
  initialPosts,
  initialRequests,
  initialTopFans,
  knowledgeDocs,
  leaveBalance,
  memberEksStats,
  okrTree,
  payslips,
  seniorityEntries,
  users,
} from './data/mockData';
import type {
  ApprovalItem,
  AttentionItem,
  BirthdayPerson,
  CheckInReport,
  Comment,
  DailyCheckIn,
  EventRegistration,
  EventItem,
  Goal,
  KnowledgeDoc,
  NewsPost,
  NotificationItem,
  Perspective,
  Post,
  ReactionKind,
  RequestItem,
  User,
} from './types';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'my-ikame-theme';
const PERSPECTIVE_STORAGE_KEY = 'my-ikame-perspective';

// Mid-demo refresh must not flashbang light-mode onto the projector or dump the
// presenter back into iKamer perspective (RED TEAM F13).
function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode) — demo continues without persistence.
  }
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowTimeLabel() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/** Shared by `addComment` and `congratulate` (DRY) — appends a comment to one post. */
function appendComment(posts: Post[], postId: string, comment: Comment): Post[] {
  return posts.map((post) => (post.id === postId ? { ...post, comments: [...post.comments, comment] } : post));
}

type NewPostInput = { body: string; cover?: Post['cover']; official?: boolean };
type SubmitReportInput = Omit<CheckInReport, 'id' | 'submittedAt'>;
type NewRequestInput = Omit<RequestItem, 'id' | 'createdAtLabel' | 'status'>;

type AppStateValue = {
  perspective: Perspective;
  user: User;
  news: NewsPost[];
  events: EventItem[];
  notifications: NotificationItem[];
  attention: AttentionItem[];
  goals: Goal[];
  knowledgeDocs: KnowledgeDoc[];
  theme: Theme;
  notificationOpen: boolean;
  askOpen: boolean;
  /** Increments on resetDemo() — the Ask panel keys its conversation-clearing effect off this. */
  demoResetCount: number;
  // Demo v2 — Cộng đồng feed.
  posts: Post[];
  birthdays: BirthdayPerson[];
  dailyCheckIn: DailyCheckIn;
  // Demo v2 — Mục tiêu check-in reports.
  checkInReports: CheckInReport[];
  // Demo v2 — ⌘K palette open state.
  searchOpen: boolean;
  // iRequest center — mọi request (kể cả tạo qua Trợ lý AI) theo dõi ở đây.
  requests: RequestItem[];
  // Hàng đợi duyệt của manager.
  approvals: ApprovalItem[];
  // Demo v2 — read-only pass-through fixtures (no mutator; nothing writes to these — YAGNI).
  milestones: typeof initialMilestones;
  topFans: typeof initialTopFans;
  leaveBalance: typeof leaveBalance;
  equipment: typeof equipment;
  seniorityEntries: typeof seniorityEntries;
  payslips: typeof payslips;
  contractInfo: typeof contractInfo;
  okrTree: typeof okrTree;
  eks: typeof eksObjectives;
  memberEksStats: typeof memberEksStats;
  setPerspective: (perspective: Perspective) => void;
  setTheme: (theme: Theme) => void;
  setNotificationOpen: (open: boolean) => void;
  setAskOpen: (open: boolean) => void;
  acknowledgeNews: (id: string) => void;
  markNewsRead: (id: string) => void;
  setEventRegistration: (id: string, next: EventRegistration) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resolveAttentionItem: (id: string) => void;
  checkInGoal: (id: string) => void;
  addPost: (input: NewPostInput) => void;
  toggleReaction: (postId: string, kind: ReactionKind) => void;
  addComment: (postId: string, text: string) => void;
  toggleSavePost: (postId: string) => void;
  congratulate: (birthdayId: string) => void;
  submitDailyCheckIn: (mode: 'WFO' | 'Remote') => void;
  submitReport: (input: SubmitReportInput) => void;
  addRequest: (input: NewRequestInput) => void;
  addNewsComment: (postId: string, text: string) => void;
  resolveApproval: (id: string, next: 'approved' | 'rejected') => void;
  setSearchOpen: (open: boolean) => void;
  resetDemo: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [perspective, setPerspective] = useState<Perspective>(() =>
    readStored(PERSPECTIVE_STORAGE_KEY, ['ikamer', 'manager'] as const, 'ikamer'));
  const [news, setNews] = useState(initialNews);
  const [events, setEvents] = useState(initialEvents);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [attention, setAttention] = useState(attentionItems);
  const [goals, setGoals] = useState(initialGoals);
  const [theme, setTheme] = useState<Theme>(() =>
    readStored(THEME_STORAGE_KEY, ['light', 'dark'] as const, 'light'));
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [demoResetCount, setDemoResetCount] = useState(0);
  const [posts, setPosts] = useState(initialPosts);
  const [birthdays, setBirthdays] = useState(initialBirthdays);
  const [dailyCheckIn, setDailyCheckIn] = useState(initialDailyCheckIn);
  const [checkInReports, setCheckInReports] = useState(initialCheckInReports);
  const [searchOpen, setSearchOpen] = useState(false);
  const [requests, setRequests] = useState(initialRequests);
  const [approvals, setApprovals] = useState(initialApprovals);

  useEffect(() => { writeStored(THEME_STORAGE_KEY, theme); }, [theme]);
  useEffect(() => { writeStored(PERSPECTIVE_STORAGE_KEY, perspective); }, [perspective]);

  const user = perspective === 'manager' ? users.mai : users.an;

  const value = useMemo<AppStateValue>(() => ({
    perspective,
    user,
    news,
    events,
    notifications,
    attention,
    goals,
    knowledgeDocs,
    theme,
    notificationOpen,
    askOpen,
    demoResetCount,
    posts,
    birthdays,
    dailyCheckIn,
    checkInReports,
    searchOpen,
    requests,
    approvals,
    milestones: initialMilestones,
    topFans: initialTopFans,
    leaveBalance,
    equipment,
    seniorityEntries,
    payslips,
    contractInfo,
    okrTree,
    eks: eksObjectives,
    memberEksStats,
    setPerspective,
    setTheme,
    setNotificationOpen,
    setAskOpen,
    acknowledgeNews: (id) => {
      setNews((items) => items.map((item) => item.id === id ? { ...item, acknowledged: true, read: true } : item));
      setNotifications((items) => items.map((item) => item.href.endsWith(id) ? { ...item, read: true } : item));
    },
    markNewsRead: (id) => {
      setNews((items) => items.map((item) => item.id === id && !item.read ? { ...item, read: true } : item));
    },
    setEventRegistration: (id, next) => {
      setEvents((items) => items.map((item) => {
        if (item.id !== id) return item;
        const prev = item.myRegistration;
        if (prev === next) return item;
        let remaining = item.remaining;
        if (typeof remaining === 'number') {
          if (prev === 'going' && next !== 'going') remaining += 1;
          if (prev !== 'going' && next === 'going') remaining = Math.max(0, remaining - 1);
        }
        const status = item.status === 'cancelled' || item.status === 'past'
          ? item.status
          : (remaining ?? 0) <= 0 ? 'full' : 'open';
        return { ...item, myRegistration: next, remaining, status };
      }));
    },
    markNotificationRead: (id) => {
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    },
    markAllNotificationsRead: () => {
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    },
    resolveAttentionItem: (id) => {
      setAttention((items) => items.map((item) => item.id === id ? { ...item, state: 'resolved' } : item));
    },
    checkInGoal: (id) => {
      setGoals((items) => items.map((item) => item.id === id
        ? { ...item, lastCheckIn: 'Vừa xong', status: 'on_track' }
        : item));
    },
    addPost: ({ body, cover, official }) => {
      setPosts((items) => [{
        id: generateId('post'),
        authorName: user.name,
        authorShort: user.shortName,
        role: user.role,
        time: 'Vừa xong',
        body,
        cover,
        official,
        reactions: { heart: 0, clap: 0 },
        myReactions: [],
        comments: [],
      }, ...items]);
    },
    toggleReaction: (postId, kind) => {
      setPosts((items) => items.map((item) => {
        if (item.id !== postId) return item;
        const has = item.myReactions.includes(kind);
        return {
          ...item,
          reactions: { ...item.reactions, [kind]: item.reactions[kind] + (has ? -1 : 1) },
          myReactions: has ? item.myReactions.filter((entry) => entry !== kind) : [...item.myReactions, kind],
        };
      }));
    },
    addComment: (postId, text) => {
      setPosts((items) => appendComment(items, postId, {
        id: generateId('comment'),
        authorName: user.name,
        authorShort: user.shortName,
        role: user.role,
        text,
        time: 'Vừa xong',
      }));
    },
    toggleSavePost: (postId) => {
      setPosts((items) => items.map((item) => item.id === postId ? { ...item, saved: !item.saved } : item));
    },
    congratulate: (birthdayId) => {
      const person = birthdays.find((item) => item.id === birthdayId);
      setBirthdays((items) => items.map((item) => item.id === birthdayId ? { ...item, congratulated: true } : item));
      if (person) {
        setPosts((items) => appendComment(items, person.postId, {
          id: generateId('comment-congrats'),
          authorName: user.name,
          authorShort: user.shortName,
          role: user.role,
          text: `Chúc mừng sinh nhật ${person.name}! 🎉`,
          time: 'Vừa xong',
        }));
      }
    },
    submitDailyCheckIn: (mode) => {
      setDailyCheckIn({ done: true, mode, timeLabel: nowTimeLabel() });
    },
    submitReport: (input) => {
      setCheckInReports((items) => [{ ...input, id: generateId('report'), submittedAt: 'Vừa xong' }, ...items]);
      setGoals((items) => items.map((item) => item.id === input.goalId
        ? { ...item, status: 'on_track', lastCheckIn: 'Vừa xong', progress: input.progressAfter }
        : item));
    },
    addRequest: (input) => {
      setRequests((items) => [{
        ...input,
        id: generateId('req'),
        status: 'pending',
        createdAtLabel: `Hôm nay · ${nowTimeLabel()}`,
      }, ...items]);
    },
    addNewsComment: (postId, text) => {
      setNews((items) => items.map((item) => item.id === postId
        ? {
          ...item,
          comments: [...(item.comments ?? []), {
            id: generateId('news-comment'),
            authorName: user.name,
            authorShort: user.shortName,
            role: user.role,
            text,
            time: 'Vừa xong',
          }],
        }
        : item));
    },
    resolveApproval: (id, next) => {
      setApprovals((items) => items.map((item) => item.id === id ? { ...item, state: next } : item));
    },
    setSearchOpen,
    // Restores every mutable slice so the presenter can re-run the golden path.
    // Deliberately does NOT reset theme/perspective (RED TEAM F13).
    resetDemo: () => {
      setNews(initialNews);
      setEvents(initialEvents);
      setNotifications(initialNotifications);
      setAttention(attentionItems);
      setGoals(initialGoals);
      setNotificationOpen(false);
      setAskOpen(false);
      setPosts(initialPosts);
      setBirthdays(initialBirthdays);
      setDailyCheckIn(initialDailyCheckIn);
      setCheckInReports(initialCheckInReports);
      setSearchOpen(false);
      setRequests(initialRequests);
      setApprovals(initialApprovals);
      setDemoResetCount((count) => count + 1);
    },
  }), [approvals, askOpen, attention, birthdays, checkInReports, dailyCheckIn, demoResetCount, events, goals, news,
    notificationOpen, notifications, perspective, posts, requests, searchOpen, theme, user]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
