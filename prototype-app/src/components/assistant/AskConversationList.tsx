import { AiMessage } from './AiMessage';
import { AiActionBlock } from './AiActionBlock';
import type { Turn } from './use-ask-conversation';

/** Renders the turn history (question echo + AI response + optional action block). */
export function AskConversationList({
  conversation,
  onRevealed,
  onOpenLink,
  onDraftChange,
  onSendDraft,
  onCancelDraft,
  onConfirmExecute,
}: {
  conversation: Turn[];
  onRevealed: (turnId: string) => void;
  onOpenLink: (href: string) => void;
  onDraftChange: (turnId: string, text: string) => void;
  onSendDraft: (turnId: string) => void;
  onCancelDraft: (turnId: string) => void;
  onConfirmExecute: (turnId: string, targetEventId: string) => void;
}) {
  if (conversation.length === 0) {
    return <p className="ask-panel-empty">Chọn một câu hỏi gợi ý bên dưới để bắt đầu.</p>;
  }

  return (
    <>
      {conversation.map((turn) => {
        const { action } = turn.script;
        return (
          <div key={turn.id} className="ai-turn">
            <p className="ai-turn-question">{turn.script.chip}</p>
            <AiMessage
              script={turn.script}
              ctx={turn.ctx}
              revealed={turn.revealed}
              onRevealed={() => onRevealed(turn.id)}
              onOpenCitation={onOpenLink}
            />
            {action && (
              <AiActionBlock
                action={action}
                draftText={turn.draftText}
                sent={turn.sent}
                already={turn.already}
                receiptId={turn.receiptId}
                onDraftChange={(text) => onDraftChange(turn.id, text)}
                onSendDraft={() => onSendDraft(turn.id)}
                onCancelDraft={() => onCancelDraft(turn.id)}
                onConfirmExecute={() => onConfirmExecute(turn.id, action.kind === 'execute' ? action.targetEventId : '')}
                onOpenReceiptLink={onOpenLink}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
