import { ArrowLeft, ArrowSquareOut } from '@phosphor-icons/react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { Button, SectionHeader, StatusPill } from '../components/UI';
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
          <div className="card-badges"><StatusPill tone={meta.tone}>{meta.label}</StatusPill><StatusPill>{goal.cycle}</StatusPill></div>
          <h1>{goal.title}</h1>
          <p>Chủ sở hữu: {goal.owner}</p>
          <p>Tiến độ: {goal.progress}% · {goal.nextDue}</p>
          <p>Check-in gần nhất: {goal.lastCheckIn}</p>
          <Button variant="borderless" icon={<ArrowSquareOut size={17} />} title="Demo — sẽ deep-link sang hệ thống nguồn">Cấu hình trong iGoal</Button>
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
