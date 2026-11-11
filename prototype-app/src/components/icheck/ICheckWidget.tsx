import { CalendarCheckIcon as CalendarCheck, ClockIcon as Clock, HouseIcon as House, QuestionIcon as Question } from '@coreds/react/icons';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../AppState';
import { useToast } from '../toast';
import { Button } from '../UI';
import { ATTENDANCE_LEGEND, ICHECK_QUICK_ACTIONS, type ICheckQuickActionKey } from '../../data/icheck-data';
import { useLive } from '../../lib/live/live-data';
import { PlatformHandoffButton } from '../PlatformHandoff';
import { LeaveBalanceCard } from './LeaveBalanceCard';
import { WeekStrip } from './WeekStrip';

const QUICK_ICONS: Record<ICheckQuickActionKey, typeof Clock> = { late: Clock, leave: CalendarCheck, missing: Question, wfh: House };

/**
 * iCheck mỏng trong My iKame — phần iKamer chạm mỗi ngày (ảnh iCheck 27/10): banner trạng thái,
 * 4 nút nhanh (đi qua Trợ lý AI → MCP iCheck), ngày phép. Lịch tháng/lịch sử để ở iCheck thật.
 * `compact` = thẻ trên Home; bản đầy đủ nằm ở tab Công việc.
 */
export function ICheckWidget({ compact = false }: { compact?: boolean }) {
  const mock = useAppState();
  const icheck = useLive().data?.icheck;
  // Bản artifact đã kết nối iCheck: hiện số thật của người xem, chỉ đọc (không chấm công hộ).
  const isLive = !!icheck;
  const dailyCheckIn = isLive ? icheck!.checkIn : mock.dailyCheckIn;
  const weekAttendance = isLive ? icheck!.week : mock.weekAttendance;
  const leaveBalance = isLive
    ? { ...mock.leaveBalance, annualRemaining: icheck!.leave.total, carriedOver: icheck!.leave.carriedOver, annualTotal: icheck!.leave.annualQuota, annualUsed: icheck!.leave.annualUsed }
    : mock.leaveBalance;
  const { submitDailyCheckIn } = mock;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const status = dailyCheckIn.done ? ATTENDANCE_LEGEND[dailyCheckIn.status ?? 'on_time'] : null;

  const checkIn = () => {
    submitDailyCheckIn('WFO');
    showToast('Đã chấm công — iCheck ghi nhận giờ vào.');
  };

  return (
    <section className={`icheck-widget ${compact ? 'is-compact' : ''}`} aria-label="Chấm công hôm nay">
      <div className="icheck-widget-main">
        <div className={`icheck-banner ${dailyCheckIn.done ? `icheck-banner--${status?.tone}` : 'icheck-banner--pending'}`}>
          {dailyCheckIn.done ? (
            <div role="status">
              <strong>Đã chấm công: {dailyCheckIn.timeLabel}</strong>
              <span>{status?.label}{dailyCheckIn.mode === 'Remote' ? ' · Làm từ xa' : ''}</span>
            </div>
          ) : (
            <>
              <strong role="status">Bạn chưa chấm công hôm nay</strong>
              {isLive
                ? <PlatformHandoffButton platform="iCheck" action="chấm công" label="Mở iCheck để chấm công" />
                : <Button variant="primary" onClick={checkIn}>Chấm công ngay</Button>}
            </>
          )}
        </div>
        <div className="icheck-quick-actions" role="group" aria-label="Thao tác nhanh iCheck">
          {ICHECK_QUICK_ACTIONS.map((action) => {
            const Icon = QUICK_ICONS[action.key as keyof typeof QUICK_ICONS];
            return (
              <button key={action.key} type="button" className="icheck-quick-action" onClick={() => navigate(`/assistant?q=${encodeURIComponent(action.prompt)}`)}>
                <Icon size={17} /> {action.label}
              </button>
            );
          })}
        </div>
        {!compact && <WeekStrip days={weekAttendance} showLegend />}
        {isLive && (
          <p className="live-source">Nguồn: iCheck · tháng này đã chấm {icheck!.month.checkedDays} buổi, đi muộn {icheck!.month.lateDays} buổi</p>
        )}
      </div>
      <LeaveBalanceCard leaveBalance={leaveBalance} compact={compact} hideWedding={isLive} />
    </section>
  );
}
