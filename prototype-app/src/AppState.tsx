import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  attentionItems,
  initialEvents,
  initialGoals,
  initialNews,
  initialNotifications,
  knowledgeDocs,
  users,
} from './data/mockData';
import type {
  AttentionItem,
  EventRegistration,
  EventItem,
  Goal,
  KnowledgeDoc,
  NewsPost,
  NotificationItem,
  Perspective,
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
      setDemoResetCount((count) => count + 1);
    },
  }), [askOpen, attention, demoResetCount, events, goals, news, notificationOpen, notifications, perspective, theme, user]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
