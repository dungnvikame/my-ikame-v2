import { ArrowCounterClockwiseIcon as ArrowCounterClockwise, BellRingingIcon as BellRinging, ClockIcon as Clock, CompassIcon as Compass, EnvelopeSimpleIcon as EnvelopeSimple, MoonIcon as Moon, SlackLogoIcon as SlackLogo, SunIcon as Sun } from '@coreds/react/icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../AppState';
import { Button, ButtonLink } from '../components/UI';
import { Tabs, type TabDef } from '../components/Tabs';
import { ProfileActivity } from './profile/ProfileActivity';
import { ProfileDocuments } from './profile/ProfileDocuments';
import { useLive } from '../lib/live/live-data';
import { AttendanceSection, GoalsSection, LiveLicenses, LiveRecordNote, OrgSection, ReportSection } from './profile/LiveProfile';
import { ProfileHrisCard } from './profile/ProfileHrisCard';
import { ProfileEquipment, ProfileLeave, ProfilePay, ProfileTimeline } from './profile/ProfileHrSection';
import { ProfileOrgSection } from './profile/ProfileOrgSection';
import { ProfileHeader, ProfileKpis, type KpiItem } from './profile/ProfileHeader';
import { ProfileAttendance } from './profile/ProfileAttendance';
import { ProfileJourney, YearCard, type YearStats } from './profile/ProfileJourney';
import { ProfileGrowth } from './profile/ProfileGrowth';
import { DeviceCards, ItTickets, equipmentToView, type DeviceView } from './profile/ProfileDevices';
import { buildHeatmap, parseVnDate, summarizeHeatmap } from './profile/profile-utils';
import { DEMO_TODAY, journeyByPerson, type JourneyItem } from '../data/profile-extras';
import { LIFECYCLE_BADGES } from '../data/onboarding-data';
import { earnedBadges } from '../lib/onboarding';

type ProfileTab = 'overview' | 'attendance' | 'growth' | 'devices' | 'record';
const PROFILE_TABS: TabDef<ProfileTab>[] = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'attendance', label: 'Chấm công' },
  { key: 'growth', label: 'Phát triển' },
  { key: 'devices', label: 'Thiết bị' },
  { key: 'record', label: 'Hồ sơ' },
];

/** Số ngày làm việc từ đầu năm 2026 (hoặc ngày vào) đến nay: bỏ cuối tuần, ngày lễ (mẫu: 11 ngày) và phép đã nghỉ. */
function workDaysThisYear(joined: Date | undefined, leaveUsed: number): number {
  const start = new Date(2026, 0, 1);
  const from = joined && joined > start ? joined : start;
  let count = 0;
  for (const d = new Date(from); d <= DEMO_TODAY; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) count += 1;
  }
  return Math.max(0, Math.round(count - 11 - leaveUsed));
}

/**
 * Cá nhân — thẻ danh tính + KPI + 5 tab (Tổng quan / Chấm công / Phát triển / Thiết bị / Hồ sơ).
 * Có dữ liệu thật (artifact) thì header, KPI, thiết bị dùng số thật; phần chưa có nguồn không bịa.
 */
export function ProfilePage() {
  const {
    user, theme, setTheme, resetDemo, demoResetCount,
    news, events, checkInReports, posts, leaveBalance, equipment, seniorityEntries, goals, requests,
    payslips, contractInfo, hrProfile, documents, sensitive, sensitiveUnlocked, journeyDay, journey, preference,
    perspective, demoNewJoiner, setDemoNewJoiner,
  } = useAppState();
  const badges = earnedBadges(journeyDay, LIFECYCLE_BADGES, !!journey);
  const live = useLive().data;
  const [resetReceipt, setResetReceipt] = useState(false);
  const [tab, setTab] = useState<ProfileTab>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (demoResetCount > 0) setResetReceipt(true);
  }, [demoResetCount]);

  const joinedAt = parseVnDate(hrProfile.joinedAt);
  const birthDate = parseVnDate(hrProfile.birthDate);
  const heat = useMemo(() => summarizeHeatmap(buildHeatmap(user.personId)), [user.personId]);

  const myGoals = goals.filter((goal) => goal.owner === user.name);
  const goalPool = myGoals.length > 0 ? myGoals : goals;
  const goalPercent = goalPool.length ? Math.round(goalPool.reduce((sum, g) => sum + g.progress, 0) / goalPool.length) : undefined;
  const latestReport = checkInReports.find((report) => report.authorName === user.name);
  const pendingRequests = requests.filter((request) => request.status === 'pending').length;

  const kpis: KpiItem[] = live ? [
    { id: 'goal', label: 'Mục tiêu cá nhân', value: live.objectives?.length ? `${Math.round(live.objectives.reduce((s, o) => s + o.progress, 0) / live.objectives.length)}%` : '—', hint: live.objectives ? `${live.objectives.length} mục tiêu · kỳ ${live.igoal?.period ?? 'hiện tại'}` : 'Chưa đọc được iGoal' },
    { id: 'report', label: 'Báo cáo gần nhất', value: live.igoal?.weekly?.latestTitle ? 'Đã có' : '—', hint: live.igoal?.weekly?.latestTitle ?? 'Chưa có báo cáo trong kỳ' },
    { id: 'leave', label: 'Ngày phép còn', value: live.icheck ? `${live.icheck.leave.total.toLocaleString('vi-VN')}` : '—', hint: 'iCheck' },
    { id: 'ontime', label: 'Đúng giờ tháng này', value: live.icheck && live.icheck.month.checkedDays > 0 ? `${Math.round(((live.icheck.month.checkedDays - live.icheck.month.lateDays) / live.icheck.month.checkedDays) * 100)}%` : '—', hint: live.icheck ? `${live.icheck.month.lateDays} buổi muộn` : 'Chưa đọc được iCheck' },
    { id: 'requests', label: 'Đề xuất đang chờ', value: '—', hint: 'Xem ở trang Đơn từ' },
  ] : [
    { id: 'goal', label: 'Mục tiêu cá nhân', value: goalPercent === undefined ? '—' : `${goalPercent}%`, hint: `${goalPool.length} mục tiêu` },
    { id: 'report', label: 'Báo cáo gần nhất', value: latestReport?.periodLabel ?? '—', hint: latestReport ? `Gửi ${latestReport.submittedAt}` : 'Chưa có báo cáo' },
    { id: 'leave', label: 'Ngày phép còn', value: `${leaveBalance.annualRemaining.toLocaleString('vi-VN')}`, hint: `trên ${leaveBalance.annualTotal} ngày` },
    { id: 'ontime', label: 'Đúng giờ 30 ngày', value: heat.percent === null ? '—' : `${heat.percent}%`, hint: `${heat.late} buổi muộn` },
    { id: 'requests', label: 'Đề xuất đang chờ', value: String(pendingRequests), hint: pendingRequests ? 'Đang chờ duyệt' : 'Không có đề xuất chờ' },
  ];

  const journeyItems: JourneyItem[] = journeyByPerson[user.personId]
    ?? seniorityEntries.map((entry, index) => ({ id: entry.id, kind: index === 0 ? 'join' : 'event', dateLabel: entry.dateLabel, title: entry.title, note: entry.note }));
  const yearStats: YearStats = {
    workDays: workDaysThisYear(joinedAt, leaveBalance.annualUsed),
    events: events.filter((item) => item.myRegistration === 'going').length,
    okrDone: goalPool.filter((goal) => goal.status === 'done' || goal.progress >= 100).length,
    okrTotal: goalPool.length,
  };
  const activityCount =
    news.filter((item) => item.acknowledged).length +
    events.filter((item) => item.myRegistration === 'going' || item.myRegistration === 'waitlisted').length +
    checkInReports.filter((report) => report.authorName === user.name).length +
    posts.filter((post) => post.authorName === user.name).length;

  const devices: DeviceView[] = live?.devices
    ? live.devices.map((d) => ({ id: d.id, name: d.name, meta: [d.category, d.code].filter(Boolean).join(' · '), assignedAt: parseVnDate(d.allocatedLabel), health: d.health }))
    : equipment.map(equipmentToView);

  const employed = hrProfile.employmentType.toLowerCase().includes('thử việc') ? 'iKamer thử việc' : 'iKamer chính thức';

  return (
    <div className="page profile-page pp-page">
      <ProfileHeader
        personId={live ? 'live' : user.personId}
        name={live ? live.person.name : user.name}
        initial={(live ? live.person.shortName : user.shortName).slice(0, 1)}
        subtitle={live ? [live.person.position, live.person.team].filter(Boolean).join(' · ') : `${user.role} · ${user.team}`}
        statusLabel={live ? 'Dữ liệu thật' : employed}
        birthDate={live ? undefined : birthDate}
        joinedAt={live ? undefined : joinedAt}
        extra={live ? undefined : (
          <>
            <div className="pp-chip-row">
              <span><EnvelopeSimple size={14} aria-hidden="true" />{hrProfile.email}</span>
              <span><SlackLogo size={14} aria-hidden="true" />{hrProfile.slackHandle}</span>
              <span><Clock size={14} aria-hidden="true" />{user.timezone}</span>
            </div>
            {badges.length > 0 && (
              <div className="profile-badges" aria-label="Huy hiệu mốc">
                {badges.map((badge) => <span key={badge.id} title={badge.description}><span aria-hidden="true">{badge.emoji}</span>{badge.title}</span>)}
              </div>
            )}
          </>
        )}
      />
      <ProfileKpis items={kpis} />

      <Tabs tabs={PROFILE_TABS} active={tab} onChange={setTab} ariaLabel="Nội dung trang Cá nhân" />
      <div className="pp-panel" role="tabpanel">
        {tab === 'overview' && (live ? (
          <div className="profile-grid">
            <div className="profile-main"><GoalsSection live={live} /></div>
            <aside className="profile-rail"><ReportSection live={live} /><OrgSection live={live} /></aside>
          </div>
        ) : (
          <div className="pp-stack">
            <ProfileJourney items={journeyItems} />
            <YearCard
              name={user.name}
              role={user.role}
              stats={yearStats}
              greeting="Cảm ơn một năm bền bỉ cùng iKame. Chúc bạn một năm 2027 thật bứt phá!"
            />
            <p className="pp-muted">Hoạt động gần đây: {activityCount} (tin đã đọc, sự kiện, báo cáo, bài đăng).</p>
          </div>
        ))}

        {tab === 'attendance' && (live ? <AttendanceSection live={live} /> : <ProfileAttendance seed={user.personId} />)}

        {tab === 'growth' && <ProfileGrowth personId={live ? 'live' : user.personId} />}

        {tab === 'devices' && (live ? (
          <div className="pp-stack">
            <DeviceCards devices={devices} />
            <LiveLicenses live={live} />
          </div>
        ) : (
          <div className="pp-stack">
            <DeviceCards devices={devices} />
            <ItTickets personId={user.personId} deviceNames={devices.map((d) => d.name)} />
          </div>
        ))}

        {tab === 'record' && (live ? (
          <div className="profile-grid">
            <div className="profile-main"><LiveRecordNote /></div>
            <aside className="profile-rail"><OrgSection live={live} /></aside>
          </div>
        ) : (
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
        ))}
      </div>

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
