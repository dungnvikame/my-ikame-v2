import { ArrowRight, SquaresFour } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '../AppState';
import { visibleApps } from '../data/apps-data';
import { IconButton } from './UI';

/**
 * Launcher ứng dụng trên topbar (kiểu Google apps grid): popover liệt kê app nội bộ,
 * chọn app điều hướng tới /apps (external mở handoff tại đó) hoặc route nội bộ.
 * A11y: popover là danh sách nút thường (không dùng role menu để khỏi phải cam kết
 * arrow-key navigation); mở → focus vào item đầu, Escape đóng + focus trả về trigger.
 */
export function AppLauncher() {
  const { user } = useAppState();
  const apps = visibleApps(user);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Mở panel → chuyển focus vào item đầu tiên cho người dùng bàn phím.
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('button, a')?.focus();
  }, [open]);

  // Click ngoài popover → đóng (chỉ gắn listener khi đang mở).
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  // External app: launcher chỉ điều hướng tới trang Ứng dụng (nơi có handoff SSO đầy đủ).
  const openApp = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <div className="app-launcher-wrap" ref={wrapRef} onKeyDown={onKeyDown}>
      <IconButton
        ref={triggerRef}
        label="Mở danh sách ứng dụng"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="app-launcher-panel"
        onClick={() => setOpen((prev) => !prev)}
      >
        <SquaresFour size={20} />
      </IconButton>
      {open && (
        <div ref={panelRef} id="app-launcher-panel" className="app-launcher-panel" aria-label="Ứng dụng nội bộ">
          <div className="app-launcher-grid">
            {apps.map((app) => (
              <button
                key={app.id}
                type="button"
                className="app-launcher-item"
                onClick={() => openApp(app.kind === 'internal' ? app.href : '/apps')}
              >
                <span className="app-launcher-emoji" aria-hidden="true">{app.emoji}</span>
                <span className="app-launcher-name">{app.name}</span>
              </button>
            ))}
          </div>
          <Link className="text-link app-launcher-all" to="/apps" onClick={() => setOpen(false)}>
            Xem tất cả ứng dụng<ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
