import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../../AppState';
import { SectionHeader } from '../../components/UI';
import { buildTeamSubtree, type CycleOption } from './build-okr-tree';
import { GoalsCycleHeader } from './GoalsCycleHeader';
import { GoalsManagerAiBrief } from './GoalsManagerAiBrief';
import { GoalsTabPanel, GoalsTabs, type GoalsTabDef } from './GoalsTabs';
import { MemberEksTable } from './MemberEksTable';
import { OkrTree } from './OkrTree';
import { ReportList } from './ReportList';

type TabKey = 'okr' | 'members' | 'reports';
const TABS: GoalsTabDef<TabKey>[] = [
  { key: 'okr', label: 'OKR của team' },
  { key: 'members', label: 'Thành viên' },
  { key: 'reports', label: 'Báo cáo' },
];

/** Manager perspective — team OKR management: AI summary + team OKR tree, member
 * EKS/report compliance table, and the full report list. */
export function ManagerGoalsView() {
  const { user, okrTree, attention, memberEksStats, checkInReports, goals, demoResetCount } = useAppState();
  const [cycle, setCycle] = useState<CycleOption>('H2 2026');
  const [activeTab, setActiveTab] = useState<TabKey>('okr');

  const teamNode = useMemo(() => okrTree.find((node) => node.level === 'team' && node.ownerShort === user.shortName), [okrTree, user.shortName]);
  const tree = useMemo(() => (teamNode ? buildTeamSubtree(okrTree, teamNode.id) : []), [okrTree, teamNode]);
  const allNodeIds = useMemo(() => okrTree.map((objective) => objective.id), [okrTree]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(allNodeIds));
  const goalsById = useMemo(() => Object.fromEntries(goals.map((goal) => [goal.id, goal])), [goals]);

  useEffect(() => {
    setActiveTab('okr');
    setExpandedIds(new Set(allNodeIds));
  }, [demoResetCount, allNodeIds]);

  function toggleNode(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="page collection-page">
      <GoalsCycleHeader eyebrow="OKR" title={`OKR · ${user.team}`} cycle={cycle} onCycleChange={setCycle}>
        <p>Theo dõi OKR team, EKS và báo cáo check-in của các thành viên trong My iKame.</p>
      </GoalsCycleHeader>

      <GoalsTabs tabs={TABS} active={activeTab} onChange={setActiveTab} ariaLabel="Chế độ xem OKR team" />

      {activeTab === 'okr' && (
        <GoalsTabPanel tabKey="okr">
          <GoalsManagerAiBrief attention={attention} members={memberEksStats} teamId={user.teamId} />
          <section className="section-block">
            <SectionHeader title="OKR của team" meta={`${tree.length > 0 ? tree[0].children.length + 1 : 0} objective · chu kỳ ${cycle}`} />
            {tree.length > 0
              ? <OkrTree nodes={tree} variant="list" expandedIds={expandedIds} onToggle={toggleNode} goalsById={goalsById} />
              : <p className="inline-guidance">Chưa có OKR team nào cho chu kỳ này.</p>}
          </section>
        </GoalsTabPanel>
      )}

      {activeTab === 'members' && (
        <GoalsTabPanel tabKey="members">
          <MemberEksTable members={memberEksStats} />
        </GoalsTabPanel>
      )}

      {activeTab === 'reports' && (
        <GoalsTabPanel tabKey="reports">
          <ReportList reports={checkInReports} />
        </GoalsTabPanel>
      )}
    </div>
  );
}
