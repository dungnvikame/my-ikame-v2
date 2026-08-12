import { CaretRight } from '@phosphor-icons/react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { StatusPill } from '../../components/UI';
import type { Goal } from '../../types';
import { STATUS_META, type OkrNode } from './build-okr-tree';

type OkrRowProps = {
  variant: 'list' | 'diagram';
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  goalsById: Record<string, Goal>;
};

type OkrTreeProps = OkrRowProps & { nodes: OkrNode[] };

const LEVEL_LABEL: Record<OkrNode['level'], string> = {
  company: 'Công ty',
  team: 'Nhóm',
  personal: 'Cá nhân',
};

export function OkrTree({ nodes, variant, expandedIds, onToggle, goalsById }: OkrTreeProps) {
  return (
    <div className={`okr-tree okr-tree--${variant}`}>
      {nodes.map((node) => (
        <OkrNodeRow key={node.id} node={node} depth={0} variant={variant} expandedIds={expandedIds} onToggle={onToggle} goalsById={goalsById} />
      ))}
    </div>
  );
}

function OkrNodeRow({ node, depth, variant, expandedIds, onToggle, goalsById }: OkrRowProps & { node: OkrNode; depth: number }) {
  const expanded = expandedIds.has(node.id);
  const linkedGoal = node.linkedGoalId ? goalsById[node.linkedGoalId] : undefined;

  return (
    <div className="okr-node" style={{ '--okr-depth': depth } as CSSProperties}>
      <div className={`okr-row okr-row--${node.level}`}>
        <button
          type="button"
          className="okr-row-toggle"
          aria-expanded={expanded}
          aria-label={expanded ? `Thu gọn key result của ${node.title}` : `Mở rộng key result của ${node.title}`}
          onClick={() => onToggle(node.id)}
        >
          <CaretRight size={14} weight="bold" className={expanded ? 'is-expanded' : ''} />
        </button>
        <span className="okr-owner-avatar" aria-hidden="true">{node.ownerShort}</span>
        <div className="okr-row-copy">
          <strong>{variant === 'list' ? node.title : `${LEVEL_LABEL[node.level]} · ${node.title}`}</strong>
          <span>{node.ownerName} · {node.keyResults.length} key result</span>
        </div>
        <div className="okr-row-progress">
          <div className="okr-progress-bar" role="progressbar" aria-valuenow={node.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${node.title}`}>
            <div className="okr-progress-fill" style={{ width: `${node.progress}%` }} />
          </div>
          <span>{node.progress}%</span>
          {linkedGoal && <StatusPill tone={STATUS_META[linkedGoal.status].tone}>{STATUS_META[linkedGoal.status].label}</StatusPill>}
        </div>
      </div>

      {expanded && (
        <ul className="okr-kr-list">
          {node.keyResults.map((kr) => (
            <li key={kr.id} className="okr-kr-row">
              <span className="okr-kr-title">{kr.title}</span>
              <div className="okr-progress-bar okr-progress-bar--kr" role="progressbar" aria-valuenow={kr.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${kr.title}`}>
                <div className="okr-progress-fill" style={{ width: `${kr.progress}%` }} />
              </div>
              <span className="okr-kr-unit">{kr.progress} {kr.unitLabel}</span>
              <StatusPill tone={STATUS_META[kr.status].tone}>{STATUS_META[kr.status].label}</StatusPill>
            </li>
          ))}
        </ul>
      )}

      {linkedGoal && variant === 'list' && (
        <Link className="text-link okr-goal-link" to={`/goals/${linkedGoal.id}`}>Xem mục tiêu cá nhân</Link>
      )}

      {node.children.length > 0 && (
        <div className="okr-children">
          {node.children.map((child) => (
            <OkrNodeRow key={child.id} node={child} depth={depth + 1} variant={variant} expandedIds={expandedIds} onToggle={onToggle} goalsById={goalsById} />
          ))}
        </div>
      )}
    </div>
  );
}
