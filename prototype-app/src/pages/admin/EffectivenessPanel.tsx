import { useCallback, useEffect, useState } from 'react';
import { Progress } from '@coreds/react';
import { ArrowsClockwiseIcon as ArrowsClockwise } from '@coreds/react/icons';
import { Button, EmptyState, SectionHeader, StatusPill } from '../../components/UI';
import {
  FEEDBACK_KIND_LABEL, loadAllMetrics, subscribeMetrics, summarize,
  type MetricsScope, type MetricsSummary,
} from '../../lib/metrics/metrics';

const SCOPE_NOTE: Record<MetricsScope, string> = {
  everyone: 'Số đo thật của mọi người đã mở artifact này.',
  'me-only': 'Bạn không có quyền sửa artifact nên chỉ thấy số đo của chính mình.',
  'this-browser': 'Bản web không có kho dùng chung: đây là số đo của riêng trình duyệt này.',
};

const dateTime = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

/**
 * Hiệu quả My iKame — số đo thật từ chính sản phẩm (không phải số kịch bản): người dùng, mức dùng
 * hằng ngày, tỷ lệ làm xong từng luồng, mức dễ dùng và góp ý. Đặt trong Tổng quan COM.
 */
export function EffectivenessPanel() {
  const [summary, setSummary] = useState<MetricsSummary>();
  const [scope, setScope] = useState<MetricsScope>('this-browser');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    void loadAllMetrics().then((result) => {
      setScope(result.scope);
      setSummary(summarize(result.users));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
    // Số đo của chính mình đổi (vừa làm xong một luồng) → tính lại.
    return subscribeMetrics(load);
  }, [load]);

  return (
    <section className="effectiveness" aria-label="Hiệu quả My iKame">
      <div className="effectiveness-head">
        <SectionHeader title="Hiệu quả My iKame" meta={SCOPE_NOTE[scope]} />
        <Button variant="dim" size="s" icon={<ArrowsClockwise size={14} />} onClick={load} disabled={loading}>Tải lại</Button>
      </div>

      {!summary ? (
        <p className="live-source" role="status">Đang đọc số đo…</p>
      ) : (
        <>
          <div className="effectiveness-tiles" role="list">
            <div role="listitem"><strong>{summary.users}</strong><small>Người đã dùng</small></div>
            <div role="listitem"><strong>{summary.activeToday}</strong><small>Mở hôm nay</small></div>
            <div role="listitem"><strong>{summary.activeWeek}</strong><small>Mở trong 7 ngày</small></div>
            <div role="listitem">
              <strong>{summary.easeAverage === null ? '—' : `${summary.easeAverage.toLocaleString('vi-VN')}/5`}</strong>
              <small>Mức dễ dùng · {summary.easeCount} lượt chấm</small>
            </div>
          </div>

          <div className="effectiveness-flows">
            <h3>Tỷ lệ làm xong từng luồng</h3>
            <ul>
              {summary.flows.map((flow) => (
                <li key={flow.id}>
                  <span className="effectiveness-flow-name">{flow.label}</span>
                  <Progress className="effectiveness-flow-bar" size="sm" value={flow.rate ?? 0} aria-label={`${flow.label}: ${flow.rate ?? 0}%`} />
                  <span className="effectiveness-flow-rate">{flow.rate === null ? 'chưa có lượt' : `${flow.rate}%`}</span>
                  <small>{flow.done} xong / {flow.start} bắt đầu{flow.exit > 0 ? ` · ${flow.exit} bỏ dở` : ''}</small>
                </li>
              ))}
            </ul>
          </div>

          <div className="effectiveness-feedback">
            <h3>Góp ý ({summary.feedback.length})</h3>
            {summary.feedback.length === 0 ? (
              <EmptyState title="Chưa có góp ý" body="Góp ý gửi từ nút Góp ý ở góc màn hình sẽ hiện ở đây." />
            ) : (
              <ul>
                {summary.feedback.slice(0, 20).map((item) => (
                  <li key={`${item.at}-${item.text.slice(0, 12)}`}>
                    <div className="card-badges">
                      <StatusPill tone={item.kind === 'bug' ? 'error' : item.kind === 'hard' ? 'warning' : 'info'}>{FEEDBACK_KIND_LABEL[item.kind]}</StatusPill>
                      <small>{item.page} · {item.lens} · {dateTime(item.at)}</small>
                    </div>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
