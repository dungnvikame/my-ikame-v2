import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Flame,
  Heart,
  History,
  MapPin,
  Send,
  Snowflake,
  Sparkles,
  User,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import ikameMascot from '../assets/ikame-mascot.png';
import { useApp } from '../context/AppContext';
import { KNOWLEDGE_DOCS } from '../data/mockData';
import { QUICK_ACTIONS_CATALOG } from '../lib/quickActions';
import { rankFeedPostsForUser } from '../lib/ranking';
import { QuickActionsBar } from '../components/QuickActionsBar';
import { FullPageCheckInCelebration } from '../components/FestiveEffects';
import { Modal } from '../components/UI';

const MASCOT_TAPS = [
  'Hôm nay làm gọn từng việc một nhé! 🔥',
  'Cần tìm gì cứ gõ thanh AI bên dưới nha ✨',
  'Đừng quên uống nước và nghỉ mắt 5 phút!',
];

const WISH_STARTERS = [
  'Chúc mừng Khoa tròn 2 năm rực rỡ tại iKame! 🎉',
  'Cảm ơn Khoa luôn hết mình và đồng hành cùng team! 🔥',
  'Chúc Khoa thêm nhiều dự án bùng nổ trong năm mới nhé!',
];

const WEEK_ON_TIME_LOG = [
  { day: 'T2', time: '08:19', ok: true },
  { day: 'T3', time: '08:24', ok: true },
  { day: 'T4', time: '08:21', ok: true },
  { day: 'T5', time: '08:25', ok: true },
];

interface InstantSuggestion {
  id: string;
  section?: 'recent' | 'suggest';
  group: 'Gần đây' | 'Lệnh nhanh' | 'Đồng nghiệp' | 'Tri thức' | 'Tin tức' | 'Trợ lý AI';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  run: () => void;
}

interface RecentSearchItem {
  id: string;
  title: string;
  subtitle: string;
  kind: 'ai' | 'route';
  payload: string;
}

const RECENT_STORAGE_KEY = 'my-ikame-home-recent-v1';

const DEFAULT_RECENTS: RecentSearchItem[] = [
  {
    id: 'rec-care-2027',
    title: 'Chính sách bảo hiểm iKame Care 2027',
    subtitle: 'Tri thức · Phúc lợi',
    kind: 'route',
    payload: '/support/policies',
  },
  {
    id: 'rec-weekly-report',
    title: 'Viết báo cáo tuần này',
    subtitle: 'Trợ lý AI · Tổng hợp tuần 48',
    kind: 'ai',
    payload: 'Viết báo cáo tuần này',
  },
];

function loadRecentSearches(): RecentSearchItem[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return DEFAULT_RECENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 4) : DEFAULT_RECENTS;
  } catch {
    return DEFAULT_RECENTS;
  }
}

interface TodayMeetingItem {
  id: string;
  time: string;
  timeRange: string;
  title: string;
  place: string;
  isMeet: boolean;
  status: 'past' | 'soon' | 'upcoming';
  countdown: string;
  agenda: string;
  attendees: { initials: string; name: string; bg: string; fg: string }[];
}

type HomeFeedFilter = 'all' | 'official' | 'kudos' | 'community';

const FEED_FILTER_OPTIONS: { id: HomeFeedFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'official', label: 'Thông báo' },
  { id: 'kudos', label: 'Kudos' },
  { id: 'community', label: 'Cộng đồng' },
];

function parseDateTile(dateLabel: string): { day: string; month: string } {
  const m = dateLabel.match(/(\d{1,2})\/(\d{1,2})/);
  if (!m) return { day: '28', month: 'TH11' };
  return { day: m[1].padStart(2, '0'), month: `TH${m[2]}` };
}

function getTimeGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Chào buổi sáng';
  if (hour >= 12 && hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

export const HomePage: React.FC = () => {
  const {
    noelMode,
    currentPerson,
    people,
    posts,
    events,
    todayItems,
    quests,
    checkedInByPerson,
    isCheckedInToday,
    performCheckIn,
    openAiWithPrompt,
    setSearchOpen,
    wishBirthday,
    pushToast,
    lens,
  } = useApp();

  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState('');
  const [omniOpen, setOmniOpen] = useState(false);
  const [omniIdx, setOmniIdx] = useState(0);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() => loadRecentSearches());
  const omniRef = useRef<HTMLDivElement>(null);
  const omniInputRef = useRef<HTMLInputElement>(null);

  const [taskFilter, setTaskFilter] = useState<'all' | 'urgent'>('all');
  const [feedFilter, setFeedFilter] = useState<HomeFeedFilter>('all');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [celebrationCount, setCelebrationCount] = useState(0);
  const [celebrationTime, setCelebrationTime] = useState('');
  const [mascotNoteIdx, setMascotNoteIdx] = useState<number | null>(null);

  // Live minute ticker for dynamic greeting & meeting countdown
  const [nowDate, setNowDate] = useState<Date>(() => new Date());
  const [minutesLeft, setMinutesLeft] = useState<number>(15);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowDate(new Date());
      setMinutesLeft((m) => (m > 1 ? m - 1 : 1));
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  // Close Google Instant Dropdown on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (omniRef.current && !omniRef.current.contains(e.target as Node)) {
        setOmniOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Wish Pop-up Form state
  const [wishModalOpen, setWishModalOpen] = useState(false);
  const [wishMessage, setWishMessage] = useState('');
  const [wishedKhoa, setWishedKhoa] = useState(false);

  // Global "/" keyboard shortcut on Home -> focus Hero AI Omni-Bar & open dropdown
  useEffect(() => {
    const handleSlashShortcut = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || wishModalOpen) return;
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || active?.isContentEditable) return;

      e.preventDefault();
      omniInputRef.current?.focus();
      setOmniOpen(true);
      setOmniIdx(0);
    };
    window.addEventListener('keydown', handleSlashShortcut);
    return () => window.removeEventListener('keydown', handleSlashShortcut);
  }, [wishModalOpen]);

  const recordRecent = (item: Omit<RecentSearchItem, 'id'>) => {
    setRecentSearches((prev) => {
      const next: RecentSearchItem[] = [
        { ...item, id: `rec-${Date.now()}` },
        ...prev.filter((r) => r.title.toLowerCase() !== item.title.toLowerCase()),
      ].slice(0, 4);
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify([]));
    } catch {
      // ignore
    }
  };

  const isNoel = noelMode;
  const firstName = currentPerson.name.split(' ').slice(-1)[0];
  const checkInTime = checkedInByPerson[currentPerson.id] || '';
  const timeGreeting = getTimeGreeting(nowDate.getHours());

  // On-time check-in streak (strictly before 08:30 or today's on-time check-in)
  const baseOnTimeStreak = currentPerson.id === 'u-huy' ? 6 : 12;
  const isTodayOnTime = useMemo(() => {
    if (!isCheckedInToday || !checkInTime) return false;
    const [hh, mm] = checkInTime.split(':').map((n) => parseInt(n, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return true;
    // Count on-time if <= 08:30 OR when checked in live during prototype demo
    return hh < 8 || (hh === 8 && mm <= 30) || celebrationCount > 0;
  }, [isCheckedInToday, checkInTime, celebrationCount]);

  const onTimeStreakDays = baseOnTimeStreak + (isTodayOnTime ? 1 : 0);

  // Exclude duplicate Check-in item from "Việc hôm nay" since Check-in lives prominently in Hero
  const actionItems = useMemo(
    () => todayItems.filter((item) => item.actionKind !== 'checkin'),
    [todayItems]
  );

  const urgentItems = useMemo(
    () => actionItems.filter((item) => item.priorityGroup <= 1),
    [actionItems]
  );

  const visibleTasks = taskFilter === 'urgent' ? urgentItems : actionItems;

  // Classic "Tin mới nổi bật" list with multi-category filter
  const rankedFeedAll = useMemo(
    () => rankFeedPostsForUser(posts, currentPerson),
    [posts, currentPerson]
  );

  const recommendedFeed = useMemo(() => {
    if (feedFilter === 'all') return rankedFeedAll.slice(0, 4);
    if (feedFilter === 'official') return rankedFeedAll.filter((p) => p.kind === 'official').slice(0, 4);
    if (feedFilter === 'kudos') return rankedFeedAll.filter((p) => p.kind === 'kudos').slice(0, 4);
    return rankedFeedAll.filter((p) => p.kind === 'community' || p.kind === 'lifecycle').slice(0, 4);
  }, [rankedFeedAll, feedFilter]);

  const upcomingEvents = useMemo(
    () =>
      events
        .filter(
          (e) =>
            (e.audience === 'all' || e.audience === currentPerson.team) &&
            (e.status === 'upcoming' || e.status === 'ongoing')
        )
        .slice(0, 2),
    [events, currentPerson.team]
  );

  const todayMeetings = useMemo<TodayMeetingItem[]>(
    () => [
      {
        id: 'm-0',
        time: '09:00',
        timeRange: '09:00 – 09:20',
        title: 'Standup sáng · Product',
        place: 'Google Meet',
        isMeet: true,
        status: 'past',
        countdown: 'Đã xong',
        agenda: 'Điểm nhanh tiến độ Sprint 24 và các blocker giao diện Mobile.',
        attendees: [
          { initials: 'VD', name: 'Việt Dũng', bg: '#D3E3FD', fg: '#0842A0' },
          { initials: 'TM', name: 'Thanh Mai', bg: '#E6F4EA', fg: '#137333' },
          { initials: 'GH', name: 'Gia Huy', bg: '#FEF7E0', fg: '#B06000' },
        ],
      },
      {
        id: 'm-1',
        time: '10:00',
        timeRange: '10:00 – 10:45',
        title: 'Daily Sync · Team BM',
        place: 'Google Meet',
        isMeet: true,
        status: 'soon',
        countdown: `Sau ${minutesLeft}p`,
        agenda: 'Chốt phạm vi pilot My iKame v2 và kế hoạch truyền thông tuần tới.',
        attendees: [
          { initials: 'TM', name: 'Thanh Mai', bg: '#E6F4EA', fg: '#137333' },
          { initials: 'VD', name: 'Việt Dũng', bg: '#D3E3FD', fg: '#0842A0' },
          { initials: 'BN', name: 'Bảo Ngọc', bg: '#F3E8FD', fg: '#7627BB' },
          { initials: 'MK', name: 'Minh Khoa', bg: '#FCE8E6', fg: '#C5221F' },
        ],
      },
      {
        id: 'm-2',
        time: '14:00',
        timeRange: '14:00 – 15:00',
        title: 'Review My iKame v2',
        place: 'Phòng Sao Hỏa · Tầng 5',
        isMeet: false,
        status: 'upcoming',
        countdown: 'Chiều nay',
        agenda: 'Demo trang chủ mới, điều hướng đa ứng dụng và kiểm thử hiệu năng.',
        attendees: [
          { initials: 'VD', name: 'Việt Dũng', bg: '#D3E3FD', fg: '#0842A0' },
          { initials: 'TM', name: 'Thanh Mai', bg: '#E6F4EA', fg: '#137333' },
          { initials: 'KL', name: 'Khánh Linh', bg: '#FEF7E0', fg: '#B06000' },
        ],
      },
    ],
    [minutesLeft]
  );

  // Google-style Live Instant Dropdown suggestions (with Recent History when empty)
  const instantSuggestions = useMemo<InstantSuggestion[]>(() => {
    const q = aiQuery.trim().normalize('NFC').toLowerCase();
    const list: InstantSuggestion[] = [];

    if (!q) {
      recentSearches.slice(0, 2).forEach((rec) => {
        list.push({
          id: rec.id,
          section: 'recent',
          group: 'Gần đây',
          title: rec.title,
          subtitle: rec.subtitle,
          icon: <History size={14} style={{ color: 'var(--text-tertiary)' }} />,
          run: () => {
            recordRecent({ title: rec.title, subtitle: rec.subtitle, kind: rec.kind, payload: rec.payload });
            if (rec.kind === 'ai') openAiWithPrompt(rec.payload);
            else navigate(rec.payload);
          },
        });
      });

      const defaults: InstantSuggestion[] = [
        {
          id: 'sug-leave',
          section: 'suggest',
          group: 'Lệnh nhanh',
          title: 'Xin nghỉ phép năm',
          subtitle: 'Soạn nhanh đơn nghỉ phép qua Trợ lý AI',
          icon: <Zap size={14} style={{ color: 'var(--brand-primary-fg)' }} />,
          run: () => {
            recordRecent({
              title: 'Xin nghỉ phép năm',
              subtitle: 'Trợ lý AI · Lệnh nhanh',
              kind: 'ai',
              payload: 'Xin nghỉ phép năm ngày thứ 6',
            });
            openAiWithPrompt('Xin nghỉ phép năm ngày thứ 6');
          },
        },
        {
          id: 'sug-room',
          section: 'suggest',
          group: 'Lệnh nhanh',
          title: 'Đặt phòng họp chiều nay',
          subtitle: 'Kiểm tra phòng trống & đặt lịch nhanh',
          icon: <Sparkles size={14} style={{ color: 'var(--ikame-orange)' }} />,
          run: () => {
            recordRecent({
              title: 'Đặt phòng họp chiều nay',
              subtitle: 'Lịch · Đặt phòng họp',
              kind: 'route',
              payload: '/calendar',
            });
            navigate('/calendar');
          },
        },
        {
          id: 'sug-policy',
          section: 'suggest',
          group: 'Tri thức',
          title: 'Chính sách nghỉ phép & Phúc lợi iKame',
          subtitle: 'Tra cứu nhanh tại Trung tâm Hỗ trợ',
          icon: <BookOpen size={14} style={{ color: 'var(--info-fg)' }} />,
          run: () => {
            recordRecent({
              title: 'Chính sách nghỉ phép & Phúc lợi iKame',
              subtitle: 'Tri thức · Hỗ trợ',
              kind: 'route',
              payload: '/support/policies',
            });
            navigate('/support/policies');
          },
        },
      ];

      return [...list, ...defaults.filter((d) => !list.some((r) => r.title === d.title)).slice(0, 3)];
    }

    // 1. Matching Quick Actions
    QUICK_ACTIONS_CATALOG.filter((a) => a.label.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((a) => {
        list.push({
          id: `qa-${a.id}`,
          group: 'Lệnh nhanh',
          title: a.label,
          subtitle: a.category,
          icon: <Zap size={14} style={{ color: 'var(--brand-primary-fg)' }} />,
          run: () => {
            if (a.kind === 'ai' && a.aiPrompt) {
              recordRecent({ title: a.label, subtitle: `Trợ lý AI · ${a.category}`, kind: 'ai', payload: a.aiPrompt });
              openAiWithPrompt(a.aiPrompt);
            } else if (a.kind === 'route' && a.route) {
              recordRecent({ title: a.label, subtitle: a.category, kind: 'route', payload: a.route });
              navigate(a.route);
            } else if (a.kind === 'checkin') {
              handleCheckIn();
            }
          },
        });
      });

    // 2. Matching People
    people
      .filter((p) => (p.name + ' ' + p.title + ' ' + p.team).toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((p) => {
        const canOpen360 = lens === 'manager' && p.managerId === 'u-mai';
        const route = canOpen360
          ? `/manager/team/${p.id}`
          : p.id === currentPerson.id
            ? '/profile'
            : `/search?q=${encodeURIComponent(p.name)}&tab=people`;
        list.push({
          id: `peo-${p.id}`,
          group: 'Đồng nghiệp',
          title: p.name,
          subtitle: `${p.title} · ${p.team}`,
          icon: <User size={14} style={{ color: 'var(--success-fg)' }} />,
          run: () => {
            recordRecent({ title: p.name, subtitle: `${p.title} · ${p.team}`, kind: 'route', payload: route });
            navigate(route);
          },
        });
      });

    // 3. Matching Knowledge Docs
    KNOWLEDGE_DOCS.filter((d) => (d.title + ' ' + d.summary).toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((d) => {
        const route = `/search?q=${encodeURIComponent(d.title)}&tab=knowledge`;
        list.push({
          id: `doc-${d.id}`,
          group: 'Tri thức',
          title: d.title,
          subtitle: `iWiki · ${d.category}`,
          icon: <BookOpen size={14} style={{ color: 'var(--info-fg)' }} />,
          run: () => {
            recordRecent({ title: d.title, subtitle: `iWiki · ${d.category}`, kind: 'route', payload: route });
            navigate(route);
          },
        });
      });

    // 4. Matching News / Feed posts
    posts
      .filter((p) => (p.audience === 'all' || p.audience === currentPerson.team) && ((p.title || '') + ' ' + p.content).toLowerCase().includes(q))
      .slice(0, 1)
      .forEach((p) => {
        const title = p.title || p.content.slice(0, 62);
        const route = p.kind === 'official' ? `/feed/article/${p.id}` : '/icom/feed';
        list.push({
          id: `post-${p.id}`,
          group: 'Tin tức',
          title,
          subtitle: `${p.authorName} · ${p.timeLabel}`,
          icon: <FileText size={14} />,
          run: () => {
            recordRecent({ title, subtitle: `Tin tức · ${p.authorName}`, kind: 'route', payload: route });
            navigate(route);
          },
        });
      });

    // 5. Always include direct Ask AI action
    list.push({
      id: 'ask-ai-direct',
      group: 'Trợ lý AI',
      title: `Hỏi Trợ lý AI: "${aiQuery.trim()}"`,
      subtitle: 'Trả lời tức thì có trích nguồn & đề xuất hành động',
      icon: <Sparkles size={14} style={{ color: 'var(--ikame-orange)' }} />,
      run: () => {
        const clean = aiQuery.trim();
        recordRecent({ title: clean, subtitle: 'Trợ lý AI', kind: 'ai', payload: clean });
        openAiWithPrompt(clean);
      },
    });

    return list.slice(0, 5);
  }, [aiQuery, recentSearches, people, posts, currentPerson, lens, openAiWithPrompt, navigate]);

  const completedQuests = quests.filter((q) => q.completed).length;
  const nextQuest = quests.find((q) => !q.completed);

  const triggerMascotBounce = () => {
    setCelebrating(false);
    requestAnimationFrame(() => setCelebrating(true));
    window.setTimeout(() => setCelebrating(false), 1100);
  };

  const handleCheckIn = () => {
    if (isCheckedInToday) {
      navigate('/icheck');
      return;
    }
    const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    performCheckIn();
    setCelebrationTime(nowLabel);
    setCelebrationCount((c) => c + 1);
    setJustCheckedIn(true);
    setMascotNoteIdx(null);
    triggerMascotBounce();
    window.setTimeout(() => setJustCheckedIn(false), 2600);
  };

  const handleTapMascot = () => {
    setMascotNoteIdx((prev) => (prev === null ? 0 : (prev + 1) % MASCOT_TAPS.length));
    triggerMascotBounce();
  };

  const runInstantItem = (item: InstantSuggestion) => {
    setOmniOpen(false);
    setAiQuery('');
    item.run();
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = aiQuery.trim();
    if (!clean) return;
    if (omniOpen && instantSuggestions[omniIdx]) {
      runInstantItem(instantSuggestions[omniIdx]);
      return;
    }
    setOmniOpen(false);
    recordRecent({ title: clean, subtitle: 'Trợ lý AI', kind: 'ai', payload: clean });
    openAiWithPrompt(clean);
    setAiQuery('');
  };

  const handleItemAction = (item: (typeof actionItems)[number]) => {
    if (item.actionKind === 'open_ai' && item.aiPrompt) {
      openAiWithPrompt(item.aiPrompt);
    } else if (item.actionRoute) {
      navigate(item.actionRoute);
    }
  };

  const handleSubmitWish = (e: React.FormEvent) => {
    e.preventDefault();
    const text = wishMessage.trim();
    if (!text) return;
    wishBirthday('Ngô Minh Khoa', text);
    setWishedKhoa(true);
    setWishModalOpen(false);
    setWishMessage('');
  };

  const moodLine =
    mascotNoteIdx !== null
      ? MASCOT_TAPS[mascotNoteIdx]
      : justCheckedIn
        ? isNoel
          ? 'Giáng sinh an lành! Ngọn lửa hôm nay đã bùng cháy 🎄✨'
          : 'Tuyệt vời! Chuỗi chấm công đúng giờ vừa tăng thêm 1 ngày 🔥'
        : lens === 'ikamer_new'
          ? `Ngày ${currentPerson.onboardingDay}/60 · Còn ${quests.length - completedQuests} bước nữa thôi`
          : isCheckedInToday
            ? `Thứ 6, 27/11 · ${urgentItems.length > 0 ? `${urgentItems.length} việc cần ưu tiên` : 'Mọi thứ đang trong tầm kiểm soát'}`
            : isNoel
              ? 'Thứ 6, 27/11 · Chấm công đúng giờ trước 08:30 để giữ lửa nhé! ❄️'
              : 'Thứ 6, 27/11 · Chấm công đúng giờ trước 08:30 để giữ chuỗi nhé!';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Refined Full-Page Confetti + Frosted Banner Celebration */}
      <FullPageCheckInCelebration
        triggerId={celebrationCount}
        firstName={firstName}
        timeLabel={celebrationTime || checkInTime}
        isNoel={isNoel}
      />

      {/* 1. Soulful Hero: Transparent Flame Mascot + Time Greeting + On-Time Streak + Prominent Check-in + Google Instant Omni-Bar */}
      <section className="home-hero">
        <div className="home-hero-top">
          <div className="mascot-greeting">
            <button
              type="button"
              className={`mascot-stage ${celebrating ? 'celebrating' : ''}`}
              onClick={handleTapMascot}
              title="Chạm vào bạn Lửa iKame"
              aria-label="Mascot ngọn lửa iKame"
            >
              <span className="mascot-aura" />
              <span className="mascot-bob">
                <img src={ikameMascot} alt="iKame Flame Mascot" className="mascot-img" />
                {isNoel && (
                  <svg className="mascot-santa-hat" viewBox="0 0 42 28" aria-hidden="true">
                    <path d="M7 21 C10 7, 23 1, 35 11 C31 12, 29 16, 31 20 Z" fill="#C41E3A" />
                    <path d="M4 21 Q18 16 33 21 Q34 25 31 26 Q18 22 6 26 Q3 25 4 21 Z" fill="#FFFFFF" />
                    <circle cx="36.5" cy="12.5" r="3.8" fill="#FFFFFF" />
                  </svg>
                )}
              </span>
            </button>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 className="page-title" style={{ fontSize: 25, lineHeight: 1.2 }}>
                  {timeGreeting}, {firstName}
                </h1>

                {/* On-Time Check-in Streak Pill with Weekday Hover Tooltip */}
                <div className="streak-wrap">
                  <span className={`streak-pill ${justCheckedIn ? 'bumped' : ''}`}>
                    🔥 {onTimeStreakDays} ngày đúng giờ
                  </span>
                  <div className="streak-tooltip">
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 6 }}>
                      Chuỗi chấm công đúng giờ (trước 08:30)
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                      {WEEK_ON_TIME_LOG.map((d) => (
                        <div key={d.day} style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>{d.day}</div>
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              margin: '3px auto 2px',
                              borderRadius: 'var(--r-full)',
                              background: 'var(--success-bg)',
                              color: 'var(--success-fg)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </div>
                          <div className="tabular" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                            {d.time}
                          </div>
                        </div>
                      ))}
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-strong)' }}>T6</div>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            margin: '3px auto 2px',
                            borderRadius: 'var(--r-full)',
                            background: isTodayOnTime ? 'rgba(247, 98, 38, 0.16)' : 'var(--bg-subtle)',
                            color: isTodayOnTime ? '#f76226' : 'var(--text-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {isTodayOnTime ? '🔥' : '•'}
                        </div>
                        <div className="tabular" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                          {isTodayOnTime ? checkInTime : '--:--'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="page-desc" style={{ marginTop: 4, fontSize: 13.5 }}>
                {moodLine}
              </p>
            </div>
          </div>

          {/* Large Prominent Check-in Button (No Check-out, No leave balance line) */}
          <div className="checkin-wrap">
            {isCheckedInToday ? (
              <button
                type="button"
                className={`checkin-btn-done ${justCheckedIn ? 'just-checked' : ''}`}
                onClick={handleCheckIn}
              >
                <CheckCircle2 size={18} />
                <span className="tabular">Đã chấm công - {checkInTime}</span>
              </button>
            ) : (
              <button type="button" className="checkin-btn-fire" onClick={handleCheckIn}>
                {isNoel ? <Snowflake size={18} /> : <Flame size={18} />}
                <span>Chấm công ngay</span>
              </button>
            )}
          </div>
        </div>

        {/* Google-style Omni-Bar with "/" Shortcut & Recent History Dropdown */}
        <div className="home-omni-wrap" ref={omniRef}>
          <form onSubmit={handleAsk} className="home-omni-bar">
            <Sparkles size={16} style={{ color: 'var(--ikame-orange)', flexShrink: 0 }} />
            <input
              ref={omniInputRef}
              className="home-omni-input"
              value={aiQuery}
              onFocus={() => {
                setOmniOpen(true);
                setOmniIdx(0);
              }}
              onChange={(e) => {
                setAiQuery(e.target.value);
                setOmniOpen(true);
                setOmniIdx(0);
              }}
              onKeyDown={(e) => {
                if (!omniOpen) return;
                if (e.key === 'Escape') {
                  setOmniOpen(false);
                  omniInputRef.current?.blur();
                } else if (e.key === 'ArrowDown' && instantSuggestions.length > 0) {
                  e.preventDefault();
                  setOmniIdx((i) => (i + 1) % instantSuggestions.length);
                } else if (e.key === 'ArrowUp' && instantSuggestions.length > 0) {
                  e.preventDefault();
                  setOmniIdx((i) => (i - 1 + instantSuggestions.length) % instantSuggestions.length);
                }
              }}
              placeholder='Nhấn "/" để hỏi AI, tìm đồng nghiệp, tài liệu hoặc gõ lệnh...'
            />
            {aiQuery.trim() ? (
              <button type="submit" className="btn btn-primary btn-sm" style={{ height: 32, padding: '0 14px' }}>
                Hỏi AI
              </button>
            ) : (
              <button
                type="button"
                className="kbd"
                style={{ cursor: 'pointer', height: 24, minWidth: 26, padding: '0 7px' }}
                onClick={() => {
                  omniInputRef.current?.focus();
                  setOmniOpen(true);
                  setOmniIdx(0);
                }}
                title='Nhấn phím "/" để tìm nhanh & hỏi AI'
              >
                /
              </button>
            )}
          </form>

          {omniOpen && instantSuggestions.length > 0 && (
            <div className="home-omni-dropdown" role="listbox" aria-label="Gợi ý tức thì">
              {instantSuggestions.map((item, idx) => {
                const prevSection = idx > 0 ? instantSuggestions[idx - 1].section : undefined;
                const showRecentHeader = !aiQuery.trim() && item.section === 'recent' && idx === 0;
                const showSuggestHeader =
                  !aiQuery.trim() && item.section === 'suggest' && prevSection !== 'suggest';

                return (
                  <React.Fragment key={item.id}>
                    {showRecentHeader && (
                      <div className="home-omni-section-head">
                        <span>Gần đây</span>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            clearRecentSearches();
                          }}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-tertiary)',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: 0,
                          }}
                        >
                          Xoá
                        </button>
                      </div>
                    )}
                    {showSuggestHeader && (
                      <div
                        className="home-omni-section-head"
                        style={
                          prevSection === 'recent'
                            ? { marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }
                            : undefined
                        }
                      >
                        <span>Gợi ý nhanh</span>
                      </div>
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={idx === omniIdx}
                      className={`home-omni-row ${idx === omniIdx ? 'active' : ''}`}
                      onMouseEnter={() => setOmniIdx(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        runInstantItem(item);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <span style={{ display: 'inline-flex', flexShrink: 0 }}>{item.icon}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-neutral" style={{ height: 20, fontSize: 11, flexShrink: 0 }}>
                        {item.group}
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 2. Adaptive 1-Row Onboarding Strip (Only for New Joiners < 60 days) */}
      {lens === 'ikamer_new' && (
        <section
          className="card-compact"
          style={{
            borderColor: 'var(--info-border)',
            background: 'var(--info-bg)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            padding: '12px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 }}>
            <Compass size={18} style={{ color: 'var(--info-fg)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)' }}>
                  Hành trình 60 ngày · Ngày {currentPerson.onboardingDay}/60
                </span>
                <span className="tabular" style={{ fontSize: 12, fontWeight: 600, color: 'var(--info-fg)' }}>
                  {completedQuests}/{quests.length} nhiệm vụ
                </span>
              </div>
              {nextQuest && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Tiếp theo: {nextQuest.title}
                </div>
              )}
            </div>
          </div>
          <Link to="/onboarding" className="btn btn-secondary btn-sm">
            Tiếp tục <ArrowRight size={13} />
          </Link>
        </section>
      )}

      {/* 3. Ultra-Light 1-Row Quick Actions Strip (Popular 6 actions default) */}
      <QuickActionsBar variant="strip" excludeIds={['qa-checkin']} />

      {/* 4. Focused 2-Column Workspace */}
      <div className="layout-with-rail" style={{ gap: 20 }}>
        {/* Left Column: Việc hôm nay + Tin mới nổi bật */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Việc hôm nay */}
          <section className="card">
            <div className="card-header" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 className="card-title">Việc hôm nay</h2>
                <span className="tab-count">{visibleTasks.length}</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${taskFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ height: 28, fontSize: 12 }}
                  onClick={() => setTaskFilter('all')}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${taskFilter === 'urgent' ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ height: 28, fontSize: 12 }}
                  onClick={() => setTaskFilter('urgent')}
                >
                  Khẩn ({urgentItems.length})
                </button>
              </div>
            </div>

            {visibleTasks.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 12px' }}>
                <img src={ikameMascot} alt="" style={{ width: 44, height: 44, marginBottom: 8 }} />
                <div style={{ fontWeight: 700, color: 'var(--text-strong)' }}>Xong hết việc hôm nay!</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Tận hưởng ngày làm việc thật nhẹ nhàng nhé.
                </div>
              </div>
            ) : (
              <div className="clean-list">
                {visibleTasks.map((item, idx) => (
                  <div key={item.id} className="clean-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, flex: 1 }}>
                      <span
                        className={
                          item.urgencyTone === 'error'
                            ? 'dot-urgent'
                            : item.urgencyTone === 'warning'
                              ? 'dot-warning'
                              : item.urgencyTone === 'info'
                                ? 'dot-info'
                                : 'dot-neutral'
                        }
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 12, color: item.urgencyTone === 'error' ? 'var(--error-fg)' : 'var(--text-tertiary)', marginTop: 1 }}>
                          {item.source} · {item.urgencyLabel}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm ${idx === 0 && item.priorityGroup <= 1 ? 'btn-primary' : 'btn-dim'}`}
                      onClick={() => handleItemAction(item)}
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tin mới nổi bật — Diverse Clean Category Filters */}
          <section className="card">
            <div className="card-header" style={{ marginBottom: 8 }}>
              <h2 className="card-title">Tin mới nổi bật</h2>
              <Link to="/icom/feed" className="btn btn-ghost btn-sm">
                iCom Feed <ArrowRight size={13} />
              </Link>
            </div>

            <div className="feed-filter-row" role="tablist" aria-label="Lọc tin mới nổi bật">
              {FEED_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={feedFilter === opt.id}
                  className={`feed-filter-pill ${feedFilter === opt.id ? 'active' : ''}`}
                  onClick={() => setFeedFilter(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {recommendedFeed.length === 0 ? (
              <div className="empty-state" style={{ padding: '22px 12px' }}>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                  Chưa có bài viết mới trong mục này.
                </div>
              </div>
            ) : (
              <div className="clean-list">
                {recommendedFeed.map((post) => {
                  const isUnacked = post.mandatoryAck && !post.ackedBy[currentPerson.id];
                  return (
                    <Link
                      key={post.id}
                      to={post.kind === 'official' ? `/feed/article/${post.id}` : '/icom/feed'}
                      className="clean-row clean-row-interactive"
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {post.title ||
                            (post.kind === 'kudos'
                              ? `${post.authorName} gửi Kudos cho ${post.kudosRecipientName}`
                              : post.content.slice(0, 72))}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          {post.authorName} · {post.timeLabel}
                        </div>
                      </div>
                      <span
                        className={`badge ${
                          isUnacked
                            ? 'badge-error'
                            : post.kind === 'official'
                              ? 'badge-neutral'
                              : post.kind === 'kudos'
                                ? 'badge-violet'
                                : 'badge-neutral'
                        }`}
                      >
                        {isUnacked ? 'Cần xác nhận' : post.kind === 'official' ? 'COM' : post.kind === 'kudos' ? 'Kudos' : 'Cộng đồng'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Rail: Live Today's Schedule + Quick Preview + Events & Wish Pop-up */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Today's Meetings with Live State, Highlighted Meet CTA & Inline Quick Preview */}
          <section className="card" style={{ padding: '16px 18px' }}>
            <div className="card-header" style={{ marginBottom: 8 }}>
              <h2 className="card-title" style={{ fontSize: 14 }}>
                <Clock size={15} style={{ color: 'var(--brand-primary-fg)' }} /> Lịch hôm nay
              </h2>
              <Link to="/calendar" className="btn btn-ghost btn-sm" style={{ height: 26, fontSize: 12 }}>
                Xem lịch
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {todayMeetings.map((mt) => {
                const isSoonLive = mt.status === 'soon' && minutesLeft <= 15;
                const isPast = mt.status === 'past';
                const isSelected = selectedMeetingId === mt.id;

                return (
                  <div key={mt.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        className={`meeting-row-btn ${isPast ? 'past' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedMeetingId((prev) => (prev === mt.id ? null : mt.id))}
                        aria-expanded={isSelected}
                      >
                        <span
                          className="tabular"
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: isSoonLive
                              ? 'var(--brand-primary-fg)'
                              : isPast
                                ? 'var(--text-tertiary)'
                                : 'var(--text-secondary)',
                            width: 40,
                            flexShrink: 0,
                          }}
                        >
                          {mt.time}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            {isSoonLive && <span className="live-pulse-dot" title="Sắp diễn ra" />}
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: 'var(--text-strong)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {mt.title}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                            <span
                              style={{
                                color: isSoonLive ? 'var(--success-fg)' : 'var(--text-tertiary)',
                                fontWeight: isSoonLive ? 600 : 400,
                              }}
                            >
                              {mt.countdown}
                            </span>
                            <span>· {mt.place.split(' · ')[0]}</span>
                          </div>
                        </div>
                      </button>

                      {mt.isMeet && !isPast && (
                        <button
                          type="button"
                          className={`btn btn-sm ${isSoonLive ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ height: 26, fontSize: 11.5, padding: '0 10px', flexShrink: 0 }}
                          onClick={() =>
                            pushToast({
                              title: `Đang mở Google Meet · ${mt.title}`,
                              description: 'Đã chuẩn bị phòng họp trực tuyến cho bạn.',
                              tone: 'info',
                            })
                          }
                        >
                          <Video size={12} /> Meet
                        </button>
                      )}
                    </div>

                    {isSelected && (
                      <div className="meeting-preview-box">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-strong)' }}>
                            {mt.isMeet ? <Video size={13} style={{ color: 'var(--brand-primary-fg)' }} /> : <MapPin size={13} style={{ color: 'var(--ikame-orange)' }} />}
                            <span className="tabular">{mt.timeRange}</span>
                            <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>· {mt.place}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedMeetingId(null)}
                            aria-label="Đóng xem nhanh"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-tertiary)',
                              padding: 2,
                              display: 'inline-flex',
                            }}
                          >
                            <X size={13} />
                          </button>
                        </div>

                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {mt.agenda}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                            <div className="mini-avatar-stack">
                              {mt.attendees.map((att) => (
                                <span
                                  key={att.name}
                                  className="mini-avatar-chip"
                                  style={{ background: att.bg, color: att.fg }}
                                  title={att.name}
                                >
                                  {att.initials}
                                </span>
                              ))}
                            </div>
                            <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <Users size={11} style={{ verticalAlign: '-1px', marginRight: 3 }} />
                              {mt.attendees.length} người tham gia
                            </span>
                          </div>

                          <Link
                            to="/calendar"
                            style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--brand-primary-fg)', whiteSpace: 'nowrap' }}
                          >
                            Chi tiết →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Events with Date Badges + Warm Celebration with Wish Pop-up Form */}
          <section className="card" style={{ padding: '16px 18px' }}>
            <div className="card-header" style={{ marginBottom: 10 }}>
              <h2 className="card-title" style={{ fontSize: 14 }}>
                <Calendar size={15} style={{ color: 'var(--ikame-orange)' }} /> Sự kiện & Khoảnh khắc
              </h2>
              <Link to="/icom/events" className="btn btn-ghost btn-sm" style={{ height: 26, fontSize: 12 }}>
                Tất cả
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingEvents.map((ev) => {
                const tile = parseDateTile(ev.dateLabel);
                const isReg = ev.registeredIds.includes(currentPerson.id);
                return (
                  <Link
                    key={ev.id}
                    to={`/events/${ev.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 0' }}
                  >
                    <div className="date-tile">
                      <span className="date-tile-month">{tile.month}</span>
                      <span className="date-tile-day">{tile.day}</span>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 1 }}>
                        {ev.timeLabel} · {ev.format}
                      </div>
                    </div>
                    {isReg && <span className="badge badge-success" style={{ height: 20, fontSize: 11 }}>Đã ĐK</span>}
                  </Link>
                );
              })}

              <div
                style={{
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>
                    🎉 Ngô Minh Khoa · Tròn 2 năm
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Kỷ niệm hôm nay</div>
                </div>
                <button
                  type="button"
                  className={`btn btn-sm ${wishedKhoa ? 'btn-dim' : 'btn-secondary'}`}
                  style={{ height: 28, fontSize: 12, color: wishedKhoa ? 'var(--ikame-orange)' : undefined }}
                  onClick={() => setWishModalOpen(true)}
                >
                  <Heart size={12} fill={wishedKhoa ? 'currentColor' : 'none'} /> {wishedKhoa ? 'Chúc thêm' : 'Chúc mừng'}
                </button>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Pop-up Form to Write a Personal Celebration Message */}
      <Modal
        open={wishModalOpen}
        onClose={() => setWishModalOpen(false)}
        title="Gửi lời chúc tới Ngô Minh Khoa 🎉"
        subtitle="Kỷ niệm tròn 2 năm đồng hành tại iKame · 27/11/2026"
        maxWidth={480}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setWishModalOpen(false)}>
              Huỷ
            </button>
            <button
              type="submit"
              form="wish-compose-form"
              className="btn btn-primary"
              disabled={!wishMessage.trim()}
            >
              <Send size={14} /> Gửi lời chúc
            </button>
          </>
        }
      >
        <form id="wish-compose-form" onSubmit={handleSubmitWish} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {WISH_STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                className="btn btn-dim btn-sm"
                style={{ height: 26, fontSize: 11.5 }}
                onClick={() => setWishMessage(starter)}
              >
                {starter.slice(0, 32)}...
              </button>
            ))}
          </div>

          <div>
            <label className="field-label">Lời chúc của bạn</label>
            <textarea
              className="textarea"
              rows={3}
              required
              autoFocus
              value={wishMessage}
              onChange={(e) => setWishMessage(e.target.value)}
              placeholder="Viết vài dòng chúc mừng kỷ niệm 2 năm gửi tới Khoa..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
