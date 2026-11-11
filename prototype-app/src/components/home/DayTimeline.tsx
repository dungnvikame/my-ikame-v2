/**
 * Dải thời gian trong ngày (8h–18h) trên Trang chủ: khối cuộc họp, vạch "bây giờ" và khoảng
 * trống dài nhất còn lại — nhìn một lần là biết hôm nay còn bao nhiêu thời gian tập trung.
 */
export type TimelineMeeting = { id: string; title: string; start: Date; end: Date };

const DAY_START = 8;
const DAY_END = 18;
const TICKS = [8, 10, 12, 14, 16, 18];
const MIN_FREE_MINUTES = 30;

const pad = (value: number) => String(value).padStart(2, '0');
const hhmm = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

function atHour(now: Date, hour: number): Date {
  const date = new Date(now);
  date.setHours(hour, 0, 0, 0);
  return date;
}

/** Khoảng trống dài nhất từ bây giờ tới hết giờ làm, bỏ qua các khoảng dưới 30 phút. */
function longestFreeSlot(meetings: TimelineMeeting[], from: Date, to: Date): { start: Date; end: Date } | undefined {
  let cursor = from;
  let best: { start: Date; end: Date } | undefined;
  const consider = (start: Date, end: Date) => {
    const minutes = (end.getTime() - start.getTime()) / 60000;
    if (minutes >= MIN_FREE_MINUTES && (!best || minutes > (best.end.getTime() - best.start.getTime()) / 60000)) best = { start, end };
  };
  for (const meeting of [...meetings].sort((a, b) => a.start.getTime() - b.start.getTime())) {
    if (meeting.end <= cursor) continue;
    if (meeting.start > cursor) consider(cursor, meeting.start < to ? meeting.start : to);
    if (meeting.end > cursor) cursor = meeting.end;
    if (cursor >= to) break;
  }
  if (cursor < to) consider(cursor, to);
  return best;
}

export function DayTimeline({ meetings, now = new Date() }: { meetings: TimelineMeeting[]; now?: Date }) {
  const dayStart = atHour(now, DAY_START);
  const dayEnd = atHour(now, DAY_END);
  const span = dayEnd.getTime() - dayStart.getTime();
  const percent = (date: Date) => Math.min(100, Math.max(0, ((date.getTime() - dayStart.getTime()) / span) * 100));

  const visible = meetings.filter((meeting) => meeting.end > dayStart && meeting.start < dayEnd);
  const upcoming = visible.filter((meeting) => meeting.end > now).sort((a, b) => a.start.getTime() - b.start.getTime());
  const inWorkday = now >= dayStart && now < dayEnd;
  const free = now < dayEnd ? longestFreeSlot(visible, now > dayStart ? now : dayStart, dayEnd) : undefined;

  const summary = now >= dayEnd
    ? 'Đã hết giờ làm việc hôm nay.'
    : upcoming.length === 0
      ? 'Hôm nay không còn cuộc họp nào, thời gian tốt để làm việc tập trung.'
      : `Còn ${upcoming.length} cuộc họp hôm nay, gần nhất lúc ${hhmm(upcoming[0].start)}: ${upcoming[0].title}.`;

  return (
    <div className="day-timeline">
      <p className="day-timeline-summary">{summary}{free && <span className="day-timeline-free-note"> Trống {hhmm(free.start)}–{hhmm(free.end)}.</span>}</p>
      <div className="day-timeline-track" role="img" aria-label={`Lịch hôm nay từ ${DAY_START} giờ đến ${DAY_END} giờ. ${summary}`}>
        {free && (
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
        {inWorkday && <span className="day-timeline-now" style={{ left: `${percent(now)}%` }}><span>{hhmm(now)}</span></span>}
      </div>
      <div className="day-timeline-ticks" aria-hidden="true">
        {TICKS.map((hour) => <span key={hour} style={{ left: `${((hour - DAY_START) / (DAY_END - DAY_START)) * 100}%` }}>{hour}h</span>)}
      </div>
    </div>
  );
}
