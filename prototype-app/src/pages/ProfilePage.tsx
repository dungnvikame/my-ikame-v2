import { ArrowCounterClockwise, Clock, EnvelopeSimple, Moon, SlackLogo, Sun } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useAppState } from '../AppState';
import { Button, StatusPill } from '../components/UI';
import { ProfileActivity } from './profile/ProfileActivity';
import { ProfileEquipment, ProfileLeave, ProfilePay, ProfileTimeline } from './profile/ProfileHrSection';
import { ProfileOrgSection } from './profile/ProfileOrgSection';

/**
 * Hồ sơ redesign — theo pattern employee-profile của các HR platform (BambooHR/HiBob):
 * hero cover + identity + quick-stats, body 2 cột (main: hoạt động live + timeline;
 * rail: tổ chức, nghỉ phép, thiết bị), cài đặt gộp gọn cuối trang.
 */
export function ProfilePage() {
  const {
    user, theme, setTheme, resetDemo, demoResetCount,
    news, events, checkInReports, posts, leaveBalance, equipment, seniorityEntries,
    payslips, contractInfo,
  } = useAppState();
  const [resetReceipt, setResetReceipt] = useState(false);

  // Receipt only for a reset triggered while this page is mounted.
  useEffect(() => {
    if (demoResetCount > 0) setResetReceipt(true);
  }, [demoResetCount]);

  const latestMilestone = seniorityEntries[seniorityEntries.length - 1];
  const activityCount =
    news.filter((item) => item.acknowledged).length +
    events.filter((item) => item.myRegistration === 'going' || item.myRegistration === 'waitlisted').length +
    checkInReports.filter((report) => report.authorName === user.name).length +
    posts.filter((post) => post.authorName === user.name).length;

  return (
    <div className="page profile-page">
      <section className="profile-hero" aria-label="Thông tin cá nhân">
        <div className="profile-cover" aria-hidden="true" />
        <div className="profile-identity">
          <span className="profile-avatar" aria-hidden="true">{user.shortName.slice(0, 1)}</span>
          <div className="profile-identity-main">
            <div className="profile-identity-name">
              <h1>{user.name}</h1>
              <StatusPill tone="success">Nhân viên chính thức</StatusPill>
            </div>
            <p className="profile-identity-role">{user.role} · {user.team}</p>
            <div className="profile-contact-chips">
              <span><EnvelopeSimple size={14} />an.nguyen@ikameglobal.com</span>
              <span><SlackLogo size={14} />@an.nguyen</span>
              <span><Clock size={14} />{user.timezone}</span>
            </div>
          </div>
        </div>
        <div className="profile-stats" role="list">
          <div role="listitem">
            <strong>{latestMilestone?.title ?? '—'}</strong>
            <small>Cột mốc gần nhất · {latestMilestone?.dateLabel ?? ''}</small>
          </div>
          <div role="listitem">
            <strong>{leaveBalance.annualRemaining}/{leaveBalance.annualTotal} ngày</strong>
            <small>Phép năm còn lại</small>
          </div>
          <div role="listitem">
            <strong>{equipment.length} thiết bị</strong>
            <small>Đang được cấp</small>
          </div>
          <div role="listitem">
            <strong>{activityCount}</strong>
            <small>Hoạt động gần đây</small>
          </div>
        </div>
      </section>

      <div className="profile-grid">
        <div className="profile-main">
          <ProfileActivity user={user} news={news} events={events} checkInReports={checkInReports} posts={posts} />
          <ProfileTimeline entries={seniorityEntries} />
        </div>
        <aside className="profile-rail">
          <ProfileOrgSection user={user} />
          <ProfileLeave leaveBalance={leaveBalance} />
          <ProfilePay payslips={payslips} contractInfo={contractInfo} />
          <ProfileEquipment equipment={equipment} />
        </aside>
      </div>

      <section className="profile-settings" aria-label="Cài đặt">
        <div className="side-info profile-section profile-setting-card">
          <div>
            <strong>Hiển thị</strong>
            <p>Chuyển đổi giao diện sáng/tối cho toàn bộ ứng dụng.</p>
          </div>
          <Button icon={theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
          </Button>
        </div>
        <div className="side-info profile-section profile-setting-card">
          <div>
            <strong>Demo</strong>
            <p>Đưa dữ liệu demo (tin tức, sự kiện, mục tiêu, iKame Feed, hội thoại AI) về trạng thái ban đầu.</p>
            {resetReceipt && <p className="receipt" role="status">Đã đặt lại dữ liệu demo về trạng thái ban đầu.</p>}
          </div>
          <Button icon={<ArrowCounterClockwise size={18} />} onClick={resetDemo}>Đặt lại demo</Button>
        </div>
      </section>
    </div>
  );
}
