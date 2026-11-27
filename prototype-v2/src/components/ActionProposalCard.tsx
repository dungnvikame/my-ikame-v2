import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { AiActionProposal } from '../types';

export const ActionProposalCard: React.FC<{
  proposal: AiActionProposal;
  onApprove: (fields: Record<string, string>) => void;
  onCancel: () => void;
}> = ({ proposal, onApprove, onCancel }) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const f of proposal.fields) map[f.key] = f.value;
    return map;
  });

  const isPending = proposal.status === 'pending';
  const isApproved = proposal.status === 'approved';

  return (
    <div
      style={{
        marginTop: 10,
        borderRadius: 'var(--r-10)',
        border: `1px solid ${
          isApproved
            ? 'var(--success-border)'
            : proposal.status === 'cancelled'
              ? 'var(--border-primary)'
              : 'var(--border-strong)'
        }`,
        background: isApproved ? 'var(--success-bg)' : 'var(--bg-surface)',
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>
          {isApproved ? (
            <CheckCircle2 size={16} style={{ color: 'var(--success-fg)' }} />
          ) : proposal.status === 'cancelled' ? (
            <XCircle size={16} style={{ color: 'var(--text-tertiary)' }} />
          ) : (
            <ShieldCheck size={16} style={{ color: 'var(--brand-primary-fg)' }} />
          )}
          {proposal.title}
        </div>
        <span className="source-chip">
          via MCP · {proposal.server}.{proposal.tool}
        </span>
      </div>

      <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--text-secondary)' }}>
        {proposal.description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {proposal.fields.map((field) => (
          <div key={field.key}>
            <label className="field-label" style={{ fontSize: 11.5, marginBottom: 3 }}>
              {field.label}
            </label>
            {isPending ? (
              field.type === 'select' && field.options ? (
                <select
                  className="select"
                  value={values[field.key]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ padding: '6px 9px', fontSize: 13 }}
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="input"
                  value={values[field.key]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ padding: '6px 9px', fontSize: 13 }}
                />
              )
            ) : (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-strong)',
                  padding: '5px 8px',
                  borderRadius: 'var(--r-6)',
                  background: 'var(--bg-canvas)',
                }}
              >
                {values[field.key]}
              </div>
            )}
          </div>
        ))}
      </div>

      {isPending && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
            approval = human · Lưu vết audit
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="btn btn-dim btn-sm" onClick={onCancel}>
              Huỷ
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onApprove(values)}
            >
              <Sparkles size={13} /> Duyệt & gửi
            </button>
          </div>
        </div>
      )}

      {isApproved && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid var(--success-border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
            fontSize: 12,
            color: 'var(--success-fg)',
          }}
        >
          <span className="tabular" style={{ fontWeight: 600 }}>
            Biên nhận {proposal.receiptId} · {proposal.executedAt} ({proposal.durationSec}s)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Đã ghi audit log <ExternalLink size={12} />
          </span>
        </div>
      )}

      {proposal.status === 'cancelled' && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)' }}>
          Đã huỷ đề xuất — chưa ghi dữ liệu sang {proposal.server}.
        </div>
      )}
    </div>
  );
};
