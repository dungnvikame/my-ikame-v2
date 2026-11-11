import { useEffect, useState } from 'react';
import { HandsClappingIcon as HandsClapping, PencilSimpleLineIcon as PencilSimpleLine, ShieldWarningIcon as ShieldWarning } from '@coreds/react/icons';
import { Button, ChipButton } from '../../components/UI';
import { checkContent, type ModerationResult } from '../../lib/moderation';
import type { Post } from '../../types';
import { Select, Avatar, Textarea } from '@coreds/react';
import { avatarText } from '../../lib/avatar-text';

export type ComposerSubmit = { body: string; kudos?: Post['kudos'] };
export type Colleague = { name: string; shortName: string; role: string };

type ComposerMode = 'share' | 'kudos';

type PostComposerProps = {
  userShort: string;
  demoResetCount: number;
  colleagues: Colleague[];
  onSubmit: (input: ComposerSubmit) => void;
  /** Mở sẵn chế độ Kudos với người nhận (từ Tín hiệu sớm của manager: /feed?compose=kudos&to=…). */
  initialKudosTo?: string;
};

/** Composer 2 chế độ: chia sẻ thường / ghi nhận đồng nghiệp (Kudos) — cả hai qua bộ lọc tự động. */
export function PostComposer({ userShort, demoResetCount, colleagues, onSubmit, initialKudosTo }: PostComposerProps) {
  const presetRecipient = colleagues.find((person) => person.name === initialKudosTo)?.name;
  const [mode, setMode] = useState<ComposerMode>(presetRecipient ? 'kudos' : 'share');
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState(presetRecipient ?? colleagues[0]?.name ?? '');
  const [rejection, setRejection] = useState<Extract<ModerationResult, { ok: false }> | null>(null);

  // Draft is component-local UI state — must clear on resetDemo() (F4), not stored in AppState.
  useEffect(() => { setBody(''); setMode('share'); setRejection(null); setRecipient(colleagues[0]?.name ?? ''); }, [demoResetCount, colleagues]);
  useEffect(() => {
    if (presetRecipient) { setMode('kudos'); setRecipient(presetRecipient); }
  }, [presetRecipient]);

  const canSubmit = body.trim().length > 0 && (mode === 'share' || !!recipient);

  const submit = () => {
    if (!canSubmit) return;
    const result = checkContent(body);
    if (!result.ok) { setRejection(result); return; }
    const target = colleagues.find((person) => person.name === recipient);
    onSubmit({
      body: body.trim(),
      kudos: mode === 'kudos' && target ? { toName: target.name, toShort: target.shortName } : undefined,
    });
    setBody('');
    setRejection(null);
  };

  return (
    <section className="community-composer" aria-label="Đăng bài mới">
      <div className="community-composer-modes" role="group" aria-label="Loại bài đăng">
        <ChipButton aria-pressed={mode === 'share'} onClick={() => setMode('share')}>
          <PencilSimpleLine size={15} /> Chia sẻ
        </ChipButton>
        <ChipButton aria-pressed={mode === 'kudos'} onClick={() => setMode('kudos')}>
          <HandsClapping size={15} /> Ghi nhận đồng nghiệp
        </ChipButton>
      </div>
      {mode === 'kudos' && (
        <label className="community-composer-recipient">
          <span>Gửi tới</span>
          <Select
            variant="fill"
            searchable
            aria-label="Người được ghi nhận"
            searchPlaceholder="Tìm đồng nghiệp…"
            options={colleagues.map((person) => ({ value: person.name, label: person.name, description: person.role }))}
            value={recipient}
            onValueChange={(value) => setRecipient(String(value))}
          />
        </label>
      )}
      <div className="community-composer-row">
        <Avatar type="text" size="m" fallback={avatarText(userShort)} alt="" aria-hidden="true" />
        <Textarea variant="borderless" autosize minRows={2}
          value={body}
          onChange={(event) => { setBody(event.target.value); if (rejection) setRejection(null); }}
          placeholder={mode === 'kudos' ? `Vì sao bạn muốn ghi nhận ${recipient || 'đồng nghiệp'}?` : 'Bạn muốn chia sẻ gì với iKame?'}
          rows={3}
          aria-label="Nội dung bài viết"
          aria-invalid={!!rejection}
        />
      </div>
      {rejection && (
        <div className="community-moderation" role="alert">
          <ShieldWarning size={20} variant="duotone" aria-hidden="true" />
          <div>
            <strong>Bài chưa được đăng — {rejection.reason}</strong>
            <p>Hệ thống phát hiện “{rejection.matched}”. {rejection.hint}</p>
            <small>Bộ lọc tự động, không duyệt trước · COM hậu kiểm các trường hợp cần xử lý thêm.</small>
          </div>
        </div>
      )}
      <div className="community-composer-actions">
        <Button variant="primary" disabled={!canSubmit} onClick={submit}>{mode === 'kudos' ? 'Gửi ghi nhận' : 'Đăng'}</Button>
      </div>
    </section>
  );
}
