import { MagnifyingGlass, SlidersHorizontal, UserCircle } from '@phosphor-icons/react';
import { attentionItems } from '../data/mockData';
import { SectionHeader, StatusPill } from '../components/UI';

const team = [
  { name: 'Lan Nguyễn', role: 'Product Designer', status: 'Cần cập nhật mục tiêu', tone: 'error' as const, time: '09:20' },
  { name: 'Minh Trần', role: 'Frontend Developer', status: 'Cần cập nhật mục tiêu', tone: 'error' as const, time: '09:20' },
  { name: 'Hà Phạm', role: 'QA Engineer', status: 'Chưa phản hồi sự kiện', tone: 'warning' as const, time: '08:45' },
  { name: 'Tuấn Lê', role: 'Backend Developer', status: 'Đang ổn', tone: 'success' as const, time: 'Hôm qua' },
  { name: 'Ngọc Anh', role: 'Business Analyst', status: 'Đang ổn', tone: 'success' as const, time: 'Hôm qua' },
  { name: 'Gia Huy', role: 'Product Designer', status: 'Sắp gia nhập', tone: 'info' as const, time: '17/08' },
];

export function TeamPage() {
  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div><p className="eyebrow">MANAGER · TEAM PRODUCT</p><h1>Đội ngũ của tôi</h1><p>6 thành viên · {attentionItems.length} attention items</p></div>
      </header>
      <div className="filter-row">
        <label className="filter-input"><MagnifyingGlass size={17} /><input aria-label="Tìm thành viên" placeholder="Tìm thành viên" /></label>
        <button className="button button--dim"><SlidersHorizontal size={17} />Cần chú ý</button>
      </div>
      <section className="people-table" aria-label="Danh sách đội ngũ">
        <div className="people-table-header"><span>Thành viên</span><span>Trạng thái</span><span>Cập nhật</span><span /></div>
        {team.map((person) => (
          <article className="people-row" key={person.name}>
            <div className="person-cell"><span className="avatar"><UserCircle size={22} /></span><span><strong>{person.name}</strong><small>{person.role}</small></span></div>
            <StatusPill tone={person.tone}>{person.status}</StatusPill>
            <span className="muted-text">{person.time}</span>
            <button className="text-link">Xem</button>
          </article>
        ))}
      </section>
      <SectionHeader title="Nguyên tắc hiển thị" />
      <p className="inline-guidance">Prototype chỉ hiển thị direct reports. Dữ liệu ngoài management scope phải được lọc trước khi tới client.</p>
    </div>
  );
}
