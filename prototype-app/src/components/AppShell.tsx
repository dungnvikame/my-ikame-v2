import { BellIcon as Bell, BriefcaseIcon as Briefcase, CalendarDotsIcon as CalendarDots, ChatsCircleIcon as ChatsCircle, CompassIcon as Compass, GaugeIcon as Gauge, HouseIcon as House, MagnifyingGlassIcon as MagnifyingGlass, MoonIcon as Moon, SidebarSimpleIcon as SidebarSimple, SparkleIcon as Sparkle, SquaresFourIcon as SquaresFour, SunIcon as Sun, TargetIcon as Target, UsersThreeIcon as UsersThree, XIcon as X, PaperPlaneTiltIcon as PaperPlaneTilt, UserCircleIcon as UserCircle, ArrowsClockwiseIcon as ArrowsClockwise, EyeIcon as Eye, EyeSlashIcon as EyeSlash, PlugsConnectedIcon as PlugsConnected, DatabaseIcon as Database, CalendarIcon as CalendarIco, HandHeartIcon as HandHeart } from '@coreds/react/icons';
import { useEffect, useRef, useState, type KeyboardEvent, type PropsWithChildren } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../AppState';
import type { Perspective } from '../types';
import { AppLauncher } from './AppLauncher';
import { BrandLogo } from './BrandLogo';
import { IconButton, StatusPill, ChipButton, TextButton } from './UI';
import { NotificationList } from '../pages/NotificationsPage';
import { QuickAskPanel } from './assistant/QuickAskPanel';
import { SearchPalette } from './search/SearchPalette';
import { useLive } from '../lib/live/live-data';
import { NotiBadge, Avatar, Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerClose, SimpleSidebar, SegmentedControl } from '@coreds/react';
import { avatarText } from '../lib/avatar-text';
import { FeedbackWidgets } from './feedback/FeedbackWidgets';

type NavEntry = { label: string; to: string; icon: typeof House };
type NavGroup = { label: string; items: NavEntry[] };

// MVP: nav tinh gọn còn 5 mục (Newsfeed + Sự kiện là trọng tâm; Ứng dụng là một cửa
// vào các platform khác). Module ngoài MVP (Tri thức, Mục tiêu, iRequest, Manager)
// vẫn giữ route — chỉ ẩn khỏi điều hướng.
const iKamerNavGroups: NavGroup[] = [
  { label: 'KHÔNG GIAN CỦA BẠN', items: [
    { label: 'Trang chủ', to: '/home', icon: House },
    { label: 'Công việc', to: '/work', icon: Briefcase },
    { label: 'Lịch', to: '/calendar', icon: CalendarIco },
    { label: 'Đề xuất', to: '/requests', icon: PaperPlaneTilt },
    { label: 'Cá nhân', to: '/profile', icon: UserCircle },
  ] },
  { label: 'IKAME', items: [
    { label: 'iKame Feed', to: '/feed', icon: ChatsCircle },
    { label: 'Sự kiện', to: '/events', icon: CalendarDots },
    { label: 'Gắn kết', to: '/people', icon: HandHeart },
    { label: 'Ứng dụng', to: '/apps', icon: SquaresFour },
    { label: 'Trợ lý AI', to: '/assistant', icon: Sparkle },
  ] },
];

// Manager: không gian quản lý (tổng quan, đội ngũ, OKR team) đứng trước; lõi chung phía dưới.
const managerNavGroups: NavGroup[] = [
  { label: 'QUẢN LÝ', items: [
    { label: 'Tổng quan', to: '/manager/overview', icon: House },
    { label: 'Đội ngũ', to: '/manager/team', icon: UsersThree },
    { label: 'Mục tiêu team', to: '/goals', icon: Target },
  ] },
  { label: 'KHÔNG GIAN CHUNG', items: [
    { label: 'Công việc', to: '/work', icon: Briefcase },
    { label: 'Lịch', to: '/calendar', icon: CalendarIco },
    { label: 'Đề xuất', to: '/requests', icon: PaperPlaneTilt },
    { label: 'Cá nhân', to: '/profile', icon: UserCircle },
    { label: 'iKame Feed', to: '/feed', icon: ChatsCircle },
    { label: 'Sự kiện', to: '/events', icon: CalendarDots },
    { label: 'Gắn kết', to: '/people', icon: HandHeart },
    { label: 'Ứng dụng', to: '/apps', icon: SquaresFour },
    { label: 'Trợ lý AI', to: '/assistant', icon: Sparkle },
  ] },
];

const managerBottomNav: NavEntry[] = [
  { label: 'Tổng quan', to: '/manager/overview', icon: House },
  { label: 'Đội ngũ', to: '/manager/team', icon: UsersThree },
  { label: 'Công việc', to: '/work', icon: Briefcase },
  { label: 'Feed', to: '/feed', icon: ChatsCircle },
  { label: 'Trợ lý AI', to: '/assistant', icon: Sparkle },
];

// COM Admin: "Tổng quan COM" thay Trang chủ — nơi ghim/push/đo acknowledge; các mục còn lại dùng chung.
const adminNavGroups: NavGroup[] = [
  { label: 'QUẢN TRỊ COM', items: [
    { label: 'Tổng quan COM', to: '/admin', icon: Gauge },
  ] },
  { label: 'KHÔNG GIAN CHUNG', items: [
    { label: 'iKame Feed', to: '/feed', icon: ChatsCircle },
    { label: 'Sự kiện', to: '/events', icon: CalendarDots },
    { label: 'Gắn kết', to: '/people', icon: HandHeart },
    { label: 'Ứng dụng', to: '/apps', icon: SquaresFour },
    { label: 'Trợ lý AI', to: '/assistant', icon: Sparkle },
  ] },
];

// Fixed 5 — mobile bottom-nav mirrors the MVP sidebar.
// Mobile: Ứng dụng nhường chỗ cho Công việc (vẫn còn launcher ▦ trên topbar).
const iKamerBottomNav: NavEntry[] = [
  { label: 'Trang chủ', to: '/home', icon: House },
  { label: 'Công việc', to: '/work', icon: Briefcase },
  { label: 'Feed', to: '/feed', icon: ChatsCircle },
  { label: 'Sự kiện', to: '/events', icon: CalendarDots },
  { label: 'Trợ lý AI', to: '/assistant', icon: Sparkle },
];

const adminBottomNav: NavEntry[] = [
  { label: 'COM', to: '/admin', icon: Gauge },
  { label: 'Feed', to: '/feed', icon: ChatsCircle },
  { label: 'Sự kiện', to: '/events', icon: CalendarDots },
  { label: 'Ứng dụng', to: '/apps', icon: SquaresFour },
  { label: 'Trợ lý AI', to: '/assistant', icon: Sparkle },
];

/** Một shell, ba lăng kính — nav/bottom-nav/nhà riêng theo góc nhìn. */
const NAV_BY_PERSPECTIVE: Record<Perspective, { groups: NavGroup[]; bottom: NavEntry[]; home: string; label: string }> = {
  ikamer: { groups: iKamerNavGroups, bottom: iKamerBottomNav, home: '/home', label: 'iKamer' },
  manager: { groups: managerNavGroups, bottom: managerBottomNav, home: '/manager/overview', label: 'Manager' },
  admin: { groups: adminNavGroups, bottom: adminBottomNav, home: '/admin', label: 'COM Admin' },
};
const PERSPECTIVE_ORDER: Perspective[] = ['ikamer', 'manager', 'admin'];

const JOURNEY_NAV: NavEntry = { label: 'Hành trình', to: '/onboarding', icon: Compass };

/** Overlay Người mới: thêm "Hành trình" ngay sau Trang chủ; mobile nhường chỗ của Sự kiện (vẫn vào được từ Home). */
function navFor(perspective: Perspective, newJoiner: boolean) {
  const base = NAV_BY_PERSPECTIVE[perspective];
  if (perspective !== 'ikamer' || !newJoiner) return base;
  const [first, ...rest] = base.groups;
  const groups = [{ ...first, items: [first.items[0], JOURNEY_NAV, ...first.items.slice(1)] }, ...rest];
  const bottom = base.bottom.map((entry) => (entry.to === '/events' ? JOURNEY_NAV : entry));
  return { ...base, groups, bottom };
}

function Logo() {
  return (
    <div className="brand" aria-label="My iKame">
      <BrandLogo size={36} />
      <span className="brand-name">My iKame</span>
    </div>
  );
}

/** Chuyển góc nhìn demo: iKamer · Manager · COM Admin — mỗi lăng kính có nhà riêng. */
function PerspectiveSwitch() {
  const { perspective, setPerspective, demoNewJoiner, setDemoNewJoiner } = useAppState();
  const navigate = useNavigate();

  const select = (next: Perspective) => {
    setPerspective(next);
    navigate(NAV_BY_PERSPECTIVE[next].home);
  };

  // Chip demo: cùng lăng kính iKamer nhưng đăng nhập là người mới (Gia Huy, Ngày 32/60).
  const toggleNewJoiner = () => {
    setDemoNewJoiner(!demoNewJoiner);
    navigate('/home');
  };

  return (
    <>
      <SegmentedControl
        className="perspective-switch-ds"
        aria-label="Chọn góc nhìn"
        size="xs"
        // Nhãn ngắn để ba lựa chọn vừa bề rộng thanh bên.
        options={PERSPECTIVE_ORDER.map((key) => ({ value: key, label: key === 'admin' ? 'COM' : NAV_BY_PERSPECTIVE[key].label }))}
        value={perspective}
        onValueChange={(value) => select(value as Perspective)}
      />
      {perspective === 'ikamer' && (
        <ChipButton icon={<Compass size={14} />} aria-pressed={demoNewJoiner} onClick={toggleNewJoiner}>
          Người mới · Gia Huy
        </ChipButton>
      )}
    </>
  );
}

/**
 * Ngăn kéo thông báo — Drawer của Core DS lo lớp phủ, bẫy focus, phím Esc và trả focus về
 * nút chuông khi đóng (trước đây app tự viết các phần này).
 */
function NotificationsDrawer(_props: { triggerRef: React.RefObject<HTMLButtonElement | null> }) {
  const { notifications, notificationOpen, setNotificationOpen, markAllNotificationsRead } = useAppState();
  const close = () => setNotificationOpen(false);

  return (
    <Drawer open={notificationOpen} onOpenChange={setNotificationOpen}>
      <DrawerContent side="right" className="notification-drawer-ds">
        <DrawerHeader>
          <div>
            <DrawerTitle>Thông báo</DrawerTitle>
            <DrawerDescription>Ưu tiên những việc cần bạn hành động.</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <IconButton label="Đóng thông báo"><X size={20} /></IconButton>
          </DrawerClose>
        </DrawerHeader>
        <DrawerBody>
          <div className="drawer-toolbar">
            <TextButton onClick={markAllNotificationsRead}>Đánh dấu tất cả đã đọc</TextButton>
            <NavLink className="text-link" to="/notifications" onClick={close}>Xem tất cả</NavLink>
          </div>
          <NotificationList items={notifications} compact onItemOpen={close} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const { perspective, user, isNewJoiner, notifications, theme, setTheme, setNotificationOpen, setAskOpen, setSearchOpen } = useAppState();
  const liveCtx = useLive();
  const livePerson = liveCtx.data?.person;
  const { requests, goals } = useAppState();
  // Số đếm trên menu: việc đang chờ ở từng mục, để biết cần vào đâu mà không phải mở từng trang.
  const navBadges: Record<string, number> = {
    '/requests': requests.filter((request) => request.status !== 'done').length,
    '/work': liveCtx.data ? (liveCtx.data.candidates?.length ?? 0) : goals.filter((goal) => goal.status === 'needs_update').length,
  };
  // Che số nhạy cảm (công, phép, tiến độ) khi chia sẻ màn hình; nhớ lựa chọn trên máy này.
  const [privacy, setPrivacy] = useState(() => {
    try { return localStorage.getItem('my-ikame-privacy') === 'on'; } catch { return false; }
  });
  const togglePrivacy = () => setPrivacy((on) => {
    try { localStorage.setItem('my-ikame-privacy', on ? 'off' : 'on'); } catch { /* không lưu được thì vẫn đổi trong phiên */ }
    return !on;
  });
  const liveTime = liveCtx.data?.loadedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const navigate = useNavigate();
  const location = useLocation();
  const { groups: navGroups, bottom: bottomNav } = navFor(perspective, isNewJoiner);
  // Mục menu đang mở: đường dẫn khớp dài nhất (ví dụ /manager/team/abc thuộc mục /manager/team).
  const activeNavId = navGroups.flatMap((group) => group.items.map((item) => item.to))
    .filter((to) => location.pathname === to || location.pathname.startsWith(`${to}/`))
    .sort((left, right) => right.length - left.length)[0];
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
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${privacy ? 'privacy-on' : ''}`} data-theme={theme}>
      <a className="skip-link" href="#main-content">Đi tới nội dung chính</a>
      <aside className="sidebar sidebar--ds">
        <Logo />
        {/* Danh sách mục: SimpleSidebar của Core DS; logo và ô tài khoản nằm ngoài vì khe header/footer của kit chỉ vừa một icon. */}
        <div className="sidebar-nav-ds">
          <SimpleSidebar
            aria-label="Điều hướng chính"
            alwaysExpanded={!sidebarCollapsed}
            expandedWidth={248}
            groups={navGroups.map((group) => ({
              id: group.label,
              label: group.label,
              items: group.items.map(({ label, to, icon: Icon }) => ({
                id: to,
                // Số việc đang chờ đi kèm tên mục để thấy ngay trên menu.
                label: navBadges[to] > 0 ? `${label} · ${navBadges[to]}` : label,
                icon: <Icon size={18} />,
              })),
            }))}
            activeId={activeNavId}
            onNavigate={(id) => navigate(id)}
          />
        </div>
        <div className="sidebar-account">
          <PerspectiveSwitch />
          <NavLink to="/profile" className="account-row">
            <Avatar type="text" size="m" fallback={avatarText((livePerson?.shortName ?? user.shortName).slice(0, 1))} alt="" aria-hidden="true" />
            <span className="account-copy"><strong>{livePerson?.name ?? user.name}</strong><small>{livePerson ? (livePerson.position || livePerson.team) : user.role}</small></span>
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
            {liveCtx.status !== 'unavailable' && (
              <button
                type="button"
                className={`live-chip live-chip--${liveCtx.status}`}
                onClick={liveCtx.connect}
                disabled={liveCtx.status === 'loading'}
                title={liveCtx.data ? 'Tải lại dữ liệu thật' : 'Dùng dữ liệu thật của tôi'}
              >
                {liveCtx.status === 'loading' ? <ArrowsClockwise size={15} className="live-chip-spin" /> : liveCtx.data ? <PlugsConnected size={15} /> : <Database size={15} />}
                <span>{liveCtx.status === 'loading' ? 'Đang đọc dữ liệu…' : liveCtx.data ? `Dữ liệu thật · ${liveTime}` : liveCtx.status === 'error' ? 'Chưa đọc được · thử lại' : 'Dữ liệu mẫu'}</span>
                {liveCtx.data && <ArrowsClockwise size={14} aria-hidden="true" />}
              </button>
            )}
            <IconButton label={privacy ? 'Hiện số liệu' : 'Che số liệu nhạy cảm'} aria-pressed={privacy} onClick={togglePrivacy}>
              {privacy ? <EyeSlash size={20} /> : <Eye size={20} />}
            </IconButton>
            <AppLauncher />
            <IconButton label="Hỏi iKame" onClick={() => setAskOpen(true)}>
              <Sparkle size={20} />
            </IconButton>
            <IconButton label={theme === 'light' ? 'Bật giao diện tối' : 'Bật giao diện sáng'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </IconButton>
            <div className="notification-trigger-wrap">
              <IconButton ref={notificationTriggerRef} label="Mở thông báo" onClick={() => setNotificationOpen(true)}><Bell size={20} /></IconButton>
              {unreadCount > 0 && <NotiBadge className="notification-count-pos" size="s" count={unreadCount} aria-label={`${unreadCount} thông báo chưa đọc`} />}
            </div>
            <span className="topbar-env"><StatusPill tone="neutral">H2 Prototype</StatusPill></span>
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
      <FeedbackWidgets />
    </div>
  );
}
