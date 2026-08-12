import { ShareNetwork } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button } from '../../components/UI';

/** Local-only CTA toast — concept action, no navigation. File-local hook, no cross-phase import. */
export function KnowledgeBanner() {
  const [toast, setToast] = useState<string | null>(null);

  function handleShare() {
    setToast('Tính năng đóng góp tài liệu sẽ mở ở bản kế tiếp');
    window.setTimeout(() => setToast(null), 3200);
  }

  return (
    <section className="khub-banner">
      <div>
        <h2>Đừng để kiến thức ngừng chảy</h2>
        <p>Chia sẻ quy trình, checklist hoặc bài học của bạn để cả team cùng học nhanh hơn.</p>
      </div>
      <Button variant="primary" icon={<ShareNetwork size={17} />} onClick={handleShare}>
        Chia sẻ tài liệu của bạn
      </Button>
      {toast && <div className="khub-toast" role="status">{toast}</div>}
    </section>
  );
}
