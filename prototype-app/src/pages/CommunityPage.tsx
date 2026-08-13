import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, X } from '@phosphor-icons/react';
import { useAppState } from '../AppState';
import { Button, EmptyState, IconButton } from '../components/UI';
import { isEligible } from '../lib/audience';
import type { Post } from '../types';
import { CommunityRail } from './community/CommunityRail';
import { PinnedCarousel } from './community/PinnedCarousel';
import { PostCard } from './community/PostCard';
import { PostComposer } from './community/PostComposer';
import { useToast } from './community/use-toast';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type FeedFilter = 'company' | 'team' | 'official' | 'saved';

const FEED_FILTERS: { key: FeedFilter; label: string }[] = [
  { key: 'company', label: 'Toàn công ty' },
  { key: 'team', label: 'Team của mình' },
  { key: 'official', label: 'Thông báo' },
  { key: 'saved', label: 'Đã lưu' },
];

const FILTER_EMPTY_COPY: Record<FeedFilter, { title: string; body: string }> = {
  company: { title: 'Chưa có bài viết', body: 'Hãy là người đầu tiên chia sẻ với iKame Feed.' },
  team: { title: 'Team chưa có bài viết riêng', body: 'Bài viết dành riêng cho team của bạn sẽ xuất hiện ở đây.' },
  official: { title: 'Chưa có thông báo', body: 'Thông báo chính thức từ công ty sẽ xuất hiện ở đây.' },
  saved: { title: 'Chưa lưu bài viết nào', body: 'Bấm biểu tượng lưu trên bài viết để xem lại tại đây.' },
};

function matchesFilter(post: Post, filter: FeedFilter): boolean {
  if (filter === 'team') return !!post.audienceTeamIds?.length;
  if (filter === 'official') return !!post.official;
  if (filter === 'saved') return !!post.saved;
  return !post.audienceTeamIds?.length;
}

export function CommunityPage() {
  const {
    posts, birthdays, milestones, topFans, events, user, demoResetCount,
    addPost, toggleReaction, addComment, toggleSavePost, congratulate,
  } = useAppState();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('company');
  const { toast, show } = useToast();
  const postRefs = useRef(new Map<string, HTMLElement>());

  // Component-local UI state clears on resetDemo() (F4) — feed data itself lives in AppState.
  useEffect(() => { setExpanded(new Set()); setBannerDismissed(false); setFeedFilter('company'); }, [demoResetCount]);

  const visiblePosts = useMemo(() => posts.filter((post) => isEligible(user, post.audienceTeamIds)), [posts, user]);
  const pinned = useMemo(() => visiblePosts.filter((post) => post.pinned), [visiblePosts]);
  const feed = useMemo(() => visiblePosts.filter((post) => !post.pinned), [visiblePosts]);
  const filteredFeed = useMemo(() => feed.filter((post) => matchesFilter(post, feedFilter)), [feed, feedFilter]);
  const mentioned = feed.find((post) => post.mentionsMe);

  const scrollToPost = (id: string) => {
    // Bài đích có thể đang bị tab lọc ẩn — chuyển đúng tab trước khi cuộn tới.
    const target = feed.find((post) => post.id === id);
    if (target && !matchesFilter(target, feedFilter)) {
      setFeedFilter(target.audienceTeamIds?.length ? 'team' : 'company');
    }
    setExpanded((prev) => new Set(prev).add(id));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      postRefs.current.get(id)?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }));
  };

  const toggleExpanded = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const handleSubmitPost = (body: string) => {
    addPost({ body });
    show('Đã đăng lên iKame Feed');
  };

  const handleToggleSave = (id: string) => {
    const target = posts.find((item) => item.id === id);
    toggleSavePost(id);
    show(target?.saved ? 'Đã bỏ lưu bài viết' : 'Đã lưu bài viết');
  };

  const handleCongratulate = (personId: string, postId: string, name: string) => {
    congratulate(personId);
    show(`Đã gửi lời chúc mừng ${name} 🎉`, { label: 'Xem bài viết', onClick: () => scrollToPost(postId) });
  };

  return (
    <div className="page community-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">IKAME FEED</p>
          <h1>iKame Feed</h1>
          <p>Không gian chia sẻ và kết nối nội bộ của iKamer.</p>
        </div>
      </header>

      <PinnedCarousel posts={pinned} />

      {mentioned && !bannerDismissed && (
        <div className="community-mention-banner" role="status">
          <span>Bài viết nhắc tên bạn có {mentioned.comments.length} bình luận mới</span>
          <div className="community-mention-actions">
            <Button variant="dim" onClick={() => scrollToPost(mentioned.id)}>Xem ngay<ArrowRight size={16} /></Button>
            <IconButton label="Ẩn thông báo" onClick={() => setBannerDismissed(true)}><X size={16} /></IconButton>
          </div>
        </div>
      )}

      <div className="community-layout">
        <div className="community-feed">
          <PostComposer userShort={user.shortName} demoResetCount={demoResetCount} onSubmit={handleSubmitPost} />
          <div className="neutral-tabs community-feed-tabs" role="tablist" aria-label="Lọc bảng tin">
            {FEED_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={feedFilter === key}
                className={feedFilter === key ? 'is-active' : ''}
                onClick={() => setFeedFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          {filteredFeed.length === 0 ? (
            <EmptyState title={FILTER_EMPTY_COPY[feedFilter].title} body={FILTER_EMPTY_COPY[feedFilter].body} />
          ) : filteredFeed.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              expanded={expanded.has(post.id)}
              demoResetCount={demoResetCount}
              onToggleExpanded={toggleExpanded}
              onToggleReaction={toggleReaction}
              onAddComment={addComment}
              onToggleSave={handleToggleSave}
              onShare={() => show('Đã sao chép liên kết bài viết')}
              registerRef={(el) => { if (el) postRefs.current.set(post.id, el); else postRefs.current.delete(post.id); }}
            />
          ))}
        </div>

        <CommunityRail
          user={user}
          events={events}
          topFans={topFans}
          birthdays={birthdays}
          milestones={milestones}
          onCongratulate={handleCongratulate}
        />
      </div>

      {toast && (
        <div className="community-toast" role="status">
          <span>{toast.message}</span>
          {toast.action && <button type="button" onClick={toast.action.onClick}>{toast.action.label}</button>}
        </div>
      )}
    </div>
  );
}
