import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button, EmptyState } from '../components/UI';

export function KnowledgePage() {
  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div>
          <h1>Tri thức</h1>
          <p>Tri thức sẽ giúp bạn tìm kiếm, xem trước và đọc nhanh tài liệu từ iWiki ngay trong My iKame, đúng theo quyền truy cập của bạn. Việc soạn, sửa và duyệt tài liệu vẫn tiếp tục thực hiện trên iWiki.</p>
        </div>
      </header>

      <div className="manager-resource">
        <p className="eyebrow">SẮP CÓ Ở R2</p>
        <h3>Khi hoàn thiện, bạn sẽ có thể</h3>
        <ul>
          <li>Tìm kiếm và lọc tài liệu theo đúng quyền truy cập của bạn.</li>
          <li>Xem trước và đọc nhanh tài liệu ngay trong My iKame.</li>
          <li>Mở sâu sang iWiki để soạn, sửa hoặc duyệt tài liệu.</li>
        </ul>
        <Button disabled icon={<MagnifyingGlass size={18} />}>Tìm kiếm tri thức (sắp có ở R2)</Button>
      </div>
    </div>
  );
}

export function KnowledgeDetailPage() {
  return (
    <div className="page detail-page">
      <Link className="back-link" to="/knowledge"><ArrowLeft size={17} />Quay lại Tri thức</Link>
      <EmptyState
        title="Tài liệu tri thức sẽ hiển thị ở đây khi R2 ra mắt"
        body="Trang chi tiết tài liệu chưa khả dụng ở bản R0."
      />
    </div>
  );
}
