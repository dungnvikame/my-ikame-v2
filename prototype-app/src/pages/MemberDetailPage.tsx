import { useState } from 'react';
import {
  ArrowLeft, BellRinging, CalendarPlus, ChatCircleText, EnvelopeSimple, Target,
} from '@phosphor-icons/react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { memberProfile, teamMembers } from '../data/mockData';
import { PlatformHandoffButton } from '../components/PlatformHandoff';
import { Tabs } from '../components/Tabs';
import { Button, StatusPill } from '../components/UI';
import { useAppState } from '../AppState';
import { CheckinPanel, GoalsPanel, GrowthPanel, HrPanel, OverviewPanel } from './team/member-tabs';
import { initials, riskLabel, riskScore, STATUS_LABEL, STATUS_TONE } from './team/team-visuals';

type TabKey = 'overview' | 'goals' | 'checkin' | 'growth' | 'hr';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'goals', label: 'Mục tiêu & EKS' },
  { key: 'checkin', label: 'Check-in & 1:1' },
  { key: 'growth', label: 'Ghi nhận & phát triển' },
  { key: 'hr', label: 'Hồ sơ nhân sự' },
];

/**
 * Hồ sơ 360° của thành viên (góc nhìn manager) — pattern học từ Lattice/15Five:
 * header nhận diện dính kèm hành động nhanh, tín hiệu tổng hợp đa nguồn, và
 * nội dung chia tab thay vì một drawer trạng thái chung chung.
 */
export function MemberDetailPage() {
  const { memberId } = useParams();
  const { user } = useAppState();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('overview');

  const member = teamMembers.find((item) => item.id === memberId);
  const profile = memberId ? memberProfile(memberId) : undefined;

  if (!member) return <Navigate to="/not-found" replace />;
  // Scope boundary: manager chỉ xem được hồ sơ thành viên trong team mình.
  // Kiểm tra scope TRƯỚC hồ sơ — người ngoài phạm vi phải nhận "không có quyền",
  // không phải "không tìm thấy" (tránh lộ sự tồn tại của nhân sự team khác).
  if (member.teamId !== user.teamId) return <Navigate to="/forbidden" replace />;
  if (!profile) return <Navigate to="/not-found" replace />;

  const risk = riskLabel(riskScore(profile));
  const askAi = (prompt: string) => navigate(`/assistant?q=${encodeURIComponent(prompt)}`);

  return (
    <div className="page member-detail-page">
      <Link className="back-link" to="/manager/team"><ArrowLeft size={17} />Quay lại Đội ngũ</Link>

      <header className="member-hero">
        <div className="member-hero-identity">
          <span className="member-hero-avatar" aria-hidden="true">{initials(member.name)}</span>
          <div className="member-hero-copy">
            <div className="member-hero-name">
              <h1>{member.name}</h1>
              <StatusPill tone={STATUS_TONE[member.status]}>{STATUS_LABEL[member.status]}</StatusPill>
              <StatusPill tone={risk.tone === 'risk' ? 'error' : risk.tone === 'watch' ? 'warning' : 'success'}>{risk.label}</StatusPill>
            </div>
            <p className="member-hero-role">{member.role} · {user.team} · {profile.tenureLabel}</p>
            <div className="member-hero-contacts">
              <span><EnvelopeSimple size={14} />{profile.email}</span>
              <span><ChatCircleText size={14} />{profile.slack}</span>
              <span>Quản lý: {profile.managerName}</span>
            </div>
          </div>
        </div>
        <div className="member-hero-actions">
          <Button variant="primary" icon={<CalendarPlus size={16} />} onClick={() => askAi(`Đặt lịch 1:1 với ${member.name} trong tuần này`)}>
            Đặt lịch 1:1
          </Button>
          <Button variant="dim" icon={<BellRinging size={16} />} onClick={() => askAi(`Soạn tin nhắn nhắc check-in cho ${member.name}`)}>
            Nhắc check-in
          </Button>
          <Button variant="dim" icon={<Target size={16} />} onClick={() => navigate('/goals')}>
            OKR team
          </Button>
          <PlatformHandoffButton platform="iHRM" action={`xem hồ sơ nhân sự đầy đủ của ${member.name}`} label="Hồ sơ trên iHRM" />
        </div>
      </header>

      <Tabs
        className="neutral-tabs member-tabs"
        tabs={TABS}
        active={tab}
        onChange={setTab}
        ariaLabel="Nội dung hồ sơ"
      />

      <div className="member-tab-panel" role="tabpanel">
        {tab === 'overview' && <OverviewPanel profile={profile} />}
        {tab === 'goals' && <GoalsPanel profile={profile} />}
        {tab === 'checkin' && <CheckinPanel profile={profile} />}
        {tab === 'growth' && <GrowthPanel profile={profile} />}
        {tab === 'hr' && <HrPanel profile={profile} />}
      </div>
    </div>
  );
}
