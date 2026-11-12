import { useMemo, useState } from 'react';
import { Avatar, Input, SegmentedControl } from '@coreds/react';
import { DoorIcon as Door, LightningIcon as Lightning, MagnifyingGlassIcon as MagnifyingGlass, VideoCameraIcon as VideoCamera } from '@coreds/react/icons';
import { Button, ChipButton } from '../../components/UI';
import { avatarText } from '../../lib/avatar-text';
import { dayLabel } from '../../data/work-dates';
import { autoTitle, findSlots, fmtDuration, fmtTime, PEOPLE, type CalMeeting, type Slot } from '../../data/calendar-data';
import { parseBooking } from './booking-parse';

export type BookInput = { title: string; date: string; start: number; end: number; roomId?: string; guestIds: string[] };

type Ctx = { selectedDate: string; extra: CalMeeting[]; ownFor: (date: string) => CalMeeting[]; onBook: (b: BookInput) => void };

function Avatars({ ids }: { ids: string[] }) {
  return (
    <span className="cal-avatars" aria-label={`${ids.length} người được mời`}>
      {ids.slice(0, 4).map((id) => <Avatar key={id} type="text" size="s" fallback={avatarText(PEOPLE.find((p) => p.id === id)?.name)} alt="" aria-hidden="true" />)}
      {ids.length > 4 && <span className="cal-avatar-more">+{ids.length - 4}</span>}
    </span>
  );
}

function SlotLine({ slot, date, title, guestIds, onBook, label }: { slot: Slot; date: string; title: string; guestIds: string[]; onBook: () => void; label?: string }) {
  return (
    <div className="cal-slot">
      <div className="cal-slot-main">
        <strong>{fmtTime(slot.start)}–{fmtTime(slot.end)}<span className="cal-slot-day">{dayLabel(date)}</span></strong>
        <span className="cal-slot-title">{title}</span>
        <span className="cal-slot-room">
          {slot.room ? <><Door size={14} aria-hidden="true" />{slot.room.name} · tầng {slot.room.floor} · {slot.room.capacity} chỗ · {slot.room.equipment[0]}</>
            : <><VideoCamera size={14} aria-hidden="true" />Không có phòng đủ chỗ, họp online</>}
        </span>
      </div>
      <div className="cal-slot-side">
        <Avatars ids={guestIds} />
        <Button variant="primary" size="s" onClick={onBook}>{label ?? 'Giữ chỗ'}</Button>
      </div>
    </div>
  );
}

/** Đặt phòng nhanh bằng một câu tự nhiên. */
export function QuickBooking({ ctx }: { ctx: Ctx }) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [idx, setIdx] = useState(0);

  const result = useMemo(() => {
    const req = parseBooking(submitted, ctx.selectedDate);
    if (!req) return null;
    const guestIds = PEOPLE.slice(0, Math.min(req.people - 1, PEOPLE.length)).map((p) => p.id);
    const slots = findSlots({ date: req.date, attendeeIds: guestIds, headcount: req.people, duration: req.duration, from: req.from, to: req.to, own: ctx.ownFor(req.date), extra: ctx.extra }, 6);
    return { req, guestIds, slots };
  }, [submitted, ctx]);

  const run = () => { setSubmitted(text); setIdx(0); };
  const slot = result?.slots[idx % Math.max(1, result.slots.length)];

  return (
    <section className="cal-card cal-quick" aria-label="Đặt phòng nhanh">
      <h2><Lightning size={18} variant="fill" aria-hidden="true" />Đặt phòng nhanh</h2>
      <form className="cal-quick-row" onSubmit={(e) => { e.preventDefault(); run(); }}>
        <Input size="l" variant="fill" value={text} onChange={(e) => setText(e.target.value)} placeholder="Họp 6 người chiều mai 1 tiếng" aria-label="Mô tả cuộc họp cần đặt" />
        <Button variant="primary" type="submit" disabled={!text.trim()}>Tìm</Button>
      </form>
      {!result && <p className="cal-muted">Gõ số người, ngày (hôm nay, mai, thứ 6), buổi (sáng, chiều) và thời lượng. Ví dụ: "họp 6 người chiều mai 1 tiếng".</p>}
      {result && (
        <div className="cal-result" role="status">
          <p className="cal-muted">
            Hiểu là: {result.req.people} người · {dayLabel(result.req.date).toLowerCase()}{result.req.part ? ` · buổi ${result.req.part}` : ''} · {fmtDuration(result.req.duration)}
          </p>
          {slot ? (
            <>
              <SlotLine
                slot={slot}
                date={result.req.date}
                title={autoTitle(result.req.people)}
                guestIds={result.guestIds}
                onBook={() => ctx.onBook({ title: autoTitle(result.req.people), date: result.req.date, start: slot.start, end: slot.end, roomId: slot.room?.id, guestIds: result.guestIds })}
              />
              {result.slots.length > 1 && <Button variant="dim" size="s" onClick={() => setIdx((i) => i + 1)}>Đổi giờ ({(idx % result.slots.length) + 1}/{result.slots.length})</Button>}
            </>
          ) : <p className="cal-warn">Không có giờ chung phù hợp. Thử đổi buổi hoặc ngày khác.</p>}
        </div>
      )}
    </section>
  );
}

const DURATIONS = [30, 60, 90];

/** Chọn người dự họp rồi tìm giờ mọi người cùng rảnh. */
export function MeetingPlanner({ ctx }: { ctx: Ctx }) {
  const [ids, setIds] = useState<string[]>(['p-lan', 'p-minh']);
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState(ctx.selectedDate);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const title = autoTitle(ids.length + 1);

  const toggle = (id: string) => { setIds((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id])); setSlots(null); };
  const search = () => setSlots(findSlots({ date, attendeeIds: ids, headcount: ids.length + 1, duration, from: 8 * 60, to: 18 * 60, own: ctx.ownFor(date), extra: ctx.extra }, 3));

  return (
    <section className="cal-card cal-planner" aria-label="Đặt lịch họp">
      <h2>Đặt lịch họp</h2>
      <div className="cal-field">
        <span id="cal-attendees-label">Mời ai</span>
        <div className="cal-chips" role="group" aria-labelledby="cal-attendees-label">
          {PEOPLE.map((p) => <ChipButton key={p.id} aria-pressed={ids.includes(p.id)} onClick={() => toggle(p.id)}>{p.name}</ChipButton>)}
        </div>
      </div>
      <div className="cal-field-row">
        <div className="cal-field">
          <span id="cal-duration-label">Thời lượng</span>
          <SegmentedControl aria-labelledby="cal-duration-label" size="s" options={DURATIONS.map((d) => ({ value: String(d), label: fmtDuration(d) }))} value={String(duration)} onValueChange={(v) => { setDuration(Number(v)); setSlots(null); }} />
        </div>
        <label className="cal-field"><span>Ngày</span>
          <Input size="m" variant="fill" type="date" value={date} onChange={(e) => { if (e.target.value) { setDate(e.target.value); setSlots(null); } }} />
        </label>
      </div>
      <Button variant="primary" size="m" icon={<MagnifyingGlass size={16} />} disabled={!ids.length} onClick={search}>Tìm giờ mọi người cùng rảnh</Button>
      {slots && (
        <div className="cal-slots" role="status">
          {slots.length === 0 ? <p className="cal-warn">Không tìm được giờ chung trong ngày này. Thử ngày khác hoặc bớt người.</p>
            : slots.map((s) => (
              <SlotLine key={s.start} slot={s} date={date} title={title} guestIds={ids} label="Đặt lịch"
                onBook={() => ctx.onBook({ title, date, start: s.start, end: s.end, roomId: s.room?.id, guestIds: ids })} />
            ))}
        </div>
      )}
    </section>
  );
}
