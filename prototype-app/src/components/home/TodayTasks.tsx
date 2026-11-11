import { useState } from 'react';
import { ArrowSquareOutIcon as ArrowSquareOut, CheckCircleIcon as CheckCircle, XIcon as X } from '@coreds/react/icons';
import { Link } from 'react-router-dom';
import type { DigestItem } from '../../pages/assistant/daily-digest';
import { ButtonLink } from '../UI';

/**
 * "Cần làm ngay" trên Trang chủ. Mỗi dòng: vạch màu theo nguồn, tên việc, nguồn + bối cảnh,
 * và MỘT nút gọi đúng tên hành động ("Đánh giá", "Đọc và xác nhận") thay cho "Xử lý" chung.
 * Nút × ẩn việc trong phiên này ("để sau") — không đổi dữ liệu ở công cụ gốc.
 */
const VISIBLE = 5;

/** Tên nút theo nguồn; id của việc quyết định khi một nguồn có nhiều loại việc. */
function actionLabel(item: DigestItem): string {
  if (item.id.includes('checkin')) return 'Chấm công';
  if (item.id.includes('weekly-report')) return 'Viết báo cáo';
  if (item.id.includes('candidate-more')) return 'Mở iHiring';
  switch (item.source) {
    case 'iHiring': return 'Đánh giá';
    case 'COM': return 'Đọc và xác nhận';
    case 'iGoal': return 'Check-in';
    case 'HRIS': return 'Bổ sung';
    case 'Onboarding': return 'Làm tiếp';
    case 'Asana': return 'Mở task';
    case 'Google Calendar': return 'Xem lịch';
    case 'My iKame': return 'Xem sự kiện';
    default: return 'Mở';
  }
}

/** Bỏ tên nguồn lặp lại ở đầu/cuối phần mô tả ("iCheck · chưa ghi nhận" → "chưa ghi nhận"). */
function metaOf(item: DigestItem): string {
  return item.meta.split(' · ').filter((part) => part.trim() !== item.source).join(' · ');
}

export function TodayTasks({ items, sourceNote, askHref }: { items: DigestItem[]; sourceNote: string; askHref: string }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  const open = items.filter((item) => !dismissed.includes(item.id));
  const urgent = open.filter((item) => item.urgent).length;
  const filtered = onlyUrgent && urgent > 0 ? open.filter((item) => item.urgent) : open;
  const shown = expanded ? filtered : filtered.slice(0, VISIBLE);
  const hidden = filtered.length - shown.length;

  return (
    <section className="today-tasks" aria-labelledby="today-tasks-title">
      <header className="today-tasks-head">
        <div>
          <h2 id="today-tasks-title">Cần làm ngay</h2>
          <p>{open.length === 0 ? 'Không còn việc nào đang chờ bạn' : `${open.length} việc${urgent > 0 ? `, ${urgent} việc gấp lên đầu` : ''}`}</p>
        </div>
        <Link className="text-link" to={askHref}>Hỏi Trợ lý AI</Link>
      </header>

      {urgent > 0 && urgent < open.length && (
        <div className="today-tasks-filter" role="group" aria-label="Lọc việc">
          <button type="button" aria-pressed={!onlyUrgent} onClick={() => setOnlyUrgent(false)}>Tất cả <span>{open.length}</span></button>
          <button type="button" aria-pressed={onlyUrgent} onClick={() => setOnlyUrgent(true)}>Gấp <span>{urgent}</span></button>
        </div>
      )}

      {open.length === 0 ? (
        <div className="today-tasks-empty">
          <CheckCircle size={22} variant="duotone" aria-hidden="true" />
          <div><strong>Bạn đã xử lý hết việc hôm nay</strong><span>Việc mới sẽ hiện ở đây khi có.</span></div>
        </div>
      ) : (
        <ul className="today-tasks-list">
          {shown.map((item) => (
            <li key={item.id} className={`today-task ${item.urgent ? 'is-urgent' : ''}`} data-source={item.source}>
              <div className="today-task-copy">
                <strong>{item.label}</strong>
                <span><b>{item.source}</b>{metaOf(item)}{item.urgent && <em>Gấp</em>}</span>
              </div>
              {item.href
                ? <ButtonLink variant="dim" size="m" href={item.href}>{actionLabel(item)}<ArrowSquareOut size={14} aria-hidden="true" /></ButtonLink>
                : <ButtonLink variant="dim" size="m" to={item.to}>{actionLabel(item)}</ButtonLink>}
              <button type="button" className="today-task-dismiss" aria-label={`Để sau: ${item.label}`} title="Để sau" onClick={() => setDismissed((ids) => [...ids, item.id])}>
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="today-tasks-foot">
        <span>{sourceNote}</span>
        {hidden > 0 && <button type="button" className="text-link" onClick={() => setExpanded(true)}>Xem thêm {hidden} việc</button>}
        {expanded && filtered.length > VISIBLE && <button type="button" className="text-link" onClick={() => setExpanded(false)}>Thu gọn</button>}
        {dismissed.length > 0 && <button type="button" className="text-link" onClick={() => setDismissed([])}>Hiện lại {dismissed.length} việc đã để sau</button>}
      </footer>
    </section>
  );
}
