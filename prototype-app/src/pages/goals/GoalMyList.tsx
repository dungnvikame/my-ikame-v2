import { NotePencil, Target } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button, EmptyState, SectionHeader, StatusPill } from '../../components/UI';
import type { Goal } from '../../types';
import { STATUS_META } from './build-okr-tree';

type GoalMyListProps = {
  goals: Goal[];
  onCheckIn: (goal: Goal) => void;
  onOpenReport: (goal: Goal) => void;
};

export function GoalMyList({ goals, onCheckIn, onOpenReport }: GoalMyListProps) {
  if (goals.length === 0) {
    return <EmptyState title="Chưa có mục tiêu nào" body="Mục tiêu của bạn sẽ xuất hiện ở đây khi được tạo trên iGoal." />;
  }

  return (
    <section className="section-block">
      <SectionHeader title="Mục tiêu của tôi" meta={`${goals.length} mục tiêu cá nhân`} />
      <div className="collection-grid goal-grid">
        {goals.map((goal) => (
          <GoalMyCard key={goal.id} goal={goal} onCheckIn={() => onCheckIn(goal)} onOpenReport={() => onOpenReport(goal)} />
        ))}
      </div>
    </section>
  );
}

function GoalMyCard({ goal, onCheckIn, onOpenReport }: { goal: Goal; onCheckIn: () => void; onOpenReport: () => void }) {
  const meta = STATUS_META[goal.status];
  const canCheckIn = goal.status === 'needs_update' || goal.status === 'at_risk';

  return (
    <article className="content-card goal-card">
      <div className="card-body">
        <div className="card-badges"><StatusPill tone={meta.tone}>{meta.label}</StatusPill><StatusPill>{goal.cycle}</StatusPill></div>
        <h3><Link to={`/goals/${goal.id}`}>{goal.title}</Link></h3>
        <div className="goal-progress" role="progressbar" aria-valuenow={goal.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${goal.progress}%`}>
          <div className="goal-progress-fill" style={{ width: `${goal.progress}%` }} />
        </div>
        <p className="goal-progress-label">{goal.progress}% hoàn thành</p>
        <div className="source-line"><span>Check-in gần nhất: {goal.lastCheckIn}</span></div>
        <div className="source-line"><span>{goal.nextDue}</span></div>
        <div className="okr-goal-actions">
          {canCheckIn && <Button variant="dim" icon={<Target size={16} />} onClick={onCheckIn}>Check-in nhanh</Button>}
          <Button variant="primary" icon={<NotePencil size={16} />} onClick={onOpenReport}>Tạo báo cáo</Button>
        </div>
      </div>
    </article>
  );
}
