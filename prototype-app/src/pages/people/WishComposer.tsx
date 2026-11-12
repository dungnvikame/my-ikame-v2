import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Textarea } from '@coreds/react';
import { Button, ChipButton } from '../../components/UI';

const MAX_LENGTH = 400;

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  suggestions: string[];
  confirmLabel: string;
  placeholder?: string;
  /** Phần phía trên ô nhập (chọn người nhận…). */
  header?: ReactNode;
  /** Chặn gửi khi chưa đủ điều kiện ngoài nội dung (vd chưa chọn người nhận). */
  canSubmit?: boolean;
  onConfirm: (text: string) => void;
};

/** Hộp soạn lời chúc / lời cảm ơn: ô nhập + câu gợi ý bấm một lần để điền. */
export function WishComposer({ open, onClose, title, description, suggestions, confirmLabel, placeholder, header, canSubmit = true, onConfirm }: Props) {
  const [text, setText] = useState('');
  useEffect(() => { if (open) setText(''); }, [open]);
  const trimmed = text.trim();

  return (
    <Modal
      open={open}
      onOpenChange={(next) => { if (!next) onClose(); }}
      size="sm"
      title={title}
      description={description}
      footer={(
        <>
          <Button variant="borderless" onClick={onClose}>Huỷ</Button>
          <Button variant="primary" disabled={!trimmed || !canSubmit} onClick={() => onConfirm(trimmed)}>{confirmLabel}</Button>
        </>
      )}
    >
      <div className="pp-form">
        {header}
        <Textarea
          variant="fill"
          minRows={4}
          maxLength={MAX_LENGTH}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder ?? 'Viết đôi lời gửi tới đồng nghiệp…'}
          aria-label="Nội dung lời nhắn"
        />
        <small className="pp-muted">{text.length}/{MAX_LENGTH}</small>
        <div className="pp-suggest" role="group" aria-label="Gợi ý nhanh">
          {suggestions.map((suggestion) => (
            <ChipButton key={suggestion} aria-pressed={text === suggestion} onClick={() => setText(suggestion)}>{suggestion}</ChipButton>
          ))}
        </div>
      </div>
    </Modal>
  );
}
