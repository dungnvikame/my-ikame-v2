import { useMemo } from 'react';
import { DoorIcon as Door } from '@coreds/react/icons';
import { StatusPill } from '../../components/UI';
import { DAY_END, DAY_START, fmtTime, nowMinutes, roomStatuses, type CalMeeting } from '../../data/calendar-data';
import { todayYmd } from '../../data/work-dates';

/** Danh sách phòng họp và độ trống tại mốc hiện tại (hoặc 9h nếu xem ngày khác). */
export function RoomsPanel({ date, extra }: { date: string; extra: CalMeeting[] }) {
  const isToday = date === todayYmd();
  const now = nowMinutes();
  const ref = isToday ? (now >= DAY_END ? DAY_START : Math.max(DAY_START, now)) : 9 * 60;

  const list = useMemo(() => {
    const rows = roomStatuses(date, ref, extra);
    return rows.sort((a, b) => Number(b.free) - Number(a.free) || (b.until - b.from) - (a.until - a.from));
  }, [date, ref, extra]);

  return (
    <section className="cal-card cal-rooms" aria-label="Phòng phù hợp">
      <div className="cal-card-head"><h2><Door size={18} aria-hidden="true" />Phòng phù hợp</h2><span className="cal-muted">{isToday ? 'Tình trạng lúc này' : `Tình trạng từ ${fmtTime(ref)}`}</span></div>
      <ul className="cal-room-list">
        {list.map(({ room, free, from, until }) => (
          <li key={room.id}>
            <div className="cal-room-main">
              <strong>{room.name}</strong>
              <span className="cal-muted">Tầng {room.floor} · {room.capacity} chỗ · {room.equipment.join(', ')}</span>
              <span className={free ? 'cal-room-state cal-room-free' : 'cal-room-state'}>{free ? `Trống đến ${fmtTime(until)}` : `Đang bận, trống từ ${fmtTime(from)}`}</span>
            </div>
            {free && until - from > 120 && <StatusPill tone="success">Trống trên 2 giờ</StatusPill>}
          </li>
        ))}
      </ul>
    </section>
  );
}
