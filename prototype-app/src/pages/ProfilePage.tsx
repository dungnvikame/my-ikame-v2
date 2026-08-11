import { Moon, SignOut, Sun } from '@phosphor-icons/react';
import { useAppState } from '../AppState';
import { Button, StatusPill } from '../components/UI';

export function ProfilePage() {
  const { user, perspective, theme, setTheme } = useAppState();

  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div><p className="eyebrow">TÀI KHOẢN</p><h1>Hồ sơ</h1><p>Thông tin cá nhân và tuỳ chọn hiển thị của bạn.</p></div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="side-info">
          <div className="account-row">
            <span className="avatar avatar--large" aria-hidden="true">{user.shortName.slice(0, 1)}</span>
            <span className="account-copy"><strong>{user.name}</strong><small>{user.role} · {user.team}</small></span>
          </div>
          <p>Góc nhìn hiện tại: <strong>{perspective === 'manager' ? 'Manager' : 'iKamer'}</strong></p>
          <div className="card-badges">
            {user.availablePerspectives.map((item) => (
              <StatusPill key={item} tone={item === perspective ? 'info' : 'neutral'}>{item === 'manager' ? 'Manager' : 'iKamer'}</StatusPill>
            ))}
          </div>
        </div>

        <div className="side-info">
          <h2>Hiển thị</h2>
          <p>Chuyển đổi giao diện sáng/tối cho toàn bộ ứng dụng.</p>
          <Button icon={theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'Bật giao diện tối' : 'Bật giao diện sáng'}
          </Button>
        </div>

        <div className="side-info">
          <h2>Phiên đăng nhập</h2>
          <p>Prototype — chưa kết nối SSO.</p>
          <Button variant="danger" icon={<SignOut size={18} />} disabled>Đăng xuất</Button>
        </div>
      </div>
    </div>
  );
}
