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

function EventGroup({ title, events, highlightedId, cardRefs }: Omit<EventGroupedListProps, 'now'> & { title: string }) {
  if (events.length === 0) return null;
  return (
    <section className="events-v2-group">
      <h2 className="events-v2-group-title">{title}</h2>
      <div className="event-collection">
        {events.map((event) => (
          <EventCardV2
            key={event.id}
            event={event}
            highlighted={highlightedId === event.id}
            cardRef={(element) => { cardRefs.current[event.id] = element; }}
          />
        ))}
      </div>
    </section>
  );
}

/** Splits the "Sắp diễn ra" tab into TUẦN NÀY / SẮP TỚI buckets (spec §Requirements 4). */
export function EventGroupedList({ events, now, highlightedId, cardRefs }: EventGroupedListProps) {
  const thisWeek = events.filter((event) => {
    const date = eventDate(event);
    return date ? isThisWeek(date, now) : false;
  });
  const thisWeekIds = new Set(thisWeek.map((event) => event.id));
  const later = events.filter((event) => !thisWeekIds.has(event.id));
  return (
    <>
      <EventGroup title="TUẦN NÀY" events={thisWeek} highlightedId={highlightedId} cardRefs={cardRefs} />
      <EventGroup title="SẮP TỚI" events={later} highlightedId={highlightedId} cardRefs={cardRefs} />
    </>
  );
}
