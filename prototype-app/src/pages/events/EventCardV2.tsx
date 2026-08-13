import { CalendarDots, Clock, MapPin } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { StatusPill } from '../../components/UI';
import type { EventItem } from '../../types';
import { eventCoverPalette, eventEmoji } from './event-visuals';

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

/** "Trà My +30 người tham gia" social-proof line — owner reference. Uses real registered
 *  headcount (capacity - remaining) when available, else falls back to the named sample. */
export function ParticipantSummary({ event }: { event: EventItem }) {
  const names = event.participantNames;
  if (!names || names.length === 0) return null;
  const capacity = capacityInfo(event);
  const extra = Math.max((capacity?.registered ?? names.length) - 1, 0);
  return (
    <span className="events-v2-participant-summary">
      {names[0]}{extra > 0 ? ` +${extra} người tham gia` : ' đã tham gia'}
    </span>
  );
}

/**
 * Rounded gradient tile with an emoji — the no-photo "cover" used by hero/card. Plain (no
 * `children`) it's a small decorative art tile; the hero passes `children` to overlay real
 * title/countdown/CTA content on top of the same gradient + radial glow treatment.
 */
export function EventCoverTile({ event, className = '', children }: { event: EventItem; className?: string; children?: ReactNode }) {
  return (
    <div className={`events-v2-cover events-v2-cover--${eventCoverPalette(event)} ${className}`}>
      <span className="events-v2-cover-emoji" aria-hidden="true">{eventEmoji(event)}</span>
      {children}
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

/** Upgraded event card — gradient emoji cover tile, avatars + social-proof line, capacity bar. */
export function EventCardV2({ event, highlighted = false, cardRef }: EventCardV2Props) {
  const capacity = capacityInfo(event);
  const isDimmed = event.status === 'past' || event.status === 'cancelled';
  return (
    <article
      ref={cardRef}
      className={`content-card event-card events-v2-card ${isDimmed ? 'is-past' : ''} ${highlighted ? 'is-highlighted' : ''}`}
    >
      <EventCoverTile event={event} className="events-v2-card-cover" />
      <div className="card-body">
        <div className="card-badges">
          <StatusPill tone={registrationTone(event)}>{registrationLabel(event)}</StatusPill>
          <StatusPill>{event.format}</StatusPill>
          {event.closingSoon && event.status === 'open' && <StatusPill tone="warning">Sắp hết hạn đăng ký</StatusPill>}
        </div>
        <h3><Link to={`/events/${event.id}`}>{event.title}</Link></h3>
        <div className="event-meta">
          <span><CalendarDots size={16} /> {event.dateLabel}</span>
          <span><Clock size={16} /> {event.time}</span>
          <span><MapPin size={16} /> {event.location}</span>
        </div>
        <div className="events-v2-card-footer">
          <div className="events-v2-card-footer-left">
            <ParticipantAvatars names={event.participantNames} />
            <ParticipantSummary event={event} />
          </div>
          <div className="events-v2-card-footer-right">
            {capacity && (
              <div className="events-v2-capacity" aria-label={capacity.label}>
                <div className="events-v2-capacity-bar"><span style={{ width: `${capacity.ratio * 100}%` }} /></div>
                <small>{capacity.label}</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
