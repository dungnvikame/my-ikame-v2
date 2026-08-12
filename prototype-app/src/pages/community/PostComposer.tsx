import { useEffect, useState } from 'react';
import { Button } from '../../components/UI';
import type { PostCover } from '../../types';

const COVER_PRESETS: { pattern: PostCover['pattern']; emoji: string; label: string }[] = [
  { pattern: 'aurora', emoji: '✨', label: 'Aurora' },
  { pattern: 'grid', emoji: '💡', label: 'Lưới' },
  { pattern: 'wave', emoji: '🌊', label: 'Sóng' },
  { pattern: 'confetti', emoji: '🎉', label: 'Confetti' },
];

type PostComposerProps = {
  userShort: string;
  demoResetCount: number;
  onSubmit: (body: string, cover?: PostCover) => void;
};

export function PostComposer({ userShort, demoResetCount, onSubmit }: PostComposerProps) {
  const [body, setBody] = useState('');
  const [cover, setCover] = useState<PostCover | undefined>(undefined);

  // Draft is component-local UI state — must clear on resetDemo() (F4), not stored in AppState.
  useEffect(() => { setBody(''); setCover(undefined); }, [demoResetCount]);

  const canSubmit = body.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(body.trim(), cover);
    setBody('');
    setCover(undefined);
  };

  return (
    <section className="community-composer" aria-label="Đăng bài mới">
      <div className="community-composer-row">
        <span className="avatar" aria-hidden="true">{userShort}</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Bạn muốn chia sẻ gì với iKame?"
          rows={3}
          aria-label="Nội dung bài viết"
        />
      </div>
      <div className="community-composer-covers" role="group" aria-label="Chọn hình đại diện bài viết">
        {COVER_PRESETS.map((preset) => {
          const selected = cover?.pattern === preset.pattern;
          return (
            <button
              key={preset.pattern}
              type="button"
              className={`community-cover-chip post-cover--${preset.pattern} ${selected ? 'is-selected' : ''}`}
              aria-pressed={selected}
              onClick={() => setCover(selected ? undefined : { pattern: preset.pattern, emoji: preset.emoji })}
            >
              <span aria-hidden="true">{preset.emoji}</span>{preset.label}
            </button>
          );
        })}
      </div>
      <div className="community-composer-actions">
        <Button variant="primary" disabled={!canSubmit} onClick={submit}>Đăng</Button>
      </div>
    </section>
  );
}
