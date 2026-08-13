import { useEffect, useState } from 'react';
import { Button } from '../../components/UI';

type PostComposerProps = {
  userShort: string;
  demoResetCount: number;
  onSubmit: (body: string) => void;
};

export function PostComposer({ userShort, demoResetCount, onSubmit }: PostComposerProps) {
  const [body, setBody] = useState('');

  // Draft is component-local UI state — must clear on resetDemo() (F4), not stored in AppState.
  useEffect(() => { setBody(''); }, [demoResetCount]);

  const canSubmit = body.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(body.trim());
    setBody('');
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
      <div className="community-composer-actions">
        <Button variant="primary" disabled={!canSubmit} onClick={submit}>Đăng</Button>
      </div>
    </section>
  );
}
