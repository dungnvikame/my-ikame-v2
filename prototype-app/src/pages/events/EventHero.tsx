import { CalendarPlus, Clock, MapPin, Users } from '@phosphor-icons/react';
import { Button, StatusPill } from '../../components/UI';
import type { EventItem } from '../../types';
import { capacityInfo, ParticipantAvatars } from './EventCardV2';
import { EventCountdown } from './EventCountdown';

export type EventHeroAction = { label: string; onClick: () => void; disabled?: boolean };

type EventHeroProps = { event: EventItem; primaryAction?: EventHeroAction };

/** Hero block shared by EventsPage (featured/nearest event) and EventDetailPage. */
export function EventHero({ event, primaryAction }: EventHeroProps) {
  const capacity = capacityInfo(event);
  const cancelled = event.status === 'cancelled';
  return (
    <section className="events-v2-hero">
      <div className="events-v2-hero-cover" aria-hidden="true"><span>🎯</span></div>
      <div className="events-v2-hero-body">
        <div className="card-badges">
          <StatusPill>{event.format}</StatusPill>
          {event.featured && <StatusPill tone="info">Sự kiện nổi bật</StatusPill>}
        </div>
        <h2>{event.title}</h2>
        <p>{event.summary}</p>
        <div className="event-meta">
          <span><Clock size={16} /> {event.dateLabel} · {event.time}</span>
          <span><MapPin size={16} /> {event.location}</span>
        </div>
        <EventCountdown startsAt={event.startsAt} cancelled={cancelled} />
        <ParticipantAvatars names={event.participantNames} />
        {capacity && <p className="events-v2-hero-capacity"><Users size={16} /> {capacity.label}</p>}
        {primaryAction && (
          <Button variant="primary" icon={<CalendarPlus size={17} />} onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
            {primaryAction.label}
          </Button>
        )}
      </div>
    </section>
  );
}
