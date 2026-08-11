import { ArrowRight, CalendarDots, CheckCircle, TrendUp, UsersThree } from '@phosphor-icons/react';
import { attentionItems } from '../data/mockData';
import { AttentionCard } from '../components/ContentCards';
import { SectionHeader, StatusPill } from '../components/UI';
import { useAppState } from '../AppState';

export function ManagerPage() {
  const { user } = useAppState();

  return (
    <div className="page overview-page">
      <header className="context-header">
        <div>
          <p className="eyebrow">GÓC NHÌN MANAGER</p>
          <h1>Chào {user.shortName}, team đang có 3 việc cần chú ý</h1>
          <p>Product & Technology · 6 thành viên · Dữ liệu cập nhật 09:20</p>
        </div>
        <button className="scope-selector"><UsersThree size={18} />Team Product<ArrowRight size={15} /></button>
      </header>

      <section className="manager-attention">
        <SectionHeader title="Cần bạn chú ý" meta="Required trước optional · Quá hạn trước sắp đến hạn" actionLabel="Xem toàn bộ" href="/manager/team" />
        <div className="attention-list">
          {attentionItems.map((item, index) => <AttentionCard key={item.id} item={item} primary={index === 0} />)}
        </div>
      </section>

      <div className="manager-grid">
        <section className="team-snapshot">
          <SectionHeader title="Ảnh chụp nhanh của team" meta="Mỗi số liệu đều có ngữ cảnh và đường đi tiếp theo" />
          <div className="metric-grid">
            <article className="metric-card">
              <span className="metric-icon"><CheckCircle size={22} weight="duotone" /></span>
              <strong>4/6</strong>
              <h3>Đã hoàn tất check-in tuần</h3>
              <p>2 thành viên còn lại nằm trong attention queue.</p>
              <button className="text-link">Xem trạng thái<ArrowRight size={15} /></button>
            </article>
            <article className="metric-card">
              <span className="metric-icon"><CalendarDots size={22} weight="duotone" /></span>
              <strong>3</strong>
              <h3>Sự kiện team quan tâm</h3>
              <p>iConnect có tỷ lệ phản hồi thấp nhất.</p>
              <button className="text-link">Xem sự kiện<ArrowRight size={15} /></button>
            </article>
            <article className="metric-card">
              <span className="metric-icon"><TrendUp size={22} weight="duotone" /></span>
              <strong>92%</strong>
              <h3>Thông báo đã được đọc</h3>
              <p>Cao hơn tuần trước 6 điểm phần trăm.</p>
              <button className="text-link">Xem chi tiết<ArrowRight size={15} /></button>
            </article>
          </div>
        </section>

        <aside className="team-moments">
          <SectionHeader title="Khoảnh khắc của team" />
          <article className="moment-card">
            <span className="avatar avatar--large">H</span>
            <div><StatusPill tone="info">THÀNH VIÊN MỚI</StatusPill><h3>Phạm Gia Huy</h3><p>Bắt đầu ngày 17/08 · Product Designer</p></div>
          </article>
          <article className="manager-resource">
            <p className="eyebrow">GỢI Ý CHO MANAGER</p>
            <h3>Checklist giúp thành viên mới hòa nhập trong 30 ngày đầu</h3>
            <button className="text-link">Mở tài liệu<ArrowRight size={15} /></button>
          </article>
        </aside>
      </div>
    </div>
  );
}

