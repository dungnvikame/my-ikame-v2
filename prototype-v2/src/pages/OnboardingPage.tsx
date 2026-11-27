import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  ExternalLink,
  Laptop,
  MessageSquareHeart,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react';
import ikameMascot from '../assets/ikame-mascot.png';
import { useApp } from '../context/AppContext';
import { INTERNAL_APPS } from '../data/mockData';
import { MilestoneCelebrationOverlay } from '../components/FestiveEffects';
import { Avatar, Modal } from '../components/UI';

type MilestoneId = 'm1' | 'm2' | 'm3' | 'm4';

const MILESTONES: { id: MilestoneId; step: string; label: string; dayLabel: string }[] = [
  { id: 'm1', step: '01', label: 'Welcome Pack', dayLabel: 'Ngày 1' },
  { id: 'm2', step: '02', label: 'Hoà nhập', dayLabel: 'Tuần 1' },
  { id: 'm3', step: '03', label: 'Vững vàng', dayLabel: '30 ngày' },
  { id: 'm4', step: '04', label: 'Chính thức', dayLabel: '60 ngày' },
];

const PULSE_OPTIONS = [
  { score: 1, label: 'Cần hỗ trợ', emoji: '😟' },
  { score: 2, label: 'Tạm ổn', emoji: '😐' },
  { score: 3, label: 'Thuận lợi', emoji: '🙂' },
  { score: 4, label: 'Rất tốt', emoji: '😄' },
];

interface KitGuide {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  actionLabel: string;
  actionRoute?: string;
  aiPrompt?: string;
}

const SURVIVAL_KIT: {
  id: string;
  label: string;
  icon: React.ReactNode;
  accentBg: string;
  accentFg: string;
  guide?: KitGuide;
  directAiPrompt?: string;
}[] = [
  {
    id: 'kit-time',
    label: 'Giờ làm & Phép',
    icon: <Clock size={15} />,
    accentBg: 'rgba(11, 87, 208, 0.12)',
    accentFg: 'var(--brand-primary-fg)',
    guide: {
      id: 'kit-time',
      title: 'Giờ làm việc & Nghỉ phép',
      subtitle: 'Tóm tắt nhanh cho nhân sự mới',
      bullets: [
        'Giờ làm chuẩn: 08:30 – 17:30 (Thứ 2 – Thứ 6), nghỉ trưa 12:00 – 13:30.',
        'Chấm công vào trước 08:30 tại Trang chủ hoặc iCheck (không cần chấm công ra).',
        'Đi muộn / WFH / Xin nghỉ: tạo đề xuất trước trên My iKame để Quản lý duyệt.',
      ],
      actionLabel: 'Mở iCheck',
      actionRoute: '/icheck',
    },
  },
  {
    id: 'kit-it',
    label: 'Wifi & Thiết bị',
    icon: <Laptop size={15} />,
    accentBg: 'rgba(24, 128, 56, 0.12)',
    accentFg: 'var(--success-fg)',
    guide: {
      id: 'kit-it',
      title: 'Tài khoản, Wifi & Thiết bị IT',
      subtitle: 'Hỗ trợ bởi IT Helpdesk · Tầng 5',
      bullets: [
        'Wifi văn phòng: iKame-Corp (đăng nhập bằng email @ikame.vn).',
        'Một tài khoản Google SSO dùng chung cho My iKame, iCheck, iGoal, iWiki.',
        'Cần cấp thêm màn hình, chuột, phần mềm: gửi phiếu nhanh tới IT.',
      ],
      actionLabel: 'Nhờ AI tạo yêu cầu IT',
      aiPrompt: 'Tạo yêu cầu IT cấp màn hình phụ cho nhân sự mới',
    },
  },
  {
    id: 'kit-pay',
    label: 'Lương & Phúc lợi',
    icon: <Wallet size={15} />,
    accentBg: 'rgba(247, 98, 38, 0.13)',
    accentFg: 'var(--ikame-orange)',
    guide: {
      id: 'kit-pay',
      title: 'Lương, Thuế & Bảo hiểm',
      subtitle: 'Hỗ trợ bởi P&OD C&B · Tầng 4',
      bullets: [
        'Kỳ nhận lương: Ngày 05 hàng tháng qua tài khoản Vietcombank / Techcombank.',
        'Giai đoạn thử việc 60 ngày hưởng 85% lương gross theo hợp đồng.',
        'Sau khi chính thức: đóng BHXH và kích hoạt gói bảo hiểm sức khoẻ iKame Care.',
      ],
      actionLabel: 'Xem Chính sách & Phúc lợi',
      actionRoute: '/support/policies',
    },
  },
  {
    id: 'kit-ai',
    label: 'Hỏi AI nhanh',
    icon: <Sparkles size={15} />,
    accentBg: 'rgba(139, 92, 246, 0.14)',
    accentFg: '#8b5cf6',
    directAiPrompt: 'Tôi là nhân sự mới trong 60 ngày đầu, hãy gợi ý những điều quan trọng cần nắm tại iKame',
  },
];

export const OnboardingPage: React.FC = () => {
  const {
    noelMode,
    lens,
    switchLens,
    currentPerson,
    people,
    quests,
    toggleQuestComplete,
    onboardingSurvey,
    submitOnboardingSurvey,
    launchApp,
    openAiWithPrompt,
    schedule1on1,
  } = useApp();

  // Always bind onboarding data to the new-joiner profile (Phạm Gia Huy) so previewing from another role never shows wrong names
  const joiner = useMemo(
    () => (lens === 'ikamer_new' ? currentPerson : people.find((p) => p.id === 'u-huy') || currentPerson),
    [lens, currentPerson, people]
  );

  const day = joiner.onboardingDay || 32;
  const buddy = people.find((p) => p.id === joiner.buddyId) || people[0];
  const manager = people.find((p) => p.id === joiner.managerId) || people[2];

  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneId | 'all'>('m3');
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [activeGuide, setActiveGuide] = useState<KitGuide | null>(null);

  // Celebration & Mascot micro-interaction state
  const [mascotBounce, setMascotBounce] = useState(false);
  const [celebrationId, setCelebrationId] = useState(0);
  const [celebrationCopy, setCelebrationCopy] = useState({ title: '', subtitle: '' });

  // Pulse survey optional note when score <= 2
  const [pendingPulseScore, setPendingPulseScore] = useState<number | null>(null);
  const [pulseNote, setPulseNote] = useState('');

  const doneCount = quests.filter((q) => q.completed).length;
  const pct = Math.round((doneCount / quests.length) * 100);
  const m3Done = quests.filter((q) => q.milestoneId === 'm3').every((q) => q.completed);
  const allDone = doneCount === quests.length;

  // Single highest-priority next incomplete quest
  const nextQuest = useMemo(() => quests.find((q) => !q.completed) || null, [quests]);

  const visibleMilestones =
    selectedMilestone === 'all'
      ? MILESTONES
      : MILESTONES.filter((m) => m.id === selectedMilestone);

  const triggerBounce = () => {
    setMascotBounce(false);
    requestAnimationFrame(() => setMascotBounce(true));
    window.setTimeout(() => setMascotBounce(false), 950);
  };

  const handleToggleQuest = (questId: string) => {
    const target = quests.find((q) => q.id === questId);
    if (!target) return;
    const willComplete = !target.completed;

    // Detect if this completion finishes M3 (30d) or all 12 quests (60d)
    const nextList = quests.map((q) => (q.id === questId ? { ...q, completed: willComplete } : q));
    const willFinishM3 =
      willComplete &&
      target.milestoneId === 'm3' &&
      nextList.filter((q) => q.milestoneId === 'm3').every((q) => q.completed);
    const willFinishAll = willComplete && nextList.every((q) => q.completed);

    toggleQuestComplete(questId);
    if (willComplete) triggerBounce();

    if (willFinishAll) {
      setCelebrationCopy({
        title: 'Chúc mừng tốt nghiệp 60 ngày! 🎓',
        subtitle: 'Đã mở huy hiệu Chính thức 60 ngày trên Hồ sơ của bạn',
      });
      setCelebrationId((c) => c + 1);
    } else if (willFinishM3) {
      setCelebrationCopy({
        title: 'Mở khoá huy hiệu Vững vàng 30 ngày! 🏅',
        subtitle: 'Tuyệt vời! Bạn đã hoàn tất chặng 30 ngày đầu tiên',
      });
      setCelebrationId((c) => c + 1);
      setSelectedMilestone('m4');
    }
  };

  const activeSurveyKey: 'day30' | 'day60' =
    onboardingSurvey.day30 && (m3Done || selectedMilestone === 'm4') ? 'day60' : 'day30';
  const currentSurveyScore = onboardingSurvey[activeSurveyKey];

  const handleSelectPulse = (score: number) => {
    if (score <= 2) {
      setPendingPulseScore(score);
      return;
    }
    setPendingPulseScore(null);
    submitOnboardingSurvey(activeSurveyKey, score);
  };

  const handleSendPulseWithNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingPulseScore === null) return;
    submitOnboardingSurvey(activeSurveyKey, pendingPulseScore, pulseNote);
    setPendingPulseScore(null);
    setPulseNote('');
  };

  const heroSubtitle = allDone
    ? 'Bạn đã hoàn tất trọn vẹn 12/12 bước hội nhập tại iKame! 🎉'
    : !m3Done
      ? `Chặng 3/4 · Còn ${quests.filter((q) => q.milestoneId === 'm3' && !q.completed).length} bước để mở huy hiệu 30 ngày`
      : `Đã mở huy hiệu 30 ngày · Còn ${quests.length - doneCount} bước tới mốc Chính thức`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <MilestoneCelebrationOverlay
        triggerId={celebrationId}
        title={celebrationCopy.title}
        subtitle={celebrationCopy.subtitle}
        isNoel={noelMode}
      />

      {/* Slim Role Notice ONLY when viewing from a non-new-joiner account */}
      {lens !== 'ikamer_new' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            padding: '9px 14px',
            borderRadius: 'var(--r-12)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-primary)',
            fontSize: 12.5,
            color: 'var(--text-secondary)',
          }}
        >
          <span>
            Đang xem hành trình mẫu của <strong style={{ color: 'var(--text-strong)' }}>{joiner.name}</strong> (Ngày {day}/60)
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ height: 26, fontSize: 12 }}
            onClick={() => switchLens('ikamer_new')}
          >
            Đổi sang vai trò Người mới
          </button>
        </div>
      )}

      {/* 1. Airy Hero + 4-Stage Visual Stepper */}
      <section className="onb-hero">
        <div className="onb-hero-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <button
              type="button"
              className={`mascot-stage ${mascotBounce ? 'celebrating' : ''}`}
              onClick={triggerBounce}
              aria-label="Mascot iKame"
              title="Bạn đồng hành iKame"
            >
              <span className="mascot-aura" />
              <span className="mascot-bob">
                <img src={ikameMascot} alt="" className="mascot-img" />
                {noelMode && (
                  <svg className="mascot-santa-hat" viewBox="0 0 42 28" aria-hidden="true">
                    <path d="M7 21 C10 7, 23 1, 35 11 C31 12, 29 16, 31 20 Z" fill="#C41E3A" />
                    <path d="M4 21 Q18 16 33 21 Q34 25 31 26 Q18 22 6 26 Q3 25 4 21 Z" fill="#FFFFFF" />
                    <circle cx="36.5" cy="12.5" r="3.8" fill="#FFFFFF" />
                  </svg>
                )}
              </span>
            </button>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                <h1 className="page-title" style={{ fontSize: 23, lineHeight: 1.2 }}>
                  Hành trình 60 ngày
                </h1>
                <span className="badge badge-info tabular" style={{ height: 22, fontSize: 11.5 }}>
                  Ngày {day} / 60
                </span>
                {m3Done && (
                  <span className="badge badge-success" style={{ height: 22, fontSize: 11.5 }}>
                    <Award size={12} /> Vững vàng 30 ngày
                  </span>
                )}
              </div>
              <p className="page-desc" style={{ marginTop: 4, fontSize: 13 }}>
                {heroSubtitle}
              </p>
            </div>
          </div>

          <div className="onb-progress-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="tabular" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>
                {doneCount}/{quests.length} bước · {pct}%
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ height: 26, fontSize: 12, padding: '0 8px' }}
                onClick={() => setSelectedMilestone(selectedMilestone === 'all' ? (m3Done ? 'm4' : 'm3') : 'all')}
              >
                {selectedMilestone === 'all' ? 'Theo chặng' : 'Xem tất cả'}
              </button>
            </div>
            <div className="onb-progress-track">
              <div className="onb-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* 4-Milestone Stepper */}
        <div className="onb-stepper" role="tablist" aria-label="Các chặng hội nhập">
          {MILESTONES.map((ms) => {
            const msQuests = quests.filter((q) => q.milestoneId === ms.id);
            const msDone = msQuests.filter((q) => q.completed).length;
            const stageComplete = msDone === msQuests.length;
            const isSelected = selectedMilestone === ms.id;
            const ratio = Math.round((msDone / msQuests.length) * 100);

            return (
              <button
                key={ms.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`onb-step-card ${stageComplete ? 'done' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedMilestone(ms.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-tertiary)' }}>
                    {ms.dayLabel}
                  </span>
                  <span
                    className="tabular"
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: stageComplete ? 'var(--success-fg)' : isSelected ? 'var(--brand-primary-fg)' : 'var(--text-secondary)',
                    }}
                  >
                    {stageComplete ? '✓ Xong' : `${msDone}/${msQuests.length}`}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>{ms.label}</div>
                <div className="onb-step-bar">
                  <span
                    style={{
                      width: `${ratio}%`,
                      background: stageComplete ? 'var(--success-fg)' : 'var(--brand-primary)',
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Two-Column Calm Workspace */}
      <div className="layout-with-rail" style={{ gap: 18 }}>
        {/* Left Column: Next Step Strip + Clean Expandable Quests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {nextQuest && (
            <div className="onb-next-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 'var(--r-full)',
                    background: 'var(--bg-surface)',
                    color: 'var(--brand-primary-fg)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Zap size={15} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-primary-fg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Việc tiếp theo · {nextQuest.dueDay < day ? `Trễ ${day - nextQuest.dueDay} ngày` : `Hạn Ngày ${nextQuest.dueDay}`}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {nextQuest.title}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {nextQuest.actionRoute && (
                  <Link to={nextQuest.actionRoute} className="btn btn-secondary btn-sm">
                    Mở <ArrowRight size={12} />
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleToggleQuest(nextQuest.id)}
                >
                  Hoàn thành
                </button>
              </div>
            </div>
          )}

          {visibleMilestones.map((ms) => {
            const msQuests = quests.filter((q) => q.milestoneId === ms.id);
            const msDone = msQuests.filter((q) => q.completed).length;

            return (
              <section key={ms.id} className="card">
                <div className="card-header" style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 className="card-title">{ms.label}</h2>
                    <span className="tab-count">{ms.dayLabel}</span>
                  </div>

                  {ms.id === 'm3' && (
                    <span className={`badge ${m3Done ? 'badge-success' : 'badge-neutral'}`}>
                      <Award size={12} /> {m3Done ? 'Đã nhận huy hiệu 30 ngày' : 'Huy hiệu 30 ngày'}
                    </span>
                  )}
                  {ms.id === 'm4' && (
                    <span className={`badge ${msDone === msQuests.length ? 'badge-success' : 'badge-neutral'}`}>
                      <Award size={12} /> {msDone === msQuests.length ? 'Đã tốt nghiệp' : 'Huy hiệu 60 ngày'}
                    </span>
                  )}
                </div>

                <div>
                  {msQuests.map((q) => {
                    const isOverdue = !q.completed && q.dueDay < day;
                    const isExpanded = expandedQuestId === q.id;

                    return (
                      <div key={q.id} className="onb-quest-item" style={{ opacity: q.completed ? 0.65 : 1 }}>
                        <div className="onb-quest-main">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, minWidth: 0 }}>
                            <button
                              type="button"
                              onClick={() => handleToggleQuest(q.id)}
                              aria-label={`Đánh dấu ${q.title}`}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                padding: 0,
                                display: 'inline-flex',
                                flexShrink: 0,
                                color: q.completed ? 'var(--success-fg)' : 'var(--text-tertiary)',
                              }}
                            >
                              {q.completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                            </button>

                            <button
                              type="button"
                              className="onb-quest-title-btn"
                              onClick={() => setExpandedQuestId((prev) => (prev === q.id ? null : q.id))}
                              aria-expanded={isExpanded}
                            >
                              <span
                                style={{
                                  textDecoration: q.completed ? 'line-through' : 'none',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {q.title}
                              </span>
                              <ChevronDown
                                size={14}
                                style={{
                                  flexShrink: 0,
                                  color: 'var(--text-tertiary)',
                                  transform: isExpanded ? 'rotate(180deg)' : 'none',
                                  transition: 'transform 150ms',
                                }}
                              />
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: 11.5,
                                fontWeight: isOverdue ? 600 : 400,
                                color: isOverdue ? 'var(--error-fg)' : 'var(--text-tertiary)',
                              }}
                            >
                              {isOverdue ? `Trễ ${day - q.dueDay} ngày` : `Ngày ${q.dueDay}`}
                            </span>

                            {!q.completed && q.actionRoute && (
                              <Link to={q.actionRoute} className="btn btn-dim btn-sm" style={{ height: 26, fontSize: 12 }}>
                                Mở
                              </Link>
                            )}
                            {!q.completed && q.externalApp && (
                              <button
                                type="button"
                                className="btn btn-dim btn-sm"
                                style={{ height: 26, fontSize: 12 }}
                                onClick={() => {
                                  const app = INTERNAL_APPS.find((a) => a.name === q.externalApp);
                                  if (app) launchApp(app);
                                }}
                              >
                                {q.externalApp.split(' ')[0]} <ExternalLink size={11} />
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="onb-quest-detail">
                            <span>{q.description}</span>
                            <span className="badge badge-neutral" style={{ height: 20, fontSize: 11 }}>
                              Đầu mối: {q.source}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Right Rail: Companions + 2x2 Pocket Survival Kit + 1-Tap Pulse */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 1. Buddy & Manager + Next 1:1 */}
          <section className="card" style={{ padding: '16px 18px' }}>
            <div className="card-header" style={{ marginBottom: 8 }}>
              <h2 className="card-title" style={{ fontSize: 14 }}>
                Người đồng hành
              </h2>
            </div>

            <div className="clean-list">
              <div className="clean-row" style={{ padding: '9px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar person={buddy} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>{buddy.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Buddy · {buddy.slack}</div>
                  </div>
                </div>
                <Link
                  to={`/icom/feed?compose=kudos&to=${buddy.id}`}
                  className="btn btn-dim btn-sm"
                  style={{ height: 26, fontSize: 11.5 }}
                >
                  <Sparkles size={12} /> Kudos
                </Link>
              </div>

              <div className="clean-row" style={{ padding: '9px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar person={manager} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>{manager.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Quản lý · {manager.slack}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-dim btn-sm"
                  style={{ height: 26, fontSize: 11.5 }}
                  onClick={() => schedule1on1(manager.name)}
                >
                  Đặt 1:1
                </button>
              </div>
            </div>

            {joiner.pulse?.next1on1 && (
              <div
                style={{
                  marginTop: 8,
                  padding: '8px 10px',
                  borderRadius: 'var(--r-10)',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                }}
              >
                <Calendar size={13} style={{ color: 'var(--brand-primary-fg)', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {joiner.pulse.next1on1}
                </span>
              </div>
            )}
          </section>

          {/* 2. Ultra-Clean 2x2 Survival Kit */}
          <section className="card" style={{ padding: '16px 18px' }}>
            <div className="card-header" style={{ marginBottom: 10 }}>
              <h2 className="card-title" style={{ fontSize: 14 }}>
                Cẩm nang người mới
              </h2>
            </div>

            <div className="onb-kit-grid">
              {SURVIVAL_KIT.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="onb-kit-tile"
                  onClick={() => {
                    if (item.directAiPrompt) {
                      openAiWithPrompt(item.directAiPrompt);
                    } else if (item.guide) {
                      setActiveGuide(item.guide);
                    }
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--r-8)',
                      background: item.accentBg,
                      color: item.accentFg,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ lineHeight: 1.25 }}>{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 3. 1-Tap Milestone Pulse */}
          <section className="card" style={{ padding: '16px 18px' }}>
            <div className="card-header" style={{ marginBottom: 10 }}>
              <h2 className="card-title" style={{ fontSize: 14 }}>
                <MessageSquareHeart size={15} style={{ color: 'var(--brand-primary-fg)' }} />{' '}
                {activeSurveyKey === 'day30' ? 'Cảm nhận 30 ngày' : 'Cảm nhận 60 ngày'}
              </h2>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Ẩn danh · P&OD</span>
            </div>

            {currentSurveyScore ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-10)',
                  background: 'var(--success-bg)',
                  color: 'var(--success-fg)',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} /> Đã gửi ({PULSE_OPTIONS.find((o) => o.score === currentSurveyScore)?.label})
                </span>
                <button
                  type="button"
                  onClick={() => submitOnboardingSurvey(activeSurveyKey, undefined)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 11.5,
                    fontWeight: 500,
                    padding: 0,
                  }}
                >
                  Đổi
                </button>
              </div>
            ) : (
              <>
                <div className="onb-pulse-grid">
                  {PULSE_OPTIONS.map((opt) => (
                    <button
                      key={opt.score}
                      type="button"
                      className={`onb-pulse-btn ${pendingPulseScore === opt.score ? 'active' : ''}`}
                      onClick={() => handleSelectPulse(opt.score)}
                    >
                      <span style={{ fontSize: 17, lineHeight: 1.1 }}>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>

                {pendingPulseScore !== null && (
                  <form onSubmit={handleSendPulseWithNote} style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <input
                      className="input"
                      style={{ height: 32, fontSize: 12.5 }}
                      value={pulseNote}
                      onChange={(e) => setPulseNote(e.target.value)}
                      placeholder="Điều bạn cần hỗ trợ thêm (tuỳ chọn)..."
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ height: 32, flexShrink: 0 }}>
                      Gửi
                    </button>
                  </form>
                )}
              </>
            )}
          </section>
        </aside>
      </div>

      {/* Clean 3-Bullet Survival Kit Quick Modal */}
      <Modal
        open={Boolean(activeGuide)}
        onClose={() => setActiveGuide(null)}
        title={activeGuide?.title || ''}
        subtitle={activeGuide?.subtitle}
        maxWidth={440}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveGuide(null)}>
              Đóng
            </button>
            {activeGuide?.actionRoute && (
              <Link
                to={activeGuide.actionRoute}
                className="btn btn-primary"
                onClick={() => setActiveGuide(null)}
              >
                {activeGuide.actionLabel} <ArrowRight size={14} />
              </Link>
            )}
            {activeGuide?.aiPrompt && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const p = activeGuide.aiPrompt!;
                  setActiveGuide(null);
                  openAiWithPrompt(p);
                }}
              >
                <Sparkles size={14} /> {activeGuide.actionLabel}
              </button>
            )}
          </>
        }
      >
        {activeGuide && (
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5, color: 'var(--text-primary)' }}>
            {activeGuide.bullets.map((b) => (
              <li key={b} style={{ lineHeight: 1.5 }}>
                {b}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
};
