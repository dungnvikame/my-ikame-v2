import { ArrowLeft, ArrowSquareOut, CheckCircle, Target } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { RBadge } from '../components/RBadge';
import { Button, EmptyState, SectionHeader, StatusPill } from '../components/UI';
import type { Goal, GoalStatus } from '../types';

const STATUS_ORDER: GoalStatus[] = ['needs_update', 'at_risk', 'on_track', 'done'];

const STATUS_META: Record<GoalStatus, { label: string; tone: 'error' | 'warning' | 'success' | 'neutral' }> = {
  needs_update: { label: 'Cần cập nhật', tone: 'error' },
  at_risk: { label: 'Có rủi ro', tone: 'warning' },
  on_track: { label: 'Đang đúng tiến độ', tone: 'success' },
  done: { label: 'Hoàn thành', tone: 'neutral' },
};

export function GoalsPage() {
  const { goals, checkInGoal, demoResetCount } = useAppState();
  const [receipt, setReceipt] = useState<string | null>(null);

  // Rehearsal reset must not leave a stale check-in receipt once goals are restored.
  useEffect(() => { setReceipt(null); }, [demoResetCount]);

  function handleCheckIn(goal: Goal) {
    checkInGoal(goal.id);
    setReceipt(`Đã check-in "${goal.title}" — chuyển sang Đang đúng tiến độ.`);
  }

  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div>
          <h1>Mục tiêu <RBadge tag="R3" /></h1>
          <p>Theo dõi trạng thái, tiến độ và chu kỳ mục tiêu của bạn, với check-in nhanh ngay trong My iKame. Việc cấu hình và phê duyệt mục tiêu vẫn tiếp tục thực hiện trên iGoal.</p>
        </div>
        <Button variant="borderless" icon={<ArrowSquareOut size={17} />} title="Demo — sẽ deep-link sang hệ thống nguồn">Cấu hình trong iGoal</Button>
      </header>

      {receipt && <p className="receipt" role="status"><CheckCircle size={16} />{receipt}</p>}

      {goals.length === 0 ? (
        <EmptyState title="Chưa có mục tiêu nào" body="Mục tiêu của bạn sẽ xuất hiện ở đây khi được tạo trên iGoal." />
      ) : (
        STATUS_ORDER.map((status) => {
          const items = goals.filter((goal) => goal.status === status);
          if (items.length === 0) return null;
          return (
            <section key={status} className="section-block">
              <SectionHeader title={STATUS_META[status].label} meta={`${items.length} mục tiêu`} />
              <div className="collection-grid goal-grid">
                {items.map((goal) => <GoalCard key={goal.id} goal={goal} onCheckIn={() => handleCheckIn(goal)} />)}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function GoalCard({ goal, onCheckIn }: { goal: Goal; onCheckIn: () => void }) {
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
        {canCheckIn && <Button variant="primary" icon={<Target size={16} />} onClick={onCheckIn}>Check-in nhanh</Button>}
      </div>
    </article>
  );
}

export function GoalDetailPage() {
  const { goalId } = useParams();
  const { goals } = useAppState();
  const goal = goals.find((item) => item.id === goalId);

  if (!goal) return <Navigate to="/not-found" replace />;

  const meta = STATUS_META[goal.status];
  return (
    <div className="page detail-page">
      <Link className="back-link" to="/goals"><ArrowLeft size={17} />Quay lại Mục tiêu</Link>
      <article className="content-card goal-detail-card">
        <div className="card-body">
          <div className="card-badges"><StatusPill tone={meta.tone}>{meta.label}</StatusPill><StatusPill>{goal.cycle}</StatusPill></div>
          <h1>{goal.title}</h1>
          <p>Chủ sở hữu: {goal.owner}</p>
          <p>Tiến độ: {goal.progress}% · {goal.nextDue}</p>
          <p>Check-in gần nhất: {goal.lastCheckIn}</p>
          <Button variant="borderless" icon={<ArrowSquareOut size={17} />} title="Demo — sẽ deep-link sang hệ thống nguồn">Cấu hình trong iGoal</Button>
        </div>
      </article>
    </div>
  );
}
