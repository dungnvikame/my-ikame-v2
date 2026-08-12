import { CalendarDots, CheckCircle, HourglassMedium } from '@phosphor-icons/react';
import type { EventItem } from '../../types';
import { eventDate, monthKey } from './event-dates';

type EventStatsProps = { events: EventItem[]; now?: Date };

/** 3 live stat cards computed from `events` — never hardcoded counts (spec §Requirements 3). */
export function EventStats({ events, now = new Date() }: EventStatsProps) {
  const currentMonthKey = monthKey(now);
  const thisMonthCount = events.filter((event) => {
    const date = eventDate(event);
    return date ? monthKey(date) === currentMonthKey : false;
  }).length;
  const goingCount = events.filter((event) =>
    event.myRegistration === 'going' && event.status !== 'past' && event.status !== 'cancelled').length;
  const closingSoon = events.filter((event) => event.closingSoon && event.status === 'open');

  return (
    <div className="events-v2-stats">
      <article className="events-v2-stat-card">
        <CalendarDots size={22} weight="duotone" />
        <strong>{thisMonthCount}</strong>
        <span>Sự kiện tháng này</span>
      </article>
      <article className="events-v2-stat-card">
        <CheckCircle size={22} weight="duotone" />
        <strong>{goingCount}</strong>
        <span>Bạn sẽ tham gia</span>
      </article>
      <article className="events-v2-stat-card">
        <HourglassMedium size={22} weight="duotone" />
        <strong>{closingSoon.length}</strong>
        <span>Sắp hết hạn đăng ký</span>
        {closingSoon[0]?.registrationDeadlineLabel && <small>{closingSoon[0].registrationDeadlineLabel}</small>}
      </article>
    </div>
  );
}
