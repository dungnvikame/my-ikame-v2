import React, { useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  DoorOpen,
  Home,
  Plane,
  Plus,
  Ticket,
  TimerReset,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type ReqFilter = 'all' | 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';

export const MyRequestsPage: React.FC = () => {
  const { currentPerson, requests, openAiWithPrompt } = useApp();
  const [filter, setFilter] = useState<ReqFilter>('all');

  const myRequests = useMemo(
    () => requests.filter((r) => r.personId === currentPerson.id),
    [requests, currentPerson.id]
  );

  const filtered = useMemo(
    () => (filter === 'all' ? myRequests : myRequests.filter((r) => r.status === filter)),
    [myRequests, filter]
  );

  const quickTemplates = [
    { label: 'Xin nghỉ phép', icon: Plane, prompt: 'Xin nghỉ phép năm ngày thứ 6' },
    { label: 'Đăng ký WFH', icon: Home, prompt: 'Đăng ký WFH thứ 2 tuần tới' },
    { label: 'Đi muộn / Về sớm', icon: CalendarClock, prompt: 'Xin đi muộn 60 phút ngày mai' },
    { label: 'Quên chấm công', icon: TimerReset, prompt: 'Bổ sung quên chấm công sáng nay' },
    { label: 'Thiết bị / IT', icon: Ticket, prompt: 'Tạo request IT hỗ trợ thiết bị' },
    { label: 'Đặt phòng họp', icon: DoorOpen, prompt: 'Đặt phòng họp chiều nay' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Đề xuất của tôi</h1>
          <p className="page-desc">Tạo nhanh đơn từ có duyệt và theo dõi trạng thái xử lý</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openAiWithPrompt('Xin nghỉ phép năm ngày thứ 6')}
        >
          <Plus size={16} /> Tạo đề xuất mới
        </button>
      </div>

      {/* Quick Create Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {quickTemplates.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              type="button"
              className="btn btn-dim btn-sm"
              onClick={() => openAiWithPrompt(t.prompt)}
            >
              <Icon size={14} style={{ color: 'var(--brand-primary-fg)' }} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Status Filter Tabs */}
      <div className="tabs-bar">
        {(
          [
            { id: 'all', label: 'Tất cả', count: myRequests.length },
            { id: 'Chờ duyệt', label: 'Chờ duyệt', count: myRequests.filter((r) => r.status === 'Chờ duyệt').length },
            { id: 'Đã duyệt', label: 'Đã duyệt', count: myRequests.filter((r) => r.status === 'Đã duyệt').length },
            { id: 'Từ chối', label: 'Từ chối', count: myRequests.filter((r) => r.status === 'Từ chối').length },
          ] as { id: ReqFilter; label: string; count: number }[]
        ).map((t) => (
          <button key={t.id} type="button" className={`tab-btn ${filter === t.id ? 'active' : ''}`} onClick={() => setFilter(t.id)}>
            {t.label} <span className="tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <section className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">Chưa có đề xuất nào trong trạng thái này.</div>
        ) : (
          <div className="clean-list">
            {filtered.map((r) => (
              <div key={r.id} className="clean-row">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>{r.type}</span>
                    <span className="source-chip">{r.sourceTool}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>
                    {r.dateRange} · {r.summary}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    Gửi {r.createdAt} {r.reviewerNote ? `· ${r.reviewerNote}` : ''}
                  </div>
                </div>
                <span
                  className={`badge ${
                    r.status === 'Đã duyệt'
                      ? 'badge-success'
                      : r.status === 'Từ chối'
                        ? 'badge-error'
                        : 'badge-warning'
                  }`}
                >
                  {r.status === 'Đã duyệt' && <CheckCircle2 size={12} />}
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
