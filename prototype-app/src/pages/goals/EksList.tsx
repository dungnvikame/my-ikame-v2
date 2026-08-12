import { Target } from '@phosphor-icons/react';
import { Button, SectionHeader, StatusPill } from '../../components/UI';
import type { EksObjective, Goal } from '../../types';
import { STATUS_META } from './build-okr-tree';

type EksListProps = {
  eks: EksObjective[];
  goalsById: Record<string, Goal>;
  onQuickCheckIn: (goal: Goal) => void;
};

/** "Danh sách EKS" card — mirrors the real iGoal My EKS screen: E-objective rows (blue
 * circular code) with KS child rows (orange code, wrapping title, progress, status). */
export function EksList({ eks, goalsById, onQuickCheckIn }: EksListProps) {
  return (
    <section className="section-block eks-card">
      <SectionHeader title="Danh sách EKS" meta={`${eks.length} mục tiêu · ${eks.reduce((sum, e) => sum + e.keySuccesses.length, 0)} KS`} />
      <div className="eks-list">
        {eks.map((objective) => (
          <EksObjectiveRow key={objective.id} objective={objective} goalsById={goalsById} onQuickCheckIn={onQuickCheckIn} />
        ))}
      </div>
    </section>
  );
}

function EksObjectiveRow({ objective, goalsById, onQuickCheckIn }: Omit<EksListProps, 'eks'> & { objective: EksObjective }) {
  return (
    <article className="eks-objective">
      <div className="eks-objective-row">
        <span className="eks-code eks-code--e" aria-hidden="true">{objective.code}</span>
        <strong className="eks-objective-title">{objective.title}</strong>
        <div className="eks-progress">
          <div className="okr-progress-bar" role="progressbar" aria-valuenow={objective.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${objective.title}`}>
            <div className="okr-progress-fill" style={{ width: `${objective.progress}%` }} />
          </div>
          <span>{objective.progress}%</span>
        </div>
      </div>
      <ul className="eks-ks-list">
        {objective.keySuccesses.map((ks) => {
          const linkedGoal = ks.linkedGoalId ? goalsById[ks.linkedGoalId] : undefined;
          const canCheckIn = linkedGoal && (linkedGoal.status === 'needs_update' || linkedGoal.status === 'at_risk');
          return (
            <li key={ks.id} className="eks-ks-row">
              <span className="eks-code eks-code--ks" aria-hidden="true">{ks.code}</span>
              <p className="eks-ks-title">{ks.title}</p>
              <div className="eks-progress">
                <div className="okr-progress-bar okr-progress-bar--kr" role="progressbar" aria-valuenow={ks.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${ks.code}`}>
                  <div className="okr-progress-fill" style={{ width: `${ks.progress}%` }} />
                </div>
                <span>{ks.progress}%</span>
              </div>
              <StatusPill tone={STATUS_META[ks.status].tone}>{STATUS_META[ks.status].label}</StatusPill>
              {canCheckIn && linkedGoal && (
                <Button variant="dim" icon={<Target size={15} />} onClick={() => onQuickCheckIn(linkedGoal)}>Check-in nhanh</Button>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
