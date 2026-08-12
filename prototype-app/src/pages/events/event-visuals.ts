import type { EventItem } from '../../types';

/**
 * Visual identity helpers for the Events redesign — no real photos (owner decision).
 * Deterministic per-event emoji + gradient palette so covers stay stable across re-renders
 * and are shared by the hero cover, card tiles, and timeline dots (DRY, one source of truth).
 */

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

export function eventEmoji(event: EventItem): string {
  return EMOJI_BY_ID[event.id] ?? EMOJI_BY_FORMAT[event.format] ?? '📅';
}

export const COVER_PALETTES = ['blue', 'indigo', 'emerald', 'amber', 'fuchsia'] as const;
export type CoverPalette = (typeof COVER_PALETTES)[number];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash;
}

/** Stable per-event palette pick — same event always renders the same cover color. */
export function eventCoverPalette(event: EventItem): CoverPalette {
  return COVER_PALETTES[hashString(event.id) % COVER_PALETTES.length];
}

/** `audienceTeamIds` empty/undefined = company-wide (same contract as `lib/audience.ts`). */
export function audienceLabel(event: EventItem): string {
  return event.audienceTeamIds && event.audienceTeamIds.length > 0 ? 'Đội ngũ của bạn' : 'Toàn công ty';
}

/** Compound "audience — trạng thái" copy, e.g. "Toàn công ty — bạn đã có suất" (owner reference pill). */
export function audienceStatusLabel(event: EventItem): string {
  const audience = audienceLabel(event);
  if (event.myRegistration === 'going') return `${audience} — bạn đã có suất`;
  if (event.myRegistration === 'waitlisted') return `${audience} — bạn đang chờ`;
  return audience;
}
