import { Buildings, DesktopTower, Sparkle, Ticket, UserCircle, Wrench } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../AppState';
import { EmptyState, SectionHeader, StatusPill } from '../components/UI';
import type { RequestItem, RequestStatus, RequestType } from '../types';

/**
 * iRequest center — nơi theo dõi mọi yêu cầu hỗ trợ. Việc TẠO request đi qua
 * Trợ lý AI (AI front door): mỗi loại request deep-link sang /assistant với
 * câu lệnh soạn sẵn, AI dựng form → duyệt → request xuất hiện ở đây.
 */
const REQUEST_TYPES: { type: RequestType; icon: typeof Wrench; desc: string; prompt: string }[] = [
  { type: 'IT support', icon: Wrench, desc: 'Sự cố thiết bị, phần mềm, mạng', prompt: 'Tạo request IT support: laptop không kết nối được wifi' },
  { type: 'Nhân sự', icon: UserCircle, desc: 'Nghỉ phép, giấy tờ, chế độ', prompt: 'Tạo đơn nghỉ phép 2 ngày cuối tuần sau' },
  { type: 'Hành chính', icon: Buildings, desc: 'Chỗ ngồi, gửi xe, văn phòng phẩm', prompt: 'Tạo request hành chính: đăng ký chỗ gửi xe máy tầng B1' },
  { type: 'Thiết bị', icon: DesktopTower, desc: 'Cấp mới, đổi, mượn thiết bị', prompt: 'Tạo request xin cấp thêm màn hình phụ 27 inch' },
];

const STATUS_META: Record<RequestStatus, { label: string; tone: 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Chờ duyệt', tone: 'warning' },
  in_progress: { label: 'Đang xử lý', tone: 'info' },
  done: { label: 'Hoàn tất', tone: 'success' },
};

const TYPE_ICON: Record<RequestType, typeof Wrench> = {
  'IT support': Wrench,
  'Nhân sự': UserCircle,
  'Hành chính': Buildings,
  'Thiết bị': DesktopTower,
};

function RequestRow({ request }: { request: RequestItem }) {
  const Icon = TYPE_ICON[request.type];
  const status = STATUS_META[request.status];
  return (
    <article className="request-row">
      <span className="request-icon" aria-hidden="true"><Icon size={20} /></span>
      <div className="request-copy">
        <strong>{request.title}</strong>
        <small>
          {request.type} · {request.createdAtLabel}
          {request.handlerLabel && ` · ${request.handlerLabel}`}
          {request.slaLabel && ` · ${request.slaLabel}`}
        </small>
      </div>
      <StatusPill tone={status.tone}>{status.label}</StatusPill>
    </article>
  );
}

export function RequestsPage() {
  const { requests } = useAppState();
  const navigate = useNavigate();

  const open = requests.filter((request) => request.status !== 'done');
  const done = requests.filter((request) => request.status === 'done');

  return (
    <div className="page requests-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">CẦN HỖ TRỢ</p>
          <h1>iRequest</h1>
          <p>Gửi và theo dõi mọi yêu cầu hỗ trợ — tạo nhanh qua Trợ lý AI, xử lý ở đúng bộ phận.</p>
        </div>
      </header>

      <section>
        <SectionHeader title="Tạo request mới" meta="Trợ lý AI soạn sẵn form — bạn kiểm tra rồi gửi" />
        <div className="request-type-grid">
          {REQUEST_TYPES.map(({ type, icon: Icon, desc, prompt }) => (
            <button key={type} type="button" className="request-type-card" onClick={() => navigate(`/assistant?q=${encodeURIComponent(prompt)}`)}>
              <span className="request-icon" aria-hidden="true"><Icon size={20} /></span>
              <span className="request-type-copy"><strong>{type}</strong><small>{desc}</small></span>
              <span className="request-type-ai"><Sparkle size={14} weight="fill" />AI</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionHeader title="Đang theo dõi" meta={`${open.length} request`} />
        {open.length === 0 ? (
          <EmptyState icon={<Ticket size={44} weight="duotone" />} title="Không có request nào đang mở" body="Tạo request mới bằng một trong các loại phía trên." />
        ) : (
          <div className="request-list">{open.map((request) => <RequestRow key={request.id} request={request} />)}</div>
        )}
      </section>

      {done.length > 0 && (
        <section className="section-block">
          <SectionHeader title="Đã hoàn tất" meta={`${done.length} request`} />
          <div className="request-list request-list--done">{done.map((request) => <RequestRow key={request.id} request={request} />)}</div>
        </section>
      )}
    </div>
  );
}
