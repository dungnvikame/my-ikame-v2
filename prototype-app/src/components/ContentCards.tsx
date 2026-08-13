import {
  ArrowRight,
  CalendarCheck,
  CalendarDots,
  CheckCircle,
  Clock,
  MapPin,
  SealCheck,
  Users,
  WarningCircle,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import type { AttentionItem, EventItem, NewsPost } from '../types';
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

export function EventCard({ event, compact = false }: { event: EventItem; compact?: boolean }) {
  const tone = event.myRegistration === 'going' ? 'success' : event.myRegistration === 'waitlisted' ? 'info' : event.status === 'full' ? 'warning' : event.status === 'cancelled' ? 'error' : 'neutral';
  const label = event.myRegistration === 'going' ? 'Đã đăng ký' : event.myRegistration === 'waitlisted' ? 'Đang chờ' : event.status === 'full' ? 'Hết chỗ' : event.status === 'cancelled' ? 'Đã hủy' : event.remaining ? `Còn ${event.remaining} chỗ` : 'Mở đăng ký';

  return (
    <article className={`content-card event-card ${compact ? 'is-compact' : ''}`}>
      <div className="event-date" aria-label={event.dateLabel}>
        <span>{event.month}</span>
        <strong>{event.day}</strong>
      </div>
      <div className="card-body">
        <div className="card-badges"><StatusPill tone={tone}>{label}</StatusPill><StatusPill>{event.format}</StatusPill></div>
        <h3><Link to={`/events/${event.id}`}>{event.title}</Link></h3>
        {!compact && <p>{event.summary}</p>}
        <div className="event-meta">
          <span><Clock size={16} /> {event.time}</span>
          <span><MapPin size={16} /> {event.location}</span>
        </div>
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

export function QuickAction({ icon, label, note }: { icon: 'event' | 'news' | 'team'; label: string; note: string }) {
  const Icon = icon === 'event' ? CalendarCheck : icon === 'news' ? CalendarDots : Users;
  return (
    <button className="quick-action">
      <span className="quick-action-icon"><Icon size={20} /></span>
      <span><strong>{label}</strong><small>{note}</small></span>
      <ArrowRight size={16} />
    </button>
  );
}
