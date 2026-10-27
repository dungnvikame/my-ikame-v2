import {
  Bell,
  CalendarDots,
  ChatsCircle,
  Gauge,
  House,
  MagnifyingGlass,
  Moon,
  SidebarSimple,
  Sparkle,
  SquaresFour,
  Sun,
  X,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState, type KeyboardEvent, type PropsWithChildren } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../AppState';
import { AppLauncher } from './AppLauncher';
import { BrandLogo } from './BrandLogo';
import { IconButton, StatusPill } from './UI';
import { NotificationList } from '../pages/NotificationsPage';
import { QuickAskPanel } from './assistant/QuickAskPanel';
import { SearchPalette } from './search/SearchPalette';

type NavEntry = { label: string; to: string; icon: typeof House };
type NavGroup = { label: string; items: NavEntry[] };

// MVP: nav tinh gọn còn 5 mục (Newsfeed + Sự kiện là trọng tâm; Ứng dụng là một cửa
// vào các platform khác). Module ngoài MVP (Tri thức, Mục tiêu, iRequest, Manager)
// vẫn giữ route — chỉ ẩn khỏi điều hướng.
const iKamerNavGroups: NavGroup[] = [
  { label: 'KHÔNG GIAN CỦA BẠN', items: [
    { label: 'Trang chủ', to: '/home', icon: House },
    { label: 'iKame Feed', to: '/feed', icon: ChatsCircle },
    { label: 'Sự kiện', to: '/events', icon: CalendarDots },
    { label: 'Ứng dụng', to: '/apps', icon: SquaresFour },
    { label: 'Trợ lý AI', to: '/assistant', icon: Sparkle },
  ] },
];

// COM Admin: "Tổng quan COM" thay Trang chủ — nơi ghim/push/đo acknowledge; các mục còn lại dùng chung.
const adminNavGroups: NavGroup[] = [
  { label: 'QUẢN TRỊ COM', items: [
    { label: 'Tổng quan COM', to: '/admin', icon: Gauge },
  ] },
  { label: 'KHÔNG GIAN CHUNG', items: [
    { label: 'iKame Feed', to: '/feed', icon: ChatsCircle },
    { label: 'Sự kiện', to: '/events', icon: CalendarDots },
    { label: 'Ứng dụng', to: '/apps', icon: SquaresFour },
    { label: 'Trợ lý AI', to: '/assistant', icon: Sparkle },
  ] },
];

// Fixed 5 — mobile bottom-nav mirrors the MVP sidebar.
const iKamerBottomNav: NavEntry[] = [
  { label: 'Trang chủ', to: '/home', icon: House },
  { label: 'Feed', to: '/feed', icon: ChatsCircle },
  { label: 'Sự kiện', to: '/events', icon: CalendarDots },
  { label: 'Ứng dụng', to: '/apps', icon: SquaresFour },
  { label: 'Trợ lý AI', to: '/assistant', icon: Sparkle },
];

const adminBottomNav: NavEntry[] = [
  { label: 'COM', to: '/admin', icon: Gauge },
  { label: 'Feed', to: '/feed', icon: ChatsCircle },
  { label: 'Sự kiện', to: '/events', icon: CalendarDots },
  { label: 'Ứng dụng', to: '/apps', icon: SquaresFour },
  { label: 'Trợ lý AI', to: '/assistant', icon: Sparkle },
];

function Logo() {
  return (
    <div className="brand" aria-label="My iKame">
      <BrandLogo size={36} />
      <span className="brand-name">My iKame</span>
    </div>
  );
}

/** Chuyển góc nhìn demo: iKamer ↔ COM Admin (Manager parked ở MVP — thêm lại 1 nút khi cần). */
function PerspectiveSwitch() {
  const { perspective, setPerspective } = useAppState();
  const navigate = useNavigate();

  const select = (next: 'ikamer' | 'admin') => {
    setPerspective(next);
    navigate(next === 'admin' ? '/admin' : '/home');
  };

  return (
    <div className="perspective-switch" role="group" aria-label="Chọn góc nhìn">
      <button type="button" aria-pressed={perspective === 'ikamer'} className={perspective === 'ikamer' ? 'is-active' : ''} onClick={() => select('ikamer')}>iKamer</button>
      <button type="button" aria-pressed={perspective === 'admin'} className={perspective === 'admin' ? 'is-active' : ''} onClick={() => select('admin')}>COM Admin</button>
    </div>
  );
}

function NotificationsDrawer({ triggerRef }: { triggerRef: React.RefObject<HTMLButtonElement | null> }) {
  const {
    notifications,
    notificationOpen,
    setNotificationOpen,
    markAllNotificationsRead,
  } = useAppState();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setNotificationOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (notificationOpen) closeButtonRef.current?.focus();
  }, [notificationOpen]);

  if (!notificationOpen) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="drawer-layer" role="presentation" onMouseDown={close}>
      <aside ref={drawerRef} className="notification-drawer" role="dialog" aria-modal="true" aria-label="Thông báo" onKeyDown={onKeyDown} onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2>Thông báo</h2>
            <p>Ưu tiên những việc cần bạn hành động.</p>
          </div>
          <IconButton ref={closeButtonRef} label="Đóng thông báo" onClick={close}><X size={20} /></IconButton>
        </div>
        <div className="drawer-toolbar">
          <button className="text-link" onClick={markAllNotificationsRead}>Đánh dấu tất cả đã đọc</button>
          <NavLink className="text-link" to="/notifications" onClick={close}>Xem tất cả</NavLink>
        </div>
        <NotificationList items={notifications} compact onItemOpen={close} />
      </aside>
    </div>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const { perspective, user, notifications, theme, setTheme, setNotificationOpen, setAskOpen, setSearchOpen } = useAppState();
  const navGroups = perspective === 'admin' ? adminNavGroups : iKamerNavGroups;
  const bottomNav = perspective === 'admin' ? adminBottomNav : iKamerBottomNav;
  const unreadCount = notifications.filter((item) => !item.read).length;
  const notificationTriggerRef = useRef<HTMLButtonElement>(null);

  // Presenter may hide the sidebar for extra canvas mid-demo; survives refresh like theme.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('my-ikame-sidebar') === 'collapsed'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('my-ikame-sidebar', sidebarCollapsed ? 'collapsed' : 'open'); } catch { /* private mode */ }
  }, [sidebarCollapsed]);

  // ⌘K / Ctrl+K opens the palette from any route. Deliberately no `/` shortcut — it would
  // hijack the character inside every text input on the page (typing trap).
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setSearchOpen]);

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} data-theme={theme}>
      <a className="skip-link" href="#main-content">Đi tới nội dung chính</a>
      <aside className="sidebar">
        <div className="sidebar-top">
          <Logo />
          <nav className="primary-nav" aria-label="Điều hướng chính">
            {navGroups.map((group) => (
              <div key={group.label} className="nav-group">
                <p className="nav-label">{group.label}</p>
                {group.items.map(({ label, to, icon: Icon }) => (
                  <NavLink key={to} to={to} end title={label} className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>
        <div className="sidebar-account">
          <PerspectiveSwitch />
          <NavLink to="/profile" className="account-row">
            <span className="avatar" aria-hidden="true">{user.shortName.slice(0, 1)}</span>
            <span className="account-copy"><strong>{user.name}</strong><small>{user.role}</small></span>
          </NavLink>
        </div>
      </aside>

      <div className="work-area">
        <header className="topbar">
          <div className="topbar-left">
            <IconButton
              className="sidebar-toggle"
              label={sidebarCollapsed ? 'Hiện thanh điều hướng' : 'Ẩn thanh điều hướng'}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
            >
              <SidebarSimple size={20} />
            </IconButton>
            <div className="mobile-logo"><Logo /></div>
          </div>
          <button type="button" className="search-trigger" aria-label="Tìm kiếm (⌘K)" onClick={() => setSearchOpen(true)}>
            <MagnifyingGlass size={18} />
            <span>Tìm tin tức, sự kiện...</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="topbar-actions">
            <AppLauncher />
            <IconButton label="Hỏi iKame" onClick={() => setAskOpen(true)}>
              <Sparkle size={20} />
            </IconButton>
            <IconButton label={theme === 'light' ? 'Bật giao diện tối' : 'Bật giao diện sáng'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </IconButton>
            <div className="notification-trigger-wrap">
              <IconButton ref={notificationTriggerRef} label="Mở thông báo" onClick={() => setNotificationOpen(true)}><Bell size={20} /></IconButton>
              {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
            </div>
            <StatusPill tone="neutral">H2 Prototype</StatusPill>
          </div>
        </header>
        <main id="main-content" className="main-content">{children}</main>
        <nav className="bottom-nav" aria-label="Điều hướng mobile">
          {bottomNav.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'is-active' : ''}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <NotificationsDrawer triggerRef={notificationTriggerRef} />
      <SearchPalette />
      <QuickAskPanel />
    </div>
  );
}
