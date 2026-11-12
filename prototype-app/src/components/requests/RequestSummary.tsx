import { AirplaneTiltIcon as AirplaneTilt, HourglassMediumIcon as HourglassMedium } from '@coreds/react/icons';
import { dayCount, rangeLabel, type LeavePlan, weekdayLabel } from './request-context';

/** 3 thẻ tóm tắt đầu trang Đề xuất: phép còn lại (vòng tròn), đơn đang chờ, kỳ nghỉ sắp tới. */
type Props = {
  remaining: number;
  used: number;
  total: number;
  /** Dòng phụ dưới số phép, ví dụ "dùng được đến 31/3/2027". */
  leaveNote: string;
  pending: number;
  upcoming?: LeavePlan;
};

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RequestSummary({ remaining, used, total, leaveNote, pending, upcoming }: Props) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, remaining / total)) : 0;
  return (
    <section className="rq-tiles" aria-label="Tóm tắt">
      <article className="rq-tile">
        <svg className="rq-ring" width="68" height="68" viewBox="0 0 68 68" role="img" aria-label={`Còn ${dayCount(remaining)} trên ${dayCount(total)} ngày phép`}>
          <circle cx="34" cy="34" r={RADIUS} className="rq-ring-track" />
          <circle cx="34" cy="34" r={RADIUS} className="rq-ring-value" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - ratio)} transform="rotate(-90 34 34)" />
        </svg>
        <div className="rq-tile-copy">
          <small>Ngày phép còn lại</small>
          <strong>{dayCount(remaining)} ngày</strong>
          <span>Đã dùng {dayCount(used)}, {leaveNote}</span>
        </div>
      </article>

      <article className="rq-tile">
        <span className="rq-tile-icon rq-tile-icon--warn" aria-hidden="true"><HourglassMedium size={24} variant="duotone" /></span>
        <div className="rq-tile-copy">
          <small>Đơn của bạn đang chờ</small>
          <strong>{pending > 0 ? `${pending} đơn` : 'Không có'}</strong>
          <span>{pending > 0 ? 'Đang chờ duyệt hoặc xử lý' : 'Mọi đề xuất đã được xử lý'}</span>
        </div>
      </article>

      <article className="rq-tile">
        <span className="rq-tile-icon rq-tile-icon--info" aria-hidden="true"><AirplaneTilt size={24} variant="duotone" /></span>
        <div className="rq-tile-copy">
          <small>Kỳ nghỉ sắp tới</small>
          <strong>{upcoming ? rangeLabel(upcoming.start, upcoming.end) : 'Chưa có'}</strong>
          <span>{upcoming ? `${weekdayLabel(upcoming.start)} · ${dayCount(upcoming.days)} ngày · chờ duyệt` : 'Gõ một câu bên dưới để xin nghỉ'}</span>
        </div>
      </article>
    </section>
  );
}
