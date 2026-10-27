import { ATTENDANCE_LEGEND } from '../../data/icheck-data';
import type { AttendanceStatus, WeekDayAttendance } from '../../types';

const LEGEND_ORDER: AttendanceStatus[] = ['on_time', 'late', 'leave_full', 'leave_half', 'wfh', 'holiday', 'absent'];

/** Dải T2–CN tuần hiện tại — bản rút gọn của lịch tháng iCheck; lịch đầy đủ deep-link sang iCheck. */
export function WeekStrip({ days, showLegend = false }: { days: WeekDayAttendance[]; showLegend?: boolean }) {
  return (
    <div className="icheck-week">
      <ol className="icheck-week-days" aria-label="Chấm công tuần này">
        {days.map((day) => {
          const legend = ATTENDANCE_LEGEND[day.status];
          return (
            <li key={day.dateLabel} className={`icheck-day icheck-day--${legend.tone} ${day.isToday ? 'is-today' : ''}`} title={`${day.dateLabel} · ${legend.label}`}>
              <small>{day.weekday}</small>
              <strong>{day.dateLabel.slice(0, 2)}</strong>
              <span className="icheck-day-mark" aria-hidden="true">{legend.symbol}</span>
              <span className="sr-only">{legend.label}</span>
            </li>
          );
        })}
      </ol>
      {showLegend && (
        <ul className="icheck-legend" aria-label="Chú giải">
          {LEGEND_ORDER.map((status) => (
            <li key={status}><span className={`icheck-legend-dot icheck-day--${ATTENDANCE_LEGEND[status].tone}`} aria-hidden="true" />{ATTENDANCE_LEGEND[status].label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
