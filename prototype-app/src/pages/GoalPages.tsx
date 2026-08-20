import { ArrowLeft } from '@phosphor-icons/react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { PlatformHandoffButton } from '../components/PlatformHandoff';
import { SectionHeader, StatusPill } from '../components/UI';
import { STATUS_META } from './goals/build-okr-tree';
import { IkamerGoalsView } from './goals/IkamerGoalsView';
import { ManagerGoalsView } from './goals/ManagerGoalsView';
import { ReportList } from './goals/ReportList';

/** Perspective-aware entry point (spec): iKamer gets the EKS-first "My EKS" layout,
 * Manager gets the team OKR management layout. `/goals` carries no PerspectiveGuard
 * (App.tsx) by design — both perspectives read it directly. */
export function GoalsPage() {
  const { perspective } = useAppState();
  return perspective === 'manager' ? <ManagerGoalsView /> : <IkamerGoalsView />;
}

export function GoalDetailPage() {
  const { goalId } = useParams();
  const { goals, okrTree, checkInReports } = useAppState();
  const goal = goals.find((item) => item.id === goalId);

  if (!goal) return <Navigate to="/not-found" replace />;

  const objective = okrTree.find((item) => item.linkedGoalId === goal.id);
  const reports = checkInReports.filter((report) => report.goalId === goal.id);
  const meta = STATUS_META[goal.status];

  return (
    <div className="page detail-page">
      <Link className="back-link" to="/goals"><ArrowLeft size={17} />Quay lại Mục tiêu</Link>
      <article className="content-card goal-detail-card">
        <div className="card-body">
          <div className="goal-detail-head">
            <div className="card-badges"><StatusPill tone={meta.tone}>{meta.label}</StatusPill><StatusPill>{goal.cycle}</StatusPill></div>
            <PlatformHandoffButton platform="iGoal" action="thiết lập chi tiết mục tiêu này" label="Cấu hình trên iGoal" />
          </div>
          <h1>{goal.title}</h1>
          <div className="goal-detail-progress">
            <div className="okr-progress-bar" role="progressbar" aria-valuenow={goal.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${goal.title}`}>
              <div className="okr-progress-fill" style={{ width: `${goal.progress}%` }} />
            </div>
            <strong>{goal.progress}%</strong>
          </div>
          <dl className="goal-detail-facts">
            <div><dt>Chủ sở hữu</dt><dd>{goal.owner}</dd></div>
            <div><dt>Hạn check-in</dt><dd>{goal.nextDue}</dd></div>
            <div><dt>Check-in gần nhất</dt><dd>{goal.lastCheckIn}</dd></div>
          </dl>
        </div>
      </article>

      {objective && (
        <section className="section-block">
          <SectionHeader title="Key results" meta={`${objective.keyResults.length} KR · ${objective.title}`} />
          <ul className="okr-kr-list okr-kr-list--detail">
            {objective.keyResults.map((kr) => (
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
        </section>
      )}

      <section className="section-block">
        <ReportList reports={reports} />
      </section>
    </div>
  );
}
