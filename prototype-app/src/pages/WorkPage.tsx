import { ArrowRight, Target, Ticket } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { ICheckWidget } from '../components/icheck/ICheckWidget';
import { PlatformHandoffButton } from '../components/PlatformHandoff';
import { EmptyState, SectionHeader, StatusPill } from '../components/UI';
import { fullDateLabel } from '../data/icheck-data';
import type { RequestItem } from '../types';

const REQUEST_STATUS: Record<RequestItem['status'], { label: string; tone: 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Chờ duyệt', tone: 'warning' },
  in_progress: { label: 'Đang xử lý', tone: 'info' },
  done: { label: 'Đã duyệt', tone: 'success' },
};

/**
 * Tab Công việc — lăng kính iKamer: iCheck mỏng (chấm công, phép, tuần này), mục tiêu cần
 * check-in, đề xuất/đơn của tôi. Nghiệp vụ sâu deep-link iCheck / iGoal / iRequest.
 */
export function WorkPage() {
  const { user, goals, requests } = useAppState();
  const needsCheckIn = goals.filter((goal) => goal.status === 'needs_update');
  const recentRequests = requests.slice(0, 4);

  return (
    <div className="page work-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{fullDateLabel(new Date()).toUpperCase()}</p>
          <h1>Công việc của {user.shortName}</h1>
          <p>Chấm công, ngày phép, mục tiêu và đề xuất — những việc bạn chạm mỗi ngày, ở một chỗ.</p>
        </div>
        <PlatformHandoffButton platform="iCheck" action="xem lịch chấm công cả tháng và lịch sử nghỉ phép" label="Mở iCheck đầy đủ" />
      </header>

      <ICheckWidget />

      <div className="work-grid">
        <section aria-label="Mục tiêu của tôi">
          <SectionHeader title="Mục tiêu của tôi" meta={needsCheckIn.length ? `${needsCheckIn.length} mục tiêu cần check-in` : 'Tất cả đã cập nhật'} href="/goals" actionLabel="Mở iGoal" />
          <div className="active-items">
            {needsCheckIn.length === 0 ? (
              <EmptyState icon={<Target size={44} weight="duotone" />} title="Không có mục tiêu trễ check-in" body="iGoal sẽ nhắc khi tới kỳ check-in tiếp theo." />
            ) : needsCheckIn.map((goal) => (
              <article key={goal.id} className="active-item">
                <span className="active-item-icon"><Target size={20} /></span>
                <div><strong>{goal.title}</strong><span>Tiến độ {goal.progress}% · hạn {goal.nextDue}</span></div>
                <Link className="text-link" to={`/assistant?q=${encodeURIComponent('Mục tiêu nào của tôi cần cập nhật?')}`}>Check-in với AI<ArrowRight size={16} /></Link>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Đề xuất của tôi">
          <SectionHeader title="Đề xuất của tôi" meta={`${requests.length} đơn`} href="/requests" actionLabel="Tất cả" />
          {recentRequests.length === 0 ? (
            <EmptyState icon={<Ticket size={44} weight="duotone" />} title="Chưa có đề xuất" body="Đơn nghỉ, WFH, request IT tạo qua Trợ lý AI sẽ hiện ở đây." />
          ) : (
            <div className="work-request-list">
              {recentRequests.map((request) => (
                <div key={request.id} className="work-request">
                  <div>
                    <strong>{request.title}</strong>
                    <small>{request.type} · {request.createdAtLabel}{request.handlerLabel ? ` · ${request.handlerLabel}` : ''}</small>
                  </div>
                  <StatusPill tone={REQUEST_STATUS[request.status].tone}>{REQUEST_STATUS[request.status].label}</StatusPill>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
