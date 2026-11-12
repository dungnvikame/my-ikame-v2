import { useMemo, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Checkbox, SegmentedControl } from '@coreds/react';
import { ArrowBendUpRightIcon as ArrowBendUpRight, CheckIcon as Check, ClockIcon as Clock, ListChecksIcon as ListChecks } from '@coreds/react/icons';
import { Button, EmptyState } from '../../components/UI';
import { useToast } from '../../components/toast';
import { addDays, todayYmd } from '../../data/work-dates';
import type { WorkTask } from '../../data/work-tasks';
import { byDue, DUE_GROUPS, dueGroupOf, dueText } from './work-utils';
import type { WorkTasksApi } from './useWorkTasks';

export type ListView = 'due' | 'project';

const SWIPE_THRESHOLD = 80;
const SWIPE_MAX = 140;

/** Dòng kéo được: kéo phải = xong, kéo trái = dời sang mai. Vẫn có nút bấm tương đương. */
function SwipeRow({ disabled, onDone, onSnooze, children }: { disabled: boolean; onDone: () => void; onSnooze: () => void; children: ReactNode }) {
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const justDragged = useRef(false);

  const reset = () => { start.current = null; dragging.current = false; setDx(0); };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if ((e.target as HTMLElement).closest('button, input, a, [role="checkbox"], label')) return;
    start.current = { x: e.clientX, y: e.clientY };
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const ddx = e.clientX - start.current.x;
    const ddy = e.clientY - start.current.y;
    if (!dragging.current) {
      if (Math.abs(ddx) < 8 || Math.abs(ddx) < Math.abs(ddy)) return;
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setDx(Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, ddx)));
  };
  const up = () => {
    if (dragging.current) {
      justDragged.current = true;
      window.setTimeout(() => { justDragged.current = false; }, 0);
      if (dx >= SWIPE_THRESHOLD) onDone();
      else if (dx <= -SWIPE_THRESHOLD) onSnooze();
    }
    reset();
  };

  const state = dx >= SWIPE_THRESHOLD ? 'done' : dx <= -SWIPE_THRESHOLD ? 'snooze' : dx > 0 ? 'done-hint' : dx < 0 ? 'snooze-hint' : 'idle';

  return (
    <div className="wk-swipe" data-state={state}>
      <div className="wk-reveal wk-reveal-done" aria-hidden="true"><Check size={18} />Xong</div>
      <div className="wk-reveal wk-reveal-snooze" aria-hidden="true">Dời sang mai<ArrowBendUpRight size={18} /></div>
      <div
        className="wk-swipe-body"
        data-dragging={dx !== 0 || undefined}
        style={{ transform: dx ? `translateX(${dx}px)` : undefined }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={reset}
        onClickCapture={(e) => { if (justDragged.current) { e.stopPropagation(); e.preventDefault(); } }}
      >
        {children}
      </div>
    </div>
  );
}

type Props = {
  api: WorkTasksApi;
  view: ListView;
  onViewChange: (v: ListView) => void;
  onOpen: (t: WorkTask) => void;
};

export function TaskList({ api, view, onViewChange, onOpen }: Props) {
  const { showToast } = useToast();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [showDone, setShowDone] = useState(false);
  const today = todayYmd();
  const tomorrow = addDays(today, 1);

  const open = useMemo(() => api.tasks.filter((t) => !t.done).sort(byDue), [api.tasks]);
  const done = useMemo(() => api.tasks.filter((t) => t.done), [api.tasks]);

  const groups = useMemo(() => {
    if (view === 'due') {
      return DUE_GROUPS.map((g) => ({ key: g.key, label: g.label, tasks: open.filter((t) => dueGroupOf(t, today) === g.key) })).filter((g) => g.tasks.length);
    }
    const names = [...new Set(open.map((t) => t.project))];
    return names.map((name) => ({ key: name, label: name, tasks: open.filter((t) => t.project === name) }));
  }, [open, view, today]);

  const complete = (ids: string[]) => {
    api.setDone(ids, true);
    setSelected((s) => s.filter((id) => !ids.includes(id)));
    const first = api.tasks.find((t) => t.id === ids[0]);
    showToast(ids.length > 1 ? `Đã xong ${ids.length} việc` : `Đã xong "${first?.title ?? 'việc'}"`, { label: 'Hoàn tác', onClick: () => api.setDone(ids, false) });
  };

  const snooze = (ids: string[]) => {
    const prev = new Map(api.tasks.filter((t) => ids.includes(t.id)).map((t) => [t.id, t.due]));
    api.patch(ids, (t) => ({ ...t, due: tomorrow }));
    setSelected((s) => s.filter((id) => !ids.includes(id)));
    showToast(ids.length > 1 ? `Đã dời ${ids.length} việc sang mai` : 'Đã dời sang ngày mai', { label: 'Hoàn tác', onClick: () => api.patch(ids, (t) => ({ ...t, due: prev.get(t.id) })) });
  };

  const toggleSelect = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const exitSelect = () => { setSelecting(false); setSelected([]); };

  const renderRow = (t: WorkTask) => {
    const overdue = !!t.due && t.due < today;
    const doneSubs = t.subtasks.filter((s) => s.done).length;
    return (
      <li key={t.id} className="wk-row-item">
        <SwipeRow disabled={selecting || t.done} onDone={() => complete([t.id])} onSnooze={() => snooze([t.id])}>
          <div className="wk-row" data-done={t.done || undefined}>
            {selecting ? (
              <Checkbox aria-label={`Chọn "${t.title}"`} checked={selected.includes(t.id)} onCheckedChange={() => toggleSelect(t.id)} />
            ) : (
              <Checkbox aria-label={t.done ? `Mở lại "${t.title}"` : `Hoàn thành "${t.title}"`} checked={t.done} onCheckedChange={(v) => (v === true ? complete([t.id]) : api.setDone([t.id], false))} />
            )}
            <div className="wk-row-main">
              <button type="button" className="wk-row-title" onClick={() => onOpen(t)}>{t.title}</button>
              <div className="wk-row-meta">
                {view === 'due' && <span className="wk-project">{t.project}</span>}
                <span className={overdue && !t.done ? 'wk-due wk-due-late' : 'wk-due'}>{dueText(t, today)}</span>
                {t.scheduledAt?.startsWith(today) && !t.done && <span className="wk-due"><Clock size={12} aria-hidden="true" />{t.scheduledAt.slice(11)}</span>}
                {t.subtasks.length > 0 && <span className="wk-sub"><ListChecks size={12} aria-hidden="true" />{doneSubs}/{t.subtasks.length}</span>}
              </div>
            </div>
            {!selecting && !t.done && (
              <Button variant="borderless" size="s" className="wk-row-snooze" aria-label={`Dời "${t.title}" sang mai`} onClick={() => snooze([t.id])}>Dời mai</Button>
            )}
          </div>
        </SwipeRow>
      </li>
    );
  };

  return (
    <section className="wk-card wk-list" aria-label="Danh sách việc">
      <div className="wk-card-head wk-list-head">
        <h2>Việc của bạn<span className="wk-count">{open.length}</span></h2>
        <div className="wk-list-tools">
          <SegmentedControl
            aria-label="Cách xem danh sách"
            size="s"
            options={[{ value: 'due', label: 'Theo hạn' }, { value: 'project', label: 'Theo dự án' }]}
            value={view}
            onValueChange={(v) => onViewChange(v as ListView)}
          />
          <Button variant={selecting ? 'primary' : 'dim'} size="s" aria-pressed={selecting} onClick={() => (selecting ? exitSelect() : setSelecting(true))}>
            {selecting ? 'Xong chọn' : 'Chọn nhiều'}
          </Button>
        </div>
      </div>

      {selecting && (
        <div className="wk-bulk" role="toolbar" aria-label="Thao tác hàng loạt">
          <strong>{selected.length ? `Đã chọn ${selected.length} việc` : 'Chọn các việc cần xử lý'}</strong>
          <div className="wk-actions">
            <Button variant="primary" size="s" disabled={!selected.length} icon={<Check size={14} />} onClick={() => complete(selected)}>Xong</Button>
            <Button variant="dim" size="s" disabled={!selected.length} onClick={() => snooze(selected)}>Dời sang mai</Button>
            <Button variant="borderless" size="s" disabled={!selected.length} onClick={() => setSelected([])}>Bỏ chọn</Button>
          </div>
        </div>
      )}

      {!selecting && open.length > 0 && <p className="wk-swipe-tip">Mẹo: kéo một dòng sang phải để xong, sang trái để dời sang mai.</p>}

      {open.length === 0 ? (
        <EmptyState title="Không còn việc nào" body="Thêm việc mới ở ô phía trên hoặc nghỉ ngơi một chút." />
      ) : groups.map((g) => (
        <div key={g.key} id={`wk-group-${g.key}`} className="wk-group" data-tone={g.key === 'overdue' ? 'late' : undefined}>
          <h3>{g.label}<span className="wk-count">{g.tasks.length}</span></h3>
          <ul className="wk-rows">{g.tasks.map(renderRow)}</ul>
        </div>
      ))}

      {done.length > 0 && (
        <div className="wk-group">
          <Button variant="borderless" size="s" aria-expanded={showDone} onClick={() => setShowDone((s) => !s)}>
            {showDone ? 'Ẩn' : 'Hiện'} {done.length} việc đã xong
          </Button>
          {showDone && <ul className="wk-rows">{done.map(renderRow)}</ul>}
        </div>
      )}
    </section>
  );
}
