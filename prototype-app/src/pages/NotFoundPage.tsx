import { Compass } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <div className="empty-state"><Compass size={48} weight="duotone" /><h1>Không tìm thấy nội dung</h1><p>Nội dung có thể đã được di chuyển hoặc bạn không có quyền truy cập.</p><Link className="button button--primary" to="/">Về Trang chủ</Link></div>
    </div>
  );
}

