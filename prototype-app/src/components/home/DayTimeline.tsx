import { TargetIcon as Target } from '@coreds/react/icons';
import { Button } from '../UI';
import type { FocusBlock } from './home-store';
import { DAY_END, DAY_START, freeSlotOf, hhmm, type Slot } from './task-utils';

/**
 * Dải thời gian trong ngày (8h–18h) trên Trang chủ: khối cuộc họp, vạch "bây giờ" và khoảng
 * trống dài nhất còn lại — nhìn một lần là biết hôm nay còn bao nhiêu thời gian tập trung.
 * Có thể chặn khoảng trống làm khối "Tập trung" (lưu trong ngày).
 */
export type TimelineMeeting = { id: string; title: string; start: Date; end: Date; location?: string; url?: string; guests?: number };

const TICKS = [8, 10, 12, 14, 16, 18];

type Props = {
  meetings: TimelineMeeting[];
  now?: Date;
  /** Khoảng gợi ý để chặn (đã giới hạn 2 giờ). */
  focusSuggestion?: Slot;
  focus?: FocusBlock;
  onFocusChange?: (focus: FocusBlock | undefined) => void;
};

export function DayTimeline({ meetings, now = new Date(), focusSuggestion, focus, onFocusChange }: Props) {
  const dayStart = new Date(now); dayStart.setHours(DAY_START, 0, 0, 0);
  const dayEnd = new Date(now); dayEnd.setHours(DAY_END, 0, 0, 0);
  const span = dayEnd.getTime() - dayStart.getTime();
  const percent = (date: Date) => Math.min(100, Math.max(0, ((date.getTime() - dayStart.getTime()) / span) * 100));

  const visible = meetings.filter((meeting) => meeting.end > dayStart && meeting.start < dayEnd);
  const upcoming = visible.filter((meeting) => meeting.end > now).sort((a, b) => a.start.getTime() - b.start.getTime());
  const inWorkday = now >= dayStart && now < dayEnd;
  const free = freeSlotOf(visible, now);
  const focusStart = focus ? new Date(focus.start) : undefined;
  const focusEnd = focus ? new Date(focus.end) : undefined;

  const summary = now >= dayEnd
    ? 'Đã hết giờ làm việc hôm nay.'
    : upcoming.length === 0
      ? 'Hôm nay không còn cuộc họp nào, thời gian tốt để làm việc tập trung.'
      : `Còn ${upcoming.length} cuộc họp hôm nay, gần nhất lúc ${hhmm(upcoming[0].start)}: ${upcoming[0].title}.`;

  return (
    <div className="day-timeline">
      <p className="day-timeline-summary">{summary}{free && <span className="day-timeline-free-note"> Trống {hhmm(free.start)}–{hhmm(free.end)}.</span>}</p>
      <div className="day-timeline-track" role="img" aria-label={`Lịch hôm nay từ ${DAY_START} giờ đến ${DAY_END} giờ. ${summary}${focusStart && focusEnd ? ` Đã chặn tập trung ${hhmm(focusStart)} đến ${hhmm(focusEnd)}.` : ''}`}>
        {free && !focus && (
          <span className="day-timeline-free" style={{ left: `${percent(free.start)}%`, width: `${percent(free.end) - percent(free.start)}%` }}>
            <span>Trống {hhmm(free.start)}–{hhmm(free.end)}</span>
          </span>
        )}
        {visible.map((meeting) => (
          <span
            key={meeting.id}
            className={`day-timeline-meeting ${meeting.end <= now ? 'is-past' : ''}`}
            style={{ left: `${percent(meeting.start)}%`, width: `${Math.max(1.5, percent(meeting.end) - percent(meeting.start))}%` }}
            title={`${hhmm(meeting.start)}–${hhmm(meeting.end)} · ${meeting.title}`}
          >
            <span>{meeting.title}</span>
          </span>
        ))}
        {focusStart && focusEnd && (
          <span
            className="day-timeline-focus"
            style={{ left: `${percent(focusStart)}%`, width: `${Math.max(1.5, percent(focusEnd) - percent(focusStart))}%` }}
            title={`${hhmm(focusStart)}–${hhmm(focusEnd)} · Tập trung`}
          >
            <span>Tập trung</span>
          </span>
        )}
        {inWorkday && <span className="day-timeline-now" style={{ left: `${percent(now)}%` }}><span>{hhmm(now)}</span></span>}
      </div>
      <div className="day-timeline-ticks" aria-hidden="true">
        {TICKS.map((hour) => <span key={hour} style={{ left: `${((hour - DAY_START) / (DAY_END - DAY_START)) * 100}%` }}>{hour}h</span>)}
      </div>
      {onFocusChange && focusStart && focusEnd && (
        <Button variant="dim" size="m" className="day-timeline-block is-on" icon={<Target size={16} aria-hidden="true" />} onClick={() => onFocusChange(undefined)}>
          Đã chặn {hhmm(focusStart)} đến {hhmm(focusEnd)} · Bỏ chặn
        </Button>
      )}
      {onFocusChange && !focus && focusSuggestion && (
        <Button
          variant="dim"
          size="m"
          className="day-timeline-block"
          icon={<Target size={16} aria-hidden="true" />}
          onClick={() => onFocusChange({ start: focusSuggestion.start.getTime(), end: focusSuggestion.end.getTime() })}
        >
          Chặn {hhmm(focusSuggestion.start)} đến {hhmm(focusSuggestion.end)} làm giờ tập trung
        </Button>
      )}
    </div>
  );
}
