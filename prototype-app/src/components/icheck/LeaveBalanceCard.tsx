import { Info } from '@phosphor-icons/react';
import { PlatformHandoffButton } from '../PlatformHandoff';
import type { LeaveBalance } from '../../types';

/** Ô "Ngày phép còn lại" — bố cục khớp iCheck: hiện có · năm nay/năm cũ · phép hỉ · phép hàng năm. */
/** `hideWedding`: dữ liệu thật từ iCheck chưa trả phép hỉ — ẩn thay vì hiện số mẫu. */
export function LeaveBalanceCard({ leaveBalance, compact = false, hideWedding = false }: { leaveBalance: LeaveBalance; compact?: boolean; hideWedding?: boolean }) {
  const thisYear = leaveBalance.annualRemaining - leaveBalance.carriedOver;
  return (
    <section className={`icheck-leave ${compact ? 'is-compact' : ''}`} aria-label="Ngày phép còn lại">
      <header className="icheck-leave-head">
        <h3>Ngày phép còn lại</h3>
        {!compact && <PlatformHandoffButton platform="iCheck" action="xem lịch sử nghỉ phép" label="Xem lịch sử" variant="link" />}
      </header>
      <div className="icheck-leave-grid">
        <div className="icheck-leave-main">
          <small>Ngày phép hiện có</small>
          <strong>{leaveBalance.annualRemaining.toLocaleString('vi-VN')}</strong>
          <div className="icheck-leave-split">
            <span><small>Năm nay</small><b>{thisYear.toLocaleString('vi-VN')}</b></span>
            <span><small>Năm cũ</small><b>{leaveBalance.carriedOver.toLocaleString('vi-VN')}</b></span>
          </div>
        </div>
        <div className="icheck-leave-side">
          {!hideWedding && <div><small>Phép hỉ</small><b>{leaveBalance.weddingLeave}</b></div>}
          <div><small>Phép hàng năm <Info size={13} aria-hidden="true" /></small><b>{leaveBalance.annualTotal}</b></div>
        </div>
      </div>
    </section>
  );
}
