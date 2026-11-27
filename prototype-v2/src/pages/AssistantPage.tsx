import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bot,
  History,
  PlugZap,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActionProposalCard } from '../components/ActionProposalCard';
import { RichInlineText } from '../components/UI';

export const AssistantPage: React.FC = () => {
  const {
    lens,
    mcpServers,
    cycleMcpStatus,
    aiMessages,
    sendAiMessage,
    approveAiProposal,
    cancelAiProposal,
    resetAiChat,
    agentMetrics,
  } = useApp();
  const [draft, setDraft] = useState('');
  const navigate = useNavigate();

  const quickIntents =
    lens === 'manager'
      ? [
          { label: 'Hôm nay tôi cần làm gì?', group: 'Tổng hợp' },
          { label: 'Tình hình team tuần này', group: 'Manager' },
          { label: 'Đơn chờ duyệt', group: 'Manager' },
          { label: 'Soạn tin nhắc check-in cho Minh', group: 'Manager' },
          { label: 'Đặt phòng họp chiều nay', group: 'Hành động' },
        ]
      : [
          { label: 'Hôm nay tôi cần làm gì?', group: 'Tổng hợp' },
          { label: 'Xin nghỉ phép ngày thứ 6', group: 'Hành động MCP' },
          { label: 'Đăng ký WFH tuần sau', group: 'Hành động MCP' },
          { label: 'Chính sách nghỉ phép thế nào?', group: 'Tra cứu iWiki' },
          { label: 'Số dư phép năm của tôi', group: 'Đọc iCheck' },
          { label: 'Đặt phòng họp chiều nay', group: 'Hành động MCP' },
          { label: 'Check-in OKR tuần 48', group: 'Hành động MCP' },
          { label: 'Tạo request IT màn hình phụ', group: 'Hành động MCP' },
        ];

  const connectedCount = mcpServers.filter((s) => s.status === 'connected').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendAiMessage(draft);
    setDraft('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Trợ lý AI</h1>
          <p className="page-desc">Đề xuất → Duyệt → Thực thi có biên nhận qua MCP</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={resetAiChat}>
          <RotateCcw size={14} /> Hội thoại mới
        </button>
      </div>

      {/* Compact MCP Status Strip */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 5, marginRight: 4 }}>
          <PlugZap size={13} /> MCP ({connectedCount}/7):
        </span>
        {mcpServers.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => cycleMcpStatus(s.id)}
            title={`Bấm để mô phỏng lỗi · Owner: ${s.owner}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 'var(--r-full)',
              border: `1px solid ${
                s.status === 'connected'
                  ? 'var(--border-primary)'
                  : s.status === 'degraded'
                    ? 'var(--warning-border)'
                    : 'var(--error-border)'
              }`,
              background:
                s.status === 'connected'
                  ? 'var(--bg-surface)'
                  : s.status === 'degraded'
                    ? 'var(--warning-bg)'
                    : 'var(--error-bg)',
              fontSize: 12,
              fontWeight: 500,
              color:
                s.status === 'connected'
                  ? 'var(--text-secondary)'
                  : s.status === 'degraded'
                    ? 'var(--warning-fg)'
                    : 'var(--error-fg)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 'var(--r-full)',
                background:
                  s.status === 'connected'
                    ? 'var(--success-solid)'
                    : s.status === 'degraded'
                      ? 'var(--warning-solid)'
                      : 'var(--error-solid)',
              }}
            />
            {s.name}
          </button>
        ))}
      </div>

      <div className="layout-with-rail">
        {/* Chat Column */}
        <section className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 540 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 540 }}>
            {aiMessages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: m.role === 'user' ? '80%' : '96%',
                    padding: '12px 15px',
                    borderRadius: 'var(--r-12)',
                    background: m.role === 'user' ? 'var(--bg-inverse)' : 'var(--bg-subtle)',
                    color: m.role === 'user' ? 'var(--text-inverse)' : 'var(--text-primary)',
                    fontSize: 13.5,
                    lineHeight: 1.58,
                  }}
                >
                  {m.role === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
                      <Bot size={14} style={{ color: 'var(--brand-primary-fg)' }} /> Trợ lý AI iKame · {m.timestamp}
                    </div>
                  )}

                  <RichInlineText text={m.text} />

                  {m.warningNote && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '8px 10px',
                        borderRadius: 'var(--r-8)',
                        background: 'var(--warning-bg)',
                        border: '1px solid var(--warning-border)',
                        color: 'var(--warning-fg)',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <AlertTriangle size={14} /> {m.warningNote}
                    </div>
                  )}

                  {/* Synced Today Items (AI-2) */}
                  {m.todayItems && m.todayItems.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {m.todayItems.map((it) => (
                        <div
                          key={it.id}
                          style={{
                            padding: '9px 12px',
                            borderRadius: 'var(--r-8)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>{it.title}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                              {it.source} · {it.urgencyLabel}
                            </div>
                          </div>
                          {it.actionRoute && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigate(it.actionRoute!)}
                            >
                              {it.actionLabel}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Human-in-the-loop MCP Action Card (AI-3) */}
                  {m.actionProposal && (
                    <ActionProposalCard
                      proposal={m.actionProposal}
                      onApprove={(fields) => approveAiProposal(m.id, fields)}
                      onCancel={() => cancelAiProposal(m.id)}
                    />
                  )}

                  {/* Source Chips (AI-1) */}
                  {m.sources && m.sources.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {m.sources.map((src) => (
                        <span key={src} className="source-chip">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: 14, borderTop: '1px solid var(--border-primary)', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {quickIntents.map((qi) => (
                <button
                  key={qi.label}
                  type="button"
                  className="btn btn-dim btn-sm"
                  style={{ height: 27, fontSize: 12 }}
                  onClick={() => sendAiMessage(qi.label)}
                >
                  <Sparkles size={12} style={{ color: 'var(--brand-primary-fg)' }} /> {qi.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Nhập yêu cầu hành động hoặc câu hỏi chính sách..."
              />
              <button type="submit" className="btn btn-primary">
                <Send size={15} /> Gửi
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Agent Metrics (AI-9) & Conversation History (AI-10) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <section className="card-compact">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 12 }}>
              <Activity size={15} style={{ color: 'var(--brand-primary-fg)' }} /> Đo lường Trợ lý AI
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="card-sunk" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Tác vụ hoàn tất có biên nhận</span>
                <strong className="tabular" style={{ fontSize: 17, color: 'var(--text-strong)' }}>{agentMetrics.tasksCompleted}</strong>
              </div>
              <div className="card-sunk" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Thời gian TB hỏi → receipt</span>
                <strong className="tabular" style={{ fontSize: 17, color: 'var(--success-fg)' }}>{agentMetrics.avgSecondsToReceipt}s</strong>
              </div>
              <div className="card-sunk">
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Hệ thống MCP đã ghi audit</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {agentMetrics.systemsWritten.map((sys) => (
                    <span key={sys} className="badge badge-neutral">{sys}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="card-compact">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 10 }}>
              <History size={15} /> Lịch sử phiên gần đây
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { title: 'Tổng hợp Việc hôm nay (27/11)', meta: '6 nguồn · 08:30' },
                { title: 'Đặt phòng Sao Hoả tầng 5', meta: 'RCP-482104 · Hôm qua' },
                { title: 'Tra cứu chính sách WFH Hybrid', meta: 'iWiki 4.0 · 24/11' },
              ].map((h) => (
                <button
                  key={h.title}
                  type="button"
                  className="card-sunk"
                  style={{ textAlign: 'left', border: '1px solid var(--border-subtle)' }}
                  onClick={() => sendAiMessage(h.title)}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{h.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>{h.meta}</div>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
