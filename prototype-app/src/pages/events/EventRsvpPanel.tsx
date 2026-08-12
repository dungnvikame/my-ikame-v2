import { CalendarPlus, CheckCircle, Clock, HourglassMedium, WarningCircle, XCircle } from '@phosphor-icons/react';
import { Button } from '../../components/UI';
import type { EventItem, EventRegistration } from '../../types';

type RsvpPanelProps = {
  event: EventItem;
  confirmingCancel: boolean;
  onCancelStart: () => void;
  onCancelDismiss: () => void;
  onRsvp: (next: EventRegistration, message: string) => void;
  onAddToCalendar: () => void;
};

/** Renders the icon/heading/copy/CTA block for the RSVP state matrix — byte-for-byte unchanged from v1. */
export function EventRsvpPanel({ event, confirmingCancel, onCancelStart, onCancelDismiss, onRsvp, onAddToCalendar }: RsvpPanelProps) {
  const { myRegistration, status } = event;
  if (status === 'cancelled') return <><XCircle size={28} weight="duotone" /><h2>Sự kiện đã bị hủy</h2><p>Vui lòng theo dõi thông báo mới từ ban tổ chức.</p></>;
  if (status === 'past') return myRegistration === 'going'
    ? <><CheckCircle size={28} weight="duotone" /><h2>Đã tham gia</h2><p>Cảm ơn bạn đã tham gia sự kiện này.</p></>
    : <><Clock size={28} weight="duotone" /><h2 className="muted-text">Đã kết thúc</h2><p>Sự kiện đã kết thúc và không còn nhận đăng ký.</p></>;
  if (myRegistration === 'going') return (
    <>
      <CheckCircle size={28} weight="duotone" /><h2>Bạn sẽ tham gia</h2><p>My iKame sẽ nhắc bạn trước sự kiện một ngày.</p>
      {confirmingCancel ? (
        <>
          <p>Bạn có chắc muốn hủy đăng ký?</p>
          <Button variant="danger" onClick={() => onRsvp('not_registered', 'Đã hủy đăng ký. Lịch của bạn đã được cập nhật.')}>Xác nhận hủy</Button>
          <Button variant="borderless" onClick={onCancelDismiss}>Không, giữ đăng ký</Button>
        </>
      ) : (
        <>
          <Button variant="dim" onClick={onCancelStart}>Hủy đăng ký</Button>
          <Button variant="borderless" icon={<CalendarPlus size={17} />} onClick={onAddToCalendar}>Thêm vào lịch</Button>
        </>
      )}
    </>
  );
  if (myRegistration === 'waitlisted') return (
    <>
      <HourglassMedium size={28} weight="duotone" /><h2>Bạn đang ở danh sách chờ</h2><p>Vị trí sẽ được thông báo khi có chỗ trống.</p>
      <Button variant="dim" onClick={() => onRsvp('not_registered', 'Đã rời danh sách chờ.')}>Rời danh sách chờ</Button>
    </>
  );
  if (status === 'full') return (
    <>
      <WarningCircle size={28} weight="duotone" /><h2>Sự kiện đã đủ chỗ</h2>
      <p>{event.waitlistEnabled ? 'Bạn có thể vào danh sách chờ để được thông báo khi có chỗ trống.' : 'Vui lòng quay lại sau nếu có chỗ trống.'}</p>
      {event.waitlistEnabled
        ? <Button variant="primary" onClick={() => onRsvp('waitlisted', 'Đã vào danh sách chờ.')}>Vào danh sách chờ</Button>
        : <Button variant="primary" disabled>Đăng ký tham gia</Button>}
    </>
  );
  return <><CalendarPlus size={28} weight="duotone" /><h2>Tham gia sự kiện</h2><p>Đăng ký mất chưa đến một phút.</p><Button variant="primary" onClick={() => onRsvp('going', 'Đăng ký thành công. Bạn có thể thêm sự kiện vào lịch.')}>Đăng ký tham gia</Button></>;
}
