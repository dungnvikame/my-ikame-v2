import { useMemo, useState } from 'react';
import { ArrowRightIcon as ArrowRight, ArrowSquareOutIcon as ArrowSquareOut, TargetIcon as Target, TicketIcon as Ticket } from '@coreds/react/icons';
import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { ICheckWidget } from '../components/icheck/ICheckWidget';
import { ButtonLink, EmptyState, SectionHeader, StatusPill } from '../components/UI';
import { useLive } from '../lib/live/live-data';
import { LiveWorkSections } from './work/LiveWorkSections';
import { InsightsPanel } from './work/InsightsPanel';
import { NextUpCard } from './work/NextUpCard';
import { QuickAdd } from './work/QuickAdd';
import { TaskDrawer } from './work/TaskDrawer';
import { TaskList, type ListView } from './work/TaskList';
import { useWorkTasks } from './work/useWorkTasks';
import { summaryLine, byDue } from './work/work-utils';
import { liveToCal, loadExtra, meetingsForDate } from '../data/calendar-data';
import { todayYmd } from '../data/work-dates';
import type { WorkTask } from '../data/work-tasks';
import { useToast } from '../components/toast';
import { fullDateLabel } from '../data/icheck-data';
import type { RequestItem } from '../types';

const REQUEST_STATUS: Record<RequestItem['status'], { label: string; tone: 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Chờ duyệt', tone: 'warning' },
  in_progress: { label: 'Đang xử lý', tone: 'info' },
  done: { label: 'Đã duyệt', tone: 'success' },
};

/**
 * Tab Công việc — lăng kính iKamer: iCheck mỏng (chấm công, phép, tuần này), mục tiêu cần
 * check-in, đề xuất/đơn của tôi. Nghiệp vụ sâu deep-link iCheck / iGoal / iRequest.
 */
export function WorkPage() {
  const { user, goals, requests } = useAppState();
  const needsCheckIn = goals.filter((goal) => goal.status === 'needs_update');
  // Đã nối dữ liệu thật: cột việc lấy từ iHiring, iGoal, Lịch thay cho mục tiêu của nhân vật mẫu.
  const live = useLive().data;
  const recentRequests = requests.slice(0, 4);

  const api = useWorkTasks();
  const { showToast } = useToast();
  const [view, setView] = useState<ListView>('due');
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = api.tasks.find((t) => t.id === editingId) ?? null;
  // Họp hôm nay: lịch thật nếu có, không thì dữ liệu mẫu
  const todayMeetings = useMemo(() => meetingsForDate(todayYmd(), loadExtra(), live?.meetings ? liveToCal(live.meetings) : undefined), [live?.meetings]);

  const open = (t: WorkTask) => setEditingId(t.id);
  const jumpTo = (key: string) => {
    setView('due');
    window.setTimeout(() => document.getElementById(`wk-group-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const fixOverdue = () => {
    const first = api.tasks.filter((t) => !t.done && t.due && t.due < todayYmd()).sort(byDue)[0];
    if (first) open(first); else jumpTo('overdue');
  };
  const addTask = (title: string, project: string, due?: string) => {
    const task = api.add(title, project, due);
    showToast(`Đã thêm "${title}"`, { label: 'Hoàn tác', onClick: () => api.remove(task.id) });
  };

  return (
    <div className="page work-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{fullDateLabel(new Date()).toUpperCase()}</p>
          <h1>Công việc của {live?.person.shortName ?? user.shortName}</h1>
          <p>{summaryLine(api.tasks)}</p>
        </div>
        <ButtonLink variant="dim" size="m" href="https://app.asana.com">Mở Asana<ArrowSquareOut size={16} aria-hidden="true" /></ButtonLink>
      </header>

      <QuickAdd projects={api.projects} onAdd={addTask} />
      <NextUpCard api={api} todayMeetings={todayMeetings} onOpen={open} />
      <InsightsPanel tasks={api.tasks} onFixOverdue={fixOverdue} onShowNoDue={() => jumpTo('none')} />
      <TaskList api={api} view={view} onViewChange={setView} onOpen={open} />
      {editing && <TaskDrawer key={editing.id} task={editing} api={api} onClose={() => setEditingId(null)} />}

      <ICheckWidget />

      <div className="work-grid">
        {live ? <LiveWorkSections live={live} /> : (
        <section aria-label="Mục tiêu của tôi">
          <SectionHeader title="Mục tiêu của tôi" meta={needsCheckIn.length ? `${needsCheckIn.length} mục tiêu cần check-in` : 'Tất cả đã cập nhật'} href="/goals" actionLabel="Mở iGoal" />
          <div className="active-items">
            {needsCheckIn.length === 0 ? (
              <EmptyState icon={<Target size={44} variant="duotone" />} title="Không có mục tiêu trễ check-in" body="iGoal sẽ nhắc khi tới kỳ check-in tiếp theo." />
            ) : needsCheckIn.map((goal) => (
              <article key={goal.id} className="active-item">
                <span className="active-item-icon"><Target size={20} /></span>
                <div><strong>{goal.title}</strong><span>Tiến độ {goal.progress}% · hạn {goal.nextDue}</span></div>
                <Link className="text-link" to={`/assistant?q=${encodeURIComponent('Mục tiêu nào của tôi cần cập nhật?')}`}>Check-in với AI<ArrowRight size={16} /></Link>
              </article>
            ))}
          </div>
        </section>
        )}

        <section aria-label="Đề xuất của tôi">
          <SectionHeader title="Đề xuất của tôi" meta={`${requests.length} đơn`} href="/requests" actionLabel="Tạo đề xuất" />
          {recentRequests.length === 0 ? (
            <EmptyState icon={<Ticket size={44} variant="duotone" />} title="Chưa có đề xuất" body="Đơn nghỉ, WFH, request IT tạo qua Trợ lý AI sẽ hiện ở đây." />
          ) : (
            <div className="work-request-list">
              {recentRequests.map((request) => (
                <div key={request.id} className="work-request">
                  <div>
                    <strong>{request.title}</strong>
                    <small>{request.type} · {request.createdAtLabel}{request.handlerLabel ? ` · ${request.handlerLabel}` : ''}</small>
                  </div>
                  <StatusPill tone={REQUEST_STATUS[request.status].tone}>{REQUEST_STATUS[request.status].label}</StatusPill>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
