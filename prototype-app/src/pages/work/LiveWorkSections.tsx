import { ArrowSquareOutIcon as ArrowSquareOut, CalendarBlankIcon as CalendarBlank, TargetIcon as Target, UserFocusIcon as UserFocus } from '@coreds/react/icons';
import { Link } from 'react-router-dom';
import { EmptyState, SectionHeader, ButtonLink } from '../../components/UI';
import type { LiveData } from '../../lib/live/live-data';

/**
 * Cột việc của trang Công việc khi đã nối dữ liệu thật: ứng viên chờ đánh giá (iHiring),
 * mục tiêu kỳ này (iGoal) và lịch hôm nay (Lịch Google). Thay cho khối mục tiêu của nhân vật mẫu.
 */
export function LiveWorkSections({ live }: { live: LiveData }) {
  const candidates = live.candidates ?? [];
  const objectives = live.objectives ?? [];
  const meetings = live.meetings ?? [];

  return (
    <div className="live-work">
      <section aria-label="Ứng viên chờ đánh giá">
        <SectionHeader title="Ứng viên chờ đánh giá" meta={live.candidates ? `${candidates.length} ứng viên · iHiring` : 'Chưa đọc được iHiring'} />
        {candidates.length === 0 ? (
          <EmptyState icon={<UserFocus size={44} variant="duotone" />} title="Không có ứng viên nào đang chờ" body="Ứng viên ở vòng bạn được giao sẽ hiện ở đây." />
        ) : (
          <ul className="today-tasks-list live-work-list">
            {candidates.map((candidate) => (
              <li key={candidate.id} className="today-task" data-source="iHiring">
                <div className="today-task-copy">
                  <strong>{candidate.name}</strong>
                  <span>{candidate.roundName} · {candidate.waitingDays === 0 ? 'mới chuyển vòng hôm nay' : `chờ ${candidate.waitingDays} ngày`}{candidate.waitingDays >= 7 && <em>Gấp</em>}</span>
                </div>
                <ButtonLink variant="dim" size="m" href={candidate.url}>Đánh giá<ArrowSquareOut size={14} aria-hidden="true" /></ButtonLink>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Mục tiêu kỳ này">
        <SectionHeader title="Mục tiêu kỳ này" meta={live.objectives ? `${objectives.length} mục tiêu · iGoal` : 'Chưa đọc được iGoal'} href="/profile" actionLabel="Xem chi tiết" />
        {objectives.length === 0 ? (
          <EmptyState icon={<Target size={44} variant="duotone" />} title="Chưa có mục tiêu trong kỳ này" body="Mục tiêu bạn sở hữu trên iGoal sẽ hiện ở đây." />
        ) : (
          <ul className="today-tasks-list live-work-list">
            {objectives.map((objective) => (
              <li key={objective.id} className="today-task" data-source="iGoal">
                <div className="today-task-copy">
                  <strong>{objective.title}</strong>
                  <span>{objective.scope && `${objective.scope} · `}{objective.keyResults.length} kết quả then chốt · tiến độ {Math.round(objective.progress)}%</span>
                </div>
                <ButtonLink variant="dim" size="m" to="/profile">Xem</ButtonLink>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Lịch hôm nay">
        <SectionHeader title="Lịch hôm nay" meta={live.meetings ? `${meetings.length} cuộc họp · Lịch Google` : 'Chưa đọc được Lịch'} />
        {meetings.length === 0 ? (
          <EmptyState icon={<CalendarBlank size={44} variant="duotone" />} title="Hôm nay không có cuộc họp" body="Cả ngày dành cho việc của bạn." />
        ) : (
          <ul className="today-tasks-list live-work-list">
            {meetings.map((meeting) => (
              <li key={meeting.id} className="today-task" data-source="Google Calendar">
                <div className="today-task-copy">
                  <strong>{meeting.title}</strong>
                  <span>{meeting.allDay ? 'Cả ngày' : `${meeting.startLabel}–${meeting.endLabel}`}{meeting.guests > 1 && ` · ${meeting.guests} người`}</span>
                </div>
                {meeting.url && <ButtonLink variant="dim" size="m" href={meeting.url}>Xem lịch<ArrowSquareOut size={14} aria-hidden="true" /></ButtonLink>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
