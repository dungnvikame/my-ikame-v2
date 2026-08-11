import { ArrowRight, CalendarCheck, CheckCircle, Clock, Newspaper, ShieldWarning } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { EventCard, NewsCard, QuickAction } from '../components/ContentCards';
import { Button, SectionHeader, StatusPill } from '../components/UI';

export function HomePage() {
  const { user, news, events } = useAppState();
  const mandatory = news.find((post) => post.mandatory && !post.acknowledged);
  const upcoming = events.slice(0, 2);

  return (
    <div className="page overview-page">
      <header className="context-header">
        <div>
          <p className="eyebrow">THỨ BA · 11 THÁNG 8</p>
          <h1>Chào buổi sáng, {user.shortName}</h1>
          <p>Bạn có {mandatory ? '2 việc' : '1 việc'} cần chú ý và một sự kiện sắp diễn ra.</p>
        </div>
        <div className="day-signal"><span className="signal-dot" />Mọi hệ thống hoạt động bình thường</div>
      </header>

      {mandatory ? (
        <section className="priority-hero" aria-labelledby="priority-title">
          <div className="priority-icon"><ShieldWarning size={28} weight="duotone" /></div>
          <div className="priority-copy">
            <div className="card-badges"><StatusPill tone="error">Cần xác nhận</StatusPill><StatusPill>{mandatory.dueLabel}</StatusPill></div>
            <h2 id="priority-title">{mandatory.title}</h2>
            <p>{mandatory.summary}</p>
            <span className="reason-text">Hiển thị vì đây là thông báo bắt buộc dành cho toàn bộ iKamer.</span>
          </div>
          <Link className="button button--primary" to={`/news/${mandatory.id}`}>Đọc và xác nhận<ArrowRight size={17} /></Link>
        </section>
      ) : (
        <section className="priority-complete">
          <CheckCircle size={24} weight="duotone" />
          <div><strong>Bạn đã xử lý hết việc bắt buộc</strong><span>My iKame sẽ đưa việc mới lên đây khi cần.</span></div>
        </section>
      )}

      <div className="home-grid">
        <section className="home-main">
          <SectionHeader title="Việc của tôi" meta="Ưu tiên theo thời hạn và mức độ liên quan" />
          <div className="active-items">
            <article className="active-item">
              <span className="active-item-icon active-item-icon--time"><Clock size={20} /></span>
              <div><strong>iConnect tháng 8 diễn ra sau 9 ngày</strong><span>Bạn đã đăng ký · 15:30 ngày 20/08</span></div>
              <Link className="text-link" to="/events/iconnect-2026-08">Xem sự kiện<ArrowRight size={16} /></Link>
            </article>
            <article className="active-item">
              <span className="active-item-icon"><Newspaper size={20} /></span>
              <div><strong>1 bài viết mới dành cho team của bạn</strong><span>Product Sharing · 5 phút đọc</span></div>
              <Link className="text-link" to="/news/product-sharing">Đọc bài<ArrowRight size={16} /></Link>
            </article>
          </div>

          <section className="section-block">
            <SectionHeader title="Tin dành cho bạn" meta="Chính thức và phù hợp với vai trò của bạn" href="/news" />
            <div className="news-grid">
              {news.filter((post) => !post.mandatory).slice(0, 3).map((post, index) => <NewsCard key={post.id} post={post} compact={index > 0} />)}
            </div>
          </section>
        </section>

        <aside className="home-rail">
          <section>
            <SectionHeader title="Thao tác nhanh" />
            <div className="quick-actions">
              <QuickAction icon="event" label="Sự kiện đã đăng ký" note="1 sự kiện sắp tới" />
              <QuickAction icon="news" label="Bài đã lưu" note="3 nội dung" />
              <QuickAction icon="team" label="Danh bạ iKame" note="Tìm đồng nghiệp" />
            </div>
          </section>
          <section className="section-block">
            <SectionHeader title="Sự kiện sắp tới" href="/events" />
            <div className="rail-stack">
              {upcoming.map((event) => <EventCard key={event.id} event={event} compact />)}
            </div>
          </section>
          <section className="calm-note">
            <CalendarCheck size={22} weight="duotone" />
            <div><strong>Lịch của bạn đang gọn</strong><span>Không có sự kiện nào trùng thời gian.</span></div>
          </section>
        </aside>
      </div>
    </div>
  );
}

