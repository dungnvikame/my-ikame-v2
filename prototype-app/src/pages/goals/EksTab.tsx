import { Sparkle } from '@phosphor-icons/react';
import { AiBadge } from '../../components/AiBadge';
import { useAppState } from '../../AppState';
import type { CheckInReport, EksObjective, Goal } from '../../types';
import { EksList } from './EksList';
import { GoalMyList } from './GoalMyList';
import { ReportBrowser } from './ReportBrowser';
import { ReportForm } from './ReportForm';

type EksTabProps = {
  eks: EksObjective[];
  goals: Goal[];
  checkInReports: CheckInReport[];
  goalsById: Record<string, Goal>;
  reportGoal: Goal | null;
  onQuickCheckIn: (goal: Goal) => void;
  onOpenReport: (goal: Goal) => void;
  onCancelReport: () => void;
  onSubmitReport: (input: { periodLabel: string; progressAfter: number; content: string; blockers: string }) => void;
};

/** AI quick-actions strip (spec) — both buttons only open the Ask iKame panel; the
 * panel's own /goals chips (g3 check-in, g4 week summary) do the actual work. */
function EksAiStrip() {
  const { setAskOpen } = useAppState();
  return (
    <div className="eks-ai-strip">
      <button type="button" className="eks-ai-action" onClick={() => setAskOpen(true)}>
        <Sparkle size={16} />
        <span>Tổng hợp công việc tuần (AI)</span>
        <AiBadge level="A2" />
      </button>
      <button type="button" className="eks-ai-action" onClick={() => setAskOpen(true)}>
        <Sparkle size={16} />
        <span>Viết báo cáo nhanh (AI)</span>
        <AiBadge level="A3" />
      </button>
    </div>
  );
}

export function EksTab({
  eks, goals, checkInReports, goalsById, reportGoal, onQuickCheckIn, onOpenReport, onCancelReport, onSubmitReport,
}: EksTabProps) {
  const { user } = useAppState();

  function handleCreateReport() {
    const fallback = goals.find((goal) => goal.status === 'needs_update') ?? goals.find((goal) => goal.status === 'at_risk') ?? goals[0];
    if (fallback) onOpenReport(fallback);
  }

  return (
    <>
      <EksAiStrip />
      {reportGoal && <ReportForm goal={reportGoal} authorName={user.name} onCancel={onCancelReport} onSubmit={onSubmitReport} />}
      <EksList eks={eks} goalsById={goalsById} onQuickCheckIn={onQuickCheckIn} />
      <GoalMyList goals={goals} onCheckIn={onQuickCheckIn} onOpenReport={onOpenReport} />
      <ReportBrowser reports={checkInReports} onCreateNew={handleCreateReport} />
    </>
  );
}
