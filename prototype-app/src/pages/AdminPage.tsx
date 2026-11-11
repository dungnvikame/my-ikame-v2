import { useAppState } from '../AppState';
import { useToast } from '../components/toast';
import { AdminMetrics } from './admin/AdminMetrics';
import { AdminWaerBreakdown } from './admin/AdminWaerBreakdown';
import { OfficialNewsTable } from './admin/OfficialNewsTable';
import { PinManager } from './admin/PinManager';
import { EffectivenessPanel } from './admin/EffectivenessPanel';

/**
 * Tổng quan COM (góc nhìn COM Admin): đo lường + vận hành kênh truyền thông chính thức.
 * Vòng lặp demo: đăng/ghim → push → iKamer đọc/xác nhận → COM thấy ai chưa xác nhận → nhắc → đo.
 */
export function AdminPage() {
  const { user, news, posts, pushNews, remindPendingAck, togglePinPost } = useAppState();
  const { showToast } = useToast();

  const handlePush = (id: string) => {
    pushNews(id);
    showToast('Đã gửi push tới 184 iKamer — xem ở chuông thông báo.');
  };
  const handleRemind = (id: string) => {
    const pending = news.find((item) => item.id === id)?.pendingAckNames?.length ?? 0;
    remindPendingAck(id);
    showToast(`Đã nhắc ${pending} người chưa xác nhận.`);
  };
  const handlePin = (id: string) => {
    const target = posts.find((item) => item.id === id);
    togglePinPost(id);
    showToast(target?.pinned ? 'Đã bỏ ghim bài viết' : 'Đã ghim bài lên đầu iKame Feed');
  };

  return (
    <div className="page admin-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">QUẢN TRỊ COM</p>
          <h1>Tổng quan COM</h1>
          <p>Chào {user.shortName} — kênh chính thức của iKame: ai đã đọc, ai chưa xác nhận, và bài nào đang được ghim.</p>
        </div>
      </header>
      <EffectivenessPanel />
      <AdminMetrics news={news} />
      <AdminWaerBreakdown />
      <OfficialNewsTable news={news} onPush={handlePush} onRemind={handleRemind} />
      <PinManager posts={posts} onTogglePin={handlePin} />
    </div>
  );
}
