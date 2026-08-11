import { ArrowRight, CheckCircle, UsersThree, WarningCircle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { attentionItems, teamMembers } from '../data/mockData';
import { AttentionCard } from '../components/ContentCards';
import { EmptyState, SectionHeader, StatusPill } from '../components/UI';
import { useAppState } from '../AppState';
import { rankCards } from '../lib/ranking';
import type { RankableCard } from '../lib/ranking';
import type { AttentionItem, TeamMember } from '../types';

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

export function ManagerPage() {
  const { user } = useAppState();

  // Scope boundary: only attention items owned by this manager's own team may reach the DOM.
  const scoped = attentionItems.filter((item) => item.teamId === user.teamId && item.state === 'open');
  const queue = rankCards(scoped.map(toRankable)).slice(0, 5).map((ranked) => ranked.source);
  const roster = teamMembers.filter((member) => member.teamId === user.teamId);

  const okCount = roster.filter((member) => member.status === 'ok').length;
  const criticalCount = queue.filter((item) => item.severity === 'critical').length;
  const moments = roster.filter((member) => member.momentType);
  const latestFreshness = queue[0]?.freshness ?? 'Chưa có dữ liệu mới';

  return (
    <div className="page overview-page">
      <header className="context-header">
        <div>
          <p className="eyebrow">GÓC NHÌN MANAGER</p>
          <h1>Chào {user.shortName}, team đang có {queue.length} việc cần chú ý</h1>
          <p>{user.team} · {roster.length} thành viên · Dữ liệu cập nhật {latestFreshness}</p>
        </div>
        {/* Read-only scope indicator: R0 grants each manager a single scope, so this is not switchable. */}
        <button className="scope-selector" disabled aria-disabled="true">
          <UsersThree size={18} />{user.team}<ArrowRight size={15} />
        </button>
      </header>

      <section className="manager-attention">
        <SectionHeader title="Cần bạn chú ý" meta="Required trước optional · Quá hạn trước sắp đến hạn" actionLabel="Xem toàn bộ" href="/manager/team" />
        {queue.length === 0 ? (
          <EmptyState title="Không có việc cần chú ý" body="Mọi việc trong phạm vi quản lý của bạn đều đã được xử lý." />
        ) : (
          <div className="attention-list">
            {queue.map((item, index) => <AttentionCard key={item.id} item={item} primary={index === 0} />)}
          </div>
        )}
      </section>

      <div className="manager-grid">
        <section className="team-snapshot">
          <SectionHeader title="Ảnh chụp nhanh của team" meta="Mỗi số liệu đều có ngữ cảnh và đường đi tiếp theo" />
          <div className="metric-grid">
            <article className="metric-card">
              <span className="metric-icon"><CheckCircle size={22} weight="duotone" /></span>
              <strong>{okCount}/{roster.length}</strong>
              <h3>Đã hoàn tất check-in tuần</h3>
              <p>{roster.length - okCount} thành viên còn lại nằm trong attention queue.</p>
              <Link className="text-link" to="/manager/team">Xem trạng thái<ArrowRight size={15} /></Link>
            </article>
            <article className="metric-card">
              <span className="metric-icon"><WarningCircle size={22} weight="duotone" /></span>
              <strong>{criticalCount}</strong>
              <h3>Việc mức độ nghiêm trọng cao</h3>
              <p>Ưu tiên xử lý trước các việc còn lại trong queue.</p>
              <Link className="text-link" to="/manager/team">Xem chi tiết<ArrowRight size={15} /></Link>
            </article>
            <article className="metric-card">
              <span className="metric-icon"><UsersThree size={22} weight="duotone" /></span>
              <strong>{moments.length}</strong>
              <h3>Khoảnh khắc cần đồng hành</h3>
              <p>Thành viên mới hoặc cần chú ý đặc biệt trong team.</p>
              <Link className="text-link" to="/manager/team">Xem đội ngũ<ArrowRight size={15} /></Link>
            </article>
          </div>
        </section>

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
                  <h3>{member.name}</h3>
                  <p>{member.attentionSummary} · {member.role}</p>
                </div>
              </article>
            ))
          )}
          <article className="manager-resource">
            <p className="eyebrow">GỢI Ý CHO MANAGER</p>
            <h3>Checklist giúp thành viên mới hòa nhập trong 30 ngày đầu</h3>
            <button className="text-link">Mở tài liệu<ArrowRight size={15} /></button>
          </article>
        </aside>
      </div>
    </div>
  );
}
