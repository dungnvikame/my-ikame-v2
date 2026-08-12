import { CheckCircle } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../../AppState';
import { SectionHeader } from '../../components/UI';
import type { Goal } from '../../types';
import { buildOkrTree, type CycleOption } from './build-okr-tree';
import { EksTab } from './EksTab';
import { GoalsCycleHeader } from './GoalsCycleHeader';
import { GoalsTabPanel, GoalsTabs, type GoalsTabDef } from './GoalsTabs';
import { IkamerGoalsRail } from './IkamerGoalsRail';
import { OkrTree } from './OkrTree';
import { ReportList } from './ReportList';

type TabKey = 'eks' | 'okr' | 'reports';
const TABS: GoalsTabDef<TabKey>[] = [
  { key: 'eks', label: 'Mục tiêu (EKS)' },
  { key: 'okr', label: 'OKR liên quan' },
  { key: 'reports', label: 'Báo cáo' },
];

/** iKamer perspective — EKS-first, modeled on the real iGoal "My EKS" screen. */
export function IkamerGoalsView() {
  const { eks, goals, okrTree, checkInGoal, checkInReports, submitReport, user, demoResetCount } = useAppState();
  const [cycle, setCycle] = useState<CycleOption>('H2 2026');
  const [activeTab, setActiveTab] = useState<TabKey>('eks');
  const [reportGoal, setReportGoal] = useState<Goal | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);

  const tree = useMemo(() => buildOkrTree(okrTree), [okrTree]);
  const allNodeIds = useMemo(() => okrTree.map((objective) => objective.id), [okrTree]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(allNodeIds));
  const goalsById = useMemo(() => Object.fromEntries(goals.map((goal) => [goal.id, goal])), [goals]);

  useEffect(() => {
    setActiveTab('eks');
    setReportGoal(null);
    setReceipt(null);
    setExpandedIds(new Set(allNodeIds));
  }, [demoResetCount, allNodeIds]);

  function toggleNode(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleQuickCheckIn(goal: Goal) {
    checkInGoal(goal.id);
    setReceipt(`Đã check-in "${goal.title}" — chuyển sang Đang đúng tiến độ.`);
  }

  function handleSubmitReport(input: { periodLabel: string; progressAfter: number; content: string; blockers: string }) {
    if (!reportGoal) return;
    submitReport({
      goalId: reportGoal.id,
      goalTitle: reportGoal.title,
      authorName: user.name,
      periodLabel: input.periodLabel,
      progressBefore: reportGoal.progress,
      progressAfter: input.progressAfter,
      content: input.content,
      blockers: input.blockers || undefined,
      source: 'manual',
    });
    setReceipt(`Đã gửi báo cáo cho "${reportGoal.title}" — mục tiêu chuyển sang Đang đúng tiến độ.`);
    setReportGoal(null);
  }

  const checkInCount = checkInReports.filter((report) => report.authorName === user.name).length;
  const needsUpdateCount = goals.filter((goal) => goal.status === 'needs_update').length;

  return (
    <div className="page collection-page">
      <GoalsCycleHeader eyebrow="EKS" title={`EKS · ${user.name}`} cycle={cycle} onCycleChange={setCycle}>
        <p>Theo dõi EKS cá nhân, OKR liên quan và gửi báo cáo check-in ngay trong My iKame.</p>
      </GoalsCycleHeader>

      {receipt && <p className="receipt" role="status"><CheckCircle size={16} />{receipt}</p>}

      <GoalsTabs tabs={TABS} active={activeTab} onChange={setActiveTab} ariaLabel="Chế độ xem EKS/OKR" />

      <div className="home-grid eks-grid">
        <div className="home-main">
          {activeTab === 'eks' && (
            <GoalsTabPanel tabKey="eks">
              <EksTab
                eks={eks}
                goals={goals}
                checkInReports={checkInReports}
                goalsById={goalsById}
                reportGoal={reportGoal}
                onQuickCheckIn={handleQuickCheckIn}
                onOpenReport={setReportGoal}
                onCancelReport={() => setReportGoal(null)}
                onSubmitReport={handleSubmitReport}
              />
            </GoalsTabPanel>
          )}

          {activeTab === 'okr' && (
            <GoalsTabPanel tabKey="okr">
              <section className="section-block">
                <SectionHeader title="OKR công ty · nhóm · cá nhân" meta={`${okrTree.length} objective · chu kỳ ${cycle}`} />
                <OkrTree nodes={tree} variant="list" expandedIds={expandedIds} onToggle={toggleNode} goalsById={goalsById} />
              </section>
            </GoalsTabPanel>
          )}

          {activeTab === 'reports' && (
            <GoalsTabPanel tabKey="reports">
              <ReportList reports={checkInReports} />
            </GoalsTabPanel>
          )}
        </div>

        <IkamerGoalsRail user={user} checkInCount={checkInCount} needsUpdateCount={needsUpdateCount} />
      </div>
    </div>
  );
}
