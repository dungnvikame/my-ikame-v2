import { CheckCircle, ProhibitInset } from '@phosphor-icons/react';
import { Button } from '../UI';
import type { AiScriptAction } from '../../data/ai-scripts';

/** Substitutes the receipt copy's `xxxx` placeholder with the generated receipt id. */
function formatReceipt(receipt: string, receiptId?: string): string {
  return receiptId ? receipt.replace('xxxx', receiptId) : receipt;
}

/**
 * Draft/execute/denied action variants + receipt rendering. Fully controlled — all
 * mutable state (draft text, sent/already flags) is lifted into AskIKamePanel so it
 * survives the panel closing (F4). Calls AppState mutators via the parent's handlers.
 */
export function AiActionBlock({
  action,
  draftText,
  sent,
  already,
  receiptId,
  onDraftChange,
  onSendDraft,
  onCancelDraft,
  onConfirmExecute,
  onOpenReceiptLink,
}: {
  action: AiScriptAction;
  draftText?: string;
  sent?: boolean;
  already?: boolean;
  receiptId?: string;
  onDraftChange: (text: string) => void;
  onSendDraft: () => void;
  onCancelDraft: () => void;
  onConfirmExecute: () => void;
  onOpenReceiptLink: (href: string) => void;
}) {
  if (action.kind === 'denied') {
    return (
      <div className="ai-action ai-action--denied">
        <ProhibitInset size={18} weight="duotone" />
        <p>Yêu cầu bị từ chối — không có dữ liệu nào được truy xuất.</p>
      </div>
    );
  }

  if (action.kind === 'draft') {
    if (sent) {
      return (
        <div className="receipt ai-receipt">
          <CheckCircle size={18} weight="duotone" />
          <p>{formatReceipt(action.receipt, receiptId)}</p>
        </div>
      );
    }
    return (
      <div className="ai-action ai-action--draft">
        <textarea
          className="ai-draft-textarea"
          value={draftText ?? ''}
          onChange={(event) => onDraftChange(event.target.value)}
          rows={4}
          aria-label="Soạn nội dung tin nhắc"
        />
        <div className="ai-action-buttons">
          <Button variant="primary" onClick={onSendDraft}>{action.confirmLabel}</Button>
          <Button variant="borderless" onClick={onCancelDraft}>Hủy</Button>
        </div>
      </div>
    );
  }

  // action.kind === 'execute'
  if (already) {
    return <p className="ai-action-note">Bạn đã đăng ký rồi.</p>;
  }
  if (sent) {
    return (
      <div className="receipt ai-receipt">
        <CheckCircle size={18} weight="duotone" />
        <p>{formatReceipt(action.receipt, receiptId)}</p>
        <button
          type="button"
          className="text-link"
          onClick={() => onOpenReceiptLink(`/events/${action.targetEventId}`)}
        >
          Xem trong Sự kiện
        </button>
      </div>
    );
  }
  return (
    <div className="ai-action ai-action--execute">
      <Button variant="primary" onClick={onConfirmExecute}>{action.confirmLabel}</Button>
    </div>
  );
}
