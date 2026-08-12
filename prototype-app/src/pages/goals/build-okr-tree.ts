import type { GoalStatus, Objective } from '../../types';

export type OkrNode = Objective & { children: OkrNode[] };

/** Flat Objective[] (parentId links) → nested tree. Roots = no parentId. */
export function buildOkrTree(items: Objective[]): OkrNode[] {
  const byId = new Map<string, OkrNode>();
  items.forEach((item) => byId.set(item.id, { ...item, children: [] }));
  const roots: OkrNode[] = [];
  byId.forEach((node) => {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
}

/** Shared status labels — Goal.status and KeyResult.status are the same GoalStatus union. */
export const STATUS_META: Record<GoalStatus, { label: string; tone: 'error' | 'warning' | 'success' | 'neutral' }> = {
  needs_update: { label: 'Cần cập nhật', tone: 'error' },
  at_risk: { label: 'Có rủi ro', tone: 'warning' },
  on_track: { label: 'Đang đúng tiến độ', tone: 'success' },
  done: { label: 'Hoàn thành', tone: 'neutral' },
};

/** Manager "OKR của team" tab — scope the flat list to one team node + its personal
 * children before building the tree, so the team node becomes the root (DRY reuse of buildOkrTree). */
export function buildTeamSubtree(items: Objective[], teamNodeId: string): OkrNode[] {
  const scoped = items.filter((item) => item.id === teamNodeId || item.parentId === teamNodeId);
  return buildOkrTree(scoped);
}

/** Shared cycle selector — same segmented-button pattern for both perspectives (spec §UX rules). */
export type CycleOption = 'H2 2026' | 'H1 2026';
export const CYCLE_OPTIONS: CycleOption[] = ['H2 2026', 'H1 2026'];
