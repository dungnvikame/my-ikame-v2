import { useMemo } from 'react';
import type { EventItem } from '../../types';
import { daysInMonth, eventDate, monthKey, monthLabel, monthsFrom } from './event-dates';

// Emoji dots — override by event id for flavor, else derive from format (spec §Requirements 2).
const EMOJI_BY_ID: Record<string, string> = {
  'iconnect-2026-08': '📣',
  'ai-product-workshop': '🤖',
  'design-sprint-full': '🎨',
  'running-club': '🏃',
  'security-briefing-cancelled': '⚠️',
  'town-hall-q2': '🏛️',
  'global-webinar-us': '🌍',
  'finance-town-hall': '💰',
  'hackathon-2026-09': '🚀',
  'wellness-day-09': '🧘',
  'town-hall-q3': '🏛️',
  'year-end-teaser': '🎉',
};
const EMOJI_BY_FORMAT: Record<EventItem['format'], string> = { 'Trực tiếp': '🎯', Online: '💻', Hybrid: '🌐' };

function formatEmoji(event: EventItem): string {
  return EMOJI_BY_ID[event.id] ?? EMOJI_BY_FORMAT[event.format] ?? '📅';
}

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

/** Computed insight — never a hardcoded month; must stay true even if fixtures change. */
function computeInsight(columns: MonthColumn[]): string | undefined {
  const withEvents = columns.filter((column) => column.monthEvents.length > 0);
  if (withEvents.length === 0) return undefined;
  const densest = withEvents.reduce((max, current) => (current.monthEvents.length > max.monthEvents.length ? current : max));
  return `${densest.label} dày nhất với ${densest.monthEvents.length} sự kiện`;
}

type EventTimelineProps = { events: EventItem[]; now?: Date; onSelectEvent: (id: string) => void };

/** 6-month horizontally-scrollable strip with HÔM NAY marker + emoji dots (click → scroll to card). */
export function EventTimeline({ events, now = new Date(), onSelectEvent }: EventTimelineProps) {
  const columns = useMemo(() => buildColumns(events, now), [events, now]);
  const insight = useMemo(() => computeInsight(columns), [columns]);

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
                  className="events-v2-timeline-dot"
                  title={event.title}
                  aria-label={event.title}
                  onClick={() => onSelectEvent(event.id)}
                >
                  {formatEmoji(event)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {insight && <p className="events-v2-timeline-insight">{insight}</p>}
    </section>
  );
}
