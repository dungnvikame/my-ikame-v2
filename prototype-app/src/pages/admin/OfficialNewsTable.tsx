import { BellRinging, PaperPlaneTilt } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, SectionHeader, StatusPill } from '../../components/UI';
import type { NewsPost } from '../../types';

type OfficialNewsTableProps = {
  news: NewsPost[];
  onPush: (id: string) => void;
  onRemind: (id: string) => void;
};

function percent(part: number, whole: number): string {
  return whole ? `${Math.round((part / whole) * 100)}%` : '—';
}

/** Bảng phân phối thông báo chính thức: reach / đọc / xác nhận + hành động push & nhắc lại. */
export function OfficialNewsTable({ news, onPush, onRemind }: OfficialNewsTableProps) {
  const [expandedId, setExpandedId] = useState<string>();
  const rows = news.filter((item) => item.official && !item.expired);

  return (
    <section className="admin-block" aria-label="Thông báo chính thức">
      <SectionHeader title="Thông báo chính thức" meta={`${rows.length} bài · audience lấy từ HRIS`} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Bài viết</th>
              <th scope="col">Reach</th>
              <th scope="col">Đã đọc</th>
              <th scope="col">Xác nhận</th>
              <th scope="col">Push</th>
              <th scope="col"><span className="sr-only">Hành động</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const metrics = item.metrics;
              const pending = item.pendingAckNames ?? [];
              const expanded = expandedId === item.id;
              return (
                <tr key={item.id} className={item.mandatory ? 'is-mandatory' : ''}>
                  <td>
                    <Link className="admin-table-title" to={`/feed/article/${item.id}`}>{item.title}</Link>
                    <div className="card-badges">
                      {item.mandatory && <StatusPill tone="error">Bắt buộc · {item.dueLabel}</StatusPill>}
                      <StatusPill>{item.topic}</StatusPill>
                    </div>
                  </td>
                  <td>{metrics?.reach ?? '—'}</td>
                  <td>{metrics ? percent(metrics.read, metrics.reach) : '—'}</td>
                  <td>
                    {item.mandatory && metrics ? (
                      <>
                        <strong>{percent(metrics.acknowledged, metrics.reach)}</strong>
                        {pending.length > 0 && (
                          <button type="button" className="text-link admin-pending-toggle" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? undefined : item.id)}>
                            {pending.length} chưa xác nhận
                          </button>
                        )}
                        {expanded && (
                          <ul className="admin-pending-list" aria-label="Người chưa xác nhận">
                            {pending.map((name) => <li key={name}>{name}</li>)}
                          </ul>
                        )}
                      </>
                    ) : '—'}
                  </td>
                  <td>{item.pushedLabel ? <span className="admin-pushed">Đã push · {item.pushedLabel}</span> : <span className="muted-text">Chưa push</span>}</td>
                  <td className="admin-table-actions">
                    <Button variant="dim" icon={<PaperPlaneTilt size={15} />} onClick={() => onPush(item.id)}>
                      {item.pushedLabel ? 'Push lại' : 'Gửi push'}
                    </Button>
                    {item.mandatory && pending.length > 0 && (
                      <Button variant="dim" icon={<BellRinging size={15} />} onClick={() => onRemind(item.id)}>
                        Nhắc {pending.length} người{item.remindersSent ? ` (đã nhắc ${item.remindersSent})` : ''}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
