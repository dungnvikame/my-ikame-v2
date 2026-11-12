import { LockKeyIcon as LockKey } from '@coreds/react/icons';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/UI';

export function ForbiddenPage() {
  return (
    <div className="page not-found-page">
      <div className="empty-state">
        <LockKey size={48} variant="duotone" />
        <h1>Bạn không có quyền truy cập</h1>
        <p>Nội dung này chỉ hiển thị cho một số đơn vị cụ thể. Liên hệ quản lý trực tiếp nếu bạn cần được cấp quyền.</p>
        <ButtonLink variant="primary" to="/home">Về Trang chủ</ButtonLink>
      </div>
    </div>
  );
}
