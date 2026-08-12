import { ArrowCounterClockwise, Moon, Sun } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useAppState } from '../AppState';
import { Button, SectionHeader, StatusPill } from '../components/UI';
import { ProfileActivity } from './profile/ProfileActivity';
import { ProfileHrSection } from './profile/ProfileHrSection';
import { ProfileOrgSection } from './profile/ProfileOrgSection';

/** Phase 6 rebuild — 7 sections (spec §3): Header · Tổ chức · Thâm niên & cột mốc ·
 * Nghỉ phép & phúc lợi · Thiết bị được cấp · Hoạt động gần đây (live) · Hiển thị + Demo.
 * Sections 3-5 live in `ProfileHrSection` and section 6 in `ProfileActivity` to keep this
 * file under the 200-line budget (plan's suggested split). */
export function ProfilePage() {
  const {
    user, theme, setTheme, resetDemo, demoResetCount,
    news, events, checkInReports, posts, leaveBalance, equipment, seniorityEntries,
  } = useAppState();
  const [resetReceipt, setResetReceipt] = useState(false);

  // Receipt only for a reset triggered while this page is mounted.
  useEffect(() => {
    if (demoResetCount > 0) setResetReceipt(true);
  }, [demoResetCount]);

  return (
    <div className="page collection-page profile-page">
      <header className="page-heading">
        <div><p className="eyebrow">TÀI KHOẢN</p><h1>Hồ sơ</h1><p>Thông tin cá nhân, tổ chức và phúc lợi của bạn.</p></div>
      </header>

      <section className="side-info profile-section profile-header">
        <span className="avatar avatar--large" aria-hidden="true">{user.shortName.slice(0, 1)}</span>
        <div className="profile-header-info">
          <h2>{user.name}</h2>
          <p>{user.role} · {user.team}</p>
          <div className="profile-contact-rows">
            <span>an.nguyen@ikameglobal.com</span>
            <span>Slack @an.nguyen</span>
            <span>{user.timezone}</span>
          </div>
          <StatusPill tone="success">Nhân viên chính thức</StatusPill>
        </div>
      </section>

      <ProfileOrgSection user={user} />
      <ProfileHrSection seniorityEntries={seniorityEntries} leaveBalance={leaveBalance} equipment={equipment} />
      <ProfileActivity user={user} news={news} events={events} checkInReports={checkInReports} posts={posts} />

      <section className="side-info profile-section">
        <SectionHeader title="Hiển thị" />
        <p>Chuyển đổi giao diện sáng/tối cho toàn bộ ứng dụng.</p>
        <Button icon={theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? 'Bật giao diện tối' : 'Bật giao diện sáng'}
        </Button>
      </section>

      <section className="side-info profile-section">
        <SectionHeader title="Demo" />
        <p>Đưa toàn bộ dữ liệu demo (tin tức, sự kiện, thông báo, mục chú ý, mục tiêu, Cộng đồng, hội thoại Ask iKame) về trạng thái ban đầu. Giao diện sáng/tối và góc nhìn được giữ nguyên.</p>
        <Button icon={<ArrowCounterClockwise size={18} />} onClick={resetDemo}>Đặt lại dữ liệu demo</Button>
        {resetReceipt && <p className="receipt" role="status">Đã đặt lại dữ liệu demo về trạng thái ban đầu.</p>}
      </section>
    </div>
  );
}
