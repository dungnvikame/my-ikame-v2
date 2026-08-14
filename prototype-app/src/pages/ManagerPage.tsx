import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, ClipboardText, UsersThree, WarningCircle, XCircle } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import { teamMembers } from '../data/mockData';
import { AttentionCard } from '../components/ContentCards';
import { Button, EmptyState, SectionHeader, StatusPill } from '../components/UI';
import { useAppState } from '../AppState';
import { rankCards } from '../lib/ranking';
import type { RankableCard } from '../lib/ranking';
import type { ApprovalItem, AttentionItem, TeamMember } from '../types';
import { attentionHref, ManagerAiBrief } from './manager/ManagerAiBrief';

type RankableAttention = RankableCard & { source: AttentionItem };

function toRankable(item: AttentionItem): RankableAttention {
  return {
    id: item.id,
    priorityBand: item.required ? 'P1' : 'P3',
    severity: item.severity,
    dueAt: item.dueAt,
    updatedAt: item.dueAt ?? new Date().toISOString(),
    source: item,
  };
}

function momentLabel(type: TeamMember['momentType']) {
  if (type === 'birthday') return 'SINH NHẬT';
  if (type === 'anniversary') return 'KỶ NIỆM';
  return 'THÀNH VIÊN MỚI';
}

const APPROVAL_KIND_TONE: Record<ApprovalItem['kind'], 'info' | 'warning' | 'neutral'> = {
  'Nghỉ phép': 'info',
  'Thiết bị': 'warning',
  'Làm từ xa': 'neutral',
};

/** Hàng đợi duyệt — nghiệp vụ cốt lõi của manager: quyết định ngay trên Tổng quan. */
function ApprovalQueue() {
  const { approvals, resolveApproval, demoResetCount } = useAppState();
  const [receipt, setReceipt] = useState<string | null>(null);
  useEffect(() => { setReceipt(null); }, [demoResetCount]);

  const open = approvals.filter((item) => item.state === 'open');
  const decided = approvals.filter((item) => item.state !== 'open');

  function decide(item: ApprovalItem, next: 'approved' | 'rejected') {
    resolveApproval(item.id, next);
    setReceipt(next === 'approved'
      ? `Đã duyệt "${item.title}" — ${item.memberName} sẽ nhận thông báo ngay.`
      : `Đã từ chối "${item.title}" — ${item.memberName} sẽ nhận phản hồi kèm lý do.`);
  }

  return (
    <section className="approval-queue" aria-label="Chờ bạn duyệt">
      <SectionHeader title="Chờ bạn duyệt" meta={open.length > 0 ? `${open.length} đơn từ thành viên` : 'Đã xử lý hết'} />
      {receipt && <p className="resolve-receipt" role="status">{receipt}</p>}
      {open.length === 0 ? (
        <EmptyState title="Không còn đơn chờ duyệt" body="Đơn mới từ thành viên sẽ xuất hiện ở đây và trong thông báo." />
      ) : (
        <div className="approval-list">
          {open.map((item) => (
            <article key={item.id} className="approval-row">
              <span className="avatar" aria-hidden="true">{item.memberShort.slice(0, 1)}</span>
              <div className="approval-copy">
                <div className="approval-copy-head">
                  <strong>{item.title}</strong>
                  <StatusPill tone={APPROVAL_KIND_TONE[item.kind]}>{item.kind}</StatusPill>
                </div>
                <small>{item.memberName} · {item.submittedAtLabel}</small>
                <p>{item.detail}</p>
              </div>
              <div className="approval-actions">
                <Button variant="primary" icon={<CheckCircle size={16} />} onClick={() => decide(item, 'approved')}>Duyệt</Button>
                <Button variant="dim" icon={<XCircle size={16} />} onClick={() => decide(item, 'rejected')}>Từ chối</Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {decided.length > 0 && (
        <div className="approval-decided">
          {decided.map((item) => (
            <p key={item.id} className={`approval-decided-row approval-decided-row--${item.state}`}>
              {item.state === 'approved' ? <CheckCircle size={15} weight="fill" /> : <XCircle size={15} weight="fill" />}
              {item.title} · {item.memberName} — {item.state === 'approved' ? 'đã duyệt' : 'đã từ chối'}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

export function ManagerPage() {
  const { user, attention, approvals, resolveAttentionItem, demoResetCount } = useAppState();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<string | null>(null);

  // Rehearsal reset must not leave a stale "Đã xử lý" banner once the queue is restored.
  useEffect(() => { setReceipt(null); }, [demoResetCount]);

  // Scope boundary: only attention items owned by this manager's own team may reach the DOM.
  const scoped = attention.filter((item) => item.teamId === user.teamId && item.state === 'open');
  const rankedAttention = rankCards(scoped.map(toRankable)).map((ranked) => ranked.source);
  const queue = rankedAttention.slice(0, 5);
  const roster = teamMembers.filter((member) => member.teamId === user.teamId);

  const okCount = roster.filter((member) => member.status === 'ok').length;
  const criticalCount = rankedAttention.filter((item) => item.severity === 'critical').length;
  const openApprovals = approvals.filter((item) => item.state === 'open').length;
  const moments = roster.filter((member) => member.momentType);
  const latestFreshness = queue[0]?.freshness ?? 'Chưa có dữ liệu mới';

  function handleResolve(item: AttentionItem) {
    resolveAttentionItem(item.id);
    setReceipt(`Đã xử lý · WUAR +1 — "${item.title}"`);
  }

  return (
    <div className="page overview-page">
      <header className="context-header">
        <div>
          <p className="eyebrow">GÓC NHÌN MANAGER · {user.team.toUpperCase()}</p>
          <h1>Chào {user.shortName}, team đang có {rankedAttention.length + openApprovals} việc chờ bạn</h1>
          <p>{roster.length} thành viên · Dữ liệu {latestFreshness.replace(/^Cập nhật\s*/i, 'cập nhật ')}</p>
        </div>
        {/* Read-only scope indicator: R0 grants each manager a single scope, so this is not switchable. */}
        <button className="scope-selector" disabled aria-disabled="true">
          <UsersThree size={18} />{user.team}<ArrowRight size={15} />
        </button>
      </header>

      <div className="manager-stats" role="list">
        <Link to="#" role="listitem" className="manager-stat" onClick={(event) => event.preventDefault()}>
          <span className="manager-stat-icon manager-stat-icon--danger"><WarningCircle size={20} weight="duotone" /></span>
          <div><strong>{criticalCount}</strong><span>Việc nghiêm trọng cao</span></div>
        </Link>
        <Link to="#approvals" role="listitem" className="manager-stat" onClick={(event) => { event.preventDefault(); document.querySelector('.approval-queue')?.scrollIntoView({ behavior: 'smooth' }); }}>
          <span className="manager-stat-icon manager-stat-icon--amber"><ClipboardText size={20} weight="duotone" /></span>
          <div><strong>{openApprovals}</strong><span>Đơn chờ bạn duyệt</span></div>
        </Link>
        <Link to="/manager/team" role="listitem" className="manager-stat">
          <span className="manager-stat-icon manager-stat-icon--success"><CheckCircle size={20} weight="duotone" /></span>
          <div><strong>{okCount}/{roster.length}</strong><span>Check-in tuần đã hoàn tất</span></div>
        </Link>
        <Link to="/manager/team" role="listitem" className="manager-stat">
          <span className="manager-stat-icon manager-stat-icon--info"><UsersThree size={20} weight="duotone" /></span>
          <div><strong>{moments.length}</strong><span>Khoảnh khắc cần đồng hành</span></div>
        </Link>
      </div>

      <ManagerAiBrief items={rankedAttention} />

      <div className="manager-grid">
        <div className="manager-main">
          <ApprovalQueue />

          <section className="manager-attention section-block">
            <SectionHeader title="Cần bạn chú ý" meta="Required trước optional · Quá hạn trước sắp đến hạn" actionLabel="Xem toàn bộ" href="/manager/team" />
            {receipt && <p className="resolve-receipt" role="status">{receipt}</p>}
            {queue.length === 0 ? (
              <EmptyState title="Không có việc cần chú ý" body="Mọi việc trong phạm vi quản lý của bạn đều đã được xử lý." />
            ) : (
              <div className="attention-list">
                {queue.map((item, index) => (
                  <AttentionCard
                    key={item.id}
                    item={item}
                    primary={index === 0}
                    onAction={() => navigate(attentionHref(item))}
                    onResolve={() => handleResolve(item)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="team-moments">
          <SectionHeader title="Khoảnh khắc của team" />
          {moments.length === 0 ? (
            <p className="inline-guidance">Không có khoảnh khắc nào cần chú ý lúc này.</p>
          ) : (
            moments.slice(0, 2).map((member) => (
              <article className="moment-card" key={member.id}>
                <span className="avatar avatar--large">{member.name.charAt(0)}</span>
                <div>
                  <StatusPill tone="info">{momentLabel(member.momentType)}</StatusPill>
                  <h3><Link to={`/manager/team/${member.id}`}>{member.name}</Link></h3>
                  <p>{member.attentionSummary} · {member.role}</p>
                  <Link className="text-link" to={`/manager/team/${member.id}`}>Xem hồ sơ 360°<ArrowRight size={14} /></Link>
                </div>
              </article>
            ))
          )}
          <article className="manager-resource">
            <p className="eyebrow">GỢI Ý CHO MANAGER</p>
            <h3>Checklist giúp thành viên mới hòa nhập trong 30 ngày đầu</h3>
            <Link className="text-link" to="/knowledge">Mở tài liệu<ArrowRight size={15} /></Link>
          </article>
        </aside>
      </div>
    </div>
  );
}
