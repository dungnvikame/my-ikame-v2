import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowBendUpRightIcon as ArrowBendUpRight, CheckIcon as Check, ClockIcon as Clock, PauseIcon as Pause, PlayIcon as Play, SkipForwardIcon as SkipForward, SparkleIcon as Sparkle, StopIcon as Stop, TimerIcon as Timer } from '@coreds/react/icons';
import { Button, ChipButton, EmptyState } from '../../components/UI';
import { useToast } from '../../components/toast';
import { addDays, dayLabel, startOfWeek, todayYmd, ymd } from '../../data/work-dates';
import { DAY_END, fmtTime, freeGaps, meetingBlocks, nowMinutes, type CalMeeting } from '../../data/calendar-data';
import type { WorkTask } from '../../data/work-tasks';
import { nextReason, pickNext } from './work-utils';
import type { WorkTasksApi } from './useWorkTasks';

const FOCUS_SECONDS = 25 * 60;

/** Đồng hồ Pomodoro 25 phút. Dùng mốc kết thúc thay vì đếm tick để không lệch khi tab ngủ. */
function FocusTimer({ task, onDone, onStop }: { task: WorkTask; onDone: () => void; onStop: () => void }) {
  const { showToast } = useToast();
  const [left, setLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(true);
  const endRef = useRef(Date.now() + FOCUS_SECONDS * 1000);
  const notified = useRef(false);

  useEffect(() => {
    if (!running) return undefined;
    endRef.current = Date.now() + left * 1000;
    const id = window.setInterval(() => {
      const remain = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setLeft(remain);
      if (remain === 0) {
        setRunning(false);
        if (!notified.current) { notified.current = true; showToast('Hết 25 phút tập trung. Nghỉ chút rồi tiếp tục nhé.'); }
      }
    }, 500);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ khởi động lại khi bật/tạm dừng
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const pct = ((FOCUS_SECONDS - left) / FOCUS_SECONDS) * 100;

  return (
    <div className="wk-focus">
      <div className="wk-focus-clock" role="timer" aria-label={`Còn ${mm} phút ${ss} giây`}>
        <strong>{mm}:{ss}</strong>
        <span>Đang tập trung: {task.title}</span>
      </div>
      <div className="wk-focus-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
      <div className="wk-actions">
        {left > 0 && (
          <Button variant="dim" size="m" icon={running ? <Pause size={16} /> : <Play size={16} />} onClick={() => setRunning((r) => !r)}>
            {running ? 'Tạm dừng' : 'Tiếp tục'}
          </Button>
        )}
        <Button variant="dim" size="m" icon={<Stop size={16} />} onClick={onStop}>Dừng</Button>
        <Button variant="primary" size="m" icon={<Check size={16} />} onClick={onDone}>Xong</Button>
      </div>
    </div>
  );
}

type Panel = 'none' | 'schedule' | 'snooze';

/** Thẻ "Nên làm tiếp": một việc ưu tiên nhất kèm lý do, giờ trống và các thao tác nhanh. */
export function NextUpCard({ api, todayMeetings, onOpen }: { api: WorkTasksApi; todayMeetings: CalMeeting[]; onOpen: (t: WorkTask) => void }) {
  const { showToast } = useToast();
  const [skipped, setSkipped] = useState<string[]>([]);
  const [panel, setPanel] = useState<Panel>('none');
  const [focusing, setFocusing] = useState(false);

  const task = useMemo(() => pickNext(api.tasks, skipped), [api.tasks, skipped]);
  const today = todayYmd();

  // Khoảng trống còn lại của hôm nay (từ bây giờ)
  const gaps = useMemo(() => {
    const now = nowMinutes();
    return freeGaps(meetingBlocks(todayMeetings), Math.max(now, 8 * 60), DAY_END, 30);
  }, [todayMeetings]);

  const startOptions = useMemo(() => {
    const out: number[] = [];
    for (const [s, e] of gaps) {
      for (let t = Math.ceil(s / 30) * 30; t + 25 <= e && out.length < 8; t += 30) out.push(t);
    }
    return out;
  }, [gaps]);

  if (!task) {
    return (
      <section className="wk-card wk-next" aria-label="Nên làm tiếp">
        <EmptyState icon={<Sparkle size={44} variant="duotone" />} title="Bạn đã xong hết việc cần làm" body={skipped.length ? 'Bạn đã bỏ qua hết gợi ý hôm nay.' : 'Thêm việc mới ở ô phía trên để bắt đầu.'} />
        {skipped.length > 0 && <div className="wk-actions"><Button variant="dim" size="m" onClick={() => setSkipped([])}>Xem lại gợi ý</Button></div>}
      </section>
    );
  }

  const reset = () => { setPanel('none'); setFocusing(false); };

  const complete = () => {
    api.setDone([task.id], true);
    reset();
    showToast(`Đã xong "${task.title}"`, { label: 'Hoàn tác', onClick: () => api.setDone([task.id], false) });
  };

  const snooze = (due: string) => {
    const prev = task.due;
    api.setDue([task.id], due);
    reset();
    showToast(`Đã dời "${task.title}" sang ${dayLabel(due).toLowerCase()}`, { label: 'Hoàn tác', onClick: () => api.setDue([task.id], prev) });
  };

  const schedule = (min: number) => {
    api.patch([task.id], (t) => ({ ...t, due: t.due && t.due < today ? today : t.due ?? today, scheduledAt: `${ymd(new Date())}T${fmtTime(min)}` }));
    reset();
    showToast(`Đã đặt giờ ${fmtTime(min)} hôm nay cho "${task.title}"`);
  };

  const scheduledToday = task.scheduledAt?.startsWith(today) ? task.scheduledAt.slice(11) : null;
  const gapHint = gaps.length
    ? `Bạn trống ${fmtTime(gaps[0][0])}–${fmtTime(gaps[0][1])} hôm nay, đủ để làm việc này.`
    : 'Lịch hôm nay đã kín, thử đặt giờ vào ngày mai.';
  const snoozeOptions = [
    { label: 'Ngày mai', date: addDays(today, 1) },
    { label: 'Thứ 2 tuần sau', date: addDays(startOfWeek(today), 7) },
    { label: '7 ngày nữa', date: addDays(today, 7) },
  ];

  return (
    <section className="wk-card wk-next" aria-label="Nên làm tiếp">
      <div className="wk-next-head">
        <span className="wk-badge"><Sparkle size={14} variant="fill" aria-hidden="true" />Nên làm tiếp</span>
        {task.subtasks.length > 0 && <span className="wk-muted">{task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} bước</span>}
      </div>
      <button type="button" className="wk-next-title" onClick={() => onOpen(task)}>{task.title}</button>
      <p className="wk-next-why">{nextReason(task, today)}</p>
      <p className="wk-next-gap"><Clock size={16} aria-hidden="true" />{scheduledToday ? `Đã đặt giờ ${scheduledToday} hôm nay.` : gapHint}</p>

      {focusing ? (
        <FocusTimer task={task} onDone={complete} onStop={() => setFocusing(false)} />
      ) : (
        <div className="wk-actions">
          <Button variant="primary" size="m" icon={<Timer size={16} />} onClick={() => { setPanel('none'); setFocusing(true); }}>Tập trung 25 phút</Button>
          <Button variant="dim" size="m" icon={<Clock size={16} />} aria-expanded={panel === 'schedule'} onClick={() => setPanel(panel === 'schedule' ? 'none' : 'schedule')}>Đặt giờ</Button>
          <Button variant="dim" size="m" icon={<ArrowBendUpRight size={16} />} aria-expanded={panel === 'snooze'} onClick={() => setPanel(panel === 'snooze' ? 'none' : 'snooze')}>Dời</Button>
          <Button variant="borderless" size="m" icon={<SkipForward size={16} />} onClick={() => { setSkipped((s) => [...s, task.id]); reset(); }}>Bỏ qua</Button>
        </div>
      )}

      {panel === 'schedule' && (
        <div className="wk-pop" role="group" aria-label="Chọn giờ hôm nay">
          {startOptions.length === 0 ? <span className="wk-muted">Hôm nay không còn khoảng trống đủ 25 phút.</span>
            : startOptions.map((m) => <ChipButton key={m} onClick={() => schedule(m)}>{fmtTime(m)}</ChipButton>)}
        </div>
      )}
      {panel === 'snooze' && (
        <div className="wk-pop" role="group" aria-label="Dời sang">
          {snoozeOptions.map((o) => <ChipButton key={o.label} onClick={() => snooze(o.date)}>{o.label}</ChipButton>)}
        </div>
      )}
    </section>
  );
}
