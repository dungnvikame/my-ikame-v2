import type { GoalStatus, MemberProfile360, SignalTone, TeamMemberStatus } from '../../types';

/** Helper hiển thị dùng chung cho roster Đội ngũ và trang hồ sơ 360°. */

export const STATUS_LABEL: Record<TeamMemberStatus, string> = {
  needs_attention: 'Cần chú ý',
  ok: 'Đã ổn',
  no_data: 'Sắp gia nhập',
};

export const STATUS_TONE: Record<TeamMemberStatus, 'error' | 'success' | 'info'> = {
  needs_attention: 'error',
  ok: 'success',
  no_data: 'info',
};

export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = {
  needs_update: 'Trễ check-in',
  on_track: 'Đúng tiến độ',
  at_risk: 'Có rủi ro',
  done: 'Hoàn thành',
};

export const GOAL_STATUS_TONE: Record<GoalStatus, 'error' | 'success' | 'warning' | 'info'> = {
  needs_update: 'warning',
  on_track: 'success',
  at_risk: 'error',
  done: 'info',
};

/** Điểm rủi ro dùng để xếp thứ tự roster — cao nhất lên trước khi sort "Cần chú ý nhất". */
export function riskScore(profile?: MemberProfile360): number {
  if (!profile) return 0;
  const weight: Record<SignalTone, number> = { risk: 3, watch: 1, neutral: 0, good: 0 };
  return profile.signals.reduce((sum, signal) => sum + weight[signal.tone], 0);
}

export function riskLabel(score: number): { label: string; tone: SignalTone } {
  if (score >= 6) return { label: 'Ưu tiên cao', tone: 'risk' };
  if (score >= 3) return { label: 'Cần theo dõi', tone: 'watch' };
  return { label: 'Ổn định', tone: 'good' };
}

export function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/** Tên hiển thị theo thứ tự "tên gọi + họ" (Lan Nguyễn) → lấy chữ đầu của tên gọi. */
export function initials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

/** Thẻ tín hiệu: nhãn + giá trị lớn + gợi ý + nguồn dữ liệu (minh bạch nguồn). */
export function SignalCard({ label, value, hint, tone, source }: {
  label: string; value: string; hint: string; tone: SignalTone; source: string;
}) {
  return (
    <article className={`signal-card signal-card--${tone}`}>
      <p className="signal-card-label">{label}</p>
      <strong className="signal-card-value">{value}</strong>
      <p className="signal-card-hint">{hint}</p>
      <span className="signal-card-source">{source}</span>
    </article>
  );
}

/** Thanh tiến độ nhỏ dùng lại ở card roster và tab Mục tiêu. */
export function MiniProgress({ value, tone = 'neutral' }: { value: number; tone?: SignalTone }) {
  return (
    <div className={`mini-progress mini-progress--${tone}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
