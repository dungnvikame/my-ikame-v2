import { LockKey } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div className="page not-found-page">
      <div className="empty-state">
        <LockKey size={48} weight="duotone" />
        <h1>Bạn không có quyền truy cập</h1>
        <p>Nội dung này chỉ hiển thị cho một số đơn vị cụ thể. Liên hệ quản lý trực tiếp nếu bạn cần được cấp quyền.</p>
        <Link className="button button--primary" to="/home">Về Trang chủ</Link>
      </div>
    </div>
  );
}
