import {
  ArrowRight,
  CheckCircle,
  Clock,
  SealCheck,
  Users,
  WarningCircle,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import type { AttentionItem, NewsPost } from '../types';
import { Button, SourceLine, StatusPill } from './UI';

/** Cover theo chủ đề — emoji + palette gradient dùng chung với Events (một hệ visual). */
const NEWS_TOPIC_VISUALS: Record<string, { emoji: string; palette: string }> = {
  'Chính sách': { emoji: '📋', palette: 'amber' },
  'Văn hóa': { emoji: '🎉', palette: 'fuchsia' },
  'Học tập': { emoji: '📚', palette: 'blue' },
  'Văn phòng': { emoji: '🏢', palette: 'emerald' },
};

export function newsTopicVisual(topic: string): { emoji: string; palette: string } {
  return NEWS_TOPIC_VISUALS[topic] ?? { emoji: '📰', palette: 'indigo' };
}

export function NewsCard({ post, compact = false }: { post: NewsPost; compact?: boolean }) {
  const visual = newsTopicVisual(post.topic);
  return (
    <article className={`content-card news-card ${compact ? 'is-compact' : ''}`}>
      <div className={`card-visual news-cover events-v2-cover events-v2-cover--${visual.palette}`} aria-hidden="true">
        <span className="news-cover-emoji">{visual.emoji}</span>
        <span className="news-cover-topic">{post.topic}</span>
      </div>
      <div className="card-body">
        <div className="card-badges">
          {post.official && <StatusPill tone="info"><SealCheck size={14} /> Chính thức</StatusPill>}
          {post.mandatory && !post.acknowledged && <StatusPill tone="error">Cần xác nhận</StatusPill>}
          {post.acknowledged && <StatusPill tone="success"><CheckCircle size={14} /> Đã xác nhận</StatusPill>}
          <StatusPill>{post.topic}</StatusPill>
        </div>
        <h3><Link to={`/news/${post.id}`}>{post.title}</Link></h3>
        {!compact && <p>{post.summary}</p>}
        <SourceLine source={post.publisher} time={post.publishedAt} />
      </div>
    </article>
  );
}

export function AttentionCard({ item, primary = false, onAction, onResolve }: {
  item: AttentionItem;
  primary?: boolean;
  onAction?: () => void;
  onResolve?: () => void;
}) {
  const tone = item.severity === 'critical' ? 'error' : item.severity === 'warning' ? 'warning' : 'info';
  return (
    <article className={`attention-card attention-card--${item.severity}`}>
      <div className="attention-icon" aria-hidden="true">
        {item.severity === 'critical' ? <WarningCircle size={22} weight="duotone" /> : item.severity === 'warning' ? <Clock size={22} weight="duotone" /> : <Users size={22} weight="duotone" />}
      </div>
      <div className="attention-copy">
        <div className="card-badges"><StatusPill tone={tone}>{item.required ? 'Bắt buộc' : item.reason}</StatusPill></div>
        <h3>{item.title}</h3>
        <p>{item.people}</p>
        <div className="source-line"><span>{item.source}</span><span aria-hidden="true">·</span><span>{item.freshness}</span></div>
      </div>
      <Button variant={primary ? 'primary' : 'borderless'} onClick={onAction}>{item.action}<ArrowRight size={16} /></Button>
      {onResolve && <Button variant="borderless" onClick={onResolve}>Đánh dấu đã xử lý</Button>}
    </article>
  );
}

