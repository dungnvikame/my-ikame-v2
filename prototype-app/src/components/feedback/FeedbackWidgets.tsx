import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal, SegmentedControl, Textarea } from '@coreds/react';
import { ChatTextIcon as ChatText, XIcon as X } from '@coreds/react/icons';
import { useAppState } from '../../AppState';
import {
  addFeedback, FEEDBACK_KIND_LABEL, FLOWS, pendingEaseFlow, rateEase, subscribeMetrics, trackOpen,
  type FeedbackKind, type FlowId,
} from '../../lib/metrics/metrics';
import { useToast } from '../toast';
import { Button, ChipButton, IconButton } from '../UI';

const KINDS: FeedbackKind[] = ['idea', 'hard', 'bug'];
const EASE_SCORES = [1, 2, 3, 4, 5];

/**
 * Nút Góp ý nổi ở mọi trang + câu hỏi "có dễ không" sau khi làm xong một luồng.
 * Cũng là nơi ghi nhận "hôm nay có mở app" vì component này có mặt trên mọi trang.
 */
export function FeedbackWidgets() {
  const { perspective } = useAppState();
  const location = useLocation();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>('idea');
  const [text, setText] = useState('');
  // Luồng vừa làm xong đang chờ hỏi mức dễ dùng (đổi khi lớp đo phát tín hiệu).
  const easeFlow = useSyncExternalStore<FlowId | undefined>(subscribeMetrics, pendingEaseFlow);

  useEffect(() => { trackOpen(); }, []);

  const send = () => {
    addFeedback(kind, text, location.pathname, perspective);
    setText('');
    setOpen(false);
    showToast('Đã ghi nhận góp ý. Cảm ơn bạn.');
  };

  return (
    <>
      {easeFlow && (
        <aside className="ease-prompt" role="group" aria-label="Đánh giá mức dễ dùng">
          <div className="ease-prompt-head">
            <strong>"{FLOWS[easeFlow]}" vừa rồi có dễ không?</strong>
            <IconButton label="Bỏ qua câu hỏi" onClick={() => rateEase(easeFlow, null)}><X size={16} /></IconButton>
          </div>
          <div className="ease-prompt-scale">
            <span>Rất khó</span>
            {EASE_SCORES.map((score) => (
              <ChipButton key={score} aria-label={`${score} trên 5`} onClick={() => { rateEase(easeFlow, score); showToast('Đã ghi nhận. Cảm ơn bạn.'); }}>
                {score}
              </ChipButton>
            ))}
            <span>Rất dễ</span>
          </div>
        </aside>
      )}

      <div className="feedback-fab">
        <Button variant="dim" size="m" icon={<ChatText size={16} />} onClick={() => setOpen(true)}>Góp ý</Button>
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        size="sm"
        title="Góp ý cho My iKame"
        description="Góp ý kèm tên trang bạn đang xem, không kèm tên bạn."
        footer={(
          <>
            <Button variant="borderless" onClick={() => setOpen(false)}>Huỷ</Button>
            <Button variant="primary" disabled={!text.trim()} onClick={send}>Gửi góp ý</Button>
          </>
        )}
      >
        <div className="feedback-form">
          <SegmentedControl
            aria-label="Loại góp ý"
            size="s"
            options={KINDS.map((item) => ({ value: item, label: FEEDBACK_KIND_LABEL[item] }))}
            value={kind}
            onValueChange={(value) => setKind(value as FeedbackKind)}
          />
          <Textarea
            variant="fill"
            minRows={4}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Điều gì khiến bạn vướng, hoặc bạn muốn có thêm gì?"
            aria-label="Nội dung góp ý"
          />
        </div>
      </Modal>
    </>
  );
}
