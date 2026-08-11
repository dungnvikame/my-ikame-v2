import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { initialEvents, initialNews, initialNotifications, users } from './data/mockData';
import type { EventItem, NewsPost, NotificationItem, Perspective, User } from './types';

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
  toggleRegistration: (id: string) => void;
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
      setNews((items) => items.map((item) => item.id === id ? { ...item, acknowledged: true } : item));
      setNotifications((items) => items.map((item) => item.href.endsWith(id) ? { ...item, read: true } : item));
    },
    toggleRegistration: (id) => {
      setEvents((items) => items.map((item) => {
        if (item.id !== id || item.status === 'full' || item.status === 'cancelled') return item;
        const registered = !item.registered;
        return { ...item, registered, status: registered ? 'going' : 'open' };
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

