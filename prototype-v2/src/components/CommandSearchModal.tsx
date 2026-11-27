import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Home,
  Moon,
  Plane,
  Search,
  Sparkles,
  Sun,
  Target,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INTERNAL_APPS, KNOWLEDGE_DOCS } from '../data/mockData';

interface CommandItem {
  id: string;
  group: 'Lệnh nhanh' | 'Tin tức' | 'Sự kiện' | 'Tri thức' | 'Mục tiêu' | 'Con người' | 'Ứng dụng';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  run: () => void;
}

export const CommandSearchModal: React.FC = () => {
  const {
    searchOpen,
    setSearchOpen,
    posts,
    events,
    objectives,
    people,
    currentPerson,
    lens,
    theme,
    toggleTheme,
    isCheckedInToday,
    performCheckIn,
    openAiWithPrompt,
    launchApp,
    recentSearches,
    addRecentSearch,
  } = useApp();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Global Cmd+K / Ctrl+K shortcut (Linear / Raycast style)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [searchOpen]);

  const closeAndRun = (fn: () => void, saveTerm?: string) => {
    if (saveTerm) addRecentSearch(saveTerm);
    setSearchOpen(false);
    fn();
  };

  // Instant executable actions (Raycast / Linear pattern!)
  const quickCommands = useMemo<CommandItem[]>(() => {
    const cmds: CommandItem[] = [
      {
        id: 'cmd-checkin',
        group: 'Lệnh nhanh',
        title: isCheckedInToday ? 'Xem công tuần này (iCheck)' : 'Chấm công ngay hôm nay',
        subtitle: isCheckedInToday ? 'Đã ghi nhận vào sáng nay' : 'Ghi nhận chấm công 1 chạm qua iCheck',
        icon: <Clock size={15} style={{ color: 'var(--brand-primary-fg)' }} />,
        run: () => (isCheckedInToday ? navigate('/work') : performCheckIn()),
      },
      {
        id: 'cmd-leave',
        group: 'Lệnh nhanh',
        title: 'Xin nghỉ phép năm',
        subtitle: 'Mở Trợ lý AI soạn sẵn đơn iCheck có duyệt',
        icon: <Plane size={15} style={{ color: 'var(--info-fg)' }} />,
        run: () => openAiWithPrompt('Xin nghỉ phép năm ngày thứ 6'),
      },
      {
        id: 'cmd-wfh',
        group: 'Lệnh nhanh',
        title: 'Đăng ký làm việc từ xa (WFH)',
        subtitle: 'Soạn nhanh yêu cầu WFH gửi quản lý',
        icon: <Home size={15} style={{ color: 'var(--success-fg)' }} />,
        run: () => openAiWithPrompt('Đăng ký WFH thứ 2 tuần tới'),
      },
      {
        id: 'cmd-kudos',
        group: 'Lệnh nhanh',
        title: 'Gửi Kudos ghi nhận đồng nghiệp',
        subtitle: 'Mở khung soạn Kudos trên iKame Feed',
        icon: <Award size={15} style={{ color: 'var(--violet-fg)' }} />,
        run: () => navigate('/feed?compose=kudos'),
      },
      {
        id: 'cmd-today',
        group: 'Lệnh nhanh',
        title: 'Hỏi AI: Hôm nay tôi cần làm gì?',
        subtitle: 'Tổng hợp việc ưu tiên từ 6 hệ thống',
        icon: <Sparkles size={15} style={{ color: 'var(--brand-primary-fg)' }} />,
        run: () => openAiWithPrompt('Hôm nay tôi cần làm gì?'),
      },
      {
        id: 'cmd-theme',
        group: 'Lệnh nhanh',
        title: theme === 'light' ? 'Bật chế độ tối (Dark Mode)' : 'Bật chế độ sáng (Light Mode)',
        subtitle: 'Đổi giao diện tức thì',
        icon: theme === 'light' ? <Moon size={15} /> : <Sun size={15} />,
        run: () => toggleTheme(),
      },
    ];
    return cmds;
  }, [isCheckedInToday, navigate, performCheckIn, openAiWithPrompt, theme, toggleTheme]);

  const results = useMemo<CommandItem[]>(() => {
    const q = query.trim().normalize('NFC').toLowerCase();
    if (!q) return quickCommands;

    const list: CommandItem[] = [];

    // 1. Matching Quick Commands
    quickCommands
      .filter((c) => (c.title + ' ' + c.subtitle).toLowerCase().includes(q))
      .forEach((c) => list.push(c));

    // 2. Authorized Internal Apps
    INTERNAL_APPS.filter(
      (a) =>
        a.allowedRoles.some((r) => currentPerson.roleKeys.includes(r)) &&
        (a.name + ' ' + a.shortDesc).toLowerCase().includes(q)
    )
      .slice(0, 3)
      .forEach((a) => {
        list.push({
          id: a.id,
          group: 'Ứng dụng',
          title: `Mở ${a.name} (SSO)`,
          subtitle: a.shortDesc,
          icon: <Zap size={15} style={{ color: 'var(--brand-primary-fg)' }} />,
          run: () => launchApp(a),
        });
      });

    // 3. Audience-filtered Posts
    posts
      .filter((p) => (p.audience === 'all' || p.audience === currentPerson.team) && ((p.title || '') + ' ' + p.content).toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((p) => {
        list.push({
          id: p.id,
          group: 'Tin tức',
          title: p.title || p.content.slice(0, 64),
          subtitle: `${p.authorName} · ${p.timeLabel}`,
          icon: <FileText size={15} />,
          run: () => navigate(p.kind === 'official' ? `/feed/article/${p.id}` : '/feed'),
        });
      });

    // 4. Events
    events
      .filter((e) => (e.audience === 'all' || e.audience === currentPerson.team) && (e.title + ' ' + e.tagline).toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((e) => {
        list.push({
          id: e.id,
          group: 'Sự kiện',
          title: e.title,
          subtitle: `${e.dateLabel} · ${e.location}`,
          icon: <Calendar size={15} />,
          run: () => navigate(`/events/${e.id}`),
        });
      });

    // 5. Knowledge Docs
    KNOWLEDGE_DOCS.filter((d) => (d.title + ' ' + d.summary).toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((d) => {
        list.push({
          id: d.id,
          group: 'Tri thức',
          title: d.title,
          subtitle: `iWiki · ${d.category}`,
          icon: <BookOpen size={15} />,
          run: () => navigate(`/search?q=${encodeURIComponent(d.title)}&tab=knowledge`),
        });
      });

    // 6. Objectives
    objectives
      .filter((o) => (lens === 'manager' || o.ownerId === currentPerson.id) && o.title.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((o) => {
        list.push({
          id: o.id,
          group: 'Mục tiêu',
          title: o.title,
          subtitle: `iGoal · ${o.ownerName} · ${o.progress}%`,
          icon: <Target size={15} />,
          run: () => navigate(lens === 'manager' ? '/goals' : '/work'),
        });
      });

    // 7. People (permission-safe routing)
    people
      .filter((p) => (p.name + ' ' + p.title + ' ' + p.team).toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((p) => {
        const isDirectReport = lens === 'manager' && p.managerId === 'u-mai';
        list.push({
          id: p.id,
          group: 'Con người',
          title: p.name,
          subtitle: `${p.title} · ${p.team}`,
          icon: <User size={15} />,
          run: () =>
            navigate(
              isDirectReport
                ? `/manager/team/${p.id}`
                : p.id === currentPerson.id
                  ? '/profile'
                  : `/search?q=${encodeURIComponent(p.name)}&tab=people`
            ),
        });
      });

    return list;
  }, [query, quickCommands, currentPerson, posts, events, objectives, people, lens, launchApp, navigate]);

  if (!searchOpen) return null;

  return (
    <div
      className="backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm & Lệnh nhanh"
      style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setSearchOpen(false);
      }}
    >
      <div className="modal-panel" style={{ maxWidth: 600 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '13px 16px',
            borderBottom: '1px solid var(--border-primary)',
          }}
        >
          <Search size={17} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchOpen(false);
              } else if (e.key === 'ArrowDown' && results.length > 0) {
                e.preventDefault();
                setActiveIdx((i) => (i + 1) % results.length);
              } else if (e.key === 'ArrowUp' && results.length > 0) {
                e.preventDefault();
                setActiveIdx((i) => (i - 1 + results.length) % results.length);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[activeIdx]) {
                  closeAndRun(results[activeIdx].run, query.trim() || undefined);
                } else if (query.trim()) {
                  closeAndRun(() => navigate(`/search?q=${encodeURIComponent(query.trim())}`), query.trim());
                }
              }
            }}
            placeholder='Gõ lệnh nhanh ("chấm công", "nghỉ phép", "dark") hoặc tìm kiếm...'
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14.5,
              color: 'var(--text-strong)',
            }}
          />
          {query && (
            <button type="button" className="btn-icon" onClick={() => setQuery('')} aria-label="Xoá">
              <X size={15} />
            </button>
          )}
          <span className="kbd">ESC</span>
        </div>

        <div style={{ maxHeight: 420, overflowY: 'auto', padding: 8 }}>
          {!query.trim() && recentSearches.length > 0 && (
            <div style={{ padding: '4px 8px 10px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Gần đây:</span>
              {recentSearches.slice(0, 3).map((item) => (
                <button
                  key={item}
                  type="button"
                  className="btn btn-dim btn-sm"
                  style={{ height: 24, fontSize: 11.5 }}
                  onClick={() => setQuery(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <div className="empty-state" style={{ padding: '28px 16px' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-strong)', marginBottom: 8 }}>
                Không có kết quả trực tiếp cho "{query}"
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => closeAndRun(() => navigate(`/search?q=${encodeURIComponent(query)}`), query)}
                >
                  Tìm toàn trang
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => closeAndRun(() => openAiWithPrompt(query), query)}
                >
                  <Sparkles size={13} /> Hỏi Trợ lý AI
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!query.trim() && (
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '4px 10px' }}>
                  Lệnh nhanh · Enter để chạy ngay
                </div>
              )}
              {results.map((r, idx) => (
                <button
                  key={`${r.group}-${r.id}`}
                  type="button"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => closeAndRun(r.run, query.trim() || undefined)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 'var(--r-8)',
                    border: 'none',
                    textAlign: 'left',
                    background: idx === activeIdx ? 'var(--active-neutral)' : 'transparent',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', display: 'inline-flex' }}>{r.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.subtitle}</div>
                  </div>
                  <span className="badge badge-neutral" style={{ height: 20, fontSize: 11 }}>{r.group}</span>
                </button>
              ))}
              {query.trim() && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 4, justifyContent: 'space-between', width: '100%' }}
                  onClick={() => closeAndRun(() => navigate(`/search?q=${encodeURIComponent(query)}`), query)}
                >
                  <span>Xem tất cả kết quả cho "{query}"</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '8px 14px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11.5,
            color: 'var(--text-tertiary)',
          }}
        >
          <span>↑↓ di chuyển · ↵ thực thi · ESC đóng</span>
          <span>Omni-Command My iKame</span>
        </div>
      </div>
    </div>
  );
};
