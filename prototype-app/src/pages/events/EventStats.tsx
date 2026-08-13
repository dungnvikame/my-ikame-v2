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
        <span className="events-v2-stat-icon events-v2-stat-icon--blue"><CalendarDots size={20} weight="duotone" /></span>
        <div className="events-v2-stat-copy">
          <strong>{thisMonthCount}</strong>
          <span>Sự kiện tháng này</span>
        </div>
      </article>
      <article className="events-v2-stat-card">
        <span className="events-v2-stat-icon events-v2-stat-icon--emerald"><CheckCircle size={20} weight="duotone" /></span>
        <div className="events-v2-stat-copy">
          <strong>{goingCount}</strong>
          <span>Bạn sẽ tham gia</span>
          {goingCount === 0 && <small className="events-v2-stat-helper events-v2-stat-helper--accent">Chọn 1 hoạt động bên dưới nhé!</small>}
        </div>
      </article>
      <article className="events-v2-stat-card">
        <span className="events-v2-stat-icon events-v2-stat-icon--amber"><HourglassMedium size={20} weight="duotone" /></span>
        <div className="events-v2-stat-copy">
          <strong>{closingSoon.length}</strong>
          <span>Sắp hết hạn đăng ký</span>
          {closingSoon.length > 0 && closingSoon[0]?.registrationDeadlineLabel && (
            <small className="events-v2-stat-helper events-v2-stat-helper--danger">{closingSoon[0].registrationDeadlineLabel}</small>
          )}
        </div>
      </article>
    </div>
  );
}
