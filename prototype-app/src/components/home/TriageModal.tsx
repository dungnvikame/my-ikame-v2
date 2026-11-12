import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Progress } from '@coreds/react';
import { ArrowSquareOutIcon as ArrowSquareOut, CheckCircleIcon as CheckCircle, ClockIcon as Clock } from '@coreds/react/icons';
import type { DigestItem } from '../../pages/assistant/daily-digest';
import { trackFlow } from '../../lib/metrics/metrics';
import { Button } from '../UI';
import { homeActions } from './home-store';
import { SnoozeMenu } from './SnoozeMenu';
import { actionLabel, metaOf, snoozeOptions, type SnoozeOption } from './task-utils';

/**
 * "Dọn việc": đi từng thẻ một. Làm ngay = mở việc (và đóng hộp thoại nếu là trang trong app),
 * Hoãn = chọn mốc, Bỏ qua = ẩn tới hết hôm nay. Danh sách được chụp lúc mở nên không nhảy khi xử lý.
 */
export function TriageModal({ items, onClose }: { items: DigestItem[]; onClose: () => void }) {
  const navigate = useNavigate();
  const [queue] = useState(items);
  const [index, setIndex] = useState(0);
  const total = queue.length;
  const item = queue[index];
  const finished = index >= total;
  const now = new Date();

  const next = () => setIndex((value) => value + 1);

  function doNow(task: DigestItem) {
    homeActions.markHandled(task.id);
    trackFlow('today', 'done');
    if (task.href) {
      window.open(task.href, '_blank', 'noopener,noreferrer');
      next();
    } else {
      onClose();
      navigate(task.to);
    }
  }

  function snooze(task: DigestItem, option: SnoozeOption) {
    homeActions.snooze(task.id, option.until, option.key === 'skip' ? 'skip' : 'snooze');
    next();
  }

  const skipOption = snoozeOptions(now).find((option) => option.key === 'skip');

  return (
    <Modal
      open
      onOpenChange={(open) => { if (!open) onClose(); }}
      size="sm"
      title={finished ? 'Đã dọn xong' : 'Dọn việc'}
      description={finished ? undefined : 'Xử lý từng việc một: làm ngay, hoãn hoặc bỏ qua.'}
      footer={finished ? <Button variant="primary" onClick={onClose}>Đóng</Button> : undefined}
    >
      {finished || !item ? (
        <div className="triage-done">
          <CheckCircle size={44} variant="duotone" aria-hidden="true" />
          <h3>Đã dọn xong {total} việc</h3>
          <p>Việc đã hoãn sẽ quay lại đúng giờ bạn chọn. Chúc bạn một ngày gọn gàng.</p>
        </div>
      ) : (
        <div className="triage">
          <div className="triage-progress">
            <span aria-live="polite">{index + 1}/{total}</span>
            <Progress value={(index / total) * 100} aria-label={`Đã xử lý ${index} trên ${total} việc`} />
          </div>
          <article className={`triage-card ${item.urgent ? 'is-urgent' : ''}`} data-source={item.source} aria-label={item.label}>
            <span className="triage-source">{item.source}{item.urgent && <em>Gấp</em>}</span>
            <strong>{item.label}</strong>
            <span className="triage-meta">{metaOf(item)}</span>
          </article>
          <div className="triage-actions">
            <Button variant="primary" onClick={() => doNow(item)}>
              {actionLabel(item)}{item.href && <ArrowSquareOut size={14} aria-hidden="true" />}
            </Button>
            <SnoozeMenu
              now={now}
              onPick={(option) => snooze(item, option)}
              trigger={<Button variant="dim" icon={<Clock size={16} aria-hidden="true" />}>Hoãn</Button>}
            />
            <Button variant="borderless" onClick={() => skipOption && snooze(item, skipOption)}>Bỏ qua</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
