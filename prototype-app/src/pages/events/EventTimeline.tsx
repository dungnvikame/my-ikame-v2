import { useMemo } from 'react';
import type { EventItem } from '../../types';
import { daysInMonth, daysUntil, eventDate, monthKey, monthLabel, monthsFrom } from './event-dates';
import { eventCoverPalette, eventEmoji } from './event-visuals';

type MonthColumn = { key: string; label: string; isCurrent: boolean; todayLeftPct: number; monthEvents: EventItem[] };

function buildColumns(events: EventItem[], now: Date): MonthColumn[] {
  const nowKey = monthKey(now);
  return monthsFrom(6, now).map((month) => {
    const key = monthKey(month);
    const monthEvents = events.filter((event) => {
      const date = eventDate(event);
      return date ? monthKey(date) === key : false;
    });
    return { key, label: monthLabel(month), isCurrent: key === nowKey, todayLeftPct: (now.getDate() / daysInMonth(now)) * 100, monthEvents };
  });
}

/** 3 computed clauses (nearest/densest/total) — never hardcoded, must stay true if fixtures change. */
function computeInsights(events: EventItem[], columns: MonthColumn[], now: Date): string[] {
  const insights: string[] = [];
  const upcoming = events.filter((event) => {
    const date = eventDate(event);
    return date && date.getTime() >= now.getTime() && event.status !== 'cancelled' && event.status !== 'past';
  });
  const nearest = [...upcoming].sort((a, b) => eventDate(a)!.getTime() - eventDate(b)!.getTime())[0];
  if (nearest) insights.push(`⏳ Gần nhất: ${nearest.title} — còn ${daysUntil(eventDate(nearest)!, now)} ngày`);

  const withEvents = columns.filter((column) => column.monthEvents.length > 0);
  if (withEvents.length > 0) {
    const densest = withEvents.reduce((max, current) => (current.monthEvents.length > max.monthEvents.length ? current : max));
    if (densest.monthEvents.length > 1) insights.push(`🔥 ${densest.label} dày nhất với ${densest.monthEvents.length} sự kiện`);
  }

  const total = columns.reduce((sum, column) => sum + column.monthEvents.length, 0);
  if (total > 0) insights.push(`${total} sự kiện trong 6 tháng tới`);
  return insights;
}

type EventTimelineProps = { events: EventItem[]; now?: Date; onSelectEvent: (id: string) => void };

/** 6-month horizontally-scrollable strip with HÔM NAY marker + emoji dots (click → scroll to card). */
export function EventTimeline({ events, now = new Date(), onSelectEvent }: EventTimelineProps) {
  const columns = useMemo(() => buildColumns(events, now), [events, now]);
  const insights = useMemo(() => computeInsights(events, columns, now), [events, columns, now]);

  return (
    <section className="events-v2-timeline" aria-label="Dòng thời gian sự kiện 6 tháng">
      <div className="events-v2-timeline-track">
        {columns.map((column) => (
          <div key={column.key} className={`events-v2-timeline-month ${column.isCurrent ? 'is-current' : ''}`}>
            <span className="events-v2-timeline-label">{column.label}</span>
            {column.isCurrent && (
              <span className="events-v2-timeline-today" style={{ left: `${column.todayLeftPct}%` }}>HÔM NAY</span>
            )}
            <div className="events-v2-timeline-dots">
              {column.monthEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={`events-v2-timeline-dot events-v2-timeline-dot--${eventCoverPalette(event)}`}
                  title={event.title}
                  aria-label={event.title}
                  onClick={() => onSelectEvent(event.id)}
                >
                  {eventEmoji(event)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {insights.length > 0 && <p className="events-v2-timeline-insight">{insights.join(' · ')}</p>}
    </section>
  );
}
