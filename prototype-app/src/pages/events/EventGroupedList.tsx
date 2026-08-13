import type { MutableRefObject } from 'react';
import type { EventItem } from '../../types';
import { EventCardV2 } from './EventCardV2';
import { eventDate, isThisWeek } from './event-dates';

type EventGroupedListProps = {
  events: EventItem[];
  now: Date;
  highlightedId?: string;
  cardRefs: MutableRefObject<Record<string, HTMLElement | null>>;
};

/** Single-column rows on a left "rail" (line + dot per row) — owner reference feel. */
function EventGroup({ title, events, highlightedId, cardRefs }: Omit<EventGroupedListProps, 'now'> & { title: string }) {
  if (events.length === 0) return null;
  return (
    <section className="events-v2-group">
      <h2 className="events-v2-group-title">{title}</h2>
      <div className="events-v2-list">
        {events.map((event) => (
          <div key={event.id} className="events-v2-list-row">
            <span className="events-v2-list-dot" aria-hidden="true" />
            <EventCardV2
              event={event}
              highlighted={highlightedId === event.id}
              cardRef={(element) => { cardRefs.current[event.id] = element; }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Sự kiện đã hủy chìm xuống cuối nhóm — không chen giữa các sự kiện còn hiệu lực. */
function sinkCancelled(list: EventItem[]): EventItem[] {
  return [...list].sort((a, b) => Number(a.status === 'cancelled') - Number(b.status === 'cancelled'));
}

/** Splits the "Sắp diễn ra" tab into TUẦN NÀY / SẮP TỚI buckets (spec §Requirements 4). */
export function EventGroupedList({ events, now, highlightedId, cardRefs }: EventGroupedListProps) {
  const thisWeek = sinkCancelled(events.filter((event) => {
    const date = eventDate(event);
    return date ? isThisWeek(date, now) : false;
  }));
  const thisWeekIds = new Set(thisWeek.map((event) => event.id));
  const later = sinkCancelled(events.filter((event) => !thisWeekIds.has(event.id)));
  return (
    <>
      <EventGroup title="TUẦN NÀY" events={thisWeek} highlightedId={highlightedId} cardRefs={cardRefs} />
      <EventGroup title="SẮP TỚI" events={later} highlightedId={highlightedId} cardRefs={cardRefs} />
    </>
  );
}
