import { useId, useMemo, useState } from 'react';
import { CaretDownIcon as CaretDown, CaretUpIcon as CaretUp, ChartBarIcon as ChartBar } from '@coreds/react/icons';
import { Button } from '../../components/UI';
import { addDays, parseYmd, todayYmd, WEEKDAY_SHORT } from '../../data/work-dates';
import { loadExtra, meetingHours, meetingsForDate } from '../../data/calendar-data';
import type { WorkTask } from '../../data/work-tasks';
import { doneCounts } from './work-utils';

const fmtHours = (h: number) => String(Math.round(h * 10) / 10).replace('.', ',');

/** Ngày làm việc (T2–T6) kế tiếp, bắt đầu từ hôm nay nếu là ngày làm việc. */
function nextWorkdays(n: number, from = todayYmd()): string[] {
  const out: string[] = [];
  let d = from;
  while (out.length < n) {
    const wd = parseYmd(d).getDay();
    if (wd !== 0 && wd !== 6) out.push(d);
    d = addDays(d, 1);
  }
  return out;
}

type Props = { tasks: WorkTask[]; onFixOverdue: () => void; onShowNoDue: () => void };

/** Panel "Nhìn nhanh": biểu đồ CSS thuần + vài nhận xét kèm hành động. */
export function InsightsPanel({ tasks, onFixOverdue, onShowNoDue }: Props) {
  const [open, setOpen] = useState(true);
  const bodyId = useId();
  const today = todayYmd();

  const done = useMemo(() => doneCounts(tasks, 5, today), [tasks, today]);
  const load = useMemo(() => {
    const extra = loadExtra();
    return nextWorkdays(5, today).map((date) => ({
      date,
      hours: meetingHours(meetingsForDate(date, extra)),
      count: tasks.filter((t) => !t.done && t.due === date).length,
    }));
  }, [tasks, today]);

  const open_ = tasks.filter((t) => !t.done);
  const overdue = open_.filter((t) => t.due && t.due < today).length;
  const noDue = open_.filter((t) => !t.due).length;
  const heaviest = [...load].sort((a, b) => b.hours - a.hours)[0];
  const maxDone = Math.max(1, ...done.map((d) => d.count));
  const maxLoad = Math.max(1, ...load.map((d) => d.hours + d.count));

  return (
    <section className="wk-card wk-insights" aria-label="Nhìn nhanh">
      <div className="wk-card-head">
        <h2><ChartBar size={18} aria-hidden="true" />Nhìn nhanh</h2>
        <Button variant="borderless" size="s" aria-expanded={open} aria-controls={bodyId} icon={open ? <CaretUp size={16} /> : <CaretDown size={16} />} onClick={() => setOpen((o) => !o)}>
          {open ? 'Thu gọn' : 'Mở rộng'}
        </Button>
      </div>
      {open && (
        <div id={bodyId} className="wk-insights-body">
          <div className="wk-charts">
            <figure className="wk-chart">
              <figcaption>Xong mỗi ngày, 5 ngày gần nhất</figcaption>
              <ul className="wk-bars" role="list">
                {done.map((d) => (
                  <li key={d.date} aria-label={`${WEEKDAY_SHORT[parseYmd(d.date).getDay()]}: xong ${d.count} việc`}>
                    <span className="wk-bar-val">{d.count}</span>
                    <span className="wk-bar-track"><i className="wk-bar wk-bar-done" style={{ height: `${(d.count / maxDone) * 100}%` }} /></span>
                    <span className="wk-bar-label">{d.date === today ? 'Nay' : WEEKDAY_SHORT[parseYmd(d.date).getDay()]}</span>
                  </li>
                ))}
              </ul>
            </figure>
            <figure className="wk-chart">
              <figcaption>Tải 5 ngày làm việc tới</figcaption>
              <ul className="wk-bars" role="list">
                {load.map((d) => (
                  <li key={d.date} aria-label={`${WEEKDAY_SHORT[parseYmd(d.date).getDay()]}: ${fmtHours(d.hours)} giờ họp, ${d.count} việc đến hạn`}>
                    <span className="wk-bar-val">{fmtHours(d.hours)}h</span>
                    <span className="wk-bar-track wk-bar-stack">
                      <i className="wk-bar wk-bar-task" style={{ height: `${(d.count / maxLoad) * 100}%` }} />
                      <i className="wk-bar wk-bar-meet" style={{ height: `${(d.hours / maxLoad) * 100}%` }} />
                    </span>
                    <span className="wk-bar-label">{d.date === today ? 'Nay' : WEEKDAY_SHORT[parseYmd(d.date).getDay()]}</span>
                  </li>
                ))}
              </ul>
              <p className="wk-legend"><span><i className="wk-dot wk-bar-meet" />Giờ họp</span><span><i className="wk-dot wk-bar-task" />Việc đến hạn</span></p>
            </figure>
          </div>
          <ul className="wk-insight-lines">
            {overdue > 0 && (
              <li><span>{overdue} việc quá hạn, nên xử lý trước khi nhận việc mới.</span><Button variant="dim" size="s" onClick={onFixOverdue}>Xử lý nhanh</Button></li>
            )}
            {noDue > 0 && (
              <li><span>{noDue} việc không có hạn, dễ bị trôi.</span><Button variant="dim" size="s" onClick={onShowNoDue}>Xem</Button></li>
            )}
            {heaviest && heaviest.hours >= 2 && (
              <li><span>{heaviest.date === today ? 'Hôm nay' : WEEKDAY_SHORT[parseYmd(heaviest.date).getDay()]} họp nhiều nhất ({fmtHours(heaviest.hours)} giờ), tránh xếp việc nặng vào ngày này.</span></li>
            )}
            {overdue === 0 && noDue === 0 && <li><span>Mọi việc đều có hạn và không có việc quá hạn. Làm tốt lắm.</span></li>}
          </ul>
        </div>
      )}
    </section>
  );
}
