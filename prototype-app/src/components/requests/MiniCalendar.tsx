import { useState } from 'react';
import { CaretLeftIcon as CaretLeft, CaretRightIcon as CaretRight } from '@coreds/react/icons';
import { toIsoDay } from '../../lib/request-parser';
import { IconButton } from '../UI';
import { fromIso, holidayName, isWeekendIso, todayIso, weekdayLabel } from './request-context';

/**
 * Lịch tháng nhỏ để chọn ngày: bấm ngày đầu rồi ngày cuối (chế độ khoảng) hoặc một ngày.
 * T7/CN làm mờ, ngày lễ có chấm, hôm nay có viền. Mặc định chỉ chọn từ hôm nay trở đi;
 * `allowPast` (bổ sung chấm công) đảo lại: chỉ chọn đến hôm nay.
 */
type Props = {
  start: string;
  end: string;
  range: boolean;
  allowPast?: boolean;
  onChange: (start: string, end: string) => void;
};

const HEADS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export function MiniCalendar({ start, end, range, allowPast, onChange }: Props) {
  const [view, setView] = useState(() => { const date = fromIso(start); return new Date(date.getFullYear(), date.getMonth(), 1); });
  // Đang chờ bấm ngày cuối của khoảng.
  const [anchor, setAnchor] = useState<string>();
  const today = todayIso();

  const first = view;
  const lead = (first.getDay() + 6) % 7; // ô trống trước ngày 1 (tuần bắt đầu T2)
  const total = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: total }, (_, index) => toIsoDay(new Date(first.getFullYear(), first.getMonth(), index + 1))),
  ];

  const shift = (delta: number) => setView(new Date(first.getFullYear(), first.getMonth() + delta, 1));

  const pick = (iso: string) => {
    if (!range) { onChange(iso, iso); return; }
    if (anchor) {
      const [from, to] = iso < anchor ? [iso, anchor] : [anchor, iso];
      onChange(from, to);
      setAnchor(undefined);
    } else {
      onChange(iso, iso);
      setAnchor(iso);
    }
  };

  return (
    <div className="rq-cal" role="group" aria-label="Chọn ngày">
      <div className="rq-cal-head">
        <IconButton label="Tháng trước" onClick={() => shift(-1)}><CaretLeft size={16} /></IconButton>
        <strong aria-live="polite">Tháng {first.getMonth() + 1}/{first.getFullYear()}</strong>
        <IconButton label="Tháng sau" onClick={() => shift(1)}><CaretRight size={16} /></IconButton>
      </div>
      <div className="rq-cal-grid">
        {HEADS.map((head) => <span key={head} className="rq-cal-dow" aria-hidden="true">{head}</span>)}
        {cells.map((iso, index) => {
          if (!iso) return <span key={`blank-${index}`} aria-hidden="true" />;
          const holiday = holidayName(iso);
          const weekend = isWeekendIso(iso);
          const disabled = (allowPast ? iso > today : iso < today) || weekend || !!holiday;
          const inRange = iso >= start && iso <= end;
          const cls = ['rq-cal-day',
            weekend && 'is-weekend', holiday && 'is-holiday', iso === today && 'is-today',
            inRange && 'is-in-range', iso === start && 'is-start', iso === end && 'is-end'].filter(Boolean).join(' ');
          return (
            <button
              key={iso}
              type="button"
              className={cls}
              disabled={disabled}
              aria-pressed={inRange}
              aria-label={`${weekdayLabel(iso)} ${Number(iso.slice(8))}/${Number(iso.slice(5, 7))}${holiday ? `, ${holiday}` : ''}${iso === today ? ', hôm nay' : ''}`}
              title={holiday}
              onClick={() => pick(iso)}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
      <p className="rq-cal-legend">
        <span><i className="rq-dot rq-dot--today" />Hôm nay</span>
        <span><i className="rq-dot rq-dot--holiday" />Ngày lễ</span>
        <span><i className="rq-dot rq-dot--off" />Cuối tuần</span>
        {range && <em>{anchor ? 'Bấm ngày cuối của kỳ nghỉ' : 'Bấm ngày đầu, rồi ngày cuối'}</em>}
      </p>
    </div>
  );
}
