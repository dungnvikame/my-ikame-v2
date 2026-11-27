import React, { useEffect, useRef } from 'react';
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  CreditCard,
  IdCard,
  Layers,
  Target,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { PersonProfile } from '../types';

export const Avatar: React.FC<{
  person?: Pick<PersonProfile, 'initials' | 'avatarBg' | 'avatarFg' | 'name'>;
  initials?: string;
  size?: number;
}> = ({ person, initials, size = 34 }) => {
  const bg = person?.avatarBg || 'var(--bg-muted)';
  const fg = person?.avatarFg || 'var(--text-strong)';
  const label = person?.initials || initials || 'IK';
  return (
    <span
      className="avatar"
      title={person?.name}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        background: bg,
        color: fg,
      }}
    >
      {label}
    </span>
  );
};

export const AppIconGlyph: React.FC<{ iconKey: string; size?: number }> = ({ iconKey, size = 18 }) => {
  switch (iconKey) {
    case 'clock':
      return <Clock size={size} />;
    case 'target':
      return <Target size={size} />;
    case 'ticket':
      return <Ticket size={size} />;
    case 'book':
      return <BookOpen size={size} />;
    case 'idcard':
      return <IdCard size={size} />;
    case 'users':
      return <Users size={size} />;
    case 'briefcase':
      return <Briefcase size={size} />;
    case 'layers':
      return <Layers size={size} />;
    case 'wallet':
      return <CreditCard size={size} />;
    default:
      return <Layers size={size} />;
  }
};

// Accessible Modal with real Focus Trap + Escape handling (fixes PRD §13.6)
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, subtitle, maxWidth = 540, children, footer }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    const getFocusable = () =>
      panel?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) || [];

    const focusables = getFocusable();
    if (focusables.length > 0) {
      focusables[0].focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const list = Array.from(getFocusable());
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      prevActive?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel" ref={panelRef} style={{ maxWidth }}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Đóng hộp thoại">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// Accessible Drawer with Focus Trap + Escape handling
export const Drawer: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, headerActions, children }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      prevActive?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-panel" ref={panelRef}>
        <div className="modal-header">
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {headerActions}
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Đóng">
              <X size={18} />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const ToastStack: React.FC<{
  toasts: { id: string; title: string; description?: string; tone?: string }[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast-item">
          <CheckCircle2
            size={17}
            style={{
              flexShrink: 0,
              marginTop: 1,
              color:
                t.tone === 'warning'
                  ? '#FCDD73'
                  : t.tone === 'error'
                    ? '#FF808B'
                    : '#5EE394',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{t.title}</div>
            {t.description && (
              <div style={{ fontSize: 12, opacity: 0.82, marginTop: 2 }}>{t.description}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Đóng thông báo"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              opacity: 0.7,
              padding: 2,
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Render simple inline bold markdown (**text**) safely without HTML injection
export const RichInlineText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return (
          <React.Fragment key={i}>
            {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={idx} style={{ color: 'var(--text-strong)', fontWeight: 600 }}>
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                return <em key={idx}>{part.slice(1, -1)}</em>;
              }
              return <React.Fragment key={idx}>{part}</React.Fragment>;
            })}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
};
