import { useEffect, useState } from 'react';
import { ArrowSquareOut, CheckCircle, CircleNotch, LockKey } from '@phosphor-icons/react';
import { Button } from './UI';

/**
 * Mô phỏng handoff sang platform gốc (slide "Một cửa vào, không phải một nơi
 * làm mọi việc"): bấm → màn SSO chung (không đăng nhập lại) → màn "đang làm
 * việc trên platform gốc" → nút quay về My iKame + toast xác nhận đồng bộ.
 * Toàn bộ là mô phỏng — bản thật sẽ deep-link kèm SSO token.
 */
type PlatformKey = 'iWiki' | 'iGoal' | 'iHRM';

const PLATFORM_META: Record<PlatformKey, { emoji: string; tagline: string }> = {
  iWiki: { emoji: '📖', tagline: 'Nền tảng tri thức & biên tập nội dung' },
  iGoal: { emoji: '🎯', tagline: 'Nền tảng quản trị mục tiêu & OKR' },
  iHRM: { emoji: '🧾', tagline: 'Nền tảng nhân sự, lương & phúc lợi' },
};

type Phase = 'closed' | 'sso' | 'working' | 'returned';

export function PlatformHandoffButton({
  platform,
  action,
  label,
  variant = 'button',
}: {
  platform: PlatformKey;
  /** Mô tả việc sẽ làm ở platform gốc, ví dụ "biên tập bài viết". */
  action: string;
  /** Nhãn nút; mặc định "Mở trên {platform}". */
  label?: string;
  /** 'button' = nút viền đầy đủ; 'link' = text-link gọn. */
  variant?: 'button' | 'link';
}) {
  const [phase, setPhase] = useState<Phase>('closed');
  const meta = PLATFORM_META[platform];

  // SSO giả lập ~1.4s rồi vào màn platform gốc; toast quay về tự ẩn sau 2.5s.
  useEffect(() => {
    if (phase === 'sso') {
      const timer = setTimeout(() => setPhase('working'), 1400);
      return () => clearTimeout(timer);
    }
    if (phase === 'returned') {
      const timer = setTimeout(() => setPhase('closed'), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <>
      <button
        type="button"
        className={variant === 'link' ? 'handoff-link' : 'handoff-button'}
        onClick={() => setPhase('sso')}
      >
        {label ?? `Mở trên ${platform}`}
        <ArrowSquareOut size={15} />
      </button>

      {(phase === 'sso' || phase === 'working') && (
        <div className="handoff-layer" role="dialog" aria-modal="true" aria-label={`Chuyển sang ${platform}`}>
          {phase === 'sso' ? (
            <div className="handoff-card handoff-card--sso">
              <span className="handoff-emoji" aria-hidden="true">{meta.emoji}</span>
              <CircleNotch size={22} className="handoff-spinner" aria-hidden="true" />
              <strong>Đang chuyển sang {platform}...</strong>
              <p><LockKey size={14} /> SSO chung — không cần đăng nhập lại</p>
            </div>
          ) : (
            <div className="handoff-card handoff-card--working">
              <header className="handoff-window-bar">
                <span className="handoff-emoji" aria-hidden="true">{meta.emoji}</span>
                <div>
                  <strong>{platform}</strong>
                  <small>{meta.tagline} · platform gốc (mô phỏng)</small>
                </div>
              </header>
              <div className="handoff-window-body">
                <p>Bạn đang <strong>{action}</strong> trên {platform} — công cụ chuyên biệt, phiên làm việc dài thuộc về platform gốc.</p>
                <p className="handoff-note">Trong bản thật, đây là {platform} thực tế mở qua deep-link kèm SSO. Xong việc, mọi cập nhật tự đồng bộ về My iKame.</p>
              </div>
              <footer className="handoff-window-actions">
                <Button variant="primary" icon={<CheckCircle size={16} />} onClick={() => setPhase('returned')}>
                  Xong việc — quay về My iKame
                </Button>
              </footer>
            </div>
          )}
        </div>
      )}

      {phase === 'returned' && (
        <div className="handoff-toast" role="status">
          <CheckCircle size={16} weight="fill" />
          Đã quay về My iKame — cập nhật từ {platform} sẽ đồng bộ về đây.
        </div>
      )}
    </>
  );
}
