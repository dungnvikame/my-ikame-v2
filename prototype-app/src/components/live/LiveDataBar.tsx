import { Database, PlugsConnected, WarningCircle } from '@phosphor-icons/react';
import { LIVE_SOURCES, useLive, type LiveErrorKind, type LiveSourceId } from '../../lib/live/live-data';
import { Button } from '../UI';

const PAGE_ERROR_COPY: Record<LiveErrorKind, string> = {
  not_connected: 'Tài khoản Claude của bạn chưa có các connector iKame. Thêm trong claude.ai › Settings › Connectors rồi thử lại.',
  needs_reauth: 'Phiên đăng nhập công cụ đã hết hạn. Kết nối lại trong claude.ai › Settings › Connectors.',
  denied: 'Bạn chưa cho phép trang này đọc công cụ. Trang tiếp tục dùng dữ liệu mẫu.',
  unavailable: 'Chế độ xem này không gọi được công cụ. Mở trang trong claude.ai để dùng dữ liệu thật.',
  other: 'Các công cụ chưa phản hồi. Thử lại sau ít phút.',
};

const SOURCE_ERROR_COPY: Record<LiveErrorKind, string> = {
  not_connected: 'chưa thêm connector',
  needs_reauth: 'cần đăng nhập lại',
  denied: 'chưa được cho phép',
  unavailable: 'không dùng được ở chế độ xem này',
  other: 'chưa phản hồi',
};

/**
 * Thanh chuyển dữ liệu mẫu ↔ dữ liệu thật trên Trang chủ. Chỉ hiện ở bản artifact; bản web
 * (Vercel) không có connector nên không render gì.
 */
export function LiveDataBar() {
  const { status, data, errorKind, connect, disconnect } = useLive();
  if (status === 'unavailable') return null;

  if (data) {
    const time = data.loadedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const ids = Object.keys(LIVE_SOURCES) as LiveSourceId[];
    const ok = ids.filter((id) => !data.errors[id]).map((id) => LIVE_SOURCES[id].label);
    const failed = ids.filter((id) => data.errors[id]);
    return (
      <section className="live-bar live-bar--on" aria-label="Nguồn dữ liệu">
        <PlugsConnected size={20} weight="duotone" aria-hidden="true" />
        <div className="live-bar-copy">
          <strong>Dữ liệu thật: {data.person.name}</strong>
          <span>Đọc từ {ok.join(', ')} lúc {time}. Bảng tin, sự kiện và các phần khác vẫn là dữ liệu mẫu.</span>
          {failed.map((id) => (
            <span key={id} className="live-bar-warning">{LIVE_SOURCES[id].label}: {SOURCE_ERROR_COPY[data.errors[id]!]}.</span>
          ))}
        </div>
        <Button onClick={connect}>Tải lại</Button>
        <Button onClick={disconnect}>Về dữ liệu mẫu</Button>
      </section>
    );
  }

  return (
    <section className={`live-bar ${status === 'error' ? 'live-bar--error' : ''}`} aria-label="Nguồn dữ liệu">
      {status === 'error' ? <WarningCircle size={20} weight="duotone" aria-hidden="true" /> : <Database size={20} weight="duotone" aria-hidden="true" />}
      <div className="live-bar-copy">
        <strong>{status === 'error' ? 'Chưa đọc được dữ liệu thật' : 'Bạn đang xem dữ liệu mẫu'}</strong>
        <span role="status">
          {status === 'error' && errorKind
            ? PAGE_ERROR_COPY[errorKind]
            : 'Kết nối iCheck, iGoal, iHiring, Lịch và IT Platform để thấy việc, mục tiêu và thiết bị của chính bạn. Trang chỉ đọc, bằng quyền của bạn.'}
        </span>
      </div>
      {errorKind !== 'unavailable' && (
        <Button variant="primary" onClick={connect} disabled={status === 'loading'}>
          {status === 'loading' ? 'Đang đọc dữ liệu…' : status === 'error' ? 'Thử lại' : 'Dùng dữ liệu thật của tôi'}
        </Button>
      )}
    </section>
  );
}
