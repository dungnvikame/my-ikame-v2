import { CalendarBlankIcon as CalendarBlank, MapPinIcon as MapPin, VideoCameraIcon as VideoCamera } from '@coreds/react/icons';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../UI';
import type { TimelineMeeting } from './DayTimeline';
import { hhmm } from './task-utils';

/** Cuộc họp chưa kết thúc gần nhất trong ngày. */
export function nextMeetingOf(meetings: TimelineMeeting[], now: Date): TimelineMeeting | undefined {
  return [...meetings].filter((meeting) => meeting.end > now).sort((a, b) => a.start.getTime() - b.start.getTime())[0];
}

/** "Bắt đầu sau 64 phút" / "Đang diễn ra" — chữ ngắn, đọc một lần là hiểu. */
export function startsInLabel(meeting: TimelineMeeting, now: Date): string {
  const minutes = Math.round((meeting.start.getTime() - now.getTime()) / 60000);
  if (minutes <= 0) return `Đang diễn ra, kết thúc lúc ${hhmm(meeting.end)}`;
  if (minutes < 120) return `Bắt đầu sau ${minutes} phút`;
  return `Bắt đầu sau ${Math.floor(minutes / 60)} giờ${minutes % 60 ? ` ${minutes % 60} phút` : ''}`;
}

export function NextMeetingCard({ meeting, now }: { meeting?: TimelineMeeting; now: Date }) {
  if (!meeting) {
    return (
      <aside className="next-meeting is-empty" aria-label="Cuộc họp kế tiếp">
        <span className="next-meeting-kicker"><CalendarBlank size={14} aria-hidden="true" />Cuộc họp kế tiếp</span>
        <strong>Không còn cuộc họp hôm nay</strong>
        <p>Thời gian trống là của bạn. Chặn một khối tập trung nếu cần.</p>
        <Link className="text-link" to="/calendar">Xem lịch</Link>
      </aside>
    );
  }
  const place = meeting.location ?? (meeting.url ? 'Online' : undefined);
  return (
    <aside className="next-meeting" aria-label="Cuộc họp kế tiếp">
      <span className="next-meeting-kicker"><CalendarBlank size={14} aria-hidden="true" />Cuộc họp kế tiếp</span>
      <p className="next-meeting-when">{startsInLabel(meeting, now)}, {hhmm(meeting.start)}–{hhmm(meeting.end)}</p>
      <strong>{meeting.title}</strong>
      <p className="next-meeting-place">
        {meeting.url ? <VideoCamera size={14} aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />}
        {place ?? 'Chưa có địa điểm'}{meeting.guests ? ` · ${meeting.guests} người` : ''}
      </p>
      {meeting.url && <ButtonLink variant="primary" size="m" href={meeting.url}>Vào họp</ButtonLink>}
    </aside>
  );
}
