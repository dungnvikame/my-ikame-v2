import { SealCheck } from '@phosphor-icons/react';
import { StatusPill } from '../../components/UI';
import type { Post } from '../../types';
import { PostCoverBlock } from './PostCard';

/** Horizontal-scroll carousel of pinned posts. Native overflow + focusable cards = keyboard reachable. */
export function PinnedCarousel({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="community-pinned" aria-label="Bài viết chính thức đang ghim">
      <div className="community-pinned-track">
        {posts.map((post) => (
          <article key={post.id} className="community-pinned-card" tabIndex={0}>
            <div className="card-badges">
              <StatusPill tone="info"><SealCheck size={14} />Chính thức</StatusPill>
              {post.pinnedUntilLabel && <StatusPill>{post.pinnedUntilLabel}</StatusPill>}
            </div>
            {post.cover && <PostCoverBlock cover={post.cover} compact />}
            <p className="community-pinned-body">{post.body}</p>
            <div className="source-line"><span>{post.authorName}</span><span aria-hidden="true">·</span><span>{post.time}</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}
