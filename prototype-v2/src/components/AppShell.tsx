import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  Check,
  ChevronsUpDown,
  Compass,
  Grid,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import ikameLogo from '../assets/ikame-logo.png';
import { useApp } from '../context/AppContext';
import { INTERNAL_APPS } from '../data/mockData';
import { LensKey } from '../types';
import { AppIconGlyph, Avatar, ToastStack } from './UI';
import { CommandSearchModal } from './CommandSearchModal';
import { NotificationDrawer, QuickAskDrawer, SsoHandoffModal } from './Overlays';

interface NavEntry {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeTone?: 'urgent' | 'accent';
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    theme,
    toggleTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    ssoLocked,
    setSsoLocked,
    lens,
    switchLens,
    currentPerson,
    posts,
    requests,
    quests,
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
  const [lensMenuOpen, setLensMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close popovers on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setLauncherOpen(false);
    setLensMenuOpen(false);
  }, [location.pathname]);

  // PRD R-L2: Route guard redirecting to lens home when visiting another lens's route
  useEffect(() => {
    const p = location.pathname;
    if (p.startsWith('/manager') && lens !== 'manager') {
      navigate(lens === 'com_admin' ? '/admin' : '/home', { replace: true });
    } else if (p.startsWith('/admin') && lens !== 'com_admin') {
      navigate(lens === 'manager' ? '/manager/overview' : '/home', { replace: true });
    } else if (p.startsWith('/onboarding') && lens !== 'ikamer_new') {
      navigate(lens === 'manager' ? '/manager/overview' : lens === 'com_admin' ? '/admin' : '/home', {
        replace: true,
      });
    } else if (p === '/home' && lens === 'manager') {
      navigate('/manager/overview', { replace: true });
    } else if (p === '/home' && lens === 'com_admin') {
      navigate('/admin', { replace: true });
    }
  }, [lens, location.pathname, navigate]);

  const unackedMandatoryCount = posts.filter(
    (p) =>
      p.mandatoryAck &&
      (p.audience === 'all' || p.audience === currentPerson.team) &&
      !p.ackedBy[currentPerson.id]
  ).length;

  const pendingApprovals = requests.filter((r) => r.status === 'Chờ duyệt').length;
  const remainingQuests = quests.filter((q) => !q.completed).length;

  const allowedApps = INTERNAL_APPS.filter((a) =>
    a.allowedRoles.some((r) => currentPerson.roleKeys.includes(r))
  ).sort((a, b) => (pinnedAppIds.includes(a.id) ? 0 : 1) - (pinnedAppIds.includes(b.id) ? 0 : 1));

  // Navigation items strictly per PRD §4 table
  const primaryNav: NavEntry[] =
    lens === 'manager'
      ? [
          {
            to: '/manager/overview',
            label: 'Tổng quan',
            icon: LayoutDashboard,
            badge: pendingApprovals > 0 ? pendingApprovals : undefined,
            badgeTone: 'urgent',
          },
          { to: '/manager/team', label: 'Đội ngũ', icon: Users, badge: 5 },
          { to: '/goals', label: 'Mục tiêu team', icon: Target },
        ]
      : lens === 'com_admin'
        ? [
            {
              to: '/admin',
              label: 'Tổng quan COM',
              icon: BarChart3,
              badge: 'WAER',
              badgeTone: 'accent',
            },
          ]
        : [
            { to: '/home', label: 'Trang chủ', icon: Home },
            ...(lens === 'ikamer_new'
              ? [
                  {
                    to: '/onboarding',
                    label: 'Hành trình',
                    icon: Compass,
                    badge: `${remainingQuests}`,
                    badgeTone: 'accent' as const,
                  },
                ]
              : []),
            { to: '/work', label: 'Công việc', icon: Briefcase },
          ];

  const coreNav: NavEntry[] = [
    ...(lens === 'manager' || lens === 'com_admin'
      ? [{ to: '/work', label: 'Công việc', icon: Briefcase }]
      : []),
    {
      to: '/feed',
      label: 'iKame Feed',
      icon: Newspaper,
      badge: lens !== 'com_admin' && unackedMandatoryCount > 0 ? unackedMandatoryCount : undefined,
      badgeTone: 'urgent',
    },
    { to: '/events', label: 'Sự kiện', icon: Calendar },
    { to: '/apps', label: 'Ứng dụng', icon: Grid },
    { to: '/assistant', label: 'Trợ lý AI', icon: Sparkles },
  ];

  const mobileNavItems: NavEntry[] =
    lens === 'manager'
      ? [
          { to: '/manager/overview', label: 'Tổng quan', icon: LayoutDashboard },
          { to: '/manager/team', label: 'Đội ngũ', icon: Users },
          { to: '/feed', label: 'Feed', icon: Newspaper },
          { to: '/events', label: 'Sự kiện', icon: Calendar },
          { to: '/assistant', label: 'Trợ lý AI', icon: Sparkles },
        ]
      : lens === 'com_admin'
        ? [
            { to: '/admin', label: 'COM', icon: BarChart3 },
            { to: '/feed', label: 'Feed', icon: Newspaper },
            { to: '/events', label: 'Sự kiện', icon: Calendar },
            { to: '/apps', label: 'Ứng dụng', icon: Grid },
            { to: '/assistant', label: 'Trợ lý AI', icon: Sparkles },
          ]
        : [
            { to: '/home', label: 'Trang chủ', icon: Home },
            lens === 'ikamer_new'
              ? { to: '/onboarding', label: 'Hành trình', icon: Compass }
              : { to: '/work', label: 'Công việc', icon: Briefcase },
            { to: '/feed', label: 'Feed', icon: Newspaper },
            { to: '/events', label: 'Sự kiện', icon: Calendar },
            { to: '/assistant', label: 'Trợ lý AI', icon: Sparkles },
          ];

  const lensChoices: { key: LensKey; label: string; sub: string; initials: string; bg: string; fg: string }[] = [
    { key: 'ikamer', label: 'Nguyễn Hoàng An', sub: 'iKamer · Product Designer', initials: 'HA', bg: '#FEECE6', fg: '#B83D0C' },
    { key: 'ikamer_new', label: 'Phạm Gia Huy', sub: 'Người mới · Ngày 32/60', initials: 'GH', bg: '#EBF5FF', fg: '#0B64B4' },
    { key: 'manager', label: 'Trần Thanh Mai', sub: 'Manager · Product Manager', initials: 'TM', bg: '#ECFDF5', fg: '#066B36' },
    { key: 'com_admin', label: 'Lê Bảo Ngọc', sub: 'COM Admin · Comms Lead', initials: 'BN', bg: '#F5F2FF', fg: '#6638D4' },
  ];

  // Demo SSO Lock Screen (PRD SH-6)
  if (ssoLocked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background: 'var(--bg-canvas)',
        }}
      >
        <div className="card" style={{ maxWidth: 420, width: '100%', padding: 28, textAlign: 'center' }}>
          <img
            src={ikameLogo}
            alt="iKame"
            style={{
              width: 58,
              height: 58,
              borderRadius: 'var(--r-12)',
              border: '1px solid var(--border-primary)',
              background: '#fff',
              padding: 4,
              marginBottom: 14,
            }}
          />
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: 'var(--text-strong)' }}>
            Đăng nhập My iKame
          </h1>
          <p style={{ margin: '6px 0 20px', fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Cửa vào trải nghiệm nhân viên iKame. Xác thực một lần qua SSO iKame (OIDC / Passkey).
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={() => setSsoLocked(false)}
          >
            <ShieldCheck size={18} /> Đăng nhập với iKame SSO ({currentPerson.email})
          </button>
          <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
            Tự động đồng bộ vai trò, phòng ban & ngày gia nhập từ HRIS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Chuyển thẳng tới nội dung chính
      </a>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="backdrop show-mobile"
          style={{ zIndex: 38 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop + Slide-in Sidebar */}
      <aside
        className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
        aria-label="Điều hướng chính"
      >
        <div className="sidebar-brand">
          <Link
            to={lens === 'manager' ? '/manager/overview' : lens === 'com_admin' ? '/admin' : '/home'}
            className="sidebar-logo-link"
          >
            <img src={ikameLogo} alt="My iKame" className="sidebar-logo-img" />
            {!sidebarCollapsed && (
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-name">My iKame</span>
                <span className="sidebar-brand-sub">
                  {lens === 'manager'
                    ? 'Lăng kính Manager'
                    : lens === 'com_admin'
                      ? 'Lăng kính COM Admin'
                      : lens === 'ikamer_new'
                        ? 'iKamer · Ngày 32/60'
                        : 'Employee Gate'}
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            className="btn-icon hide-mobile"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
            aria-label={sidebarCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
          <button
            type="button"
            className="btn-icon show-mobile"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            {!sidebarCollapsed && (
              <div className="nav-group-label">
                {lens === 'manager'
                  ? 'Điều hành đội ngũ'
                  : lens === 'com_admin'
                    ? 'Quản trị truyền thông'
                    : 'Không gian của bạn'}
              </div>
            )}
            {primaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={18} className="nav-item-icon" />
                  {!sidebarCollapsed && <span className="nav-item-label">{item.label}</span>}
                  {!sidebarCollapsed && item.badge !== undefined && (
                    <span className={`nav-badge ${item.badgeTone || ''}`}>{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="nav-group">
            {!sidebarCollapsed && <div className="nav-group-label">Lõi chung iKame</div>}
            {coreNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={18} className="nav-item-icon" />
                  {!sidebarCollapsed && <span className="nav-item-label">{item.label}</span>}
                  {!sidebarCollapsed && item.badge !== undefined && (
                    <span className={`nav-badge ${item.badgeTone || ''}`}>{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="nav-group">
            {!sidebarCollapsed && <div className="nav-group-label">Cá nhân</div>}
            <NavLink
              to="/notifications"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={sidebarCollapsed ? 'Thông báo' : undefined}
            >
              <Bell size={18} className="nav-item-icon" />
              {!sidebarCollapsed && <span className="nav-item-label">Thông báo</span>}
              {!sidebarCollapsed && unreadCount > 0 && (
                <span className="nav-badge urgent">{unreadCount}</span>
              )}
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={sidebarCollapsed ? 'Hồ sơ' : undefined}
            >
              <User size={18} className="nav-item-icon" />
              {!sidebarCollapsed && <span className="nav-item-label">Hồ sơ</span>}
            </NavLink>
          </div>
        </nav>

        {/* Compact Demo Lens Switcher Popover (clean sidebar!) */}
        <div className="sidebar-footer" style={{ position: 'relative' }}>
          {lensMenuOpen && (
            <div
              className="popover-menu"
              style={{
                top: 'auto',
                bottom: 'calc(100% + 6px)',
                left: 10,
                right: 10,
                padding: 6,
              }}
            >
              <div className="lens-switcher-head" style={{ padding: '4px 8px 6px' }}>
                <span>Đổi lăng kính</span>
              </div>
              <div className="lens-options">
                {lensChoices.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`lens-btn ${lens === opt.key ? 'active' : ''}`}
                    onClick={() => {
                      switchLens(opt.key);
                      setLensMenuOpen(false);
                    }}
                  >
                    <span
                      className="avatar"
                      style={{
                        width: 26,
                        height: 26,
                        fontSize: 10.5,
                        background: opt.bg,
                        color: opt.fg,
                      }}
                    >
                      {opt.initials}
                    </span>
                    <span className="lens-btn-meta">
                      <span className="lens-btn-name">{opt.label}</span>
                      <span className="lens-btn-role">{opt.sub}</span>
                    </span>
                    {lens === opt.key && <Check size={14} style={{ color: 'var(--brand-primary-fg)', flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!sidebarCollapsed ? (
            <button
              type="button"
              className="lens-btn"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--r-10)',
                padding: '8px 10px',
              }}
              onClick={() => setLensMenuOpen((v) => !v)}
              aria-expanded={lensMenuOpen}
            >
              <Avatar person={currentPerson} size={30} />
              <span className="lens-btn-meta">
                <span className="lens-btn-name">{currentPerson.name}</span>
                <span className="lens-btn-role">
                  {lens === 'manager'
                    ? 'Manager'
                    : lens === 'com_admin'
                      ? 'COM Admin'
                      : lens === 'ikamer_new'
                        ? 'Người mới · 32/60'
                        : 'iKamer'}
                </span>
              </span>
              <ChevronsUpDown size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            </button>
          ) : (
            <button
              type="button"
              className="btn-icon"
              style={{ margin: '0 auto' }}
              onClick={() => setSidebarCollapsed(false)}
              title="Đổi lăng kính"
            >
              <Avatar person={currentPerson} size={30} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Column */}
      <div className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="btn-icon show-mobile"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu điều hướng"
            >
              <Menu size={20} />
            </button>

            <button
              type="button"
              className="search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="Mở tìm kiếm nhanh"
            >
              <Search size={15} style={{ flexShrink: 0 }} />
              <span className="search-trigger-text">Tìm tin tức, sự kiện, chính sách, đồng nghiệp...</span>
              <span className="kbd hide-mobile">⌘K</span>
            </button>
          </div>

          <div className="topbar-right">
            {/* Ask iKame quick AI drawer trigger (SH-2) */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setQuickAskOpen(true)}
            >
              <Sparkles size={14} style={{ color: 'var(--brand-primary-fg)' }} />
              <span className="hide-mobile">Hỏi iKame</span>
            </button>

            {/* App Launcher popover (SH-2, AP-4) */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setLauncherOpen((v) => !v)}
                aria-label="Mở danh bạ Ứng dụng nhanh"
                title="Ứng dụng nội bộ"
              >
                <Grid size={18} />
              </button>
              {launcherOpen && (
                <div className="popover-menu" style={{ width: 320, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-strong)' }}>
                      Ứng dụng theo quyền của bạn ({allowedApps.length})
                    </span>
                    <Link
                      to="/apps"
                      style={{ fontSize: 12, color: 'var(--info-fg)', fontWeight: 500 }}
                      onClick={() => setLauncherOpen(false)}
                    >
                      Xem tất cả
                    </Link>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {allowedApps.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setLauncherOpen(false);
                          launchApp(app);
                        }}
                        style={{
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--r-8)',
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
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--r-8)',
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

            {/* Notification Bell (SH-2) */}
            <button
              type="button"
              className="btn-icon"
              onClick={() => setNotifDrawerOpen(true)}
              aria-label="Mở hộp thông báo"
              title="Thông báo"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  className="tabular"
                  style={{
                    position: 'absolute',
                    top: 3,
                    right: 3,
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

            {/* Light / Dark Theme Toggle (SH-3) */}
            <button
              type="button"
              className="btn-icon"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'}
              title={theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {/* SSO Demo Lock */}
            <button
              type="button"
              className="btn-icon hide-mobile"
              onClick={() => setSsoLocked(true)}
              title="Xem màn hình đăng nhập SSO iKame"
              aria-label="Đăng xuất SSO demo"
            >
              <LogOut size={16} />
            </button>

            {/* Profile Link */}
            <Link
              to="/profile"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}
              title={`${currentPerson.name} — Hồ sơ`}
            >
              <Avatar person={currentPerson} size={32} />
            </Link>
          </div>
        </header>

        <main id="main-content" className="app-content">
          {children}
        </main>
      </div>

      {/* Mobile 5-item Bottom Navigation (SH-1, SH-4) */}
      <nav className="mobile-bottom-nav" aria-label="Điều hướng di động">
        {mobileNavItems.map((item) => {
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

      {/* Global Overlays */}
      <CommandSearchModal />
      <NotificationDrawer />
      <QuickAskDrawer />
      <SsoHandoffModal />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
