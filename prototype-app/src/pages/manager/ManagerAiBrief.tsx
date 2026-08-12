import { ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { AiBadge } from '../../components/AiBadge';
import { RBadge } from '../../components/RBadge';
import type { AttentionItem } from '../../types';

type BriefBullet = { id: string; headline: string; reason: string; href: string };

/**
 * Concept mapping only (spec §Requirements): route by source system, not by item id,
 * so the brief stays data-driven if more attention items are ever added to mockData.
 */
export function attentionHref(item: AttentionItem): string {
  if (item.source.startsWith('iGoal')) return '/goals';
  if (item.source.startsWith('My iKame Event')) return '/events/iconnect-2026-08';
  return '/manager/team';
}

/** Pure mapping, zero hardcoded numbers — every digit comes from live `attention` state. */
export function buildBrief(items: AttentionItem[]): BriefBullet[] {
  return items.map((item) => ({
    id: item.id,
    headline: item.title,
    reason: `${item.reason} · ${item.people}`,
    href: attentionHref(item),
  }));
}

/**
 * On-canvas AI enrichment (A2 concept) — NOT a chatbot surface. Bullets derive from the
 * live scoped `attention` queue, so resolving an item changes the brief on next render
 * (RED TEAM F6 covers the empty case below).
 */
export function ManagerAiBrief({ items }: { items: AttentionItem[] }) {
  const bullets = buildBrief(items);

  return (
    <section className="ai-brief">
      <div className="ai-brief-header">
        <div>
          <p className="eyebrow">TRỢ LÝ AI</p>
          <h2>Bản tin AI đầu tuần</h2>
        </div>
        <div className="card-badges">
          <AiBadge level="A2" />
          <RBadge tag="R4" />
        </div>
      </div>
      {bullets.length === 0 ? (
        <p className="ai-brief-zero">Không còn việc tồn đọng — tuần này bắt đầu sạch.</p>
      ) : (
        <>
          <ul className="ai-brief-list">
            {bullets.map((bullet) => (
              <li key={bullet.id}>
                <p className="ai-brief-headline">{bullet.headline}</p>
                <p className="ai-brief-reason">Vì sao: {bullet.reason}</p>
                <Link className="text-link" to={bullet.href}>Xem chi tiết<ArrowRight size={14} /></Link>
              </li>
            ))}
          </ul>
          <p className="ai-brief-footer">Tổng hợp từ iGoal · Event · HRIS — mô phỏng khái niệm.</p>
        </>
      )}
    </section>
  );
}
