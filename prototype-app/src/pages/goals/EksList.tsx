import { SectionHeader } from '../../components/UI';
import type { EksObjective } from '../../types';
import { Progress } from '@coreds/react';

type EksListProps = {
  eks: EksObjective[];
};

/** "Danh sách EKS" card — mirrors the real iGoal My EKS screen: E-objective rows (blue
 * circular code) with KS child rows (orange code, wrapping title, progress, status).
 * Read-only display — check-in happens via the AI quick-action or the report flow, not
 * a per-row button here (owner feedback, 2026-08-13: a check-in action didn't belong
 * in this list). */
export function EksList({ eks }: EksListProps) {
  return (
    <section className="section-block eks-card">
      <SectionHeader title="Danh sách EKS" meta={`${eks.length} mục tiêu · ${eks.reduce((sum, e) => sum + e.keySuccesses.length, 0)} KS`} />
      <div className="eks-list">
        {eks.map((objective) => (
          <EksObjectiveRow key={objective.id} objective={objective} />
        ))}
      </div>
    </section>
  );
}

function EksObjectiveRow({ objective }: { objective: EksObjective }) {
  return (
    <article className="eks-objective">
      <div className="eks-objective-row">
        <span className="eks-code eks-code--e" aria-hidden="true">{objective.code}</span>
        <strong className="eks-objective-title">{objective.title}</strong>
        <div className="eks-progress">
          <Progress className="okr-progress" size="md" value={objective.progress} aria-label={`Tiến độ ${objective.title}`} />
          <span>{objective.progress}%</span>
        </div>
      </div>
      <ul className="eks-ks-list">
        {objective.keySuccesses.map((ks) => (
          <li key={ks.id} className="eks-ks-row">
            <span className="eks-code eks-code--ks" aria-hidden="true">{ks.code}</span>
            <p className="eks-ks-title">{ks.title}</p>
            <div className="eks-progress">
              <Progress className="okr-progress okr-progress--kr" size="sm" value={ks.progress} aria-label={`Tiến độ ${ks.code}`} />
              <span>{ks.progress}%</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
