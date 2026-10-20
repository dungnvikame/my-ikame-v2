import { isEligible } from '../../lib/audience';
import type { NewsPost, Post, User } from '../../types';

/**
 * Feed hợp nhất (MVP): trộn bài social (Post) và bài Tin tức (NewsPost) vào một
 * dòng thời gian duy nhất. Không merge 2 type — discriminated union + key tiền tố
 * để tránh va chạm id giữa hai nguồn mock.
 */
export type FeedTab = 'company' | 'team' | 'official' | 'saved';

export type FeedItem =
  | { kind: 'post'; post: Post }
  | { kind: 'news'; news: NewsPost };

export const FEED_TAB_LABELS: Record<FeedTab, string> = {
  company: 'Toàn công ty',
  team: 'Team của mình',
  official: 'Thông báo',
  saved: 'Đã lưu',
};

export function feedItemKey(item: FeedItem): string {
  return item.kind === 'post' ? `post:${item.post.id}` : `news:${item.news.id}`;
}

/**
 * Mốc "hiện tại" của bộ mock data (kịch bản demo đặt quanh 10/08) — nhãn dd/mm
 * phải so với mốc này thay vì đồng hồ thật, nếu không bài Tin tức tháng 8 bị
 * đẩy xuống đáy feed khi demo chạy ở tháng khác.
 */
const DEMO_NOW = new Date(2026, 7, 10, 9, 0);

/**
 * Mock data chỉ có nhãn thời gian tiếng Việt ("2 giờ trước", "Hôm qua · 16:30",
 * "08/08 · 10:20") — quy đổi gần đúng sang "số giờ trước" để sắp xếp. Nhãn không
 * parse được rơi xuống cuối feed thay vì gây lỗi.
 */
function hoursAgo(label: string): number {
  const minutes = label.match(/(\d+)\s*phút trước/i);
  if (minutes) return Number(minutes[1]) / 60;
  const hours = label.match(/(\d+)\s*giờ trước/i);
  if (hours) return Number(hours[1]);
  const days = label.match(/(\d+)\s*ngày trước/i);
  if (days) return Number(days[1]) * 24;
  if (/hôm nay/i.test(label)) return 2;
  if (/hôm qua/i.test(label)) return 30;
  const dayMonth = label.match(/(\d{2})\/(\d{2})/);
  if (dayMonth) {
    const published = new Date(DEMO_NOW.getFullYear(), Number(dayMonth[2]) - 1, Number(dayMonth[1]));
    const diff = (DEMO_NOW.getTime() - published.getTime()) / 3_600_000;
    return diff >= 0 ? diff : diff + 365 * 24; // ngày "tương lai" = bài của năm trước
  }
  return 999;
}

export function matchesFeedTab(item: FeedItem, tab: FeedTab): boolean {
  if (item.kind === 'post') {
    const { post } = item;
    if (tab === 'team') return !!post.audienceTeamIds?.length;
    if (tab === 'official') return !!post.official;
    if (tab === 'saved') return !!post.saved;
    return !post.audienceTeamIds?.length;
  }
  const { news } = item;
  if (tab === 'team') return !!news.audienceTeamIds?.length;
  if (tab === 'official') return !!news.official || !!news.mandatory;
  if (tab === 'saved') return false; // NewsPost chưa có saved trong mock — tab Đã lưu chỉ gom bài social
  return !news.audienceTeamIds?.length;
}

/** Bài bắt buộc chưa xác nhận luôn nổi lên đầu mọi tab nó xuất hiện (spec D3). */
function sortScore(item: FeedItem): number {
  if (item.kind === 'news') {
    const boost = item.news.mandatory && !item.news.acknowledged ? -10_000 : 0;
    return boost + hoursAgo(item.news.publishedAt);
  }
  return hoursAgo(item.post.time);
}

/** Bài news bắt buộc chưa xác nhận đầu tiên trong danh sách eligible — cho banner nhắc trên feed. */
export function pendingMandatoryNews(news: NewsPost[], user: User): NewsPost | undefined {
  return news.find((post) => !post.expired && post.mandatory && !post.acknowledged && isEligible(user, post.audienceTeamIds));
}

export function buildFeed(posts: Post[], news: NewsPost[], user: User, tab: FeedTab): FeedItem[] {
  const items: FeedItem[] = [
    // Bài ghim do PinnedCarousel hiển thị riêng — không lặp lại trong dòng feed.
    ...posts.filter((post) => !post.pinned && isEligible(user, post.audienceTeamIds)).map((post): FeedItem => ({ kind: 'post', post })),
    ...news.filter((post) => !post.expired && isEligible(user, post.audienceTeamIds)).map((item): FeedItem => ({ kind: 'news', news: item })),
  ];
  return items.filter((item) => matchesFeedTab(item, tab)).sort((a, b) => sortScore(a) - sortScore(b));
}
