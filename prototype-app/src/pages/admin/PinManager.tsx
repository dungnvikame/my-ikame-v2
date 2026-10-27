import { PushPin, PushPinSlash } from '@phosphor-icons/react';
import { Button, EmptyState, SectionHeader } from '../../components/UI';
import type { Post } from '../../types';

type PinManagerProps = { posts: Post[]; onTogglePin: (id: string) => void };

function PostRow({ post, onTogglePin }: { post: Post; onTogglePin: (id: string) => void }) {
  return (
    <li className="admin-pin-row">
      <span className="avatar" aria-hidden="true">{post.authorShort}</span>
      <div className="admin-pin-copy">
        <strong>{post.authorName} <small>· {post.time}</small></strong>
        <p>{post.kudos ? `Ghi nhận ${post.kudos.toName}: ` : ''}{post.body}</p>
      </div>
      <Button
        variant="dim"
        icon={post.pinned ? <PushPinSlash size={15} /> : <PushPin size={15} />}
        onClick={() => onTogglePin(post.id)}
      >
        {post.pinned ? 'Bỏ ghim' : 'Ghim'}
      </Button>
    </li>
  );
}

/** Quản lý bài ghim: bài ghim hiện ở carousel đầu Feed, nổi bật khác hẳn bài thường. */
export function PinManager({ posts, onTogglePin }: PinManagerProps) {
  const pinned = posts.filter((post) => post.pinned);
  const candidates = posts.filter((post) => !post.pinned).slice(0, 5);

  return (
    <section className="admin-block" aria-label="Bài ghim trên Feed">
      <SectionHeader title="Bài ghim trên Feed" meta={`${pinned.length} đang ghim · tối đa 4 để carousel gọn`} />
      {pinned.length ? (
        <ul className="admin-pin-list">{pinned.map((post) => <PostRow key={post.id} post={post} onTogglePin={onTogglePin} />)}</ul>
      ) : (
        <EmptyState title="Chưa ghim bài nào" body="Chọn bài gần đây bên dưới để ghim lên đầu Feed." />
      )}
      <h3 className="admin-subheading">Bài gần đây</h3>
      <ul className="admin-pin-list">{candidates.map((post) => <PostRow key={post.id} post={post} onTogglePin={onTogglePin} />)}</ul>
    </section>
  );
}
