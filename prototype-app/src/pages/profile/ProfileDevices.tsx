import { useState } from 'react';
import { Field, Modal, Progress, Select, Steps, Textarea } from '@coreds/react';
import { LaptopIcon as Laptop, WarningCircleIcon as WarningCircle } from '@coreds/react/icons';
import { Button, EmptyState, SectionHeader, StatusPill } from '../../components/UI';
import { useToast } from '../../components/toast';
import { DEMO_TODAY, TICKET_STEPS, deviceExtras, seedTickets, type ItTicket } from '../../data/profile-extras';
import type { Equipment } from '../../types';
import { daysBetween, diffYmd, formatMy, parseVnDate } from './profile-utils';
import { useStoredState } from './useStoredState';

export type DeviceView = { id: string; name: string; meta: string; assignedAt?: Date; warrantyEnd?: Date; health?: number };

/** "03/2027" → cuối tháng 03/2027. */
function parseMonthYear(label: string | undefined): Date | undefined {
  const match = label?.match(/^(\d{1,2})\/(\d{4})$/);
  return match ? new Date(Number(match[2]), Number(match[1]), 0) : undefined;
}

export function equipmentToView(item: Equipment): DeviceView {
  const assignedAt = parseVnDate(item.assignedAt);
  const extra = deviceExtras[item.id];
  // Thiết bị chưa có thông tin bảo hành riêng: mặc định 36 tháng kể từ ngày cấp.
  const warrantyEnd = parseMonthYear(extra?.warrantyEnd)
    ?? (assignedAt ? new Date(assignedAt.getFullYear(), assignedAt.getMonth() + 36, assignedAt.getDate()) : undefined);
  return { id: item.id, name: item.name, meta: `${item.model} · ${item.serial}`, assignedAt, warrantyEnd, health: extra?.health ?? 90 };
}

function ageLabel(from: Date): string {
  const { years, months, days } = diffYmd(from, DEMO_TODAY);
  const parts = [years > 0 && `${years} năm`, months > 0 && `${months} tháng`].filter(Boolean);
  return `Đã dùng ${parts.length ? parts.join(' ') : `${days} ngày`}`;
}

function DeviceCard({ device }: { device: DeviceView }) {
  const { assignedAt, warrantyEnd, health } = device;
  let warranty: { remainingPercent: number; text: string; expired: boolean } | undefined;
  if (assignedAt && warrantyEnd) {
    const total = Math.max(1, daysBetween(assignedAt, warrantyEnd));
    const left = daysBetween(DEMO_TODAY, warrantyEnd);
    const remainingPercent = Math.max(0, Math.min(100, Math.round((left / total) * 100)));
    const rest = diffYmd(DEMO_TODAY, warrantyEnd);
    warranty = left <= 0
      ? { remainingPercent: 0, text: `Đã hết bảo hành ${formatMy(warrantyEnd)}`, expired: true }
      : { remainingPercent, text: `Hết bảo hành ${formatMy(warrantyEnd)} · còn ${rest.years > 0 ? `${rest.years} năm ` : ''}${rest.months} tháng`, expired: false };
  }
  const healthTone = health === undefined ? undefined : health >= 85 ? 'success' : health >= 70 ? 'info' : 'warning';

  return (
    <article className="pp-card pp-device">
      <header>
        <span className="pp-device-icon" aria-hidden="true"><Laptop size={20} /></span>
        <div>
          <h3>{device.name}</h3>
          <small>{device.meta}</small>
        </div>
        {healthTone && health !== undefined && <StatusPill tone={healthTone}>Tình trạng {health}/100</StatusPill>}
      </header>
      <p className="pp-device-age">{assignedAt ? ageLabel(assignedAt) : 'Chưa có ngày cấp'}</p>
      {warranty ? (
        <div className="pp-warranty">
          <Progress size="sm" value={warranty.remainingPercent} aria-label={`Thời hạn bảo hành còn ${warranty.remainingPercent}%`} />
          <small className={warranty.expired ? 'is-expired' : undefined}>{warranty.text}</small>
        </div>
      ) : <small className="pp-muted">Chưa có dữ liệu bảo hành</small>}
    </article>
  );
}

export function DeviceCards({ devices }: { devices: DeviceView[] }) {
  return (
    <section className="pp-card pp-section" aria-label="Thiết bị được cấp">
      <SectionHeader title="Thiết bị được cấp" meta={`${devices.length} thiết bị`} />
      {devices.length === 0
        ? <EmptyState icon={<Laptop size={44} variant="duotone" />} title="Chưa được cấp thiết bị" body="Thiết bị IT cấp cho bạn sẽ hiện ở đây." />
        : <div className="pp-devices">{devices.map((device) => <DeviceCard key={device.id} device={device} />)}</div>}
    </section>
  );
}

function nowLabel(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function TicketCard({ ticket }: { ticket: ItTicket }) {
  const reached = TICKET_STEPS.filter((step) => ticket.times[step.key]).length;
  const complete = Boolean(ticket.times.done);
  return (
    <article className="pp-card pp-ticket">
      <header>
        <div>
          <small>{ticket.id} · {ticket.device}</small>
          <h3>{ticket.title}</h3>
        </div>
        <StatusPill tone={complete ? 'success' : 'info'}>{complete ? 'Hoàn tất' : TICKET_STEPS[Math.max(0, reached - 1)].label}</StatusPill>
      </header>
      <Steps
        orientation="vertical"
        variant="dot"
        currentStep={complete ? TICKET_STEPS.length : Math.max(0, reached - 1)}
        steps={TICKET_STEPS.map((step) => ({
          content: (
            <div className="pp-step">
              <strong>{step.label}</strong>
              <small>
                {ticket.times[step.key]
                  ? `${ticket.times[step.key]}${step.key !== 'sent' && ticket.assignee ? ` · ${ticket.assignee}` : ''}`
                  : 'Chưa tới bước này'}
              </small>
            </div>
          ),
        }))}
      />
    </article>
  );
}

/** Theo dõi ticket IT như theo dõi đơn hàng; "Báo sự cố" tạo thêm ticket mới (lưu trên trình duyệt). */
export function ItTickets({ personId, deviceNames }: { personId: string; deviceNames: string[] }) {
  const { showToast } = useToast();
  const [mine, setMine] = useStoredState<ItTicket[]>(`ikame.profile.tickets.${personId}`, []);
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState('');
  const [text, setText] = useState('');
  // Ticket mẫu chỉ thuộc nhân vật An.
  const tickets = [...mine, ...(personId === 'person_an' ? seedTickets : [])];

  const submit = () => {
    const title = text.trim();
    if (!title) return;
    const ticket: ItTicket = {
      id: `IT-${String(DEMO_TODAY.getFullYear()).slice(2)}${String(DEMO_TODAY.getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-4)}`,
      title, device: device || deviceNames[0] || 'Thiết bị khác', times: { sent: nowLabel() },
    };
    setMine([ticket, ...mine]);
    setOpen(false);
    setText('');
    showToast('Đã gửi báo sự cố tới IT. Bạn sẽ thấy tiến độ ngay tại đây.');
  };

  return (
    <section className="pp-card pp-section" aria-label="Sự cố IT">
      <SectionHeader title="Theo dõi sự cố IT" meta={`${tickets.length} ticket`} />
      <div className="pp-section-actions">
        <Button variant="primary" size="m" icon={<WarningCircle size={18} />} onClick={() => setOpen(true)}>Báo sự cố</Button>
      </div>
      {tickets.length === 0
        ? <EmptyState icon={<WarningCircle size={44} variant="duotone" />} title="Chưa có sự cố nào" body="Khi báo sự cố, bạn theo dõi từng bước xử lý tại đây." />
        : <div className="pp-tickets">{tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}</div>}
      <Modal
        open={open}
        onOpenChange={setOpen}
        size="sm"
        title="Báo sự cố thiết bị"
        description="IT sẽ tiếp nhận và cập nhật tiến độ ngay trên trang này."
        footer={(
          <>
            <Button variant="borderless" onClick={() => setOpen(false)}>Huỷ</Button>
            <Button variant="primary" disabled={!text.trim()} onClick={submit}>Gửi báo sự cố</Button>
          </>
        )}
      >
        <div className="pp-form">
          {deviceNames.length > 0 && (
            <Field label="Thiết bị gặp sự cố">
              <Select options={deviceNames.map((name) => ({ value: name, label: name }))} value={device || deviceNames[0]} onValueChange={(v) => setDevice(String(v))} size="m" />
            </Field>
          )}
          <Field label="Mô tả sự cố">
            <Textarea variant="fill" minRows={4} value={text} onChange={(event) => setText(event.target.value)} placeholder="Ví dụ: màn hình chớp tắt khi mở ứng dụng Figma" aria-label="Mô tả sự cố" />
          </Field>
        </div>
      </Modal>
    </section>
  );
}
