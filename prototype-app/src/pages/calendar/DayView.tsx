import { useMemo } from 'react';
import { Avatar } from '@coreds/react';
import { CalendarBlankIcon as CalendarBlank, FileTextIcon as FileText, LightbulbIcon as Lightbulb, MapPinIcon as MapPin, VideoCameraIcon as VideoCamera } from '@coreds/react/icons';
import { Button, ButtonLink, EmptyState } from '../../components/UI';
import { avatarText } from '../../lib/avatar-text';
import { ROOMS } from '../../data/calendar-rooms';
import { DAY_END, DAY_START, fmtDuration, fmtTime, freeGaps, meetingBlocks, meetingHours, nowMinutes, PEOPLE, type CalMeeting } from '../../data/calendar-data';
import { todayYmd } from '../../data/work-dates';

const HOUR_PX = 56;
const place = (m: CalMeeting) => (m.roomId ? (() => { const r = ROOMS.find((x) => x.id === m.roomId); return r ? `${r.name} · tầng ${r.floor}` : 'Phòng họp'; })() : m.kind === 'focus' ? 'Giờ tập trung' : m.online ? 'Online · Google Meet' : 'Chưa có địa điểm');

function Guests({ m }: { m: CalMeeting }) {
  const shown = m.guestIds.slice(0, 3);
  const more = m.guestCount - shown.length;
  if (m.guestCount <= 1) return null;
  return (
    <span className="cal-avatars" aria-label={`${m.guestCount} người tham dự`}>
      {shown.map((id) => <Avatar key={id} type="text" size="s" fallback={avatarText(PEOPLE.find((p) => p.id === id)?.name)} alt="" aria-hidden="true" />)}
      {more > 0 && <span className="cal-avatar-more">+{more}</span>}
    </span>
  );
}

type Props = { date: string; meetings: CalMeeting[]; onFocus: (start: number, end: number) => void; onCancel: (id: string) => void };

/** Nội dung ngày đang chọn: họp tiếp theo, danh sách, dòng thời gian 8h–18h và gợi ý. */
export function DayView({ date, meetings, onFocus, onCancel }: Props) {
  const isToday = date === todayYmd();
  const now = nowMinutes();
  const next = meetings.find((m) => m.kind === 'meeting' && (!isToday || m.end > now));
  const nextIsNow = !!next && isToday && next.start <= now;

  const gaps = useMemo(() => {
    const from = isToday ? Math.min(DAY_END, Math.max(DAY_START, Math.ceil(now / 15) * 15)) : DAY_START;
    return freeGaps(meetingBlocks(meetings), from, DAY_END, 30);
  }, [meetings, isToday, now]);

  const bigGap = [...gaps].sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))[0];
  const hours = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START / 60 + i);
  const top = (min: number) => ((min - DAY_START) / 60) * HOUR_PX;
  const busyHours = meetingHours(meetings.filter((m) => m.kind === 'meeting'));

  return (
    <div className="cal-day">
      {next ? (
        <section className="cal-card cal-next" aria-label="Cuộc họp tiếp theo">
          <span className="cal-badge">{nextIsNow ? 'Đang diễn ra' : isToday ? 'Họp tiếp theo' : 'Cuộc họp đầu tiên'}</span>
          <h2>{next.title}</h2>
          <p className="cal-next-meta">
            <span>{fmtTime(next.start)}–{fmtTime(next.end)}</span>
            <span>{next.online ? <VideoCamera size={14} aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />}{place(next)}</span>
            <Guests m={next} />
          </p>
          <div className="cal-actions">
            {next.url ? <ButtonLink variant="primary" size="m" href={next.url}><VideoCamera size={16} aria-hidden="true" />Vào họp</ButtonLink>
              : <Button variant="primary" size="m" disabled>{next.online ? 'Chưa có link họp' : 'Họp trực tiếp'}</Button>}
            {next.docUrl ? <ButtonLink variant="dim" size="m" href={next.docUrl}><FileText size={16} aria-hidden="true" />Tài liệu</ButtonLink>
              : <Button variant="dim" size="m" disabled>Chưa có tài liệu</Button>}
          </div>
        </section>
      ) : (
        <section className="cal-card"><EmptyState icon={<CalendarBlank size={44} variant="duotone" />} title={isToday && meetings.length ? 'Hôm nay hết họp rồi' : 'Ngày này không có cuộc họp'} body="Cả khoảng trống dành cho việc của bạn. Giữ một giờ tập trung ở gợi ý bên dưới." /></section>
      )}

      <section className="cal-card" aria-label="Lịch trong ngày">
        <div className="cal-card-head"><h2>Lịch trong ngày</h2><span className="cal-muted">{meetings.length} mục · {Math.round(busyHours * 10) / 10 || 0} giờ họp</span></div>
        {meetings.length === 0 ? <p className="cal-muted">Chưa có gì trong ngày này.</p> : (
          <ul className="cal-list">
            {meetings.map((m) => (
              <li key={m.id} data-kind={m.kind}>
                <span className="cal-time">{fmtTime(m.start)}<small>{fmtTime(m.end)}</small></span>
                <div className="cal-list-main"><strong>{m.title}</strong><span className="cal-muted">{place(m)}</span></div>
                <Guests m={m} />
                {m.id.startsWith('x-') && <Button variant="borderless" size="s" aria-label={`Huỷ "${m.title}"`} onClick={() => onCancel(m.id)}>Huỷ</Button>}
              </li>
            ))}
          </ul>
        )}

        <div className="cal-timeline" style={{ height: (hours.length - 1) * HOUR_PX }} role="img" aria-label={`Dòng thời gian ${DAY_START / 60}h đến ${DAY_END / 60}h: ${meetings.length} mục, ${gaps.length} khoảng trống`}>
          {hours.map((h) => <div key={h} className="cal-hour" style={{ top: top(h * 60) }}><span>{String(h).padStart(2, '0')}:00</span></div>)}
          {gaps.map(([s, e]) => (
            <div key={`g${s}`} className="cal-block cal-gap" style={{ top: top(s), height: top(e) - top(s) - 2 }}>
              <span>Trống {fmtDuration(e - s)}</span>
            </div>
          ))}
          {meetings.map((m) => (
            <div key={m.id} className="cal-block cal-event" data-kind={m.kind} style={{ top: top(m.start), height: Math.max(22, top(m.end) - top(m.start) - 2) }}>
              <strong>{m.title}</strong><span>{fmtTime(m.start)}–{fmtTime(m.end)}</span>
            </div>
          ))}
          {isToday && now >= DAY_START && now <= DAY_END && <div className="cal-now" style={{ top: top(now) }} aria-hidden="true" />}
        </div>
      </section>

      <section className="cal-card cal-suggest" aria-label="Gợi ý cho bạn">
        <h2><Lightbulb size={18} variant="fill" aria-hidden="true" />Gợi ý cho bạn</h2>
        {bigGap && bigGap[1] - bigGap[0] >= 60 ? (
          <div className="cal-suggest-row">
            <p>Bạn trống liền {fmtDuration(bigGap[1] - bigGap[0])} ({fmtTime(bigGap[0])}–{fmtTime(bigGap[1])}). Nên dành cho việc cần tập trung.</p>
            <Button variant="primary" size="s" onClick={() => onFocus(bigGap[0], bigGap[1])}>Giữ làm giờ tập trung</Button>
          </div>
        ) : <p className="cal-muted">Lịch ngày này khá kín, chưa có khoảng trống đủ dài để tập trung.</p>}
        {busyHours >= 4 && <p className="cal-muted">Ngày này họp {Math.round(busyHours * 10) / 10} giờ. Cân nhắc dời họp không gấp sang ngày khác.</p>}
      </section>
    </div>
  );
}
