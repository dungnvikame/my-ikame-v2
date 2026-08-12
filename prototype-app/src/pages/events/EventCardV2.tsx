import { Clock, MapPin } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { StatusPill } from '../../components/UI';
import type { EventItem } from '../../types';

export type CapacityInfo = { registered: number; capacity: number; ratio: number; label: string };

/** Shared by hero + card: `31/60 chỗ`, bar ratio = (capacity-remaining)/capacity. */
export function capacityInfo(event: EventItem): CapacityInfo | undefined {
  if (typeof event.capacity !== 'number') return undefined;
  const remaining = event.remaining ?? 0;
  const registered = Math.max(0, event.capacity - remaining);
  const ratio = event.capacity > 0 ? Math.min(1, registered / event.capacity) : 0;
  return { registered, capacity: event.capacity, ratio, label: `${registered}/${event.capacity} chỗ` };
}

/** Initials avatar row (max 5 + "+N") — reused by hero, card, and the detail participants section. */
export function ParticipantAvatars({ names, max = 5 }: { names?: string[]; max?: number }) {
  if (!names || names.length === 0) return null;
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="events-v2-avatars" aria-label={`${names.length} người tham gia`}>
      {shown.map((name, index) => <span key={`${name}-${index}`} className="avatar events-v2-avatar">{name.charAt(0)}</span>)}
      {extra > 0 && <span className="avatar events-v2-avatar events-v2-avatar--more">+{extra}</span>}
    </div>
  );
}

function registrationTone(event: EventItem): 'success' | 'info' | 'warning' | 'error' | 'neutral' {
  if (event.status === 'cancelled') return 'error';
  if (event.myRegistration === 'going') return 'success';
  if (event.myRegistration === 'waitlisted') return 'info';
  if (event.status === 'full') return 'warning';
  return 'neutral';
}

function registrationLabel(event: EventItem): string {
  if (event.status === 'cancelled') return 'Đã hủy';
  if (event.myRegistration === 'going') return 'Đã đăng ký';
  if (event.myRegistration === 'waitlisted') return 'Đang chờ';
  if (event.status === 'full') return 'Hết chỗ';
  if (event.status === 'past') return 'Đã kết thúc';
  return 'Mở đăng ký';
}

type EventCardV2Props = {
  event: EventItem;
  highlighted?: boolean;
  cardRef?: (element: HTMLElement | null) => void;
};

/** Upgraded event card — date block, avatars, capacity bar, registration + closingSoon pills. */
export function EventCardV2({ event, highlighted = false, cardRef }: EventCardV2Props) {
  const capacity = capacityInfo(event);
  const isDimmed = event.status === 'past' || event.status === 'cancelled';
  return (
    <article
      ref={cardRef}
      className={`content-card event-card events-v2-card ${isDimmed ? 'is-past' : ''} ${highlighted ? 'is-highlighted' : ''}`}
    >
      <div className="event-date" aria-label={event.dateLabel}><span>{event.month}</span><strong>{event.day}</strong></div>
      <div className="card-body">
        <div className="card-badges">
          <StatusPill tone={registrationTone(event)}>{registrationLabel(event)}</StatusPill>
          <StatusPill>{event.format}</StatusPill>
          {event.closingSoon && event.status === 'open' && <StatusPill tone="warning">Sắp hết hạn đăng ký</StatusPill>}
        </div>
        <h3><Link to={`/events/${event.id}`}>{event.title}</Link></h3>
        <div className="event-meta">
          <span><Clock size={16} /> {event.time}</span>
          <span><MapPin size={16} /> {event.location}</span>
        </div>
        <ParticipantAvatars names={event.participantNames} />
        {capacity && (
          <div className="events-v2-capacity" aria-label={capacity.label}>
            <div className="events-v2-capacity-bar"><span style={{ width: `${capacity.ratio * 100}%` }} /></div>
            <small>{capacity.label}</small>
          </div>
        )}
      </div>
    </article>
  );
}
