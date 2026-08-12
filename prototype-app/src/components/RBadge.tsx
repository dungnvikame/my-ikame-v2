import type { ReleaseTag } from '../types';

/**
 * Concept-labeling pill for non-shipped surfaces: "Concept · R2".
 * R1 shipped-grade surfaces carry NO badge (RED TEAM F16 — no `shipped` variant).
 * Shared frozen contract — phases 2-5 consume, only Phase 1/6 may edit.
 */
export function RBadge({ tag }: { tag: Exclude<ReleaseTag, 'R1'> }) {
  return <span className="r-badge">Concept · {tag}</span>;
}
