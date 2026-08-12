import type { AiLevel } from '../types';

const AI_LEVEL_LABELS: Record<AiLevel, string> = {
  A1: 'Tóm tắt',
  A2: 'Xuyên nguồn',
  A3: 'Soạn thảo',
  A4: 'Thực thi',
};

/**
 * AI-maturity pill: level + label ("A2 · Xuyên nguồn").
 * Shared frozen contract (RED TEAM F1): consumed by Phase 2 (Ask panel),
 * Phase 4 (AI-brief) and Phase 5 (/vision ladder) — the closing "thu hoạch"
 * beat requires pixel-identical pills across all three surfaces.
 */
export function AiBadge({ level }: { level: AiLevel }) {
  return (
    <span className={`ai-badge ai-badge--${level.toLowerCase()}`}>
      <strong>{level}</strong> · {AI_LEVEL_LABELS[level]}
    </span>
  );
}
