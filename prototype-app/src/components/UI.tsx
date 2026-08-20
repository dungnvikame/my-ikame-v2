import { forwardRef, type ButtonHTMLAttributes, type PropsWithChildren, type ReactNode } from 'react';
import { ArrowRight, CheckCircle, Clock, WarningCircle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'dim' | 'borderless' | 'danger';
  icon?: ReactNode;
};

export function Button({ variant = 'dim', icon, children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`button button--${variant} ${className}`} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

export const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>>(function IconButton({ label, children, className = '', ...props }, ref) {
  return (
    <button ref={ref} className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
});

export function SectionHeader({ title, meta, href, actionLabel = 'Xem tất cả' }: { title: string; meta?: string; href?: string; actionLabel?: string }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {meta && <p>{meta}</p>}
      </div>
      {href && <Link className="text-link" to={href}>{actionLabel}<ArrowRight size={16} /></Link>}
    </div>
  );
}

export function StatusPill({ tone = 'neutral', children }: PropsWithChildren<{ tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info' }>) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}

export function SourceLine({ source, time }: { source: string; time: string }) {
  return <div className="source-line"><span>{source}</span><span aria-hidden="true">·</span><span>{time}</span></div>;
}

/** Icon theo ngữ cảnh (mặc định CheckCircle cho trạng thái "đã xử lý hết"). */
export function EmptyState({ title, body, icon }: { title: string; body: string; icon?: ReactNode }) {
  return (
    <div className="empty-state">
      {icon ?? <CheckCircle size={44} weight="duotone" />}
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function PriorityIcon({ kind }: { kind: 'required' | 'time' | 'warning' }) {
  if (kind === 'time') return <Clock size={20} weight="duotone" />;
  return <WarningCircle size={20} weight="duotone" />;
}
