import { useCallback, useMemo, useState } from 'react';
import { CaretLeftIcon as CaretLeft, CaretRightIcon as CaretRight } from '@coreds/react/icons';
import { Button, IconButton } from '../components/UI';
import { useToast } from '../components/toast';
import { useLive } from '../lib/live/live-data';
import { addDays, dayLabel, dm, parseYmd, startOfWeek, todayYmd, WEEKDAY_LONG, WEEKDAY_SHORT } from '../data/work-dates';
import { fmtTime, liveToCal, loadExtra, meetingsForDate, saveExtra, type CalMeeting } from '../data/calendar-data';
import { MeetingPlanner, QuickBooking, type BookInput } from './calendar/BookingPanels';
import { DayView } from './calendar/DayView';
import { RoomsPanel } from './calendar/RoomsPanel';

/** Trang Lịch: dải tuần, đặt phòng nhanh, tìm giờ chung, lịch ngày và phòng họp. */
export function CalendarPage() {
  const { showToast } = useToast();
  const live = useLive().data;
  const today = todayYmd();
  const [selected, setSelected] = useState(today);
  const [extra, setExtra] = useState<CalMeeting[]>(loadExtra);

  const liveList = useMemo(() => (live?.meetings ? liveToCal(live.meetings) : undefined), [live?.meetings]);
  const weekStart = startOfWeek(selected);
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const commit = useCallback((next: CalMeeting[]) => { setExtra(next); saveExtra(next); }, []);
  const ownFor = useCallback((date: string) => meetingsForDate(date, extra, liveList), [extra, liveList]);
  const dayMeetings = useMemo(() => ownFor(selected), [ownFor, selected]);

  const add = (m: CalMeeting, message: string) => {
    commit([...extra, m]);
    setSelected(m.date);
    showToast(message, { label: 'Hoàn tác', onClick: () => commit(loadExtra().filter((x) => x.id !== m.id)) });
  };

  const book = (b: BookInput) => {
    add({
      id: `x-${Date.now().toString(36)}`, title: b.title, date: b.date, start: b.start, end: b.end, online: !b.roomId,
      roomId: b.roomId, url: b.roomId ? undefined : 'https://meet.google.com/', guestIds: b.guestIds, guestCount: b.guestIds.length + 1, kind: 'meeting',
    }, `Đã giữ chỗ ${fmtTime(b.start)}–${fmtTime(b.end)} ${dayLabel(b.date).toLowerCase()}`);
  };

  const focus = (start: number, end: number) => {
    add({ id: `x-${Date.now().toString(36)}`, title: 'Giờ tập trung', date: selected, start, end, online: false, guestIds: [], guestCount: 1, kind: 'focus' },
      `Đã giữ ${fmtTime(start)}–${fmtTime(end)} làm giờ tập trung`);
  };

  const cancel = (id: string) => {
    const gone = extra.find((m) => m.id === id);
    commit(extra.filter((m) => m.id !== id));
    if (gone) showToast(`Đã huỷ "${gone.title}"`, { label: 'Hoàn tác', onClick: () => commit([...loadExtra(), gone]) });
  };

  const shift = (days: number) => setSelected(addDays(selected, days));
  const sel = parseYmd(selected);
  const ctx = { selectedDate: selected, extra, ownFor, onBook: book };

  return (
    <div className="page cal-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Lịch{live?.meetings ? ' · Lịch Google' : ''}</p>
          <h1>Lịch</h1>
          <p>{WEEKDAY_LONG[sel.getDay()]}, {dm(selected)}/{sel.getFullYear()}{selected === today ? ' · hôm nay' : ''}</p>
        </div>
        <div className="cal-nav" role="group" aria-label="Chuyển tuần">
          <IconButton label="Tuần trước" onClick={() => shift(-7)}><CaretLeft size={18} /></IconButton>
          <Button variant="dim" size="m" disabled={selected === today} onClick={() => setSelected(today)}>Hôm nay</Button>
          <IconButton label="Tuần sau" onClick={() => shift(7)}><CaretRight size={18} /></IconButton>
        </div>
      </header>

      <nav className="cal-week" aria-label="Chọn ngày trong tuần">
        {week.map((d) => {
          const count = ownFor(d).filter((m) => m.kind === 'meeting').length;
          const wd = parseYmd(d).getDay();
          return (
            <button key={d} type="button" className="cal-day-btn" aria-pressed={d === selected} aria-current={d === today ? 'date' : undefined} data-weekend={wd === 0 || wd === 6 || undefined} data-today={d === today || undefined} onClick={() => setSelected(d)}>
              <span className="cal-day-name">{WEEKDAY_SHORT[wd] === 'CN' ? 'CN' : WEEKDAY_SHORT[wd]}</span>
              <strong>{parseYmd(d).getDate()}</strong>
              <span className="cal-day-count">{count ? `${count} họp` : 'trống'}</span>
            </button>
          );
        })}
      </nav>

      <QuickBooking ctx={ctx} />

      <div className="cal-grid">
        <DayView date={selected} meetings={dayMeetings} onFocus={focus} onCancel={cancel} />
        <aside className="cal-side">
          <RoomsPanel date={selected} extra={extra} />
          <MeetingPlanner ctx={ctx} />
        </aside>
      </div>
    </div>
  );
}
