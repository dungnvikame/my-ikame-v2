import { CompassIcon as Compass } from '@coreds/react/icons';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/UI';

export function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <div className="empty-state"><Compass size={48} variant="duotone" /><h1>Không tìm thấy nội dung</h1><p>Nội dung có thể đã được di chuyển hoặc bạn không có quyền truy cập.</p><ButtonLink variant="primary" to="/">Về Trang chủ</ButtonLink></div>
    </div>
  );
}

