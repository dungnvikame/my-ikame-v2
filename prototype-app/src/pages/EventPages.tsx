import { ArrowLeft, CalendarPlus, CheckCircle, Clock, MapPin, Users, WarningCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { EventCard } from '../components/ContentCards';
import { Button, SectionHeader, StatusPill } from '../components/UI';

type EventTab = 'upcoming' | 'registered' | 'past';

export function EventsPage() {
  const { events } = useAppState();
  const [tab, setTab] = useState<EventTab>('upcoming');
  const filtered = events.filter((event) => tab === 'registered' ? event.registered : tab === 'past' ? event.status === 'past' : event.status !== 'past');

  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div><p className="eyebrow">CẦN THAM GIA</p><h1>Sự kiện</h1><p>Khám phá hoạt động phù hợp và quản lý lịch tham gia của bạn.</p></div>
      </header>
      <div className="collection-toolbar">
        <div className="neutral-tabs" role="tablist" aria-label="Lọc sự kiện">
          <button role="tab" aria-selected={tab === 'upcoming'} className={tab === 'upcoming' ? 'is-active' : ''} onClick={() => setTab('upcoming')}>Sắp tới</button>
          <button role="tab" aria-selected={tab === 'registered'} className={tab === 'registered' ? 'is-active' : ''} onClick={() => setTab('registered')}>Đã đăng ký</button>
          <button role="tab" aria-selected={tab === 'past'} className={tab === 'past' ? 'is-active' : ''} onClick={() => setTab('past')}>Đã qua</button>
        </div>
        <span className="timezone-note"><Clock size={16} />Múi giờ Asia/Ho_Chi_Minh</span>
      </div>

      {filtered.length ? (
        <section>
          <SectionHeader title={tab === 'registered' ? 'Lịch của bạn' : 'Sự kiện phù hợp với bạn'} meta={`${filtered.length} sự kiện`} />
          <div className="event-collection">{filtered.map((event) => <EventCard key={event.id} event={event} />)}</div>
        </section>
      ) : (
        <div className="empty-state"><CalendarPlus size={44} /><h2>Chưa có sự kiện trong mục này</h2><p>Sự kiện mới sẽ xuất hiện khi phù hợp với audience của bạn.</p><Button onClick={() => setTab('upcoming')}>Xem sự kiện sắp tới</Button></div>
      )}
    </div>
  );
}

export function EventDetailPage() {
  const { eventId } = useParams();
  const { events, toggleRegistration } = useAppState();
  const event = events.find((item) => item.id === eventId);
  const [receipt, setReceipt] = useState('');

  if (!event) return <Navigate to="/not-found" replace />;

  const canRegister = event.status !== 'full' && event.status !== 'cancelled';
  const handleRegistration = () => {
    toggleRegistration(event.id);
    setReceipt(event.registered ? 'Đã hủy đăng ký. Lịch của bạn đã được cập nhật.' : 'Đăng ký thành công. Bạn có thể thêm sự kiện vào lịch.');
  };

  return (
    <div className="page detail-page">
      <Link className="back-link" to="/events"><ArrowLeft size={17} />Quay lại Sự kiện</Link>
      <div className="event-detail-hero">
        <div className="event-detail-date"><span>{event.month}</span><strong>{event.day}</strong></div>
        <div className="event-detail-heading">
          <div className="card-badges">
            <StatusPill tone={event.registered ? 'success' : event.status === 'full' ? 'warning' : 'neutral'}>{event.registered ? 'Đã đăng ký' : event.status === 'full' ? 'Hết chỗ' : event.remaining ? `Còn ${event.remaining} chỗ` : 'Mở đăng ký'}</StatusPill>
            <StatusPill>{event.format}</StatusPill>
          </div>
          <h1>{event.title}</h1>
          <p>{event.summary}</p>
          <span>Được tổ chức bởi {event.organizer}</span>
        </div>
      </div>

      <div className="detail-layout">
        <article className="event-info-card">
          <section className="event-facts">
            <div><span className="fact-icon"><Clock size={20} /></span><span><small>Thời gian</small><strong>{event.dateLabel}</strong><p>{event.time} · Asia/Ho_Chi_Minh</p></span></div>
            <div><span className="fact-icon"><MapPin size={20} /></span><span><small>Địa điểm</small><strong>{event.location}</strong><p>Vui lòng có mặt trước 10 phút</p></span></div>
            <div><span className="fact-icon"><Users size={20} /></span><span><small>Đối tượng</small><strong>Toàn bộ iKamer</strong><p>Phù hợp với bạn theo audience sự kiện</p></span></div>
          </section>
          <section className="article-body">
            <h2>Về sự kiện</h2>
            <p>iConnect tháng 8 là không gian để các team gặp gỡ, cập nhật và cùng trải nghiệm những thay đổi mới trong cách làm việc tại iKame.</p>
            <h2>Chương trình</h2>
            <ul><li>15:30 · Check-in và kết nối</li><li>15:45 · Cập nhật từ các team</li><li>16:30 · Hoạt động L&D</li><li>17:10 · Ăn chiều và networking</li></ul>
          </section>
        </article>

        <aside className="action-rail">
          <div className={`rsvp-panel ${event.registered ? 'is-complete' : ''}`}>
            {event.registered ? <CheckCircle size={28} weight="duotone" /> : <CalendarPlus size={28} weight="duotone" />}
            <h2>{event.registered ? 'Bạn sẽ tham gia' : event.status === 'full' ? 'Sự kiện đã đủ chỗ' : 'Tham gia sự kiện'}</h2>
            <p>{event.registered ? 'My iKame sẽ nhắc bạn trước sự kiện một ngày.' : event.status === 'full' ? 'Bạn có thể quay lại sau nếu có chỗ trống.' : 'Đăng ký mất chưa đến một phút.'}</p>
            {canRegister && <Button variant={event.registered ? 'dim' : 'primary'} onClick={handleRegistration}>{event.registered ? 'Hủy đăng ký' : 'Đăng ký tham gia'}</Button>}
            {event.registered && <Button variant="borderless" icon={<CalendarPlus size={17} />}>Thêm vào lịch</Button>}
            {event.status === 'full' && <span className="capacity-warning"><WarningCircle size={16} />Waitlist chưa bật trong R0</span>}
            {receipt && <span className="receipt" role="status"><CheckCircle size={16} />{receipt}</span>}
          </div>
          <div className="side-info"><h2>Cần hỗ trợ?</h2><p>Liên hệ Team Communication nếu bạn cần hỗ trợ về địa điểm hoặc khả năng tiếp cận.</p></div>
        </aside>
      </div>
    </div>
  );
}
