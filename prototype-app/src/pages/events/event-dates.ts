import type { EventItem } from '../../types';

/**
 * Phase-3-owned date helpers for the Events upgrade (hero countdown, 6-month timeline,
 * week grouping). Deliberately duplicated from other phases' local date math — ownership
 * isolation beats DRY here (see plan.md risk assessment).
 */

/** Parses a fixture ISO instant (`startsAt`), tolerating missing/invalid values. */
export function parseStartsAt(startsAt?: string): Date | undefined {
  if (!startsAt) return undefined;
  const date = new Date(startsAt);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function eventDate(event: EventItem): Date | undefined {
  return parseStartsAt(event.startsAt);
}

/** Whole calendar days between `date` and `now` (positive = future). */
export function daysUntil(date: Date, now: Date = new Date()): number {
  const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  return Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);
}

/** `YYYY-MM` key for grouping events into timeline month columns. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Vietnamese month label — never hardcode a specific month string (fixture drift safety). */
export function monthLabel(date: Date): string {
  return `Tháng ${date.getMonth() + 1}`;
}

/** Monday–Sunday window containing `now`; powers the "TUẦN NÀY" grouping. */
export function isThisWeek(date: Date, now: Date = new Date()): boolean {
  const mondayOffset = (now.getDay() + 6) % 7; // Monday = 0
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
  return date >= start && date < end;
}

/** Next `count` months starting at `from`'s month — powers the 6-month timeline strip. */
export function monthsFrom(count: number, from: Date = new Date()): Date[] {
  return Array.from({ length: count }, (_, index) => new Date(from.getFullYear(), from.getMonth() + index, 1));
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

// --- v1 RSVP/.ics timezone helpers (unchanged behavior) ---
// Mock fixtures only carry display strings (day/month/time) for the RSVP timezone demo — the
// data model carries startsAt separately for the countdown/timeline. We treat day/month/time as
// Vietnam wall-clock (fixed UTC+7, no DST) to derive a real instant for .ics export.
const EVENT_YEAR = 2026;
const VN_UTC_OFFSET_HOURS = 7;
const monthNumber = (month: string) => Number(month.match(/(\d+)/)?.[1] ?? 1);
const vnWallClockToUtc = (day: number, month: number, hour: number, minute: number) =>
  new Date(Date.UTC(EVENT_YEAR, month - 1, day, hour - VN_UTC_OFFSET_HOURS, minute));

export function eventTimeRange(event: EventItem): { start: Date; end: Date } {
  const [s, e] = [...event.time.matchAll(/(\d{1,2}):(\d{2})/g)];
  const [sh, sm] = [Number(s?.[1] ?? 0), Number(s?.[2] ?? 0)];
  const [eh, em] = [Number(e?.[1] ?? sh), Number(e?.[2] ?? sm)];
  const [day, month] = [Number(event.day), monthNumber(event.month)];
  return { start: vnWallClockToUtc(day, month, sh, sm), end: vnWallClockToUtc(day, month, eh, em) };
}

export const formatInTz = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short', timeZone: timezone }).format(date);
