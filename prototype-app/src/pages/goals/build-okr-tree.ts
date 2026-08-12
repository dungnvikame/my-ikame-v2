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
