import { useEffect, useState, type RefCallback } from 'react';
import { BookmarkSimple, ChatCircle, HandsClapping, Heart, SealCheck, ShareNetwork } from '@phosphor-icons/react';
import type { Post, PostCover, ReactionKind } from '../../types';
import { Button, StatusPill } from '../../components/UI';

/** Cover render helper (reused by PinnedCarousel) — pure CSS gradient + emoji, never a real photo. */
export function PostCoverBlock({ cover, compact = false }: { cover: PostCover; compact?: boolean }) {
  return (
    <div className={`post-cover post-cover--${cover.pattern} ${compact ? 'is-compact' : ''}`}>
      <span className="post-cover-emoji" aria-hidden="true">{cover.emoji}</span>
      {cover.caption && <small>{cover.caption}</small>}
    </div>
  );
}

type PostCardProps = {
  post: Post;
  expanded: boolean;
  demoResetCount: number;
  onToggleExpanded: (id: string) => void;
  onToggleReaction: (id: string, kind: ReactionKind) => void;
  onAddComment: (id: string, text: string) => void;
  onToggleSave: (id: string) => void;
  onShare: (id: string) => void;
  registerRef?: RefCallback<HTMLElement>;
};

export function PostCard({
  post, expanded, demoResetCount, onToggleExpanded, onToggleReaction, onAddComment, onToggleSave, onShare, registerRef,
}: PostCardProps) {
  const [draft, setDraft] = useState('');
  const [bump, setBump] = useState<ReactionKind | null>(null);

  // Inline comment draft is component-local UI state — must clear on resetDemo() (F4).
  useEffect(() => { setDraft(''); }, [demoResetCount]);

  const react = (kind: ReactionKind) => {
    onToggleReaction(post.id, kind);
    setBump(kind);
    window.setTimeout(() => setBump((current) => (current === kind ? null : current)), 220);
  };

  const submitComment = () => {
    const text = draft.trim();
    if (!text) return;
    onAddComment(post.id, text);
    setDraft('');
    if (!expanded) onToggleExpanded(post.id);
  };

  const hasHeart = post.myReactions.includes('heart');
  const hasClap = post.myReactions.includes('clap');

  return (
    <article className="community-post-card" ref={registerRef}>
      <header className="community-post-header">
        <span className="avatar" aria-hidden="true">{post.authorShort}</span>
        <div className="community-post-heading-copy">
          <strong>{post.authorName}</strong>
          <span className="community-post-meta">{post.role} · {post.time}</span>
        </div>
        {post.official && <StatusPill tone="info"><SealCheck size={14} />Chính thức</StatusPill>}
      </header>

      <p className="community-post-body">{post.body}</p>
      {post.cover && <PostCoverBlock cover={post.cover} />}

      <div className="community-reaction-row">
        <button
          type="button"
          className={`community-reaction ${hasHeart ? 'is-active' : ''} ${bump === 'heart' ? 'is-bumping' : ''}`}
          aria-pressed={hasHeart}
          onClick={() => react('heart')}
        >
          <Heart size={18} weight={hasHeart ? 'fill' : 'regular'} /> {post.reactions.heart}
        </button>
        <button
          type="button"
          className={`community-reaction ${hasClap ? 'is-active' : ''} ${bump === 'clap' ? 'is-bumping' : ''}`}
          aria-pressed={hasClap}
          onClick={() => react('clap')}
        >
          <HandsClapping size={18} weight={hasClap ? 'fill' : 'regular'} /> {post.reactions.clap}
        </button>
        <button type="button" className="community-reaction" aria-expanded={expanded} onClick={() => onToggleExpanded(post.id)}>
          <ChatCircle size={18} /> Bình luận ({post.comments.length})
        </button>
        <button type="button" className="community-reaction" onClick={() => onShare(post.id)}>
          <ShareNetwork size={18} /> Chia sẻ
        </button>
        <button
          type="button"
          className={`community-reaction ${post.saved ? 'is-active' : ''}`}
          aria-pressed={!!post.saved}
          onClick={() => onToggleSave(post.id)}
        >
          <BookmarkSimple size={18} weight={post.saved ? 'fill' : 'regular'} /> {post.saved ? 'Đã lưu' : 'Lưu'}
        </button>
      </div>

      {expanded && (
        <div className="community-comments">
          <ul className="community-comment-list">
            {post.comments.map((comment) => (
              <li key={comment.id} className="community-comment">
                <span className="avatar" aria-hidden="true">{comment.authorShort}</span>
                <div>
                  <strong>{comment.authorName}</strong>{' '}
                  <span className="community-comment-meta">{comment.role ? `${comment.role} · ` : ''}{comment.time}</span>
                  <p>{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="community-comment-composer">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                // Enter gửi bình luận, Shift+Enter xuống dòng (không phá multiline).
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  submitComment();
                }
              }}
              placeholder="Viết bình luận…"
              rows={1}
              aria-label={`Bình luận về bài viết của ${post.authorName}`}
            />
            <Button variant="dim" disabled={!draft.trim()} onClick={submitComment}>Gửi</Button>
          </div>
        </div>
      )}
    </article>
  );
}
