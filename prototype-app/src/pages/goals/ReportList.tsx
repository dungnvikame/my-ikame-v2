import { Link } from 'react-router-dom';
import { EmptyState, SectionHeader, StatusPill } from '../../components/UI';
import type { CheckInReport } from '../../types';

type ReportListProps = {
  reports: CheckInReport[];
  /** Preview mode caps the list and links to the full "Báo cáo" tab. */
  limit?: number;
  onViewAll?: () => void;
};

export function ReportList({ reports, limit, onViewAll }: ReportListProps) {
  if (reports.length === 0) {
    return <EmptyState title="Chưa có báo cáo nào" body="Báo cáo check-in sẽ xuất hiện ở đây sau khi bạn gửi báo cáo đầu tiên." />;
  }

  const visible = typeof limit === 'number' ? reports.slice(0, limit) : reports;

  return (
    <section className="section-block">
      {typeof limit === 'number' ? (
        <SectionHeader title="Tổng hợp báo cáo" meta={`${reports.length} báo cáo`} />
      ) : (
        <SectionHeader title="Báo cáo check-in" meta={`${reports.length} báo cáo · mới nhất trước`} />
      )}
      <ul className="okr-report-list">
        {visible.map((report) => <ReportRow key={report.id} report={report} />)}
      </ul>
      {typeof limit === 'number' && reports.length > limit && onViewAll && (
        <button type="button" className="text-link okr-report-viewall" onClick={onViewAll}>Xem tất cả báo cáo</button>
      )}
    </section>
  );
}

function ReportRow({ report }: { report: CheckInReport }) {
  return (
    <li className="okr-report-row">
      <div className="okr-report-row-head">
        <h4><Link to={`/goals/${report.goalId}`}>{report.goalTitle}</Link></h4>
        <StatusPill tone={report.source === 'ai' ? 'info' : 'neutral'}>{report.source === 'ai' ? 'AI soạn — đã duyệt' : 'Tự soạn'}</StatusPill>
      </div>
      <div className="source-line">
        <span>{report.periodLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{report.progressBefore}% → {report.progressAfter}%</span>
        <span aria-hidden="true">·</span>
        <span>{report.authorName}</span>
        <span aria-hidden="true">·</span>
        <span>{report.submittedAt}</span>
      </div>
      <p>{report.content}</p>
      {report.blockers && <p className="okr-report-blockers">Vướng mắc: {report.blockers}</p>}
    </li>
  );
}
