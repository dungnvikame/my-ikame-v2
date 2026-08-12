import { ArrowLeft, ArrowSquareOut, CheckCircle } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { Button, EmptyState, SectionHeader, StatusPill } from '../components/UI';
import type { Goal } from '../types';
import { buildOkrTree, STATUS_META } from './goals/build-okr-tree';
import { GoalMyList } from './goals/GoalMyList';
import { OkrTree } from './goals/OkrTree';
import { ReportForm } from './goals/ReportForm';
import { ReportList } from './goals/ReportList';

type CycleOption = 'H2 2026' | 'H1 2026';
type TabKey = 'main' | 'diagram' | 'reports';
const CYCLE_OPTIONS: CycleOption[] = ['H2 2026', 'H1 2026'];
const TABS: { key: TabKey; label: string }[] = [
  { key: 'main', label: 'Mục tiêu & báo cáo' },
  { key: 'diagram', label: 'Sơ đồ mục tiêu' },
  { key: 'reports', label: 'Báo cáo' },
];

export function GoalsPage() {
  const { goals, okrTree, checkInGoal, checkInReports, submitReport, user, demoResetCount } = useAppState();
  const [cycle, setCycle] = useState<CycleOption>('H2 2026');
  const [activeTab, setActiveTab] = useState<TabKey>('main');
  const [reportGoal, setReportGoal] = useState<Goal | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);

  const tree = useMemo(() => buildOkrTree(okrTree), [okrTree]);
  const allNodeIds = useMemo(() => okrTree.map((objective) => objective.id), [okrTree]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(allNodeIds));
  const goalsById = useMemo(() => Object.fromEntries(goals.map((goal) => [goal.id, goal])), [goals]);

  // Rehearsal reset must not leave a stale form/receipt open once goals & reports are restored.
  useEffect(() => {
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

  function handleCheckIn(goal: Goal) {
    checkInGoal(goal.id);
    setReceipt(`Đã check-in "${goal.title}" — chuyển sang Đang đúng tiến độ.`);
  }

  function handleSubmitReport(input: { periodLabel: string; progressAfter: number; content: string; blockers: string }) {
    if (!reportGoal) return;
    // Money moment #3 — single mutator writes the report AND flips the goal (see ReportForm comment).
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

  const cycleHasData = cycle === 'H2 2026';

  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">MỤC TIÊU</span>
          <h1>Mục tiêu</h1>
          <p>Theo dõi OKR công ty → nhóm → cá nhân và gửi báo cáo check-in ngay trong My iKame. Việc cấu hình và phê duyệt mục tiêu vẫn tiếp tục thực hiện trên iGoal.</p>
        </div>
        <div className="okr-header-actions">
          <div className="okr-cycle-selector" role="group" aria-label="Chọn chu kỳ">
            {CYCLE_OPTIONS.map((option) => (
              <button key={option} type="button" className={option === cycle ? 'is-active' : ''} aria-pressed={option === cycle} onClick={() => setCycle(option)}>{option}</button>
            ))}
          </div>
          <Button variant="borderless" icon={<ArrowSquareOut size={17} />} title="Demo — sẽ deep-link sang hệ thống nguồn">Cấu hình trong iGoal</Button>
        </div>
      </header>

      {receipt && <p className="receipt" role="status"><CheckCircle size={16} />{receipt}</p>}

      {!cycleHasData ? (
        <EmptyState title="Chưa có dữ liệu chu kỳ này" body="OKR và báo cáo cho H1 2026 chưa được đồng bộ từ iGoal. Chọn H2 2026 để xem dữ liệu demo." />
      ) : (
        <>
          <div className="neutral-tabs" role="tablist" aria-label="Chế độ xem mục tiêu">
            {TABS.map((tab) => (
              <button key={tab.key} type="button" role="tab" id={`goals-tab-${tab.key}`} aria-selected={activeTab === tab.key} aria-controls={`goals-panel-${tab.key}`} className={activeTab === tab.key ? 'is-active' : ''} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
            ))}
          </div>

          {activeTab === 'main' && (
            <div id="goals-panel-main" role="tabpanel" aria-labelledby="goals-tab-main">
              {reportGoal && <ReportForm goal={reportGoal} authorName={user.name} onCancel={() => setReportGoal(null)} onSubmit={handleSubmitReport} />}
              <section className="section-block">
                <SectionHeader title="OKR công ty · nhóm · cá nhân" meta={`${okrTree.length} objective · chu kỳ ${cycle}`} />
                <OkrTree nodes={tree} variant="list" expandedIds={expandedIds} onToggle={toggleNode} goalsById={goalsById} />
              </section>
              <GoalMyList goals={goals} onCheckIn={handleCheckIn} onOpenReport={setReportGoal} />
              <ReportList reports={checkInReports} limit={2} onViewAll={() => setActiveTab('reports')} />
            </div>
          )}

          {activeTab === 'diagram' && (
            <div id="goals-panel-diagram" role="tabpanel" aria-labelledby="goals-tab-diagram">
              <p className="okr-legend">Sơ đồ: <strong>Công ty</strong> → <strong>Nhóm</strong> → <strong>Cá nhân</strong>. Cuộn ngang trên màn hình nhỏ.</p>
              <div className="okr-diagram-scroll">
                <OkrTree nodes={tree} variant="diagram" expandedIds={expandedIds} onToggle={toggleNode} goalsById={goalsById} />
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div id="goals-panel-reports" role="tabpanel" aria-labelledby="goals-tab-reports">
              <ReportList reports={checkInReports} />
            </div>
          )}
        </>
      )}
    </div>
  );
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
