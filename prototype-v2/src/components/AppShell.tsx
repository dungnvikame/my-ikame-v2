import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronsUpDown,
  Clock,
  Compass,
  Cpu,
  FileCheck2,
  FileText,
  Flag,
  FolderKanban,
  Gamepad2,
  GraduationCap,
  Grid,
  HeartHandshake,
  HelpCircle,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquareText,
  Moon,
  Newspaper,
  Scale,
  Search,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import ikameLogo from '../assets/ikame-logo.png';
import ikameMascot from '../assets/ikame-mascot.png';
import { useApp } from '../context/AppContext';
import { INTERNAL_APPS } from '../data/mockData';
import { LensKey } from '../types';
import { AppIconGlyph, Avatar, ToastStack } from './UI';
import { CommandSearchModal } from './CommandSearchModal';
import { NoelEffectsLayer } from './FestiveEffects';
import { NotificationDrawer, QuickAskDrawer, SsoHandoffModal } from './Overlays';

export type SubAppId = 'my-ikame' | 'icheck' | 'igoal' | 'icom' | 'iwiki';

interface NavEntry {
  to?: string;
  onClick?: () => void;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeTone?: 'urgent' | 'neutral';
  end?: boolean;
}

interface NavSection {
  title?: string;
  items: NavEntry[];
}

const SUITE_APPS: { id: SubAppId; label: string; to: string; dotColor: string }[] = [
  { id: 'my-ikame', label: 'My iKame', to: '/home', dotColor: '#0B57D0' },
  { id: 'icheck', label: 'iCheck', to: '/icheck', dotColor: '#188038' },
  { id: 'igoal', label: 'iGoal', to: '/igoal/my-eks', dotColor: '#F76226' },
  { id: 'icom', label: 'iCom', to: '/icom/feed', dotColor: '#7627BB' },
  { id: 'iwiki', label: 'iWiki', to: '/iwiki', dotColor: '#E37400' },
];

export function detectSubApp(pathname: string): SubAppId {
  if (pathname.startsWith('/icheck')) return 'icheck';
  if (pathname.startsWith('/igoal') || pathname.startsWith('/goals')) return 'igoal';
  if (
    pathname.startsWith('/icom') ||
    pathname.startsWith('/feed') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/admin')
  ) {
    return 'icom';
  }
  if (pathname.startsWith('/iwiki')) return 'iwiki';
  return 'my-ikame';
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    theme,
    setTheme,
    noelMode,
    toggleNoelMode,
    sidebarCollapsed,
    setSidebarCollapsed,
    ssoLocked,
    setSsoLocked,
    lens,
    switchLens,
    currentPerson,
    posts,
    requests,
    todayItems,
    unreadCount,
    setSearchOpen,
    setNotifDrawerOpen,
    setQuickAskOpen,
    launchApp,
    pinnedAppIds,
    toasts,
    dismissToast,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [lensMenuOpen, setLensMenuOpen] = useState(false);
  const topbarMenusRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const activeApp = detectSubApp(location.pathname);

  useEffect(() => {
    setMobileMenuOpen(false);
    setLauncherOpen(false);
    setThemeMenuOpen(false);
    setLensMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (topbarMenusRef.current && !topbarMenusRef.current.contains(e.target as Node)) {
        setLauncherOpen(false);
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const unackedMandatoryCount = posts.filter(
    (p) =>
      p.mandatoryAck &&
      (p.audience === 'all' || p.audience === currentPerson.team) &&
      !p.ackedBy[currentPerson.id]
  ).length;

  const pendingApprovals = requests.filter((r) => r.status === 'Chờ duyệt').length;
  const allowedApps = INTERNAL_APPS.filter((a) =>
    a.allowedRoles.some((r) => currentPerson.roleKeys.includes(r))
  ).sort((a, b) => (pinnedAppIds.includes(a.id) ? 0 : 1) - (pinnedAppIds.includes(b.id) ? 0 : 1));

  // Context-aware dynamic sidebar per active sub-app!
  const sidebarSections: NavSection[] = (() => {
    if (activeApp === 'igoal') {
      return [
        {
          title: 'OKR chung',
          items: [
            { to: '/igoal/company', label: 'iKame', icon: Building2 },
            { to: '/igoal/technology', label: 'Technology', icon: Cpu },
            { to: '/igoal/team', label: 'Team OKR', icon: Users },
            { to: '/igoal/projects', label: 'Dự án', icon: FolderKanban },
          ],
        },
        {
          title: 'Cá nhân',
          items: [
            { to: '/igoal/my-eks', label: 'My EKS', icon: Target },
            { to: '/igoal/checkpoint', label: 'Checkpoint', icon: Flag },
            { to: '/igoal/feedback-360', label: 'Feedback 360', icon: MessageSquareText },
          ],
        },
      ];
    }

    if (activeApp === 'icheck') {
      return [
        {
          title: 'Chấm công',
          items: [
            { to: '/icheck', label: 'Trang chủ', icon: Home, end: true },
            { to: '/icheck/watchers', label: 'Người quan tâm', icon: Users },
          ],
        },
      ];
    }

    if (activeApp === 'icom') {
      return [
        {
          title: 'Truyền thông & Văn hoá',
          items: [
            {
              to: '/icom/feed',
              label: 'iKame Feed',
              icon: Newspaper,
              badge: unackedMandatoryCount > 0 ? unackedMandatoryCount : undefined,
              badgeTone: 'urgent',
            },
            { to: '/icom/events', label: 'Sự kiện', icon: Calendar },
            { to: '/icom/clubs', label: 'Câu lạc bộ', icon: Trophy },
          ],
        },
        {
          title: 'Điều phối COM',
          items: [{ to: '/icom/admin', label: 'Tổng quan COM', icon: BarChart3 }],
        },
      ];
    }

    if (activeApp === 'iwiki') {
      return [
        {
          items: [
            { onClick: () => setSearchOpen(true), label: 'Tìm kiếm', icon: Search },
            { to: '/iwiki', label: 'Home', icon: Home, end: true },
            { to: '/iwiki/ai', label: 'iWiki AI', icon: Sparkles },
            { to: '/iwiki/notifications', label: 'Thông báo', icon: Bell, badge: 20, badgeTone: 'urgent' },
            { to: '/iwiki/my-docs', label: 'Bài viết của tôi', icon: FileText },
            { to: '/iwiki/review', label: 'Duyệt bài viết', icon: FileCheck2, badge: 90, badgeTone: 'urgent' },
            { to: '/iwiki/delete-requests', label: 'Duyệt yêu cầu xóa', icon: Trash2, badge: 2, badgeTone: 'urgent' },
            { to: '/iwiki/archived', label: 'Bài viết lưu trữ', icon: Archive },
          ],
        },
        {
          title: 'Công ty',
          items: [
            { to: '/iwiki/space/my-ikame', label: 'My iKame', icon: Home },
            { to: '/iwiki/space/ikame-apps', label: 'iKame Apps', icon: Smartphone },
            { to: '/iwiki/space/ikame-games', label: 'iKame Games', icon: Gamepad2 },
            { to: '/iwiki/space/technology', label: 'Technology', icon: Cpu },
            { to: '/iwiki/space/pod', label: 'P&OD', icon: UserCheck },
            { to: '/iwiki/space/finance', label: 'Finance & Accounting', icon: Wallet },
            { to: '/iwiki/space/legal', label: 'Legal & Compliance', icon: Scale },
          ],
        },
      ];
    }

    // Default: My iKame App Tổng (exact 3 sections requested!)
    const showManager = lens === 'manager' || currentPerson.roleKeys.includes('manager');
    return [
      {
        title: 'Cá nhân',
        items: [
          { to: '/home', label: 'Trang chủ', icon: Home },
          { to: '/my-requests', label: 'Đề xuất của tôi', icon: Inbox },
          {
            to: '/my-tasks',
            label: 'Việc cần làm',
            icon: CheckSquare,
            badge: todayItems.length > 0 ? todayItems.length : undefined,
          },
          { to: '/calendar', label: 'Lịch', icon: CalendarDays },
          ...(lens === 'ikamer_new'
            ? [{ to: '/onboarding', label: 'Hành trình 60 ngày', icon: Compass }]
            : []),
        ],
      },
      ...(showManager
        ? [
            {
              title: 'Quản lý',
              items: [
                { to: '/manager/overview', label: 'Trang chủ quản lý', icon: LayoutDashboard },
                { to: '/manager/team', label: 'Team của tôi', icon: Users, badge: 5 },
                {
                  to: '/manager/tasks',
                  label: 'Việc cần làm',
                  icon: CheckSquare,
                  badge: pendingApprovals > 0 ? pendingApprovals : undefined,
                  badgeTone: 'urgent' as const,
                },
              ],
            },
          ]
        : []),
      {
        title: 'Trung tâm hỗ trợ',
        items: [
          { to: '/support', label: 'Tổng quan', icon: LifeBuoy, end: true },
          { to: '/support/about', label: 'Về iKame', icon: Building2 },
          { to: '/support/goals', label: 'Mục tiêu', icon: Target },
          { to: '/support/knowledge', label: 'Tri thức', icon: BookOpen },
          { to: '/support/learning', label: 'Học tập & phát triển', icon: GraduationCap },
          { to: '/support/policies', label: 'Chính sách & phúc lợi', icon: HeartHandshake },
        ],
      },
    ];
  })();

  const lensChoices: { key: LensKey; label: string; sub: string; initials: string; bg: string; fg: string }[] = [
    { key: 'ikamer', label: 'Nguyễn Việt Dũng', sub: 'PM · Cá nhân + Quản lý', initials: 'VD', bg: '#D3E3FD', fg: '#0842A0' },
    { key: 'ikamer_new', label: 'Phạm Gia Huy', sub: 'Người mới · Ngày 32/60', initials: 'GH', bg: '#E6F4EA', fg: '#137333' },
    { key: 'manager', label: 'Trần Thanh Mai', sub: 'Manager · Product', initials: 'TM', bg: '#FEF7E0', fg: '#B06000' },
    { key: 'com_admin', label: 'Lê Bảo Ngọc', sub: 'COM Admin · Comms', initials: 'BN', bg: '#F3E8FD', fg: '#7627BB' },
  ];

  const appDisplayTitle =
    activeApp === 'igoal'
      ? 'iGoal'
      : activeApp === 'icheck'
        ? 'iCheck'
        : activeApp === 'icom'
          ? 'iCom'
          : activeApp === 'iwiki'
            ? 'iWiki'
            : 'My iKame';

  if (ssoLocked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background: 'var(--bg-shell)',
        }}
      >
        <div className="card" style={{ maxWidth: 420, width: '100%', padding: 32, textAlign: 'center', borderRadius: 24 }}>
          <img
            src={ikameLogo}
            alt="iKame"
            style={{ width: 54, height: 54, borderRadius: 14, border: '1px solid var(--border-primary)', background: '#fff', padding: 4, marginBottom: 14 }}
          />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--text-strong)' }}>
            Đăng nhập My iKame
          </h1>
          <p style={{ margin: '8px 0 22px', fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Một tài khoản Google / iKame SSO cho toàn bộ hệ sinh thái iCheck, iGoal, iCom và iWiki.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={() => setSsoLocked(false)}
          >
            <ShieldCheck size={18} /> Tiếp tục với {currentPerson.email}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="g-shell">
      <a href="#main-content" className="skip-link">
        Chuyển tới nội dung chính
      </a>

      {/* Unified Google Workspace Top Navigation Bar */}
      <header className="g-topbar">
        <div className="g-topbar-left">
          <button
            type="button"
            className="btn-icon hide-mobile"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Thu gọn hoặc mở rộng menu bên trái"
            title="Menu chính"
          >
            <Menu size={20} />
          </button>
          <button
            type="button"
            className="btn-icon show-mobile"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Mở menu điều hướng"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/home" className="g-brand-link">
            <img src={ikameMascot} alt="My iKame" className="g-brand-logo" />
            <span className="g-brand-title hide-mobile">{appDisplayTitle}</span>
          </Link>
        </div>

        {/* Center Top App Switcher Navigation (Mathematically Centered) */}
        <nav className="g-suite-nav" aria-label="Điều hướng giữa các ứng dụng iKame">
          {SUITE_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              className={`g-suite-pill ${activeApp === app.id ? 'active' : ''}`}
              onClick={() => navigate(app.to)}
            >
              <span className="g-suite-dot" style={{ background: app.dotColor }} />
              <span>{app.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Google Workspace Utilities — Clean, Uniform & Balanced */}
        <div className="g-topbar-right" ref={topbarMenusRef}>
          <button
            type="button"
            className="g-search-pill"
            onClick={() => setSearchOpen(true)}
            aria-label="Tìm kiếm và lệnh nhanh"
            title="Tìm kiếm nhanh (⌘K)"
          >
            <Search size={15} />
            <span className="kbd hide-mobile">⌘K</span>
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={() => setQuickAskOpen(true)}
            title="Hỏi Trợ lý AI iKame"
            aria-label="Mở Trợ lý AI"
            style={{ color: 'var(--brand-primary-fg)' }}
          >
            <Sparkles size={18} />
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={() => setNotifDrawerOpen(true)}
            aria-label="Thông báo"
            title="Thông báo"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="tabular"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  borderRadius: 'var(--r-full)',
                  background: 'var(--error-solid)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Single Unified Theme & Noel Popover Button */}
          <div style={{ position: 'relative' }} className="hide-mobile">
            <button
              type="button"
              className="btn-icon"
              onClick={() => {
                setThemeMenuOpen((v) => !v);
                setLauncherOpen(false);
              }}
              aria-label="Tuỳ chỉnh giao diện"
              title="Giao diện (Sáng / Tối / Noel)"
              style={{
                background: themeMenuOpen ? 'var(--hover-neutral)' : undefined,
              }}
            >
              {theme === 'light' ? (
                <Sun size={18} />
              ) : theme === 'dark' ? (
                <Moon size={18} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.5 16.5 C6 8.5, 13 4.5, 19.2 9.8 C17 10.4, 16.2 12.8, 17 15.8 Z" fill="#E03553" />
                  <rect x="3" y="15.5" width="15.2" height="3.6" rx="1.8" fill="#FFFFFF" />
                  <circle cx="20" cy="10.8" r="2.1" fill="#FFFFFF" />
                </svg>
              )}
            </button>

            {themeMenuOpen && (
              <div className="popover-menu" style={{ width: 244, padding: 12 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                  Chế độ giao diện
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
                  {(
                    [
                      { id: 'light' as const, label: 'Sáng' },
                      { id: 'dark' as const, label: 'Tối' },
                      { id: 'noel' as const, label: 'Noel' },
                    ]
                  ).map((opt) => {
                    const active = theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTheme(opt.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 5,
                          padding: '9px 6px',
                          borderRadius: 'var(--r-10)',
                          border: `1.5px solid ${active ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
                          background: active ? 'var(--brand-primary-subtle)' : 'var(--bg-subtle)',
                          color: active ? 'var(--brand-primary-fg)' : 'var(--text-secondary)',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {opt.id === 'light' ? (
                          <Sun size={16} />
                        ) : opt.id === 'dark' ? (
                          <Moon size={16} />
                        ) : (
                          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d="M4.5 16.5 C6 8.5, 13 4.5, 19.2 9.8 C17 10.4, 16.2 12.8, 17 15.8 Z"
                              fill="#E03553"
                            />
                            <rect x="3" y="15.5" width="15.2" height="3.6" rx="1.8" fill="#FFFFFF" />
                            <circle cx="20" cy="10.8" r="2.1" fill="#FFFFFF" />
                          </svg>
                        )}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>
                    <Snowflake size={14} style={{ color: noelMode ? 'var(--brand-primary-fg)' : 'var(--text-tertiary)' }} />
                    <span>Hiệu ứng Noel</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={noelMode}
                    className={`switch ${noelMode ? 'on' : ''}`}
                    onClick={toggleNoelMode}
                  >
                    <span className="switch-thumb" />
                  </button>
                </div>

                {noelMode && (
                  <div
                    data-snow-preview="true"
                    style={{
                      marginTop: 10,
                      paddingTop: 9,
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Thử tuyết đọng:</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(
                        [
                          { lvl: 1, label: '1p' },
                          { lvl: 2, label: '5p' },
                          { lvl: 3, label: '10p' },
                        ] as const
                      ).map((p) => (
                        <button
                          key={p.lvl}
                          type="button"
                          data-snow-preview="true"
                          className="btn btn-dim btn-sm"
                          style={{ height: 22, padding: '0 7px', fontSize: 11 }}
                          onClick={() =>
                            window.dispatchEvent(new CustomEvent('ikame:snow-preview', { detail: p.lvl }))
                          }
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 9-dot Google App Launcher */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-icon"
              onClick={() => {
                setLauncherOpen((v) => !v);
                setThemeMenuOpen(false);
              }}
              aria-label="Mở tất cả ứng dụng iKame"
              title="Ứng dụng iKame"
              style={{
                background: launcherOpen ? 'var(--hover-neutral)' : undefined,
              }}
            >
              <Grid size={18} />
            </button>
            {launcherOpen && (
              <div className="popover-menu" style={{ width: 320, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>
                    Hệ sinh thái iKame
                  </span>
                  <Link
                    to="/apps"
                    style={{ fontSize: 12, color: 'var(--brand-primary-fg)', fontWeight: 600 }}
                    onClick={() => setLauncherOpen(false)}
                  >
                    Tất cả
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {allowedApps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        setLauncherOpen(false);
                        if (app.id === 'app-icheck') navigate('/icheck');
                        else if (app.id === 'app-igoal') navigate('/igoal/my-eks');
                        else if (app.id === 'app-iwiki') navigate('/iwiki');
                        else launchApp(app);
                      }}
                      style={{
                        border: 'none',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--r-12)',
                        padding: '10px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        textAlign: 'center',
                      }}
                    >
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 'var(--r-full)',
                          background: app.accentBg,
                          color: app.accentFg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AppIconGlyph iconKey={app.iconKey} size={16} />
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-strong)' }}>
                        {app.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link to="/profile" title={`${currentPerson.name} · Hồ sơ`} style={{ marginLeft: 4 }}>
            <Avatar person={currentPerson} size={32} />
          </Link>
        </div>
      </header>

      {/* Body: Dynamic Material 3 Navigation Drawer + Floating White Workspace Sheet */}
      <div className="g-body">
        {mobileMenuOpen && (
          <div className="backdrop show-mobile" style={{ zIndex: 42 }} onClick={() => setMobileMenuOpen(false)} />
        )}

        <aside
          className={`g-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
          aria-label={`Điều hướng ${appDisplayTitle}`}
        >
          <div className="g-nav-sections">
            {sidebarSections.map((sec, sIdx) => (
              <div key={sec.title || sIdx} className="g-nav-group">
                {!sidebarCollapsed && sec.title && <div className="g-nav-label">{sec.title}</div>}
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  if (item.onClick) {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        className="g-nav-item"
                        onClick={item.onClick}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon size={18} style={{ flexShrink: 0 }} />
                        {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                      </button>
                    );
                  }
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to!}
                      end={item.end}
                      className={({ isActive }) => `g-nav-item ${isActive ? 'active' : ''}`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon size={18} style={{ flexShrink: 0 }} />
                      {!sidebarCollapsed && (
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                      )}
                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span className={`g-nav-badge ${item.badgeTone || ''}`}>{item.badge}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Compact Profile / Role Switcher Popover */}
          <div style={{ paddingTop: 12, position: 'relative' }}>
            {lensMenuOpen && (
              <div
                className="popover-menu"
                style={{ top: 'auto', bottom: 'calc(100% + 6px)', left: 0, right: 0, padding: 8 }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', padding: '4px 10px 6px', textTransform: 'uppercase' }}>
                  Đổi vai trò (Demo)
                </div>
                {lensChoices.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className="g-nav-item"
                    style={{
                      height: 44,
                      padding: '0 10px',
                      background: lens === opt.key ? 'var(--brand-primary-tint)' : 'transparent',
                    }}
                    onClick={() => {
                      switchLens(opt.key);
                      setLensMenuOpen(false);
                    }}
                  >
                    <span className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: opt.bg, color: opt.fg }}>
                      {opt.initials}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{opt.sub}</div>
                    </div>
                    {lens === opt.key && <Check size={14} style={{ color: 'var(--brand-primary-fg)' }} />}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 6, paddingTop: 6, display: 'flex', gap: 4 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setLensMenuOpen(false);
                      navigate('/assistant');
                    }}
                  >
                    <HelpCircle size={13} /> Trợ lý AI
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setLensMenuOpen(false);
                      setSsoLocked(true);
                    }}
                  >
                    <LogOut size={13} /> SSO
                  </button>
                </div>
              </div>
            )}

            {!sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setLensMenuOpen((v) => !v)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 'var(--r-full)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-surface)',
                  textAlign: 'left',
                }}
              >
                <Avatar person={currentPerson} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentPerson.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentPerson.email}
                  </div>
                </div>
                <ChevronsUpDown size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-icon"
                style={{ margin: '0 auto' }}
                onClick={() => setSidebarCollapsed(false)}
                title={currentPerson.name}
              >
                <Avatar person={currentPerson} size={30} />
              </button>
            )}
          </div>
        </aside>

        {/* Main Floating White Material 3 Sheet */}
        <div className="g-workspace-wrap">
          <main id="main-content" className="g-workspace-sheet">
            <div className="g-workspace-inner">{children}</div>
            <NoelEffectsLayer active={noelMode} dark={theme !== 'light'} />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav" aria-label="Điều hướng di động">
        {[
          { to: '/home', label: 'My iKame', icon: LayoutGrid },
          { to: '/icheck', label: 'iCheck', icon: Clock },
          { to: '/igoal/my-eks', label: 'iGoal', icon: Target },
          { to: '/icom/feed', label: 'iCom', icon: Newspaper },
          { to: '/iwiki', label: 'iWiki', icon: BookOpen },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <CommandSearchModal />
      <NotificationDrawer />
      <QuickAskDrawer />
      <SsoHandoffModal />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
