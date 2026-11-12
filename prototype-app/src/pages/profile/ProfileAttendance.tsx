import { useMemo } from 'react';
import { SectionHeader } from '../../components/UI';
import { DAY_STATUS_LABEL, buildHeatmap, formatDm, summarizeHeatmap, weekdayLabel, type DayStatus } from './profile-utils';

const LEGEND: DayStatus[] = ['on_time', 'late', 'leave', 'absent', 'holiday'];
const ROW_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6'];

/** Chấm công dạng nhiệt 12 tuần gần nhất (dữ liệu mẫu sinh theo seed của từng người). */
export function ProfileAttendance({ seed }: { seed: string }) {
  const grid = useMemo(() => buildHeatmap(seed), [seed]);
  const summary = useMemo(() => summarizeHeatmap(grid), [grid]);
  const monthLabels = grid.map((week, index) => {
    const first = week[0].date;
    return index === 0 || first.getDate() <= 7 ? `Th${first.getMonth() + 1}` : '';
  });

  return (
    <section className="pp-card pp-section" aria-label="Chấm công dạng nhiệt">
      <SectionHeader title="Chấm công dạng nhiệt" meta="12 tuần gần nhất · Thứ Hai đến Thứ Sáu · dữ liệu mẫu" />
      <p className="pp-heat-summary">
        {summary.percent === null
          ? 'Chưa có buổi đi làm nào trong 30 ngày qua.'
          : <>Đúng giờ <strong>{summary.percent}%</strong> trong 30 ngày, <strong>{summary.late} buổi muộn</strong></>}
      </p>
      <div className="pp-heat-scroll">
        <div className="pp-heat" role="group" aria-label="Lưới chấm công theo tuần">
          <div className="pp-heat-rows" aria-hidden="true">
            <span />
            {ROW_LABELS.map((label) => <span key={label}>{label}</span>)}
          </div>
          {grid.map((week, w) => (
            <div key={week[0].date.toISOString()} className="pp-heat-col">
              <span className="pp-heat-month" aria-hidden="true">{monthLabels[w]}</span>
              {week.map((day, d) => {
                const text = `${weekdayLabel(d)} ${formatDm(day.date)}: ${DAY_STATUS_LABEL[day.status]}`;
                return <span key={day.date.getTime()} className={`pp-heat-cell is-${day.status}`} role="img" aria-label={text} title={text} />;
              })}
            </div>
          ))}
        </div>
      </div>
      <ul className="pp-legend" aria-label="Chú giải">
        {LEGEND.map((status) => (
          <li key={status}><span className={`pp-heat-cell is-${status}`} aria-hidden="true" />{DAY_STATUS_LABEL[status]}</li>
        ))}
      </ul>
    </section>
  );
}
