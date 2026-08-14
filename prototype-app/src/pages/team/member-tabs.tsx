import { CheckCircle, Circle, CircleHalf, Medal, Quotes, Sparkle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { StatusPill } from '../../components/UI';
import type { MemberProfile360 } from '../../types';
import { GOAL_STATUS_LABEL, GOAL_STATUS_TONE, MiniProgress, SignalCard } from './team-visuals';

/** Các panel nội dung của hồ sơ 360° — tách khỏi trang chính để giữ file gọn. */

const MOOD_META = {
  positive: { label: 'Tích cực', tone: 'success' as const },
  neutral: { label: 'Bình thường', tone: 'info' as const },
  concern: { label: 'Có lo ngại', tone: 'warning' as const },
};

const LEARNING_META = {
  done: { label: 'Hoàn thành', icon: CheckCircle },
  in_progress: { label: 'Đang học', icon: CircleHalf },
  not_started: { label: 'Chưa bắt đầu', icon: Circle },
};

export function OverviewPanel({ profile }: { profile: MemberProfile360 }) {
  return (
    <>
      <section className="member-insight">
        <div className="member-insight-head">
          <span className="member-insight-icon" aria-hidden="true"><Sparkle size={18} weight="fill" /></span>
          <div>
            <p className="eyebrow">TRỢ LÝ AI · TỔNG HỢP ĐA NGUỒN</p>
            <h2>{profile.aiInsight.headline}</h2>
          </div>
        </div>
        <ul className="member-insight-list">
          {profile.aiInsight.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
        </ul>
        <div className="member-insight-suggestion">
          <p><strong>Gợi ý hành động:</strong> {profile.aiInsight.suggestion}</p>
          <Link className="text-link" to={`/assistant?q=${encodeURIComponent(profile.aiInsight.suggestionPrompt)}`}>
            Nhờ Trợ lý AI chuẩn bị
          </Link>
        </div>
      </section>

      <section className="section-block">
        <h2 className="member-section-title">Tín hiệu từ các nguồn</h2>
        <div className="signal-grid">
          {profile.signals.map(({ key, ...signal }) => <SignalCard key={key} {...signal} />)}
        </div>
      </section>

      <section className="section-block">
        <h2 className="member-section-title">Hoạt động gần đây</h2>
        <ul className="member-activity">
          {profile.activities.map((activity) => (
            <li key={activity.id}>
              <span className="member-activity-source">{activity.source}</span>
              <span className="member-activity-text">{activity.text}</span>
              <span className="member-activity-time">{activity.timeLabel}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function GoalsPanel({ profile }: { profile: MemberProfile360 }) {
  if (profile.eks.length === 0) {
    return <p className="inline-guidance">Chưa thiết lập mục tiêu — sẽ được thống nhất trong tuần đầu tiên sau khi gia nhập.</p>;
  }
  const compliance = Math.round((profile.reportsSubmitted / Math.max(profile.reportsExpected, 1)) * 100);
  return (
    <>
      <section className="member-compliance">
        <div>
          <p className="member-compliance-label">Nhịp báo cáo check-in</p>
          <strong>{profile.reportsSubmitted}/{profile.reportsExpected} kỳ</strong>
        </div>
        <MiniProgress value={compliance} tone={compliance >= 90 ? 'good' : compliance >= 70 ? 'watch' : 'risk'} />
      </section>
      <div className="member-eks-list">
        {profile.eks.map((eks) => (
          <article key={eks.id} className="member-eks-row">
            <span className="eks-code eks-code--ks" aria-hidden="true">{eks.code}</span>
            <div className="member-eks-copy">
              <strong>{eks.title}</strong>
              <small>Check-in gần nhất: {eks.lastCheckIn}</small>
            </div>
            <div className="member-eks-progress">
              <MiniProgress value={eks.progress} tone={eks.progress >= 60 ? 'good' : eks.progress >= 45 ? 'watch' : 'risk'} />
              <span>{eks.progress}%</span>
            </div>
            <StatusPill tone={GOAL_STATUS_TONE[eks.status]}>{GOAL_STATUS_LABEL[eks.status]}</StatusPill>
          </article>
        ))}
      </div>
    </>
  );
}

export function CheckinPanel({ profile }: { profile: MemberProfile360 }) {
  return (
    <>
      <section className="member-next-oneonone">
        <p className="member-compliance-label">1:1 tiếp theo</p>
        <strong>{profile.nextOneOnOneLabel ?? 'Chưa đặt lịch'}</strong>
        {profile.nextOneOnOneLabel === 'Chưa đặt lịch' && (
          <Link className="text-link" to={`/assistant?q=${encodeURIComponent(profile.aiInsight.suggestionPrompt)}`}>
            Nhờ AI soạn agenda và đặt lịch
          </Link>
        )}
      </section>
      {profile.oneOnOnes.length === 0 ? (
        <p className="inline-guidance">Chưa có buổi 1:1 nào được ghi nhận.</p>
      ) : (
        <ol className="member-oneonone-list">
          {profile.oneOnOnes.map((note) => (
            <li key={note.id}>
              <div className="member-oneonone-head">
                <strong>{note.dateLabel}</strong>
                <StatusPill tone={MOOD_META[note.mood].tone}>{MOOD_META[note.mood].label}</StatusPill>
              </div>
              <div className="member-oneonone-topics">
                {note.topics.map((topic) => <span key={topic}>{topic}</span>)}
              </div>
              <p>{note.outcome}</p>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

export function GrowthPanel({ profile }: { profile: MemberProfile360 }) {
  return (
    <>
      <section className="section-block">
        <h2 className="member-section-title">Ghi nhận 90 ngày gần nhất</h2>
        {profile.recognitions.length === 0 ? (
          <p className="inline-guidance">Chưa có ghi nhận nào.</p>
        ) : (
          <div className="member-recognition-list">
            {profile.recognitions.map((item) => (
              <article key={item.id} className={`member-recognition ${item.kind === 'award' ? 'is-award' : ''}`}>
                <span className="member-recognition-icon" aria-hidden="true">
                  {item.kind === 'award' ? <Medal size={16} weight="fill" /> : <Quotes size={16} weight="fill" />}
                </span>
                <div>
                  <p>{item.message}</p>
                  <small>{item.fromName} · {item.dateLabel}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <h2 className="member-section-title">Khung năng lực</h2>
        <ul className="member-skill-list">
          {profile.skills.map((skill) => (
            <li key={skill.name}>
              <span className="member-skill-name">{skill.name}</span>
              <span className="member-skill-dots" aria-label={`Hiện tại ${skill.level}/5, mục tiêu ${skill.target}/5`}>
                {[1, 2, 3, 4, 5].map((step) => (
                  <span
                    key={step}
                    className={`member-skill-dot ${step <= skill.level ? 'is-filled' : ''} ${step > skill.level && step <= skill.target ? 'is-target' : ''}`}
                  />
                ))}
              </span>
              <small>{skill.level}/5 · mục tiêu {skill.target}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-block">
        <h2 className="member-section-title">Học tập</h2>
        <ul className="member-learning-list">
          {profile.learning.map((course) => {
            const meta = LEARNING_META[course.status];
            const Icon = meta.icon;
            return (
              <li key={course.id}>
                <Icon size={17} weight={course.status === 'done' ? 'fill' : 'regular'} />
                <div className="member-learning-copy">
                  <strong>{course.title}</strong>
                  <small>{meta.label}{course.dueLabel ? ` · ${course.dueLabel}` : ''}</small>
                </div>
                <span className="member-learning-progress">{course.progress}%</span>
              </li>
            );
          })}
        </ul>
        <p className="member-career-note">{profile.careerNote}</p>
      </section>
    </>
  );
}

export function HrPanel({ profile }: { profile: MemberProfile360 }) {
  const rows: { label: string; value: string }[] = [
    { label: 'Email công việc', value: profile.email },
    { label: 'Slack', value: profile.slack },
    { label: 'Địa điểm làm việc', value: profile.location },
    { label: 'Ngày gia nhập', value: profile.joinedAt },
    { label: 'Thâm niên', value: profile.tenureLabel },
    { label: 'Loại hợp đồng', value: profile.contractType },
    { label: 'Quản lý trực tiếp', value: profile.managerName },
    { label: 'Phép năm còn lại', value: `${profile.leaveRemaining}/${profile.leaveTotal} ngày` },
  ];
  return (
    <>
      <div className="member-hr-grid">
        {rows.map((row) => (
          <div key={row.label} className="member-hr-row">
            <span className="workspace-field-label">{row.label}</span>
            <div className="workspace-field-value">{row.value}</div>
          </div>
        ))}
      </div>
      {profile.upcomingLeaveLabel && <p className="member-hr-note">{profile.upcomingLeaveLabel}</p>}
      <p className="member-hr-scope">Chỉ hiển thị dữ liệu nhân sự trong phạm vi quyền quản lý trực tiếp. Lương, hợp đồng chi tiết và hồ sơ cá nhân do iHRM quản lý.</p>
    </>
  );
}
