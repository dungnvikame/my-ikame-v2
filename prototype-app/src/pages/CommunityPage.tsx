import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, X } from '@phosphor-icons/react';
import { useAppState } from '../AppState';
import { Button, EmptyState, IconButton } from '../components/UI';
import { isEligible } from '../lib/audience';
import type { PostCover } from '../types';
import { CommunityRail } from './community/CommunityRail';
import { PinnedCarousel } from './community/PinnedCarousel';
import { PostCard } from './community/PostCard';
import { PostComposer } from './community/PostComposer';
import { useToast } from './community/use-toast';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function CommunityPage() {
  const {
    posts, birthdays, milestones, topFans, events, dailyCheckIn, user, demoResetCount,
    addPost, toggleReaction, addComment, toggleSavePost, congratulate, submitDailyCheckIn,
  } = useAppState();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { toast, show } = useToast();
  const postRefs = useRef(new Map<string, HTMLElement>());

  // Component-local UI state clears on resetDemo() (F4) — feed data itself lives in AppState.
  useEffect(() => { setExpanded(new Set()); setBannerDismissed(false); }, [demoResetCount]);

  const visiblePosts = useMemo(() => posts.filter((post) => isEligible(user, post.audienceTeamIds)), [posts, user]);
  const pinned = useMemo(() => visiblePosts.filter((post) => post.pinned), [visiblePosts]);
  const feed = useMemo(() => visiblePosts.filter((post) => !post.pinned), [visiblePosts]);
  const mentioned = feed.find((post) => post.mentionsMe);

  const scrollToPost = (id: string) => {
    setExpanded((prev) => new Set(prev).add(id));
    requestAnimationFrame(() => {
      postRefs.current.get(id)?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  };

  const toggleExpanded = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const handleSubmitPost = (body: string, cover?: PostCover) => {
    addPost({ body, cover });
    show('Đã đăng lên Cộng đồng');
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
          <p className="eyebrow">CỘNG ĐỒNG</p>
          <h1>Cộng đồng</h1>
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
          {feed.length === 0 ? (
            <EmptyState title="Chưa có bài viết" body="Hãy là người đầu tiên chia sẻ với Cộng đồng." />
          ) : feed.map((post) => (
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
          dailyCheckIn={dailyCheckIn}
          submitDailyCheckIn={submitDailyCheckIn}
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
