import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { initialEvents, initialNews, initialNotifications, users } from './data/mockData';
import type { EventRegistration, EventItem, NewsPost, NotificationItem, Perspective, User } from './types';

type AppStateValue = {
  perspective: Perspective;
  user: User;
  news: NewsPost[];
  events: EventItem[];
  notifications: NotificationItem[];
  theme: 'light' | 'dark';
  notificationOpen: boolean;
  setPerspective: (perspective: Perspective) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotificationOpen: (open: boolean) => void;
  acknowledgeNews: (id: string) => void;
  markNewsRead: (id: string) => void;
  setEventRegistration: (id: string, next: EventRegistration) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [perspective, setPerspective] = useState<Perspective>('ikamer');
  const [news, setNews] = useState(initialNews);
  const [events, setEvents] = useState(initialEvents);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notificationOpen, setNotificationOpen] = useState(false);

  const user = perspective === 'manager' ? users.mai : users.an;

  const value = useMemo<AppStateValue>(() => ({
    perspective,
    user,
    news,
    events,
    notifications,
    theme,
    notificationOpen,
    setPerspective,
    setTheme,
    setNotificationOpen,
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
          : (remaining ?? 0) <= 0 && next !== 'going' ? 'full' : 'open';
        return { ...item, myRegistration: next, remaining, status };
      }));
    },
    markNotificationRead: (id) => {
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    },
    markAllNotificationsRead: () => {
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    },
  }), [events, news, notificationOpen, notifications, perspective, theme, user]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
