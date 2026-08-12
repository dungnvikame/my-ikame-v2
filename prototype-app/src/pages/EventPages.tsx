import { ArrowLeft, CheckCircle, Clock, MapPin, Users } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { EmptyState, SectionHeader } from '../components/UI';
import { isEligible } from '../lib/audience';
import { buildIcs, downloadIcs } from '../lib/ics';
import type { EventRegistration } from '../types';
import { EventAgenda, EventParticipants } from './events/EventAgenda';
import { EventCardV2 } from './events/EventCardV2';
import { eventTimeRange, formatInTz } from './events/event-dates';
import { EventGroupedList } from './events/EventGroupedList';
import { EventHero } from './events/EventHero';
import { EventRsvpPanel } from './events/EventRsvpPanel';
import { EventStats } from './events/EventStats';
import { EventTimeline } from './events/EventTimeline';
import { heroPrimaryAction, matchesTab, nearestUpcoming, relatedEvents, TAB_LABELS, type EventTab } from './events/event-tab-logic';

export function EventsPage() {
  const { events, user, setEventRegistration } = useAppState();
  const [tab, setTab] = useState<EventTab>('upcoming');
  const [highlightedId, setHighlightedId] = useState<string>();
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const now = new Date();
  const eligible = events.filter((event) => isEligible(user, event.audienceTeamIds));
  const heroEvent = eligible.find((event) => event.featured) ?? nearestUpcoming(eligible, now);
  const filtered = eligible.filter((event) => matchesTab(event, tab, now));

  const handleSelectEvent = (id: string) => {
    const element = cardRefs.current[id];
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    setHighlightedId(id);
    window.setTimeout(() => setHighlightedId((current) => (current === id ? undefined : current)), 1600);
  };

  return (
    <div className="page collection-page events-v2-page">
      <header className="page-heading">
        <div><p className="eyebrow">CẦN THAM GIA</p><h1>Sự kiện</h1><p>Khám phá hoạt động phù hợp và quản lý lịch tham gia của bạn.</p></div>
      </header>
      {heroEvent && (
        <EventHero
          event={heroEvent}
          primaryAction={heroPrimaryAction(heroEvent, setEventRegistration)}
          detailHref={`/events/${heroEvent.id}`}
        />
      )}
      <EventStats events={eligible} now={now} />
      <EventTimeline events={eligible} now={now} onSelectEvent={handleSelectEvent} />
      <div className="collection-toolbar">
        <div className="events-v2-tabs" role="tablist" aria-label="Lọc sự kiện">
          {(Object.keys(TAB_LABELS) as EventTab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`events-v2-tab ${tab === key ? 'is-active' : ''}`}
              onClick={() => setTab(key)}
            >
              {key === 'live' && <span className="events-v2-tab-dot" aria-hidden="true" />}
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>
        <span className="timezone-note"><Clock size={16} />Múi giờ hiển thị: {user.timezone}</span>
      </div>
      {filtered.length ? (
        tab === 'upcoming' ? (
          <EventGroupedList events={filtered} now={now} highlightedId={highlightedId} cardRefs={cardRefs} />
        ) : (
          <section>
            <SectionHeader title={TAB_LABELS[tab]} meta={`${filtered.length} sự kiện`} />
            <div className="event-collection">
              {filtered.map((event) => (
                <EventCardV2
                  key={event.id}
                  event={event}
                  highlighted={highlightedId === event.id}
                  cardRef={(element) => { cardRefs.current[event.id] = element; }}
                />
              ))}
            </div>
          </section>
        )
      ) : (
        <EmptyState title="Chưa có sự kiện trong mục này" body="Sự kiện mới sẽ xuất hiện khi phù hợp với audience của bạn." />
      )}
    </div>
  );
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
  const related = relatedEvents(event, events.filter((item) => isEligible(user, item.audienceTeamIds)), new Date());

  return (
    <div className="page detail-page">
      <Link className="back-link" to="/events"><ArrowLeft size={17} />Quay lại Sự kiện</Link>
      <EventHero event={event} />

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
            {event.joinUrl && (event.myRegistration === 'going'
              ? <p><a href={event.joinUrl} target="_blank" rel="noreferrer">Link tham gia: {event.joinUrl}</a></p>
              : <p className="muted-text">Link tham gia sẽ hiển thị sau khi bạn đăng ký.</p>)}
          </section>
          <EventAgenda agenda={event.agenda} />
          <EventParticipants names={event.participantNames} />
          {related.length > 0 && (
            <section className="article-body events-v2-related">
              <h2>Sự kiện liên quan</h2>
              <div className="event-collection">{related.map((item) => <EventCardV2 key={item.id} event={item} />)}</div>
            </section>
          )}
        </article>

        <aside className="action-rail">
          <div className={`rsvp-panel ${event.myRegistration === 'going' ? 'is-complete' : ''}`}>
            <EventRsvpPanel
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
