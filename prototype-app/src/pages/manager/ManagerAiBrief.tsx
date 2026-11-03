import { ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { AiBadge } from '../../components/AiBadge';
import type { EarlySignal } from '../../lib/engagement';
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

/** Pure mapping, zero hardcoded numbers — every digit comes from live `attention` state; tín hiệu sớm (engagement) đứng đầu. */
export function buildBrief(items: AttentionItem[], signals: EarlySignal[] = []): BriefBullet[] {
  const fromSignals = signals.filter((signal) => signal.severity === 'risk').map((signal) => ({
    id: `signal-${signal.memberId}`,
    headline: `${signal.name} đang chùng xuống — nên 1:1 trước thứ Sáu`,
    reason: signal.reason,
    href: `/manager/team/${signal.memberId}`,
  }));
  return [...fromSignals, ...items.map((item) => ({
    id: item.id,
    headline: item.title,
    reason: `${item.reason} · ${item.people}`,
    href: attentionHref(item),
  }))];
}

/**
 * On-canvas AI enrichment (A2 concept) — NOT a chatbot surface. Bullets derive from the
 * live scoped `attention` queue, so resolving an item changes the brief on next render
 * (RED TEAM F6 covers the empty case below).
 */
export function ManagerAiBrief({ items, signals = [] }: { items: AttentionItem[]; signals?: EarlySignal[] }) {
  const bullets = buildBrief(items, signals);

  return (
    <section className="ai-brief">
      <div className="ai-brief-header">
        <div>
          <p className="eyebrow">TRỢ LÝ AI</p>
          <h2>Bản tin AI đầu tuần</h2>
        </div>
        <div className="card-badges">
          <AiBadge level="A2" />
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
          <div className="ai-brief-footer-row">
            <p className="ai-brief-footer">Tổng hợp từ iGoal · Event · HRIS · engagement iKame Feed/iCheck — mô phỏng khái niệm.</p>
            <Link className="ai-brief-cta" to={`/assistant?q=${encodeURIComponent('Team tôi hôm nay có gì cần chú ý?')}`}>
              Hỏi Trợ lý AI về team<ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
