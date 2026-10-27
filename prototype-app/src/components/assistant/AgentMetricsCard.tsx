import { ChartBar } from '@phosphor-icons/react';
import { useAppState } from '../../AppState';
import { serverLabel } from '../../lib/mcp-registry';

/**
 * Thẻ "Đo lường" — tiêu chí hiệu quả anh Nghĩa yêu cầu cho mọi tính năng AI: số tác vụ
 * đã duyệt trong phiên, thời gian trung bình từ hỏi → receipt, tool write đã gọi.
 * Bản thật: đọc từ audit log của MCP gateway, so với cách làm thủ công (baseline).
 */
export function AgentMetricsCard() {
  const { agentMetrics } = useAppState();
  const average = agentMetrics.tasks ? Math.round(agentMetrics.totalMs / agentMetrics.tasks / 100) / 10 : 0;
  const servers = Array.from(new Set(agentMetrics.toolCalls.map(serverLabel)));
  return (
    <section className="assistant-metrics" aria-label="Đo lường phiên làm việc">
      <p className="assistant-metrics-title"><ChartBar size={14} weight="fill" /> Đo lường phiên này</p>
      <dl>
        <div><dt>Tác vụ đã duyệt</dt><dd>{agentMetrics.tasks}</dd></div>
        <div><dt>Hỏi → receipt</dt><dd>{agentMetrics.tasks ? `${average}s` : '—'}</dd></div>
        <div><dt>Hệ thống đã ghi</dt><dd>{servers.length ? servers.join(' · ') : '—'}</dd></div>
      </dl>
      <small>Baseline thủ công: xin nghỉ ≈ 6 phút (mở iCheck, điền đơn, nhắn quản lý). Số liệu phiên demo, reset cùng dữ liệu.</small>
    </section>
  );
}
