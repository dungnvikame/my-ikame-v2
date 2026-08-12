import { ArrowRight, CalendarPlus, Clock, MapPin } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button, StatusPill } from '../../components/UI';
import type { EventItem } from '../../types';
import { capacityInfo, EventCoverTile, ParticipantAvatars, ParticipantSummary } from './EventCardV2';
import { EventCountdown } from './EventCountdown';
import { audienceStatusLabel } from './event-visuals';

export type EventHeroAction = { label: string; onClick: () => void; disabled?: boolean };

type EventHeroProps = { event: EventItem; primaryAction?: EventHeroAction; detailHref?: string };

/**
 * Hero block shared by EventsPage (featured/nearest event) and EventDetailPage — one full-bleed
 * gradient cover (no real photos) with a dark overlay for text legibility, boxed countdown, and
 * a social-proof/CTA footer. `detailHref` (list page only) adds the "Chi tiết →" link; the detail
 * page itself never needs it since it's already there.
 */
export function EventHero({ event, primaryAction, detailHref }: EventHeroProps) {
  const capacity = capacityInfo(event);
  const cancelled = event.status === 'cancelled';
  return (
    <section className="events-v2-hero">
      <EventCoverTile event={event} className="events-v2-hero-cover">
        <div className="events-v2-hero-content">
          {event.featured && <p className="events-v2-hero-eyebrow">SỰ KIỆN NỔI BẬT</p>}
          <h2>{event.title}</h2>
          <p className="events-v2-hero-meta">
            <span><Clock size={15} /> {event.dateLabel} · {event.time}</span>
            <span><MapPin size={15} /> {event.location}</span>
          </p>
          <EventCountdown startsAt={event.startsAt} cancelled={cancelled} />
          <div className="events-v2-hero-footer">
            <div className="events-v2-hero-footer-left">
              <ParticipantAvatars names={event.participantNames} />
              <ParticipantSummary event={event} />
            </div>
            <div className="events-v2-hero-footer-right">
              <StatusPill tone={event.myRegistration === 'going' ? 'success' : event.myRegistration === 'waitlisted' ? 'info' : 'neutral'}>
                {audienceStatusLabel(event)}
              </StatusPill>
              {capacity && <span className="events-v2-hero-capacity-text">{capacity.label}</span>}
              {primaryAction && (
                <Button variant="primary" icon={<CalendarPlus size={17} />} onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
                  {primaryAction.label}
                </Button>
              )}
              {detailHref && (
                <Link className="events-v2-hero-detail-link" to={detailHref}>
                  Chi tiết <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </EventCoverTile>
    </section>
  );
}
