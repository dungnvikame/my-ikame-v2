import type { PriorityBand, Severity } from '../types';

export interface RankableCard {
  id: string;
  priorityBand: PriorityBand;
  severity?: Severity;
  dueAt?: string;
  official?: boolean;
  updatedAt: string;
}

const BAND_ORDER: Record<PriorityBand, number> = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };
const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

/**
 * Deterministic priority ordering per spec §13.2/13.3: priority band, then severity,
 * then due date (soonest first, no due date last), then official content, then
 * freshness, then a stable id tie-break so equal-rank cards never reorder between renders.
 */
export function rankCards<T extends RankableCard>(cards: T[]): T[] {
  return [...cards].sort((a, b) => {
    if (BAND_ORDER[a.priorityBand] !== BAND_ORDER[b.priorityBand]) {
      return BAND_ORDER[a.priorityBand] - BAND_ORDER[b.priorityBand];
    }
    const severityA = a.severity ? SEVERITY_ORDER[a.severity] : 3;
    const severityB = b.severity ? SEVERITY_ORDER[b.severity] : 3;
    if (severityA !== severityB) return severityA - severityB;

    const dueA = a.dueAt ? Date.parse(a.dueAt) : Infinity;
    const dueB = b.dueAt ? Date.parse(b.dueAt) : Infinity;
    if (dueA !== dueB) return dueA - dueB;

    if (!!a.official !== !!b.official) return a.official ? -1 : 1;

    const freshA = Date.parse(a.updatedAt) || 0;
    const freshB = Date.parse(b.updatedAt) || 0;
    if (freshA !== freshB) return freshB - freshA;

    return a.id.localeCompare(b.id);
  });
}
