import type { EventItem, EventRegistration } from '../../types';
import { LIVE_WINDOW_MS } from './EventCountdown';
import type { EventHeroAction } from './EventHero';
import { eventDate } from './event-dates';

export type EventTab = 'upcoming' | 'live' | 'past' | 'mine';
export const TAB_LABELS: Record<EventTab, string> = {
  upcoming: 'Sắp diễn ra', live: 'Đang diễn ra', past: 'Đã diễn ra', mine: 'Của tôi',
};

export function eventState(event: EventItem, now: Date): 'upcoming' | 'live' | 'past' | 'cancelled' {
  if (event.status === 'cancelled') return 'cancelled';
  if (event.status === 'past') return 'past';
  const date = eventDate(event);
  if (!date) return 'upcoming';
  const diff = date.getTime() - now.getTime();
  if (diff > 0) return 'upcoming';
  return diff > -LIVE_WINDOW_MS ? 'live' : 'past';
}

export function matchesTab(event: EventItem, tab: EventTab, now: Date): boolean {
  if (tab === 'mine') return event.myRegistration === 'going' || event.myRegistration === 'waitlisted';
  const state = eventState(event, now);
  if (tab === 'upcoming') return state === 'upcoming' || state === 'cancelled';
  if (tab === 'live') return state === 'live';
  return state === 'past';
}

export function nearestUpcoming(events: EventItem[], now: Date): EventItem | undefined {
  const upcoming = events.filter((event) => eventState(event, now) === 'upcoming');
  return [...upcoming].sort((a, b) => (eventDate(a)?.getTime() ?? Infinity) - (eventDate(b)?.getTime() ?? Infinity))[0];
}

/** Wraps `setEventRegistration` for the hero's primary CTA — no new RSVP logic (preserve v1 machine). */
export function heroPrimaryAction(event: EventItem, setEventRegistration: (id: string, next: EventRegistration) => void): EventHeroAction | undefined {
  if (event.status === 'cancelled' || event.status === 'past') return undefined;
  if (event.myRegistration === 'going') return { label: 'Đã đăng ký', onClick: () => undefined, disabled: true };
  if (event.myRegistration === 'waitlisted') return { label: 'Đang ở danh sách chờ', onClick: () => undefined, disabled: true };
  if (event.status === 'full') {
    return event.waitlistEnabled
      ? { label: 'Vào danh sách chờ', onClick: () => setEventRegistration(event.id, 'waitlisted') }
      : { label: 'Đã hết chỗ', onClick: () => undefined, disabled: true };
  }
  return { label: 'Đăng ký tham gia', onClick: () => setEventRegistration(event.id, 'going') };
}

/** 2-3 other upcoming events: same format preferred, else nearest by date. Excludes cancelled/past. */
export function relatedEvents(current: EventItem, pool: EventItem[], now: Date): EventItem[] {
  const candidates = pool.filter((event) => event.id !== current.id && event.status !== 'cancelled' && event.status !== 'past');
  const sameFormat = candidates.filter((event) => event.format === current.format);
  const source = sameFormat.length >= 2 ? sameFormat : candidates;
  return [...source]
    .sort((a, b) => Math.abs((eventDate(a)?.getTime() ?? Infinity) - now.getTime()) - Math.abs((eventDate(b)?.getTime() ?? Infinity) - now.getTime()))
    .slice(0, 3);
}
