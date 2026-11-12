import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type PropsWithChildren, type ReactNode } from 'react';
import { Badge, Button as DsButton, TabChip } from '@coreds/react';
import { ArrowRightIcon as ArrowRight, CheckCircleIcon as CheckCircle, ClockIcon as Clock, WarningCircleIcon as WarningCircle } from '@coreds/react/icons';
import { Link } from 'react-router-dom';

/**
 * Các thành phần dùng chung của app, dựng trên Core DS (`@coreds/react`, chuẩn giao diện của
 * công ty). App giữ tên variant cũ để 50+ nơi gọi không phải sửa; bảng dưới đổi sang variant
 * của kit. Kích cỡ luôn chọn bằng prop `size` của kit, không ghi đè chiều cao/padding bằng CSS.
 */
type AppVariant = 'primary' | 'dim' | 'borderless' | 'danger';
type DsSize = 'xs' | 's' | 'm' | 'l' | 'xl';
const DS_VARIANT = { primary: 'primary', dim: 'dim', borderless: 'subtle', danger: 'danger' } as const;

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: AppVariant;
  size?: DsSize;
  icon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'dim', size = 'l', icon, children, type = 'button', ...props }, ref,
) {
  return (
    <DsButton ref={ref} variant={DS_VARIANT[variant]} size={size} type={type} {...props}>
      {icon}
      {children}
    </DsButton>
  );
});

type ButtonLinkProps = PropsWithChildren<{ variant?: AppVariant; size?: DsSize; className?: string } & (
  | { to: string; href?: undefined }
  | { href: string; to?: undefined }
)> & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-label' | 'title' | 'onClick'>;

/**
 * Nút dạng liên kết: `to` = điều hướng trong app, `href` = mở công cụ ngoài ở tab mới.
 * Dùng `asChild` của Core DS để thẻ <a> mang đúng style nút của kit.
 */
export function ButtonLink({ variant = 'dim', size = 'l', to, href, children, className, ...rest }: ButtonLinkProps) {
  return (
    <DsButton asChild variant={DS_VARIANT[variant]} size={size} className={className}>
      {to !== undefined
        ? <Link to={to} {...rest}>{children}</Link>
        : <a href={href} target="_blank" rel="noreferrer" {...rest}>{children}</a>}
    </DsButton>
  );
}

export const IconButton = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>>(function IconButton({ label, children, type: _type, ...props }, ref) {
  return (
    <DsButton ref={ref} variant="borderlessSubtle" size="icon-l" type="button" aria-label={label} title={label} {...props}>
      {children}
    </DsButton>
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

const BADGE_VARIANT = { neutral: 'default', success: 'success', warning: 'warning', error: 'error', info: 'info' } as const;

/** Nhãn trạng thái — Badge của Core DS theo vai trò (thành công, cảnh báo, lỗi, thông tin). */
export function StatusPill({ tone = 'neutral', children }: PropsWithChildren<{ tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info' }>) {
  return <Badge variant={BADGE_VARIANT[tone]} size="m">{children}</Badge>;
}

export function SourceLine({ source, time }: { source: string; time: string }) {
  return <div className="source-line"><span>{source}</span><span aria-hidden="true">·</span><span>{time}</span></div>;
}

/** Icon theo ngữ cảnh (mặc định CheckCircle cho trạng thái "đã xử lý hết"). */
export function EmptyState({ title, body, icon }: { title: string; body: string; icon?: ReactNode }) {
  return (
    <div className="empty-state">
      {icon ?? <CheckCircle size={44} variant="duotone" />}
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function PriorityIcon({ kind }: { kind: 'required' | 'time' | 'warning' }) {
  if (kind === 'time') return <Clock size={20} variant="duotone" />;
  return <WarningCircle size={20} variant="duotone" />;
}

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>;

/**
 * Chip bấm được (lọc, gợi ý, chuyển chế độ) — TabChip của Core DS. Trạng thái đang chọn lấy từ
 * `aria-pressed` / `aria-checked` mà nơi gọi vẫn truyền cho trình đọc màn hình, nên không cần prop riêng.
 */
export function ChipButton({ children, className: _className, type: _type, icon, ...props }: NativeButtonProps & { icon?: ReactNode }) {
  const active = props['aria-pressed'] === true || props['aria-checked'] === true;
  return <TabChip size="s" pill active={active} icon={icon} type="button" {...props}>{children}</TabChip>;
}

/** Nút chữ cho hành động phụ trong dòng ("Xem thêm", "Thu gọn", "Xoá bộ lọc") — Button subtle của Core DS. */
export function TextButton({ children, className: _className, type: _type, ...props }: NativeButtonProps) {
  return <DsButton variant="subtle" size="s" type="button" {...props}>{children}</DsButton>;
}

/** Nút hành động nhỏ có icon và chữ (thả tim, bình luận, thao tác nhanh) — Button của Core DS. */
export function ActionButton({ children, className: _className, type: _type, ...props }: NativeButtonProps) {
  return <DsButton variant="subtle" size="s" type="button" {...props}>{children}</DsButton>;
}
