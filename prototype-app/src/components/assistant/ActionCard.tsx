import {
  CalendarPlusIcon as CalendarPlus, ChatCircleDotsIcon as ChatCircleDots, CheckCircleIcon as CheckCircle, CheckSquareIcon as CheckSquare,
  CopyIcon as Copy, DownloadSimpleIcon as DownloadSimple, FileTextIcon as FileText, ProhibitIcon as Prohibit,
} from '@coreds/react/icons';
import { Input, Select, Textarea } from '@coreds/react';
import { Link } from 'react-router-dom';
import { buildIcs, downloadIcs } from '../../lib/ics';
import type { ActionCard as ActionCardData, ActionKind, CardField } from '../../pages/assistant/assistant-actions';
import { Button } from '../UI';
import { useToast } from '../toast';
import { dateLabel } from '../requests/request-context';

/**
 * Thẻ xem trước hành động của Trợ lý. Trạng thái: xem trước → (sửa) → xác nhận → kết quả, hoặc huỷ.
 * Mọi thay đổi đi lên trang chủ thẻ qua `onChange` để lưu vào lịch sử hội thoại.
 */
type Props = {
  card: ActionCardData;
  disabled?: boolean;
  onChange: (next: Partial<ActionCardData>) => void;
  onConfirm: () => void;
};

const ICON: Record<ActionKind, typeof FileText> = { task: CheckSquare, meeting: CalendarPlus, request: FileText, slack: ChatCircleDots };
const KIND_LABEL: Record<ActionKind, string> = { task: 'Việc', meeting: 'Lịch họp', request: 'Đề xuất', slack: 'Tin Slack' };

/** Giá trị hiển thị ở chế độ xem trước (ngày dd/m/yyyy cho dễ đọc). */
const display = (field: CardField) => (field.type === 'date' && field.value ? dateLabel(field.value) : field.value);

function FieldInput({ field, onValue }: { field: CardField; onValue: (value: string) => void }) {
  if (field.type === 'select') {
    return <Select variant="fill" aria-label={field.label} options={(field.options ?? []).map((option) => ({ value: option, label: option }))} value={field.value} onValueChange={(value) => onValue(String(value))} />;
  }
  if (field.type === 'textarea') {
    return <Textarea variant="fill" rows={5} aria-label={field.label} value={field.value} onChange={(event) => onValue(event.target.value)} />;
  }
  return <Input variant="fill" type={field.type ?? 'text'} aria-label={field.label} value={field.value} onChange={(event) => onValue(event.target.value)} />;
}

export function ActionCard({ card, disabled, onChange, onConfirm }: Props) {
  const { showToast } = useToast();
  const Icon = ICON[card.kind];
  const editing = card.status === 'editing';
  const canConfirm = card.fields.every((field) => field.type === 'textarea' || field.value.trim());

  const setField = (id: string, value: string) => onChange({ fields: card.fields.map((field) => (field.id === id ? { ...field, value } : field)) });

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Đã sao chép tin nhắn');
    } catch {
      showToast('Không sao chép được — hãy bôi đen và sao chép thủ công');
    }
  };

  const saveIcs = () => {
    const ics = card.result?.ics;
    if (!ics) return;
    const startsAt = new Date(ics.startIso);
    const endsAt = new Date(ics.endIso);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) { showToast('Ngày giờ chưa hợp lệ để tạo file lịch'); return; }
    downloadIcs('cuoc-hop.ics', buildIcs({ uid: `assistant-${Date.now()}@my-ikame`, title: ics.title, startsAt, endsAt, location: ics.location }));
  };

  if (card.status === 'cancelled') {
    return (
      <div className="as-card is-cancelled">
        <p><Prohibit size={16} aria-hidden="true" />Đã huỷ — mình không thực hiện gì cả.</p>
        <Button size="s" variant="borderless" onClick={() => onChange({ status: 'preview' })}>Hoàn tác</Button>
      </div>
    );
  }

  if (card.status === 'done' && card.result) {
    const { result } = card;
    return (
      <div className="as-card is-done" role="status">
        <header className="as-card-head">
          <span className="as-card-icon as-card-icon--done" aria-hidden="true"><CheckCircle size={20} variant="fill" /></span>
          <div><strong>Hoàn tất · {KIND_LABEL[card.kind]}</strong><small>via MCP · {card.tool}</small></div>
          <span className="demo-badge">DEMO</span>
        </header>
        <p className="as-card-summary">{result.summary}</p>
        {result.copyText && <pre className="as-card-quote">{result.copyText}</pre>}
        <div className="as-card-actions">
          {result.copyText && <Button variant="primary" icon={<Copy size={16} />} onClick={() => copy(result.copyText ?? '')}>Sao chép tin nhắn</Button>}
          {result.ics && <Button variant="primary" icon={<DownloadSimple size={16} />} onClick={saveIcs}>Tải file lịch (.ics)</Button>}
          {result.link && <Link className="as-card-link" to={result.link.to}>{result.link.label}</Link>}
        </div>
      </div>
    );
  }

  return (
    <div className="as-card">
      <header className="as-card-head">
        <span className="as-card-icon" aria-hidden="true"><Icon size={20} variant="duotone" /></span>
        <div><strong>{card.title}</strong><small>{editing ? 'Đang chỉnh sửa' : 'Cần bạn xác nhận trước khi thực hiện'}</small></div>
        <span className="demo-badge">DEMO</span>
      </header>

      {editing ? (
        <div className="as-card-form">
          {card.fields.map((field) => (
            <label key={field.id} className={`as-card-field ${field.half ? 'is-half' : ''}`}>
              <span>{field.label}</span>
              <FieldInput field={field} onValue={(value) => setField(field.id, value)} />
            </label>
          ))}
        </div>
      ) : (
        <dl className="as-card-fields">
          {card.fields.map((field) => (
            <div key={field.id} className={field.type === 'textarea' ? 'is-wide' : ''}>
              <dt>{field.label}</dt>
              <dd className={field.type === 'textarea' ? 'is-multiline' : ''}>{display(field) || '—'}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="as-card-actions">
        {editing ? (
          <Button variant="primary" onClick={() => onChange({ status: 'preview' })}>Lưu chỉnh sửa</Button>
        ) : (
          <>
            <Button variant="primary" disabled={disabled || !canConfirm} onClick={onConfirm}>Xác nhận</Button>
            <Button onClick={() => onChange({ status: 'editing' })}>Sửa</Button>
            <Button variant="borderless" onClick={() => onChange({ status: 'cancelled' })}>Huỷ</Button>
          </>
        )}
      </div>
      {!editing && <p className="as-card-note">Bấm Xác nhận để: {card.confirmLabel.toLowerCase()}. Chưa bấm thì mình không làm gì.</p>}
    </div>
  );
}
