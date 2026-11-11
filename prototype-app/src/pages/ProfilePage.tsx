import { ArrowCounterClockwiseIcon as ArrowCounterClockwise, BellRingingIcon as BellRinging, ClockIcon as Clock, CompassIcon as Compass, EnvelopeSimpleIcon as EnvelopeSimple, MoonIcon as Moon, SlackLogoIcon as SlackLogo, SunIcon as Sun } from '@coreds/react/icons';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '../AppState';
import { Button, StatusPill, ButtonLink } from '../components/UI';
import { ProfileActivity } from './profile/ProfileActivity';
import { ProfileDocuments } from './profile/ProfileDocuments';
import { useLive } from '../lib/live/live-data';
import { LiveProfileGrid, LiveProfileHero } from './profile/LiveProfile';
import { ProfileHrisCard } from './profile/ProfileHrisCard';
import { ProfileEquipment, ProfileLeave, ProfilePay, ProfileTimeline } from './profile/ProfileHrSection';
import { ProfileOrgSection } from './profile/ProfileOrgSection';
import { LIFECYCLE_BADGES } from '../data/onboarding-data';
import { earnedBadges } from '../lib/onboarding';

/**
 * Hồ sơ redesign — theo pattern employee-profile của các HR platform (BambooHR/HiBob):
 * hero cover + identity + quick-stats, body 2 cột (main: hoạt động live + timeline;
 * rail: tổ chức, nghỉ phép, thiết bị), cài đặt gộp gọn cuối trang.
 */
export function ProfilePage() {
  const {
    user, theme, setTheme, resetDemo, demoResetCount,
    news, events, checkInReports, posts, leaveBalance, equipment, seniorityEntries,
    payslips, contractInfo, hrProfile, documents, sensitive, sensitiveUnlocked, journeyDay, journey, preference,
    perspective, demoNewJoiner, setDemoNewJoiner,
  } = useAppState();
  // Huy hiệu mốc vòng đời theo số ngày gắn bó (HRIS joinedAt): onboarding cho người có hành trình, thâm niên lấy mốc cao nhất.
  const badges = earnedBadges(journeyDay, LIFECYCLE_BADGES, !!journey);
  // Bản artifact đã nối dữ liệu thật: hồ sơ hiện dữ liệu của người xem, không hiện nhân vật mẫu.
  const live = useLive().data;
  const [resetReceipt, setResetReceipt] = useState(false);
  const navigate = useNavigate();

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
      {live ? <LiveProfileHero live={live} /> : (
      <section className="profile-hero" aria-label="Thông tin cá nhân">
        <div className="profile-cover" aria-hidden="true" />
        <div className="profile-identity">
          <span className="profile-avatar" aria-hidden="true">{user.shortName.slice(0, 1)}</span>
          <div className="profile-identity-main">
            <div className="profile-identity-name">
              <h1>{user.name}</h1>
              <StatusPill tone="success">{hrProfile.employmentType}</StatusPill>
            </div>
            <p className="profile-identity-role">{user.role} · {user.team}</p>
            <div className="profile-contact-chips">
              <span><EnvelopeSimple size={14} />{hrProfile.email}</span>
              <span><SlackLogo size={14} />{hrProfile.slackHandle}</span>
              <span><Clock size={14} />{user.timezone}</span>
            </div>
            {badges.length > 0 && (
              <div className="profile-badges" aria-label="Huy hiệu mốc">
                {badges.map((badge) => <span key={badge.id} title={badge.description}><span aria-hidden="true">{badge.emoji}</span>{badge.title}</span>)}
              </div>
            )}
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
      )}

      {live ? <LiveProfileGrid live={live} /> : (
      <div className="profile-grid">
        <div className="profile-main">
          <ProfileHrisCard profile={hrProfile} sensitive={sensitive} unlocked={sensitiveUnlocked} />
          <ProfileDocuments documents={documents} />
          <ProfileActivity user={user} news={news} events={events} checkInReports={checkInReports} posts={posts} />
          <ProfileTimeline entries={seniorityEntries} />
        </div>
        <aside className="profile-rail">
          <ProfileOrgSection user={user} />
          <ProfileLeave leaveBalance={leaveBalance} />
          <ProfilePay payslips={payslips} contractInfo={contractInfo} unlocked={sensitiveUnlocked} />
          <ProfileEquipment equipment={equipment} />
        </aside>
      </div>
      )}

      <section className="profile-settings" aria-label="Cài đặt">
        <div className="side-info profile-section profile-setting-card">
          <div>
            <strong>Thông báo</strong>
            <p>Chọn nhóm thông báo muốn nhận; Bản tin sáng gộp việc hôm nay lúc {preference.digestTime}.</p>
          </div>
          <ButtonLink variant="dim" to="/notifications?tab=settings"><BellRinging size={18} />Cài đặt thông báo</ButtonLink>
        </div>
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
          <div className="profile-setting-actions">
            {/* Mobile không có sidebar → công tắc Người mới cũng nằm ở đây để demo trên điện thoại. */}
            {perspective === 'ikamer' && (
              <Button icon={<Compass size={18} />} aria-pressed={demoNewJoiner} onClick={() => { setDemoNewJoiner(!demoNewJoiner); navigate('/home'); }}>
                {demoNewJoiner ? 'Quay lại An' : 'Xem như người mới (Gia Huy)'}
              </Button>
            )}
            <Button icon={<ArrowCounterClockwise size={18} />} onClick={resetDemo}>Đặt lại demo</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
