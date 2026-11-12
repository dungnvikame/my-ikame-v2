import { CalendarXIcon as CalendarX, InfoIcon as Info, UsersThreeIcon as UsersThree, WarningIcon as Warning } from '@coreds/react/icons';
import type { LiveMeeting } from '../../lib/live/live-data';
import { Button } from '../UI';
import { conflictingMeetings, dayCount, leaveDaysOf, shortDate, teammatesOff, todayIso } from './request-context';
import type { FormState } from './request-form-model';

/**
 * Ngữ cảnh tức thì cho đơn nghỉ phép: số phép dùng/còn, họp bị trùng (kèm "Báo vắng"),
 * đồng nghiệp cùng nghỉ và nhắc quy định. Họp thật chỉ có cho hôm nay; ngày khác là lịch mẫu.
 */
type Props = {
  state: FormState;
  remaining: number;
  meetings?: LiveMeeting[];
  absent: string[];
  onToggleAbsent: (id: string) => void;
};

const initials = (name: string) => name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase();

export function LeaveContextPanel({ state, remaining, meetings, absent, onToggleAbsent }: Props) {
  const used = leaveDaysOf(state.start, state.end, state.session);
  const after = remaining - used;
  const conflicts = conflictingMeetings(state.start, state.end, state.session, meetings);
  const mates = teammatesOff(state.start, state.end);
  const tooLate = state.start <= todayIso();

  return (
    <aside className="rq-context" aria-label="Ngữ cảnh đơn nghỉ" aria-live="polite">
      <div className="rq-context-block">
        <p className="rq-context-title">Ngày phép</p>
        <p className={`rq-context-line ${after < 0 ? 'is-over' : ''}`}>
          Đơn này dùng <strong>{dayCount(used)} ngày</strong>, {after < 0 ? <>vượt <strong>{dayCount(-after)} ngày</strong> so với phép còn lại</> : <>còn lại <strong>{dayCount(after)} ngày</strong></>}.
        </p>
      </div>

      <div className="rq-context-block">
        <p className="rq-context-title"><CalendarX size={14} aria-hidden="true" />Họp trùng giờ nghỉ ({conflicts.length})</p>
        {conflicts.length === 0 ? (
          <p className="rq-context-muted">Không có cuộc họp nào trùng.</p>
        ) : (
          <ul className="rq-context-list">
            {conflicts.map((meeting) => {
              const marked = absent.includes(meeting.id);
              return (
                <li key={meeting.id}>
                  <span>
                    <strong>{meeting.title}</strong>
                    <small>{shortDate(meeting.dateIso)} · {meeting.timeLabel} · {meeting.source}</small>
                  </span>
                  <Button size="s" variant={marked ? 'primary' : 'dim'} aria-pressed={marked} onClick={() => onToggleAbsent(meeting.id)}>
                    {marked ? 'Đã báo vắng' : 'Báo vắng'}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rq-context-block">
        <p className="rq-context-title"><UsersThree size={14} aria-hidden="true" />Đồng nghiệp cũng nghỉ ({mates.length})</p>
        {mates.length === 0 ? (
          <p className="rq-context-muted">Chưa ai trong team nghỉ khoảng này.</p>
        ) : (
          <ul className="rq-context-people">
            {mates.map((mate) => (
              <li key={mate.name}><span className="rq-avatar" aria-hidden="true">{initials(mate.name)}</span><span>{mate.name}<small>{mate.label}</small></span></li>
            ))}
          </ul>
        )}
      </div>

      <p className={`rq-context-policy ${tooLate ? 'is-warn' : ''}`}>
        {tooLate ? <Warning size={16} aria-hidden="true" /> : <Info size={16} aria-hidden="true" />}
        <span>
          Nghỉ phép năm cần báo trước 1 ngày làm việc.
          {tooLate && ' Ngày bạn chọn là hôm nay hoặc đã qua — nhắn thêm cho quản lý để được duyệt kịp.'}
          <small> Nội dung mẫu, chưa trích từ iWiki.</small>
        </span>
      </p>
    </aside>
  );
}
