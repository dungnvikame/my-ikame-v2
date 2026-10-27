import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FingerprintSimple, LockKey, X } from '@phosphor-icons/react';
import { useAppState } from '../../AppState';
import { Button, IconButton } from '../../components/UI';

/**
 * Gate dữ liệu nhạy cảm (lương, tài khoản ngân hàng, số CCCD/BHXH): xác thực lại trước
 * khi xem — mock mật khẩu/FaceID, mở 5 phút rồi khoá. Ý Long 06/08 (FaceID/mật mã cho C&B).
 */
export function SensitiveGate({ label = 'Xác thực để xem' }: { label?: string }) {
  const { sensitiveUnlocked, unlockSensitive } = useAppState();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const close = () => {
    setOpen(false);
    setPassword('');
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const confirm = (event?: FormEvent) => {
    event?.preventDefault();
    unlockSensitive();
    close();
  };

  if (sensitiveUnlocked) return null;

  return (
    <>
      <button ref={triggerRef} type="button" className="button button--dim" onClick={() => setOpen(true)}><LockKey size={16} />{label}</button>
      {open && (
        <div className="drawer-layer" role="presentation" onMouseDown={close}>
          <div className="sensitive-dialog" role="dialog" aria-modal="true" aria-labelledby="sensitive-title" onMouseDown={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === 'Escape') close(); }}>
            <header>
              <h2 id="sensitive-title">Xác thực để xem thông tin nhạy cảm</h2>
              <IconButton label="Đóng" onClick={close}><X size={18} /></IconButton>
            </header>
            <p>Thông tin lương, tài khoản và giấy tờ tuỳ thân chỉ hiển thị sau khi bạn xác thực lại. Phiên xem tự khoá sau 5 phút.</p>
            <form onSubmit={confirm}>
              <label>
                <span>Mật khẩu SSO</span>
                <input ref={inputRef} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="••••••••" />
              </label>
              <div className="sensitive-dialog-actions">
                <Button type="button" icon={<FingerprintSimple size={18} />} onClick={() => confirm()}>Dùng Face ID / vân tay</Button>
                <Button type="submit" variant="primary" disabled={password.length < 4}>Xác thực</Button>
              </div>
            </form>
            <small>Mô phỏng — bản thật dùng SSO step-up authentication, có ghi audit log.</small>
          </div>
        </div>
      )}
    </>
  );
}
