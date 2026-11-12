import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightIcon as ArrowRight, ChatsCircleIcon as ChatsCircle, ShieldWarningIcon as ShieldWarning, XIcon as X } from '@coreds/react/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { NewsCard } from '../components/ContentCards';
import { Tabs } from '../components/Tabs';
import { Button, EmptyState, IconButton, StatusPill, ButtonLink } from '../components/UI';
import { useToast } from '../components/toast';
import { CommunityRail } from './community/CommunityRail';
import { PinnedCarousel } from './community/PinnedCarousel';
import { PostCard } from './community/PostCard';
import { PostComposer, type ComposerSubmit } from './community/PostComposer';
import { colleagues } from '../data/community-data';
import { buildFeed, FEED_TAB_LABELS, feedItemKey, matchesFeedTab, pendingMandatoryNews, type FeedTab } from './feed/feed-items';
import { isEligible } from '../lib/audience';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const FEED_TABS = (Object.keys(FEED_TAB_LABELS) as FeedTab[]).map((key) => ({ key, label: FEED_TAB_LABELS[key] }));

const FILTER_EMPTY_COPY: Record<FeedTab, { title: string; body: string }> = {
  company: { title: 'Chưa có bài viết', body: 'Hãy là người đầu tiên chia sẻ với iKame Feed.' },
  team: { title: 'Team chưa có bài viết riêng', body: 'Bài viết và thông báo dành riêng cho team của bạn sẽ xuất hiện ở đây.' },
  official: { title: 'Chưa có thông báo', body: 'Thông báo chính thức từ công ty sẽ xuất hiện ở đây.' },
  saved: { title: 'Chưa lưu bài viết nào', body: 'Bấm biểu tượng lưu trên bài viết để xem lại tại đây.' },
};

/** iKame Feed hợp nhất (MVP) — kênh truyền thông chính thức: thông báo công ty + bài social + bài theo team. */
export function FeedPage() {
  const {
    posts, news, birthdays, milestones, topFans, events, user, demoResetCount, perspective,
    addPost, toggleReaction, addComment, toggleSavePost, congratulate, togglePinPost,
  } = useAppState();

  const [searchParams] = useSearchParams();
  const kudosTo = searchParams.get('compose') === 'kudos' ? searchParams.get('to') ?? undefined : undefined;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [feedFilter, setFeedFilter] = useState<FeedTab>('company');
  const { showToast: show } = useToast();
  const postRefs = useRef(new Map<string, HTMLElement>());

  // Component-local UI state clears on resetDemo() (F4) — feed data itself lives in AppState.
  useEffect(() => { setExpanded(new Set()); setBannerDismissed(false); setFeedFilter('company'); }, [demoResetCount]);

  const feed = useMemo(() => buildFeed(posts, news, user, feedFilter), [posts, news, user, feedFilter]);
  // Không tự ghi nhận chính mình (Gia Huy cũng nằm trong danh sách đồng nghiệp).
  const kudosColleagues = useMemo(() => colleagues.filter((person) => person.name !== user.name), [user.name]);
  // Audience check áp dụng cho MỌI lối vào feed — carousel ghim và banner mention cũng vậy.
  const visiblePosts = useMemo(() => posts.filter((post) => isEligible(user, post.audienceTeamIds)), [posts, user]);
  const pinned = useMemo(() => visiblePosts.filter((post) => post.pinned), [visiblePosts]);
  const mandatory = useMemo(() => pendingMandatoryNews(news, user), [news, user]);
  const mentioned = visiblePosts.find((post) => post.mentionsMe);

  const scrollToPost = (id: string) => {
    // Bài đích có thể đang bị tab lọc ẩn — chuyển đúng tab trước khi cuộn tới.
    const target = visiblePosts.find((post) => post.id === id);
    if (target && !matchesFeedTab({ kind: 'post', post: target }, feedFilter)) {
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

  const handleSubmitPost = ({ body, kudos }: ComposerSubmit) => {
    addPost({ body, kudos });
    show(kudos ? `Đã gửi ghi nhận tới ${kudos.toName} 🙌` : 'Đã đăng lên iKame Feed');
  };

  const handleToggleSave = (id: string) => {
    const target = posts.find((item) => item.id === id);
    toggleSavePost(id);
    show(target?.saved ? 'Đã bỏ lưu bài viết' : 'Đã lưu bài viết');
  };

  // Ghim chỉ dành cho COM Admin — iKamer không thấy nút này.
  const handleTogglePin = perspective === 'admin'
    ? (id: string) => {
      const target = posts.find((item) => item.id === id);
      togglePinPost(id);
      show(target?.pinned ? 'Đã bỏ ghim bài viết' : 'Đã ghim bài lên đầu iKame Feed');
    }
    : undefined;

  const handleCongratulate = (personId: string, postId: string, name: string) => {
    congratulate(personId);
    show(`Đã gửi lời chúc mừng ${name} 🎉`, { label: 'Xem bài viết', onClick: () => scrollToPost(postId) });
  };

  return (
    <div className="page community-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">KÊNH CHÍNH THỨC</p>
          <h1>iKame Feed</h1>
          <p>Kênh truyền thông chính thức và không gian kết nối của iKame.</p>
        </div>
      </header>

      <PinnedCarousel posts={pinned} />

      {mandatory && (
        <div className="community-mention-banner" role="status">
          <span className="feed-mandatory-copy">
            <ShieldWarning size={18} variant="duotone" aria-hidden="true" />
            <StatusPill tone="error">Cần xác nhận</StatusPill>
            <span>{mandatory.title}</span>
          </span>
          <div className="community-mention-actions">
            <ButtonLink variant="dim" to={`/feed/article/${mandatory.id}`}>Đọc & xác nhận<ArrowRight size={16} /></ButtonLink>
          </div>
        </div>
      )}

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
          <PostComposer userShort={user.shortName} demoResetCount={demoResetCount} colleagues={kudosColleagues} onSubmit={handleSubmitPost} initialKudosTo={kudosTo} />
          <Tabs
            className="neutral-tabs community-feed-tabs"
            tabs={FEED_TABS}
            active={feedFilter}
            onChange={setFeedFilter}
            ariaLabel="Lọc bảng tin"
          />
          {feed.length === 0 ? (
            <EmptyState icon={<ChatsCircle size={44} variant="duotone" />} title={FILTER_EMPTY_COPY[feedFilter].title} body={FILTER_EMPTY_COPY[feedFilter].body} />
          ) : feed.map((item) => item.kind === 'post' ? (
            <PostCard
              key={feedItemKey(item)}
              post={item.post}
              expanded={expanded.has(item.post.id)}
              demoResetCount={demoResetCount}
              onToggleExpanded={toggleExpanded}
              onToggleReaction={toggleReaction}
              onAddComment={addComment}
              onToggleSave={handleToggleSave}
              onShare={() => show('Đã sao chép liên kết bài viết')}
              onTogglePin={handleTogglePin}
              registerRef={(el) => { if (el) postRefs.current.set(item.post.id, el); else postRefs.current.delete(item.post.id); }}
            />
          ) : (
            <NewsCard key={feedItemKey(item)} post={item.news} />
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

    </div>
  );
}
