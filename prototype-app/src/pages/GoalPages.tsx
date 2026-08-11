import { ArrowLeft, Target } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button, EmptyState } from '../components/UI';

export function GoalsPage() {
  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div>
          <h1>Mục tiêu</h1>
          <p>Mục tiêu sẽ giúp bạn theo dõi trạng thái, tiến độ và chu kỳ mục tiêu của mình ngay trong My iKame, với check-in nhanh. Việc cấu hình và phê duyệt mục tiêu vẫn tiếp tục thực hiện trên iGoal.</p>
        </div>
      </header>

      <div className="manager-resource">
        <p className="eyebrow">SẮP CÓ Ở R3</p>
        <h3>Khi hoàn thiện, bạn sẽ có thể</h3>
        <p>Xem mục tiêu theo 4 trạng thái:</p>
        <ul>
          <li>Cần cập nhật</li>
          <li>Đang đúng tiến độ</li>
          <li>Có rủi ro</li>
          <li>Hoàn thành</li>
        </ul>
        <ul>
          <li>Xem tiến độ, chu kỳ, lần check-in gần nhất và hạn kế tiếp.</li>
          <li>Check-in nhanh ngay trong My iKame.</li>
          <li>Mở sâu sang iGoal để cấu hình hoặc phê duyệt mục tiêu.</li>
        </ul>
        <Button disabled icon={<Target size={18} />}>Cập nhật tiến độ (sắp có ở R3)</Button>
      </div>
    </div>
  );
}

export function GoalDetailPage() {
  return (
    <div className="page detail-page">
      <Link className="back-link" to="/goals"><ArrowLeft size={17} />Quay lại Mục tiêu</Link>
      <EmptyState
        title="Chi tiết mục tiêu sẽ hiển thị ở đây khi R3 ra mắt"
        body="Trang chi tiết mục tiêu chưa khả dụng ở bản R0."
      />
    </div>
  );
}
