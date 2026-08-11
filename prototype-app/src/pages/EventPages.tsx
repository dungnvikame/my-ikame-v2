import { ArrowLeft, CalendarPlus, CheckCircle, Clock, HourglassMedium, MapPin, Users, WarningCircle, XCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { EventCard } from '../components/ContentCards';
import { Button, EmptyState, SectionHeader, StatusPill } from '../components/UI';
import { isEligible } from '../lib/audience';
import { buildIcs, downloadIcs } from '../lib/ics';
import type { EventItem, EventRegistration } from '../types';

type EventTab = 'upcoming' | 'registered' | 'past';
const TAB_LABELS: Record<EventTab, string> = { upcoming: 'Sắp tới', registered: 'Đã đăng ký', past: 'Đã qua' };

function matchesTab(event: EventItem, tab: EventTab): boolean {
  if (tab === 'registered') return event.myRegistration === 'going' || event.myRegistration === 'waitlisted';
  if (tab === 'past') return event.status === 'past';
  return event.status !== 'past';
}

// Mock fixtures only carry display strings (day/month/time), not ISO instants — Phase 1's data
// model has no startsAt/endsAt field. We treat those strings as Vietnam wall-clock (fixed UTC+7,
// no DST) to derive a real instant — enough to demo cross-timezone rendering and .ics export.
// Known limitation: not a substitute for a real ISO timestamp field.
const EVENT_YEAR = 2026;
const VN_UTC_OFFSET_HOURS = 7;
const monthNumber = (month: string) => Number(month.match(/(\d+)/)?.[1] ?? 1);
const vnWallClockToUtc = (day: number, month: number, hour: number, minute: number) =>
  new Date(Date.UTC(EVENT_YEAR, month - 1, day, hour - VN_UTC_OFFSET_HOURS, minute));

function eventTimeRange(event: EventItem): { start: Date; end: Date } {
  const [s, e] = [...event.time.matchAll(/(\d{1,2}):(\d{2})/g)];
  const [sh, sm] = [Number(s?.[1] ?? 0), Number(s?.[2] ?? 0)];
  const [eh, em] = [Number(e?.[1] ?? sh), Number(e?.[2] ?? sm)];
  const [day, month] = [Number(event.day), monthNumber(event.month)];
  return { start: vnWallClockToUtc(day, month, sh, sm), end: vnWallClockToUtc(day, month, eh, em) };
}

const formatInTz = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short', timeZone: timezone }).format(date);

export function EventsPage() {
  const { events, user } = useAppState();
  const [tab, setTab] = useState<EventTab>('upcoming');
  const eligible = events.filter((event) => isEligible(user, event.audienceTeamIds));
  const filtered = eligible.filter((event) => matchesTab(event, tab));
  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div><p className="eyebrow">CẦN THAM GIA</p><h1>Sự kiện</h1><p>Khám phá hoạt động phù hợp và quản lý lịch tham gia của bạn.</p></div>
      </header>
      <div className="collection-toolbar">
        <div className="neutral-tabs" role="tablist" aria-label="Lọc sự kiện">
          {(Object.keys(TAB_LABELS) as EventTab[]).map((key) => (
            <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>{TAB_LABELS[key]}</button>
          ))}
        </div>
        <span className="timezone-note"><Clock size={16} />Múi giờ hiển thị: {user.timezone}</span>
      </div>
      {filtered.length ? (
        <section>
          <SectionHeader title={tab === 'registered' ? 'Lịch của bạn' : 'Sự kiện phù hợp với bạn'} meta={`${filtered.length} sự kiện`} />
          <div className="event-collection">{filtered.map((event) => <EventCard key={event.id} event={event} />)}</div>
        </section>
      ) : (
        <EmptyState title="Chưa có sự kiện trong mục này" body="Sự kiện mới sẽ xuất hiện khi phù hợp với audience của bạn." />
      )}
    </div>
  );
}

type RsvpPanelProps = {
  event: EventItem;
  confirmingCancel: boolean;
  onCancelStart: () => void;
  onCancelDismiss: () => void;
  onRsvp: (next: EventRegistration, message: string) => void;
  onAddToCalendar: () => void;
};

/** Renders the icon/heading/copy/CTA block for the RSVP state matrix (open/full/waitlist/going/cancelled/past). */
function RsvpPanelBody({ event, confirmingCancel, onCancelStart, onCancelDismiss, onRsvp, onAddToCalendar }: RsvpPanelProps) {
  const { myRegistration, status } = event;
  if (status === 'cancelled') return <><XCircle size={28} weight="duotone" /><h2>Sự kiện đã bị hủy</h2><p>Vui lòng theo dõi thông báo mới từ ban tổ chức.</p></>;
  if (status === 'past') return myRegistration === 'going'
    ? <><CheckCircle size={28} weight="duotone" /><h2>Đã tham gia</h2><p>Cảm ơn bạn đã tham gia sự kiện này.</p></>
    : <><Clock size={28} weight="duotone" /><h2 className="muted-text">Đã kết thúc</h2><p>Sự kiện đã kết thúc và không còn nhận đăng ký.</p></>;
  if (myRegistration === 'going') return (
    <>
      <CheckCircle size={28} weight="duotone" /><h2>Bạn sẽ tham gia</h2><p>My iKame sẽ nhắc bạn trước sự kiện một ngày.</p>
      {confirmingCancel ? (
        <>
          <p>Bạn có chắc muốn hủy đăng ký?</p>
          <Button variant="danger" onClick={() => onRsvp('not_registered', 'Đã hủy đăng ký. Lịch của bạn đã được cập nhật.')}>Xác nhận hủy</Button>
          <Button variant="borderless" onClick={onCancelDismiss}>Không, giữ đăng ký</Button>
        </>
      ) : (
        <>
          <Button variant="dim" onClick={onCancelStart}>Hủy đăng ký</Button>
          <Button variant="borderless" icon={<CalendarPlus size={17} />} onClick={onAddToCalendar}>Thêm vào lịch</Button>
        </>
      )}
    </>
  );
  if (myRegistration === 'waitlisted') return (
    <>
      <HourglassMedium size={28} weight="duotone" /><h2>Bạn đang ở danh sách chờ</h2><p>Vị trí sẽ được thông báo khi có chỗ trống.</p>
      <Button variant="dim" onClick={() => onRsvp('not_registered', 'Đã rời danh sách chờ.')}>Rời danh sách chờ</Button>
    </>
  );
  if (status === 'full') return (
    <>
      <WarningCircle size={28} weight="duotone" /><h2>Sự kiện đã đủ chỗ</h2>
      <p>{event.waitlistEnabled ? 'Bạn có thể vào danh sách chờ để được thông báo khi có chỗ trống.' : 'Vui lòng quay lại sau nếu có chỗ trống.'}</p>
      {event.waitlistEnabled
        ? <Button variant="primary" onClick={() => onRsvp('waitlisted', 'Đã vào danh sách chờ.')}>Vào danh sách chờ</Button>
        : <Button variant="primary" disabled>Đăng ký tham gia</Button>}
    </>
  );
  return <><CalendarPlus size={28} weight="duotone" /><h2>Tham gia sự kiện</h2><p>Đăng ký mất chưa đến một phút.</p><Button variant="primary" onClick={() => onRsvp('going', 'Đăng ký thành công. Bạn có thể thêm sự kiện vào lịch.')}>Đăng ký tham gia</Button></>;
}

export function EventDetailPage() {
  const { eventId } = useParams();
  const { events, user, setEventRegistration } = useAppState();
  const event = events.find((item) => item.id === eventId);
  const [receipt, setReceipt] = useState('');
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [pending, setPending] = useState(false);
  if (!event) return <Navigate to="/not-found" replace />;
  if (!isEligible(user, event.audienceTeamIds)) return <Navigate to="/forbidden" replace />;
  const { start, end } = eventTimeRange(event);
  const userTimeLabel = formatInTz(start, user.timezone);
  const eventTimeLabel = formatInTz(start, event.timezone);
  const showEventTz = user.timezone !== event.timezone;
  const handleRsvp = (next: EventRegistration, message: string) => {
    if (pending) return; // synchronous double-click guard — no server round-trip to await
    setPending(true);
    setEventRegistration(event.id, next);
    setReceipt(message);
    setConfirmingCancel(false);
    setPending(false);
  };
  const handleAddToCalendar = () =>
    downloadIcs(`${event.id}.ics`, buildIcs({ uid: event.id, title: event.title, description: event.summary, location: event.location, startsAt: start, endsAt: end }));
  const badgeTone = event.status === 'cancelled' ? 'error' : event.myRegistration === 'going' ? 'success' : event.status === 'full' ? 'warning' : event.myRegistration === 'waitlisted' ? 'info' : 'neutral';
  const badgeLabel = event.status === 'cancelled' ? 'Đã hủy' : event.myRegistration === 'going' ? 'Đã đăng ký' : event.myRegistration === 'waitlisted' ? 'Đang chờ' : event.status === 'full' ? 'Hết chỗ' : 'Mở đăng ký';
  return (
    <div className="page detail-page">
      <Link className="back-link" to="/events"><ArrowLeft size={17} />Quay lại Sự kiện</Link>
      <div className="event-detail-hero">
        <div className="event-detail-date"><span>{event.month}</span><strong>{event.day}</strong></div>
        <div className="event-detail-heading">
          <div className="card-badges"><StatusPill tone={badgeTone}>{badgeLabel}</StatusPill><StatusPill>{event.format}</StatusPill></div>
          <h1>{event.title}</h1>
          <p>{event.summary}</p>
          <span>Được tổ chức bởi {event.organizer}</span>
        </div>
      </div>

      <div className="detail-layout">
        <article className="event-info-card">
          <section className="event-facts">
            <div>
              <span className="fact-icon"><Clock size={20} /></span>
              <span><small>Thời gian</small><strong>{userTimeLabel}</strong>{showEventTz && <p>Giờ gốc sự kiện: {eventTimeLabel} ({event.timezone})</p>}</span>
            </div>
            <div><span className="fact-icon"><MapPin size={20} /></span><span><small>Địa điểm</small><strong>{event.location}</strong><p>Vui lòng có mặt trước 10 phút</p></span></div>
            <div><span className="fact-icon"><Users size={20} /></span><span><small>Đối tượng</small><strong>Toàn bộ iKamer</strong><p>Phù hợp với bạn theo audience sự kiện</p></span></div>
          </section>
          <section className="article-body">
            <h2>Về sự kiện</h2>
            <p>{event.summary}</p>
            {typeof event.capacity === 'number' && <p className="muted-text">Còn {event.remaining ?? 0}/{event.capacity} chỗ</p>}
            {event.joinUrl && (event.myRegistration === 'going'
              ? <p><a href={event.joinUrl} target="_blank" rel="noreferrer">Link tham gia: {event.joinUrl}</a></p>
              : <p className="muted-text">Link tham gia sẽ hiển thị sau khi bạn đăng ký.</p>)}
          </section>
        </article>

        <aside className="action-rail">
          <div className={`rsvp-panel ${event.myRegistration === 'going' ? 'is-complete' : ''}`}>
            <RsvpPanelBody
              event={event}
              confirmingCancel={confirmingCancel}
              onCancelStart={() => setConfirmingCancel(true)}
              onCancelDismiss={() => setConfirmingCancel(false)}
              onRsvp={handleRsvp}
              onAddToCalendar={handleAddToCalendar}
            />
            {receipt && <span className="receipt" role="status"><CheckCircle size={16} />{receipt}</span>}
          </div>
          <div className="side-info"><h2>Cần hỗ trợ?</h2><p>Liên hệ {event.organizer} nếu bạn cần hỗ trợ về địa điểm hoặc khả năng tiếp cận.</p></div>
        </aside>
      </div>
    </div>
  );
}
