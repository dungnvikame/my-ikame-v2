import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AiActionProposal,
  AiMessage,
  AppNotification,
  EventItem,
  FeedPost,
  InternalApp,
  LensKey,
  McpServerStatus,
  NotificationGroupKey,
  NotificationPref,
  ObjectiveItem,
  OnboardingQuest,
  PersonProfile,
  TodayActionItem,
  WorkRequest,
} from '../types';
import {
  INITIAL_EVENTS,
  INITIAL_NOTIFICATION_PREFS,
  INITIAL_NOTIFICATIONS,
  INITIAL_OBJECTIVES,
  INITIAL_POSTS,
  INITIAL_QUESTS,
  INITIAL_REQUESTS,
  INTERNAL_APPS,
  KNOWLEDGE_DOCS,
  PEOPLE,
} from '../data/mockData';
import { buildTodayItems } from '../lib/ranking';
import { INITIAL_MCP_SERVERS, routeAiPrompt } from '../lib/mcp';
import { DEFAULT_QUICK_ACTION_IDS } from '../lib/quickActions';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone?: 'success' | 'info' | 'warning' | 'error';
}

export interface AgentMetrics {
  tasksCompleted: number;
  avgSecondsToReceipt: number;
  systemsWritten: string[];
}

export type AppTheme = 'light' | 'dark' | 'noel';

interface AppContextValue {
  // Theme & Shell
  theme: AppTheme;
  setTheme: (next: AppTheme) => void;
  toggleTheme: () => void;
  noelMode: boolean;
  toggleNoelMode: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  ssoLocked: boolean;
  setSsoLocked: (v: boolean) => void;

  // Lens & Persona
  lens: LensKey;
  switchLens: (next: LensKey) => void;
  currentPerson: PersonProfile;
  people: PersonProfile[];
  teamMembers: PersonProfile[];

  // Overlays
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  notifDrawerOpen: boolean;
  setNotifDrawerOpen: (v: boolean) => void;
  quickAskOpen: boolean;
  setQuickAskOpen: (v: boolean) => void;
  openAiWithPrompt: (prompt: string) => void;
  handoffApp: InternalApp | null;
  launchApp: (app: InternalApp) => void;
  closeHandoff: () => void;
  appLaunchCount: Record<string, number>;

  // Core Data & Derived
  posts: FeedPost[];
  events: EventItem[];
  requests: WorkRequest[];
  objectives: ObjectiveItem[];
  quests: OnboardingQuest[];
  todayItems: TodayActionItem[];
  notifications: AppNotification[];
  unreadCount: number;
  notifPrefs: NotificationPref[];
  quietHours: { enabled: boolean; start: string; end: string };
  setQuietHours: (q: { enabled: boolean; start: string; end: string }) => void;

  // Attendance
  checkedInByPerson: Record<string, string | null>;
  isCheckedInToday: boolean;
  performCheckIn: () => void;

  // Customizable Quick Actions & Pinned Apps (persisted per person)
  quickActionIds: string[];
  setQuickActionIds: (ids: string[]) => void;
  pinnedAppIds: string[];
  togglePinApp: (appId: string) => void;

  // Feed Actions
  acknowledgePost: (postId: string) => void;
  toggleReaction: (postId: string, kind: 'heart' | 'clap') => void;
  toggleSavePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  createPost: (params: {
    kind: 'community' | 'kudos' | 'official';
    title?: string;
    content: string;
    audience: string;
    kudosRecipientId?: string;
    kudosTag?: string;
    mandatoryAck?: boolean;
    ackDeadline?: string;
    pinned?: boolean;
  }) => void;
  togglePinPost: (postId: string) => void;
  sendComPush: (postId: string) => void;
  sendComReminder: (postId: string) => void;
  wishBirthday: (personName: string, message?: string) => void;

  // Events Actions
  toggleEventRsvp: (eventId: string) => void;
  submitEventSurvey: (eventId: string, rating: number, note: string) => void;
  createEvent: (params: {
    title: string;
    tagline: string;
    dateLabel: string;
    timeLabel: string;
    format: 'Trực tiếp' | 'Online' | 'Hybrid';
    location: string;
    capacity: number;
  }) => void;

  // Work & Manager Actions
  resolveRequest: (requestId: string, decision: 'Đã duyệt' | 'Từ chối') => void;
  schedule1on1: (memberName: string) => void;

  // Profile & Sensitive Gate (PF-3, PF-4, PF-8)
  sensitiveUnlockedUntil: number | null;
  unlockSensitiveData: () => void;
  lockSensitiveData: () => void;
  submitHrDocument: (docId: string) => void;
  reportHrDataIssue: (field: string, note: string) => void;

  // Onboarding Actions
  toggleQuestComplete: (questId: string) => void;
  onboardingSurvey: { day30?: number; day60?: number };
  submitOnboardingSurvey: (milestone: 'day30' | 'day60', score: number) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleNotifPref: (group: NotificationGroupKey) => void;
  notify: (params: {
    recipientId: string;
    group: NotificationGroupKey;
    eventType: string;
    priority: AppNotification['priority'];
    title: string;
    body: string;
    actionRoute: string;
    actionLabel?: string;
    source: string;
  }) => void;

  // AI & MCP
  mcpServers: McpServerStatus[];
  cycleMcpStatus: (serverId: string) => void;
  aiMessages: AiMessage[];
  sendAiMessage: (prompt: string) => void;
  approveAiProposal: (messageId: string, updatedFields: Record<string, string>) => void;
  cancelAiProposal: (messageId: string) => void;
  resetAiChat: () => void;
  agentMetrics: AgentMetrics;
  recentSearches: string[];
  addRecentSearch: (q: string) => void;

  // Toasts
  toasts: ToastItem[];
  pushToast: (t: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('my-ikame-theme');
    return saved === 'light' || saved === 'dark' || saved === 'noel' ? saved : 'noel';
  });

  const [noelMode, setNoelMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('my-ikame-noel');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('my-ikame-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (noelMode) {
      document.documentElement.setAttribute('data-season', 'noel');
    } else {
      document.documentElement.removeAttribute('data-season');
    }
    localStorage.setItem('my-ikame-noel', String(noelMode));
  }, [noelMode]);

  const setThemeSafe = useCallback((next: AppTheme) => {
    setTheme(next);
    if (next === 'noel') {
      setNoelMode(true);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'noel' : 'light'));
  }, []);

  const toggleNoelMode = useCallback(() => {
    setNoelMode((prev) => {
      const next = !prev;
      if (!next && theme === 'noel') {
        setTheme('dark');
      }
      return next;
    });
  }, [theme]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [ssoLocked, setSsoLocked] = useState(false);
  const [lens, setLens] = useState<LensKey>('ikamer');
  const [people, setPeople] = useState<PersonProfile[]>(PEOPLE);
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [requests, setRequests] = useState<WorkRequest[]>(INITIAL_REQUESTS);
  const [objectives, setObjectives] = useState<ObjectiveItem[]>(INITIAL_OBJECTIVES);
  const [quests, setQuests] = useState<OnboardingQuest[]>(INITIAL_QUESTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [notifPrefsByPerson, setNotifPrefsByPerson] = useState<Record<string, NotificationPref[]>>({});
  const [quietHours, setQuietHours] = useState({ enabled: true, start: '21:00', end: '07:00' });

  const [checkedInByPerson, setCheckedInByPerson] = useState<Record<string, string | null>>({
    'u-an': null,
    'u-huy': '08:24',
    'u-mai': '08:18',
    'u-ngoc': '08:27',
  });

  const [quickActionsByPerson, setQuickActionsByPerson] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('my-ikame-quick-actions-v2');
      return saved ? { ...DEFAULT_QUICK_ACTION_IDS, ...JSON.parse(saved) } : DEFAULT_QUICK_ACTION_IDS;
    } catch {
      return DEFAULT_QUICK_ACTION_IDS;
    }
  });

  const [pinnedAppsByPerson, setPinnedAppsByPerson] = useState<Record<string, string[]>>(() => {
    const defaults: Record<string, string[]> = {
      'u-an': ['app-icheck', 'app-igoal', 'app-iwiki'],
      'u-huy': ['app-icheck', 'app-iwiki', 'app-irequest'],
      'u-mai': ['app-igoal', 'app-bmops', 'app-ihiring'],
      'u-ngoc': ['app-icheck', 'app-ihiring', 'app-iwiki'],
    };
    try {
      const saved = localStorage.getItem('my-ikame-pinned-apps');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [quickAskOpen, setQuickAskOpen] = useState(false);
  const [handoffApp, setHandoffApp] = useState<InternalApp | null>(null);
  const [appLaunchCount, setAppLaunchCount] = useState<Record<string, number>>({
    'app-icheck': 14,
    'app-igoal': 9,
    'app-iwiki': 11,
  });

  // Sensitive data step-up auth timer (5 min auto-lock + auto-lock on lens switch per PRD §7.9 PF-3)
  const [sensitiveUnlockedUntil, setSensitiveUnlockedUntil] = useState<number | null>(null);

  useEffect(() => {
    if (!sensitiveUnlockedUntil) return;
    const remaining = sensitiveUnlockedUntil - Date.now();
    if (remaining <= 0) {
      setSensitiveUnlockedUntil(null);
      return;
    }
    const timer = window.setTimeout(() => {
      setSensitiveUnlockedUntil(null);
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [sensitiveUnlockedUntil]);

  // Onboarding surveys
  const [onboardingSurvey, setOnboardingSurvey] = useState<{ day30?: number; day60?: number }>({});

  // MCP & AI Assistant
  const [mcpServers, setMcpServers] = useState<McpServerStatus[]>(INITIAL_MCP_SERVERS);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    {
      id: 'ai-welcome',
      role: 'assistant',
      timestamp: '08:30',
      text: 'Xin chào! Tôi là **Trợ lý AI My iKame** (kết nối chuẩn MCP tới HRIS, iCheck, iGoal, iWiki, iRequest, Asana, Google Calendar). Bạn muốn tổng hợp **Việc hôm nay**, tra cứu chính sách hay soạn nhanh đơn từ có duyệt?',
      sources: ['MCP Gateway · 7/7 connected'],
    },
  ]);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics>({
    tasksCompleted: 4,
    avgSecondsToReceipt: 18,
    systemsWritten: ['iCheck', 'Google Calendar', 'iGoal'],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Bảo hiểm sức khoẻ 2027',
    'Year-End Summit',
    'Chính sách WFH',
  ]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const currentPerson = useMemo(() => {
    return people.find((p) => p.lensKey === lens) || people[0];
  }, [people, lens]);

  const teamMembers = useMemo(() => {
    return people.filter((p) => p.managerId === 'u-mai');
  }, [people]);

  const notifPrefs = useMemo(() => {
    return notifPrefsByPerson[currentPerson.id] || INITIAL_NOTIFICATION_PREFS;
  }, [notifPrefsByPerson, currentPerson.id]);

  // Centralized notify(event) engine respecting recipient settings (PRD §7.8 NT-1, NT-4)
  const notify = useCallback(
    (params: {
      recipientId: string;
      group: NotificationGroupKey;
      eventType: string;
      priority: AppNotification['priority'];
      title: string;
      body: string;
      actionRoute: string;
      actionLabel?: string;
      source: string;
    }) => {
      const recipientPrefs = notifPrefsByPerson[params.recipientId] || INITIAL_NOTIFICATION_PREFS;
      const pref = recipientPrefs.find((p) => p.group === params.group);
      // Mandatory group is always allowed even if anything else is off
      if (pref && !pref.locked && !pref.enabled) {
        return;
      }
      const next: AppNotification = {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        recipientId: params.recipientId,
        group: params.group,
        eventType: params.eventType,
        priority: params.priority,
        channels: params.priority === 'critical' ? ['push', 'in-app'] : ['in-app', 'digest'],
        title: params.title,
        body: params.body,
        timeLabel: 'Vừa xong',
        read: false,
        actionRoute: params.actionRoute,
        actionLabel: params.actionLabel,
        source: params.source,
      };
      setNotifications((prev) => [next, ...prev]);
    },
    [notifPrefsByPerson]
  );

  const switchLens = useCallback(
    (next: LensKey) => {
      setLens(next);
      // PRD §7.9 PF-3: immediately lock sensitive profile data on lens switch
      setSensitiveUnlockedUntil(null);
      const nextPerson = people.find((p) => p.lensKey === next);
      if (nextPerson) {
        pushToast({
          title: `Đã chuyển sang lăng kính ${
            next === 'ikamer'
              ? 'iKamer'
              : next === 'ikamer_new'
                ? 'iKamer · Người mới'
                : next === 'manager'
                  ? 'Manager'
                  : 'COM Admin'
          }`,
          description: `${nextPerson.name} — ${nextPerson.title}`,
          tone: 'info',
        });
      }
    },
    [people, pushToast]
  );

  const isCheckedInToday = Boolean(checkedInByPerson[currentPerson.id]);

  const quickActionIds = useMemo(
    () => quickActionsByPerson[currentPerson.id] || DEFAULT_QUICK_ACTION_IDS[currentPerson.id] || DEFAULT_QUICK_ACTION_IDS['u-an'],
    [quickActionsByPerson, currentPerson.id]
  );

  const setQuickActionIds = useCallback(
    (ids: string[]) => {
      setQuickActionsByPerson((prev) => {
        const next = { ...prev, [currentPerson.id]: ids };
        try {
          localStorage.setItem('my-ikame-quick-actions-v2', JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });
    },
    [currentPerson.id]
  );

  const pinnedAppIds = useMemo(
    () => pinnedAppsByPerson[currentPerson.id] || ['app-icheck', 'app-igoal', 'app-iwiki'],
    [pinnedAppsByPerson, currentPerson.id]
  );

  const togglePinApp = useCallback(
    (appId: string) => {
      setPinnedAppsByPerson((prev) => {
        const list = prev[currentPerson.id] || [];
        const exists = list.includes(appId);
        const nextList = exists ? list.filter((id) => id !== appId) : [...list, appId];
        const next = { ...prev, [currentPerson.id]: nextList };
        try {
          localStorage.setItem('my-ikame-pinned-apps', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [currentPerson.id]
  );

  const todayItems = useMemo(() => {
    return buildTodayItems({
      person: currentPerson,
      posts,
      events,
      objectives,
      quests,
      checkedInToday: isCheckedInToday,
      isComAdmin: lens === 'com_admin',
    });
  }, [currentPerson, posts, events, objectives, quests, isCheckedInToday, lens]);

  const userNotifications = useMemo(
    () => notifications.filter((n) => n.recipientId === currentPerson.id),
    [notifications, currentPerson.id]
  );

  const unreadCount = useMemo(
    () => userNotifications.filter((n) => !n.read).length,
    [userNotifications]
  );

  const performCheckIn = useCallback(() => {
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setCheckedInByPerson((prev) => ({ ...prev, [currentPerson.id]: now }));
    pushToast({
      title: `Đã chấm công thành công lúc ${now}`,
      description: 'Đã đồng bộ trạng thái về iCheck qua MCP.',
      tone: 'success',
    });
  }, [currentPerson.id, pushToast]);

  const acknowledgePost = useCallback(
    (postId: string) => {
      if (lens === 'com_admin') {
        pushToast({
          title: 'COM Admin không thể xác nhận hộ',
          description: 'Theo quy định phân quyền, COM chỉ theo dõi tỷ lệ phân phối.',
          tone: 'warning',
        });
        return;
      }
      const stamp = `27/11 · ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId || p.ackedBy[currentPerson.id]) return p;
          return {
            ...p,
            ackedBy: { ...p.ackedBy, [currentPerson.id]: stamp },
            readCount: Math.min(p.totalAudienceCount, p.readCount + 1),
          };
        })
      );
      pushToast({
        title: 'Đã xác nhận đã đọc thông báo',
        description: `Ghi nhận lúc ${stamp} · Số liệu COM đã cập nhật tức thì.`,
        tone: 'success',
      });
    },
    [currentPerson.id, lens, pushToast]
  );

  const toggleReaction = useCallback(
    (postId: string, kind: 'heart' | 'clap') => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const list = p.reactions[kind];
          const exists = list.includes(currentPerson.id);
          return {
            ...p,
            reactions: {
              ...p.reactions,
              [kind]: exists ? list.filter((id) => id !== currentPerson.id) : [...list, currentPerson.id],
            },
          };
        })
      );
    },
    [currentPerson.id]
  );

  const toggleSavePost = useCallback(
    (postId: string) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const exists = p.savedBy.includes(currentPerson.id);
          return {
            ...p,
            savedBy: exists ? p.savedBy.filter((id) => id !== currentPerson.id) : [...p.savedBy, currentPerson.id],
          };
        })
      );
      pushToast({ title: 'Đã cập nhật danh sách Đã lưu', tone: 'info' });
    },
    [currentPerson.id, pushToast]
  );

  const addComment = useCallback(
    (postId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `c-${Date.now()}`,
                authorId: currentPerson.id,
                authorName: currentPerson.name,
                authorTitle: currentPerson.title,
                content: trimmed,
                createdAt: 'Vừa xong',
              },
            ],
          };
        })
      );
      pushToast({ title: 'Đã đăng bình luận', tone: 'success' });
    },
    [currentPerson, pushToast]
  );

  const createPost = useCallback(
    (params: {
      kind: 'community' | 'kudos' | 'official';
      title?: string;
      content: string;
      audience: string;
      kudosRecipientId?: string;
      kudosTag?: string;
      mandatoryAck?: boolean;
      ackDeadline?: string;
      pinned?: boolean;
    }) => {
      const recipient = params.kudosRecipientId
        ? people.find((p) => p.id === params.kudosRecipientId)
        : undefined;
      const newPost: FeedPost = {
        id: `post-${Date.now()}`,
        kind: params.kind,
        title: params.title,
        summary: params.content.slice(0, 140),
        content: params.content,
        keyTakeaways:
          params.kind === 'official'
            ? ['Thông báo mới vừa được phát hành từ COM CMS.', 'Hiệu lực ngay từ thời điểm đăng tải.']
            : undefined,
        whyYouSeeThis:
          params.kind === 'official'
            ? `Thông báo chính thức từ COM gửi tới ${params.audience === 'all' ? 'Toàn công ty' : `Team ${params.audience}`}.`
            : undefined,
        authorId: currentPerson.id,
        authorName: currentPerson.name,
        authorTitle: currentPerson.title,
        authorTeam: currentPerson.team,
        audience: params.audience,
        createdAt: new Date().toISOString(),
        timeLabel: 'Vừa xong',
        pinned: params.pinned,
        pinExpiresAt: params.pinned ? '10/12/2026' : undefined,
        mandatoryAck: params.mandatoryAck,
        ackReason: params.mandatoryAck ? 'Thông báo chính thức cần xác nhận đã đọc' : undefined,
        ackDeadline: params.ackDeadline || '05/12/2026',
        ackOverdue: false,
        ackedBy: {},
        reachCount: params.audience === 'all' ? 184 : 24,
        readCount: 1,
        totalAudienceCount: params.audience === 'all' ? 184 : 24,
        reminderCount: 0,
        pushSent: params.mandatoryAck,
        kudosRecipientId: recipient?.id,
        kudosRecipientName: recipient?.name,
        kudosTag: params.kudosTag,
        reactions: { heart: [], clap: [] },
        comments: [],
        savedBy: [],
        tags:
          params.kind === 'kudos'
            ? ['Kudos', params.kudosTag || 'Ghi nhận']
            : params.kind === 'official'
              ? ['Tin COM', params.mandatoryAck ? 'Bắt buộc' : 'Chính thức']
              : ['Chia sẻ', params.audience === 'all' ? 'Toàn công ty' : params.audience],
      };

      setPosts((prev) => [newPost, ...prev]);

      if (recipient) {
        notify({
          recipientId: recipient.id,
          group: 'feed',
          eventType: 'Kudos',
          priority: 'informational',
          title: `${currentPerson.name} vừa gửi Kudos cho bạn 🎉`,
          body: params.content.slice(0, 90),
          actionRoute: '/feed',
          actionLabel: 'Xem Kudos',
          source: 'iKame Feed',
        });
      }

      if (params.kind === 'official' && params.mandatoryAck) {
        for (const p of people) {
          if (p.id !== currentPerson.id && (params.audience === 'all' || p.team === params.audience)) {
            notify({
              recipientId: p.id,
              group: 'mandatory',
              eventType: 'Tin bắt buộc xác nhận',
              priority: 'critical',
              title: `[Bắt buộc] ${params.title || 'Thông báo mới từ COM'}`,
              body: `Hạn xác nhận ${params.ackDeadline || '05/12/2026'}`,
              actionRoute: `/feed/article/${newPost.id}`,
              actionLabel: 'Đọc & xác nhận',
              source: 'COM',
            });
          }
        }
      }

      pushToast({
        title:
          params.kind === 'kudos'
            ? `Đã gửi ghi nhận tới ${recipient?.name}`
            : params.kind === 'official'
              ? 'Đã xuất bản thông báo chính thức'
              : 'Đã đăng bài lên iKame Feed',
        tone: 'success',
      });
    },
    [currentPerson, people, notify, pushToast]
  );

  const togglePinPost = useCallback(
    (postId: string) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const nextPinned = !p.pinned;
          return { ...p, pinned: nextPinned, pinExpiresAt: nextPinned ? '10/12/2026' : undefined };
        })
      );
      pushToast({ title: 'Đã cập nhật trạng thái ghim bài viết', tone: 'info' });
    },
    [pushToast]
  );

  const sendComPush = useCallback(
    (postId: string) => {
      const target = posts.find((p) => p.id === postId);
      if (!target) return;
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, pushSent: true } : p)));
      pushToast({
        title: 'Đã gửi Web/In-app Push thông báo',
        description: `Phân phối tới ${target.totalAudienceCount} iKamer thuộc đối tượng nhận.`,
        tone: 'success',
      });
    },
    [posts, pushToast]
  );

  const sendComReminder = useCallback(
    (postId: string) => {
      const target = posts.find((p) => p.id === postId);
      if (!target) return;
      if (target.reminderCount >= 3) {
        pushToast({
          title: 'Đã đạt trần 3 lần nhắc (quy tắc NT-6)',
          description: 'Hệ thống giới hạn tối đa 3 lần nhắc cách nhau 24h để tránh làm phiền.',
          tone: 'warning',
        });
        return;
      }
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, reminderCount: p.reminderCount + 1 } : p))
      );
      for (const p of people) {
        if (p.lensKey !== 'com_admin' && !target.ackedBy[p.id]) {
          notify({
            recipientId: p.id,
            group: 'mandatory',
            eventType: 'Nhắc xác nhận',
            priority: 'critical',
            title: `Nhắc lần ${target.reminderCount + 1}/3: ${target.title}`,
            body: 'Vui lòng đọc và xác nhận đã nắm thông báo bắt buộc.',
            actionRoute: `/feed/article/${target.id}`,
            actionLabel: 'Đọc & xác nhận',
            source: 'COM',
          });
        }
      }
      pushToast({
        title: `Đã gửi nhắc xác nhận lần ${target.reminderCount + 1}/3`,
        description: 'Chỉ gửi tới những iKamer chưa xác nhận.',
        tone: 'success',
      });
    },
    [posts, people, notify, pushToast]
  );

  const wishBirthday = useCallback(
    (personName: string, message?: string) => {
      pushToast({
        title: `Đã gửi lời chúc tới ${personName} 🎉`,
        description: message?.trim()
          ? `"${message.trim()}"`
          : 'Lời chúc đã xuất hiện dưới bài chúc mừng hôm nay.',
        tone: 'success',
      });
    },
    [pushToast]
  );

  const toggleEventRsvp = useCallback(
    (eventId: string) => {
      const ev = events.find((e) => e.id === eventId);
      if (!ev || ev.status === 'cancelled' || ev.status === 'past') return;
      const isReg = ev.registeredIds.includes(currentPerson.id);
      const isWait = ev.waitlistIds.includes(currentPerson.id);

      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== eventId) return e;
          if (isReg) {
            // Promote first waitlist member if any
            const nextReg = e.registeredIds.filter((id) => id !== currentPerson.id);
            const [promoted, ...restWait] = e.waitlistIds;
            return {
              ...e,
              registeredIds: promoted ? [...nextReg, promoted] : nextReg,
              waitlistIds: restWait,
            };
          }
          if (isWait) {
            return { ...e, waitlistIds: e.waitlistIds.filter((id) => id !== currentPerson.id) };
          }
          if (e.registeredIds.length >= e.capacity) {
            return { ...e, waitlistIds: [...e.waitlistIds, currentPerson.id] };
          }
          return { ...e, registeredIds: [...e.registeredIds, currentPerson.id] };
        })
      );

      if (isReg || isWait) {
        pushToast({ title: 'Đã huỷ đăng ký sự kiện', description: ev.title, tone: 'info' });
      } else if (ev.registeredIds.length >= ev.capacity) {
        pushToast({
          title: 'Đã ghi tên vào Danh sách chờ',
          description: 'Hệ thống sẽ tự động báo khi có suất trống.',
          tone: 'warning',
        });
      } else {
        notify({
          recipientId: currentPerson.id,
          group: 'events',
          eventType: 'Xác nhận đăng ký',
          priority: 'transactional',
          title: `Đăng ký thành công: ${ev.title}`,
          body: `${ev.dateLabel} · ${ev.timeLabel}. Nhắc trước sự kiện 1 ngày đã bật.`,
          actionRoute: `/events/${ev.id}`,
          actionLabel: 'Xem chi tiết',
          source: 'Sự kiện',
        });
        pushToast({
          title: 'Đăng ký sự kiện thành công!',
          description: 'Bạn có thể bấm "Thêm vào lịch (.ics)" ngay trên thẻ sự kiện.',
          tone: 'success',
        });
      }
    },
    [events, currentPerson.id, notify, pushToast]
  );

  const submitEventSurvey = useCallback(
    (eventId: string, rating: number, _note: string) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId && !e.surveySubmittedBy.includes(currentPerson.id)
            ? { ...e, surveySubmittedBy: [...e.surveySubmittedBy, currentPerson.id] }
            : e
        )
      );
      pushToast({
        title: `Cảm ơn bạn đã đánh giá ${rating}/5 sao!`,
        description: 'Phản hồi đã gửi tới ban tổ chức COM.',
        tone: 'success',
      });
    },
    [currentPerson.id, pushToast]
  );

  const createEvent = useCallback(
    (params: {
      title: string;
      tagline: string;
      dateLabel: string;
      timeLabel: string;
      format: 'Trực tiếp' | 'Online' | 'Hybrid';
      location: string;
      capacity: number;
    }) => {
      const next: EventItem = {
        id: `ev-${Date.now()}`,
        title: params.title,
        tagline: params.tagline,
        description: params.tagline,
        status: 'upcoming',
        audience: 'all',
        startAt: '2026-12-12T15:00:00+07:00',
        endAt: '2026-12-12T17:00:00+07:00',
        dateLabel: params.dateLabel,
        monthGroup: 'Tháng 12 / 2026',
        timeLabel: params.timeLabel,
        format: params.format,
        location: params.location,
        organizer: 'Internal Comms (COM)',
        capacity: params.capacity,
        registeredIds: [currentPerson.id],
        waitlistIds: [],
        rsvpDeadline: '10/12/2026',
        agenda: [{ time: '15:00', title: 'Đón khách & Khai mạc chương trình' }],
        coverGradient: 'linear-gradient(135deg, #27221F 0%, #63311B 60%, #F76226 100%)',
        coverAccent: '#F76226',
        surveySubmittedBy: [],
      };
      setEvents((prev) => [next, ...prev]);
      pushToast({ title: 'Đã tạo sự kiện mới thành công', description: params.title, tone: 'success' });
    },
    [currentPerson.id, pushToast]
  );

  const resolveRequest = useCallback(
    (requestId: string, decision: 'Đã duyệt' | 'Từ chối') => {
      const target = requests.find((r) => r.id === requestId);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: decision, reviewerNote: `${decision} bởi ${currentPerson.name}` }
            : r
        )
      );
      if (target) {
        notify({
          recipientId: target.personId,
          group: 'work_icheck',
          eventType: 'Đơn có kết quả',
          priority: 'transactional',
          title: `Đơn ${target.type} của bạn đã được ${decision.toLowerCase()}`,
          body: `${target.summary} (${target.dateRange}) · xử lý bởi ${currentPerson.name}.`,
          actionRoute: '/work',
          actionLabel: 'Xem đề xuất',
          source: 'iCheck / Manager',
        });
        pushToast({
          title: `Đã ${decision.toLowerCase()} yêu cầu của ${target.personName}`,
          description: 'Người gửi đã nhận thông báo tự động.',
          tone: decision === 'Đã duyệt' ? 'success' : 'warning',
        });
      }
    },
    [requests, currentPerson.name, notify, pushToast]
  );

  const schedule1on1 = useCallback(
    (memberName: string) => {
      pushToast({
        title: `Đã gửi lời mời 1:1 tới ${memberName}`,
        description: 'Gợi ý khung giờ trống 20 phút vào Thứ 2 tới qua Google Calendar.',
        tone: 'success',
      });
    },
    [pushToast]
  );

  const unlockSensitiveData = useCallback(() => {
    setSensitiveUnlockedUntil(Date.now() + 5 * 60 * 1000);
    pushToast({
      title: 'Đã xác thực bảo mật thành công',
      description: 'Dữ liệu nhạy cảm mở khoá trong 5 phút và tự khoá khi đổi lăng kính.',
      tone: 'success',
    });
  }, [pushToast]);

  const lockSensitiveData = useCallback(() => {
    setSensitiveUnlockedUntil(null);
    pushToast({ title: 'Đã khoá lại thông tin nhạy cảm', tone: 'info' });
  }, [pushToast]);

  const submitHrDocument = useCallback(
    (docId: string) => {
      setPeople((prev) =>
        prev.map((p) => {
          if (p.id !== currentPerson.id) return p;
          return {
            ...p,
            documents: p.documents.map((d) =>
              d.id === docId ? { ...d, status: 'complete', updatedAt: '27/11/2026', note: 'Đã nộp bản điện tử — P&OD xác nhận' } : d
            ),
          };
        })
      );
      pushToast({
        title: 'Đã nộp bổ sung giấy tờ thành công',
        description: 'Mục tương ứng trong Việc hôm nay đã được hoàn tất.',
        tone: 'success',
      });
    },
    [currentPerson.id, pushToast]
  );

  const reportHrDataIssue = useCallback(
    (field: string, note: string) => {
      pushToast({
        title: 'Đã gửi yêu cầu rà soát dữ liệu tới P&OD',
        description: `Trường "${field}": ${note}`,
        tone: 'success',
      });
    },
    [pushToast]
  );

  const toggleQuestComplete = useCallback(
    (questId: string) => {
      const target = quests.find((q) => q.id === questId);
      if (!target) return;
      const nextCompleted = !target.completed;
      const updatedQuests = quests.map((q) => (q.id === questId ? { ...q, completed: nextCompleted } : q));
      setQuests(updatedQuests);

      // PRD §7.10 OB-7: Completing all M3 (30-day) quests awards badge + auto-generates Feed lifecycle post + notification!
      const m3Done = updatedQuests.filter((q) => q.milestoneId === 'm3').every((q) => q.completed);
      if (nextCompleted && target.milestoneId === 'm3' && m3Done) {
        const alreadyHasBadge = people
          .find((p) => p.id === 'u-huy')
          ?.badges.some((b) => b.id === 'b-huy-30d');

        if (!alreadyHasBadge) {
          setPeople((prev) =>
            prev.map((p) =>
              p.id === 'u-huy'
                ? {
                    ...p,
                    badges: [
                      {
                        id: 'b-huy-30d',
                        label: 'Vững vàng 30 ngày',
                        kind: 'onboarding',
                        earnedAt: '27/11/2026',
                        description: 'Hoàn thành trọn vẹn cột mốc 30 ngày hội nhập',
                      },
                      ...p.badges,
                    ],
                  }
                : p
            )
          );

          const autoPost: FeedPost = {
            id: `post-lifecycle-huy-30d-${Date.now()}`,
            kind: 'lifecycle',
            title: 'Chúc mừng Phạm Gia Huy hoàn thành cột mốc Vững vàng 30 ngày!',
            content:
              'Phạm Gia Huy (Frontend Engineer · Product Engineering) vừa hoàn thành trọn vẹn 9/9 nhiệm vụ giai đoạn 30 ngày đầu tiên tại iKame cùng Buddy Nguyễn Hoàng An. Cùng gửi lời chúc mừng chặng đường sắp tới nhé!',
            authorId: 'system-onboarding',
            authorName: 'My iKame · Hành trình 60 ngày',
            authorTitle: 'Bài tự động từ cột mốc hội nhập',
            authorTeam: 'Toàn công ty',
            audience: 'all',
            createdAt: new Date().toISOString(),
            timeLabel: 'Vừa xong',
            ackedBy: {},
            reachCount: 184,
            readCount: 1,
            totalAudienceCount: 184,
            reminderCount: 0,
            lifecycleSource: 'Hành trình 60 ngày · Mốc 30 ngày',
            reactions: { heart: [], clap: [] },
            comments: [],
            savedBy: [],
            tags: ['Hành trình 60 ngày', 'Mốc 30 ngày'],
          };
          setPosts((prev) => [autoPost, ...prev]);

          notify({
            recipientId: 'u-huy',
            group: 'onboarding',
            eventType: 'Đạt cột mốc',
            priority: 'informational',
            title: 'Chúc mừng bạn đạt huy hiệu "Vững vàng 30 ngày" 🏅',
            body: 'Huy hiệu đã xuất hiện trên Hồ sơ và bài chúc mừng đã đăng lên iKame Feed!',
            actionRoute: '/profile',
            actionLabel: 'Xem huy hiệu',
            source: 'Hành trình 60 ngày',
          });

          pushToast({
            title: 'Mở khoá huy hiệu "Vững vàng 30 ngày" 🏅',
            description: 'Đã tự động đăng bài chúc mừng trên iKame Feed và gắn vào Hồ sơ!',
            tone: 'success',
          });
          return;
        }
      }

      pushToast({
        title: nextCompleted ? 'Đã hoàn thành nhiệm vụ' : 'Đã đánh dấu chưa xong',
        description: target.title,
        tone: 'info',
      });
    },
    [quests, people, notify, pushToast]
  );

  const submitOnboardingSurvey = useCallback(
    (milestone: 'day30' | 'day60', score: number) => {
      setOnboardingSurvey((prev) => ({ ...prev, [milestone]: score }));
      pushToast({
        title: `Đã gửi khảo sát mốc ${milestone === 'day30' ? '30 ngày' : '60 ngày'}`,
        description: 'Phản hồi được tổng hợp ẩn danh gửi về P&OD.',
        tone: 'success',
      });
    },
    [pushToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => (n.recipientId === currentPerson.id ? { ...n, read: true } : n))
    );
    pushToast({ title: 'Đã đánh dấu đọc tất cả thông báo', tone: 'info' });
  }, [currentPerson.id, pushToast]);

  const toggleNotifPref = useCallback(
    (group: NotificationGroupKey) => {
      setNotifPrefsByPerson((prev) => {
        const list = prev[currentPerson.id] || INITIAL_NOTIFICATION_PREFS;
        return {
          ...prev,
          [currentPerson.id]: list.map((item) =>
            item.group === group && !item.locked ? { ...item, enabled: !item.enabled } : item
          ),
        };
      });
    },
    [currentPerson.id]
  );

  const launchApp = useCallback((app: InternalApp) => {
    setAppLaunchCount((prev) => ({ ...prev, [app.id]: (prev[app.id] || 0) + 1 }));
    setHandoffApp(app);
  }, []);

  const closeHandoff = useCallback(() => setHandoffApp(null), []);

  const cycleMcpStatus = useCallback(
    (serverId: string) => {
      setMcpServers((prev) =>
        prev.map((s) => {
          if (s.id !== serverId) return s;
          const next = s.status === 'connected' ? 'degraded' : s.status === 'degraded' ? 'offline' : 'connected';
          pushToast({
            title: `MCP ${s.name}: ${next}`,
            description:
              next === 'connected'
                ? 'Kết nối ổn định.'
                : 'Mô phỏng sự cố nguồn ngoài để kiểm chứng AI báo lỗi minh bạch.',
            tone: next === 'connected' ? 'success' : 'warning',
          });
          return { ...s, status: next };
        })
      );
    },
    [pushToast]
  );

  const sendAiMessage = useCallback(
    (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) return;
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const userMsg: AiMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: nowStr,
      };
      const reply = routeAiPrompt({
        prompt: trimmed,
        lens,
        person: currentPerson,
        todayItems,
        servers: mcpServers,
        posts,
        events,
        objectives,
        requests,
        teamMembers,
        knowledgeDocs: KNOWLEDGE_DOCS,
      });
      setAiMessages((prev) => [...prev, userMsg, reply]);
    },
    [lens, currentPerson, todayItems, mcpServers, posts, events, objectives, requests, teamMembers]
  );

  const openAiWithPrompt = useCallback(
    (prompt: string) => {
      setQuickAskOpen(true);
      sendAiMessage(prompt);
    },
    [sendAiMessage]
  );

  const approveAiProposal = useCallback(
    (messageId: string, updatedFields: Record<string, string>) => {
      const targetMsg = aiMessages.find((m) => m.id === messageId);
      const prop = targetMsg?.actionProposal;
      if (!prop || prop.status !== 'pending') return;

      const receiptId = `RCP-${Math.floor(100000 + Math.random() * 899999)}`;
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dur = 12 + Math.floor(Math.random() * 11);

      setAiMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId || !m.actionProposal) return m;
          return {
            ...m,
            actionProposal: {
              ...m.actionProposal,
              fields: m.actionProposal.fields.map((f) => ({
                ...f,
                value: updatedFields[f.key] ?? f.value,
              })),
              status: 'approved',
              receiptId,
              executedAt: nowStr,
              durationSec: dur,
            },
          };
        })
      );

      // Mutate real app state so Work/Manager/Objectives reflect the MCP execution!
      if (prop.server === 'iCheck' || prop.server === 'iRequest' || prop.server === 'Google Calendar') {
        const reqType: WorkRequest['type'] =
          prop.tool === 'create_leave_request'
            ? 'Nghỉ phép'
            : prop.tool === 'create_wfh_request'
              ? 'WFH'
              : prop.tool === 'report_missing_checkin'
                ? 'Quên chấm công'
                : prop.tool === 'create_late_early_request'
                  ? 'Đi muộn / Về sớm'
                  : prop.tool === 'book_room'
                    ? 'Đặt phòng họp'
                    : 'Thiết bị / IT';

        const newReq: WorkRequest = {
          id: `req-${Date.now()}`,
          personId: currentPerson.id,
          personName: currentPerson.name,
          type: reqType,
          summary: prop.title,
          dateRange: updatedFields.dateRange || updatedFields.room || 'Hôm nay',
          reason: updatedFields.reason || 'Gửi qua Trợ lý AI MCP',
          status: prop.tool === 'book_room' ? 'Đã duyệt' : 'Chờ duyệt',
          createdAt: `Hôm nay · ${nowStr}`,
          sourceTool: `${prop.server} · ${prop.tool}`,
        };
        setRequests((prev) => [newReq, ...prev]);

        if (currentPerson.managerId && prop.tool !== 'book_room') {
          notify({
            recipientId: currentPerson.managerId,
            group: 'manager',
            eventType: 'Đơn chờ duyệt',
            priority: 'required',
            title: `${currentPerson.name} vừa gửi ${reqType}`,
            body: `${newReq.dateRange} — ${newReq.reason}`,
            actionRoute: '/manager/overview',
            actionLabel: 'Duyệt ngay',
            source: prop.server,
          });
        }
      } else if (prop.server === 'iGoal' && prop.tool === 'submit_checkin') {
        const numeric = parseInt((updatedFields.progress || '82').replace(/\D/g, ''), 10) || 82;
        setObjectives((prev) =>
          prev.map((o) =>
            o.ownerId === currentPerson.id
              ? { ...o, progress: Math.min(100, numeric), needsCheckin: false, lastCheckin: '27/11/2026' }
              : o
          )
        );
      }

      setAgentMetrics((prev) => ({
        tasksCompleted: prev.tasksCompleted + 1,
        avgSecondsToReceipt: Math.round((prev.avgSecondsToReceipt + dur) / 2),
        systemsWritten: prev.systemsWritten.includes(prop.server)
          ? prev.systemsWritten
          : [...prev.systemsWritten, prop.server],
      }));

      notify({
        recipientId: currentPerson.id,
        group: 'work_icheck',
        eventType: 'Đơn đã gửi',
        priority: 'transactional',
        title: `Biên nhận ${receiptId}: ${prop.title}`,
        body: `Thực thi thành công via MCP · ${prop.server}.${prop.tool}`,
        actionRoute: '/work',
        actionLabel: 'Xem đề xuất',
        source: prop.server,
      });

      pushToast({
        title: `Thực thi thành công (${receiptId})`,
        description: `via MCP · ${prop.server}.${prop.tool}`,
        tone: 'success',
      });
    },
    [aiMessages, currentPerson, notify, pushToast]
  );

  const cancelAiProposal = useCallback((messageId: string) => {
    setAiMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.actionProposal
          ? { ...m, actionProposal: { ...m.actionProposal, status: 'cancelled' } }
          : m
      )
    );
  }, []);

  const resetAiChat = useCallback(() => {
    setAiMessages([
      {
        id: `ai-reset-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        text: 'Đã tạo cuộc hội thoại mới. Bạn cần tôi hỗ trợ việc gì hôm nay?',
        sources: ['MCP Gateway · Ready'],
      },
    ]);
  }, []);

  const addRecentSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 6));
  }, []);

  const value: AppContextValue = {
    theme,
    setTheme: setThemeSafe,
    toggleTheme,
    noelMode,
    toggleNoelMode,
    sidebarCollapsed,
    setSidebarCollapsed,
    ssoLocked,
    setSsoLocked,
    lens,
    switchLens,
    currentPerson,
    people,
    teamMembers,
    searchOpen,
    setSearchOpen,
    notifDrawerOpen,
    setNotifDrawerOpen,
    quickAskOpen,
    setQuickAskOpen,
    openAiWithPrompt,
    handoffApp,
    launchApp,
    closeHandoff,
    appLaunchCount,
    posts,
    events,
    requests,
    objectives,
    quests,
    todayItems,
    notifications: userNotifications,
    unreadCount,
    notifPrefs,
    quietHours,
    setQuietHours,
    checkedInByPerson,
    isCheckedInToday,
    performCheckIn,
    quickActionIds,
    setQuickActionIds,
    pinnedAppIds,
    togglePinApp,
    acknowledgePost,
    toggleReaction,
    toggleSavePost,
    addComment,
    createPost,
    togglePinPost,
    sendComPush,
    sendComReminder,
    wishBirthday,
    toggleEventRsvp,
    submitEventSurvey,
    createEvent,
    resolveRequest,
    schedule1on1,
    sensitiveUnlockedUntil,
    unlockSensitiveData,
    lockSensitiveData,
    submitHrDocument,
    reportHrDataIssue,
    toggleQuestComplete,
    onboardingSurvey,
    submitOnboardingSurvey,
    markNotificationRead,
    markAllNotificationsRead,
    toggleNotifPref,
    notify,
    mcpServers,
    cycleMcpStatus,
    aiMessages,
    sendAiMessage,
    approveAiProposal,
    cancelAiProposal,
    resetAiChat,
    agentMetrics,
    recentSearches,
    addRecentSearch,
    toasts,
    pushToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
