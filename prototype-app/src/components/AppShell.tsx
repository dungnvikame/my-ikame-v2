import {
  Bell,
  BookBookmark,
  CalendarDots,
  House,
  MagnifyingGlass,
  Moon,
  Newspaper,
  Target,
  Sun,
  UsersThree,
  X,
} from '@phosphor-icons/react';
import type { PropsWithChildren } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../AppState';
import { IconButton, StatusPill } from './UI';

const iKamerNav = [
  { label: 'Trang chủ', to: '/home', icon: House },
  { label: 'Tin tức', to: '/news', icon: Newspaper },
  { label: 'Sự kiện', to: '/events', icon: CalendarDots },
  { label: 'Tri thức', to: '/knowledge', icon: BookBookmark },
  { label: 'Mục tiêu', to: '/goals', icon: Target },
];

const managerNav = [
  { label: 'Tổng quan', to: '/manager/overview', icon: House },
  { label: 'Đội ngũ', to: '/manager/team', icon: UsersThree },
  { label: 'Tin tức', to: '/news', icon: Newspaper },
  { label: 'Sự kiện', to: '/events', icon: CalendarDots },
  { label: 'Tri thức', to: '/knowledge', icon: BookBookmark },
  { label: 'Mục tiêu', to: '/goals', icon: Target },
];

function Logo() {
  return (
    <div className="brand" aria-label="My iKame">
      <span className="brand-mark" aria-hidden="true">iK</span>
      <span className="brand-name">My iKame</span>
    </div>
  );
}

function PerspectiveSwitch() {
  const { perspective, setPerspective } = useAppState();
  const navigate = useNavigate();

  const select = (next: 'ikamer' | 'manager') => {
    setPerspective(next);
    navigate(next === 'manager' ? '/manager/overview' : '/home');
  };

  return (
    <div className="perspective-switch" aria-label="Chọn góc nhìn">
      <button className={perspective === 'ikamer' ? 'is-active' : ''} onClick={() => select('ikamer')}>iKamer</button>
      <button className={perspective === 'manager' ? 'is-active' : ''} onClick={() => select('manager')}>Manager</button>
    </div>
  );
}

function NotificationsDrawer() {
  const {
    notificationOpen,
    setNotificationOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppState();
  const navigate = useNavigate();

  if (!notificationOpen) return null;

  return (
    <div className="drawer-layer" role="presentation" onMouseDown={() => setNotificationOpen(false)}>
      <aside className="notification-drawer" role="dialog" aria-modal="true" aria-label="Thông báo" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2>Thông báo</h2>
            <p>Ưu tiên những việc cần bạn hành động.</p>
          </div>
          <IconButton label="Đóng thông báo" onClick={() => setNotificationOpen(false)}><X size={20} /></IconButton>
        </div>
        <div className="drawer-toolbar">
          <button className="text-link" onClick={markAllNotificationsRead}>Đánh dấu tất cả đã đọc</button>
          <NavLink className="text-link" to="/notifications" onClick={() => setNotificationOpen(false)}>Xem tất cả</NavLink>
        </div>
        <div className="notification-list">
          {notifications.map((item) => (
            <button
              key={item.id}
              className={`notification-item ${item.read ? '' : 'is-unread'}`}
              onClick={() => {
                markNotificationRead(item.id);
                setNotificationOpen(false);
                navigate(item.href);
              }}
            >
              <span className="notification-dot" aria-label={item.read ? 'Đã đọc' : 'Chưa đọc'} />
              <span className="notification-copy">
                <span className="notification-title">{item.title}</span>
                <span>{item.body}</span>
                <span className="notification-time">{item.time}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const { perspective, user, notifications, theme, setTheme, setNotificationOpen } = useAppState();
  const navItems = perspective === 'manager' ? managerNav : iKamerNav;
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="app-shell" data-theme={theme}>
      <a className="skip-link" href="#main-content">Đi tới nội dung chính</a>
      <aside className="sidebar">
        <div className="sidebar-top">
          <Logo />
          <nav className="primary-nav" aria-label="Điều hướng chính">
            <p className="nav-label">KHÔNG GIAN CỦA BẠN</p>
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} end className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
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
          <div className="mobile-logo"><Logo /></div>
          <NavLink className="search-trigger" to="/search">
            <MagnifyingGlass size={18} />
            <span>Tìm tin tức, sự kiện...</span>
            <kbd>⌘ K</kbd>
          </NavLink>
          <div className="topbar-actions">
            <IconButton label={theme === 'light' ? 'Bật giao diện tối' : 'Bật giao diện sáng'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </IconButton>
            <div className="notification-trigger-wrap">
              <IconButton label="Mở thông báo" onClick={() => setNotificationOpen(true)}><Bell size={20} /></IconButton>
              {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
            </div>
            <StatusPill tone="neutral">H2 Prototype</StatusPill>
          </div>
        </header>
        <main id="main-content" className="main-content">{children}</main>
        <nav className="bottom-nav" aria-label="Điều hướng mobile">
          {navItems.slice(0, 5).map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'is-active' : ''}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <NotificationsDrawer />
    </div>
  );
}
