import { ChartLineUp, Eye, SealCheck, UsersThree } from '@phosphor-icons/react';
import type { NewsPost } from '../../types';

/** Tổng % trên tập bài có metrics — tránh chia cho 0 khi mock trống. */
function ratio(items: NewsPost[], pick: (metrics: NonNullable<NewsPost['metrics']>) => number): number {
  const withMetrics = items.flatMap((item) => (item.metrics ? [item.metrics] : []));
  const reach = withMetrics.reduce((sum, metrics) => sum + metrics.reach, 0);
  if (!reach) return 0;
  return Math.round((withMetrics.reduce((sum, metrics) => sum + pick(metrics), 0) / reach) * 100);
}

/** 4 chỉ số COM cần cho OKR O1-KR4: WAU + 3 chỉ số phân phối thông báo chính thức. */
export function AdminMetrics({ news }: { news: NewsPost[] }) {
  const official = news.filter((item) => item.official && !item.expired);
  const mandatory = official.filter((item) => item.mandatory);
  const tiles = [
    // WAU/mở app là số liệu nền tảng (GA + SSO log) — mock cố định cho demo.
    { icon: UsersThree, label: 'WAU tuần này', value: '78%', hint: '144/184 iKamer · +6 điểm so tuần trước', tone: 'good' },
    { icon: ChartLineUp, label: 'Tỷ lệ mở app hôm nay', value: '64%', hint: 'Cao nhất lúc 08:30 sau push buổi sáng', tone: 'neutral' },
    { icon: Eye, label: 'Đọc thông báo chính thức', value: `${ratio(official, (m) => m.read)}%`, hint: `${official.length} bài đang phân phối`, tone: 'neutral' },
    { icon: SealCheck, label: 'Xác nhận bắt buộc', value: `${ratio(mandatory, (m) => m.acknowledged)}%`, hint: `${mandatory.reduce((sum, item) => sum + (item.pendingAckNames?.length ?? 0), 0)} người chưa xác nhận`, tone: 'watch' },
  ] as const;

  return (
    <section className="admin-tiles" aria-label="Chỉ số COM">
      {tiles.map(({ icon: Icon, label, value, hint, tone }) => (
        <article key={label} className={`admin-tile admin-tile--${tone}`}>
          <span className="admin-tile-icon" aria-hidden="true"><Icon size={18} weight="duotone" /></span>
          <small>{label}</small>
          <strong>{value}</strong>
          <p>{hint}</p>
        </article>
      ))}
    </section>
  );
}
