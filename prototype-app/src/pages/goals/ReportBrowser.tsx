import { CalendarCheck, NotePencil, PlusCircle } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Button, EmptyState, SectionHeader } from '../../components/UI';
import type { CheckInReport } from '../../types';

type ReportBrowserProps = {
  reports: CheckInReport[];
  onCreateNew: () => void;
};

/** "Tổng hợp báo cáo" — iGoal-style split view: selectable report cards on the left,
 * full viewer on the right. Distinct from `ReportList` (used for the full "Báo cáo" tab). */
export function ReportBrowser({ reports, onCreateNew }: ReportBrowserProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(reports[0]?.id);

  // New reports land at the front of the list — keep the freshest one selected, and
  // clear a stale selection once the list is reset by `resetDemo`.
  useEffect(() => {
    if (!reports.some((report) => report.id === selectedId)) setSelectedId(reports[0]?.id);
  }, [reports, selectedId]);

  const selected = reports.find((report) => report.id === selectedId);

  return (
    <section className="section-block eks-report-browser-block">
      <SectionHeader title="Tổng hợp báo cáo" meta={`${reports.length} báo cáo`} />
      {reports.length === 0 ? (
        <EmptyState title="Chưa có báo cáo nào" body="Báo cáo check-in sẽ xuất hiện ở đây sau khi bạn gửi báo cáo đầu tiên." />
      ) : (
        <div className="eks-report-browser">
          <div className="eks-report-cards" role="listbox" aria-label="Danh sách báo cáo">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} selected={report.id === selectedId} onSelect={() => setSelectedId(report.id)} />
            ))}
          </div>
          <div className="eks-report-viewer">
            {selected && (
              <>
                <div className="eks-report-viewer-head">
                  <div>
                    <h3>{selected.goalTitle}</h3>
                    <p>{selected.authorName} · {selected.submittedAt} · {selected.periodLabel}</p>
                  </div>
                </div>
                <p>{selected.content}</p>
                {selected.blockers && <p className="okr-report-blockers">Vướng mắc: {selected.blockers}</p>}
              </>
            )}
          </div>
        </div>
      )}
      <Button variant="primary" icon={<PlusCircle size={16} />} className="eks-report-create" onClick={onCreateNew}>Tạo báo cáo mới</Button>
    </section>
  );
}

function ReportCard({ report, selected, onSelect }: { report: CheckInReport; selected: boolean; onSelect: () => void }) {
  const isWeekly = report.periodLabel.startsWith('Tuần');
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={`eks-report-card ${selected ? 'is-active' : ''}`}
      onClick={onSelect}
    >
      {isWeekly ? <CalendarCheck size={18} /> : <NotePencil size={18} />}
      <span className="eks-report-card-copy">
        <strong>{isWeekly ? 'Báo cáo tuần' : 'Báo cáo định kỳ'}</strong>
        <small>{report.authorName} · {report.submittedAt}</small>
      </span>
    </button>
  );
}
