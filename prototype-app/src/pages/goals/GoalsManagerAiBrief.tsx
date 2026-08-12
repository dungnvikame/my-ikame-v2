import { ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { AiBadge } from '../../components/AiBadge';
import type { AttentionItem, MemberEksStat } from '../../types';

type Bullet = { id: string; text: string };

/** Pure derivation, zero fabricated numbers — every count comes from live `memberEksStats`
 * + `attention` (RED TEAM-style pattern reused from `pages/manager/ManagerAiBrief`). */
function buildBullets(attention: AttentionItem[], members: MemberEksStat[], teamId: string): Bullet[] {
  const fromAttention = attention
    .filter((item) => item.teamId === teamId && item.source.startsWith('iGoal') && item.state === 'open')
    .slice(0, 2)
    .map((item) => ({ id: item.id, text: `${item.title} · ${item.people} — ${item.reason}` }));
  if (fromAttention.length > 0) return fromAttention;

  const behind = members.filter((member) => member.reportsSubmitted < member.reportsExpected);
  if (behind.length === 0) return [];
  return [{ id: 'behind-reports', text: `Nhắc ${behind.map((member) => member.shortName).join(', ')} nộp báo cáo còn thiếu kỳ này` }];
}

type GoalsManagerAiBriefProps = { attention: AttentionItem[]; members: MemberEksStat[]; teamId: string };

/** "OKR của team" tab AI summary — pattern-matches `ManagerAiBrief` visually via the
 * shared `.ai-brief` classes, built locally so `pages/manager/**` stays untouched. */
export function GoalsManagerAiBrief({ attention, members, teamId }: GoalsManagerAiBriefProps) {
  const atRisk = members.filter((member) => member.eksStatus === 'at_risk' || member.eksStatus === 'needs_update').length;
  const reported = members.filter((member) => member.reportsSubmitted >= member.reportsExpected).length;
  const bullets = buildBullets(attention, members, teamId);

  return (
    <section className="ai-brief">
      <div className="ai-brief-header">
        <div>
          <p className="eyebrow">TRỢ LÝ AI</p>
          <h2>Bản tin AI · OKR team</h2>
        </div>
        <div className="card-badges"><AiBadge level="A2" /></div>
      </div>
      <p className="ai-brief-headline">{atRisk} mục tiêu EKS đang cần chú ý (có rủi ro/cần cập nhật) trên {members.length} thành viên.</p>
      <p className="ai-brief-headline">{reported}/{members.length} thành viên đã nộp đủ báo cáo kỳ này.</p>
      {bullets.length === 0 ? (
        <p className="ai-brief-zero">Không còn việc tồn đọng — team đang sạch.</p>
      ) : (
        <ul className="ai-brief-list">
          {bullets.map((bullet) => (
            <li key={bullet.id}>
              <p className="ai-brief-reason">Việc cần làm: {bullet.text}</p>
              <Link className="text-link" to="/goals">Xem chi tiết<ArrowRight size={14} /></Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
