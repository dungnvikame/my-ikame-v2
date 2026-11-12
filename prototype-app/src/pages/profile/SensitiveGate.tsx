import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FingerprintSimpleIcon as FingerprintSimple, LockKeyIcon as LockKey } from '@coreds/react/icons';
import { useAppState } from '../../AppState';
import { Button } from '../../components/UI';
import { Input, Modal } from '@coreds/react';

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
      <Button ref={triggerRef} variant="dim" onClick={() => setOpen(true)} icon={<LockKey size={16} />}>{label}</Button>
      <Modal
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
        size="sm"
        title="Xác thực để xem thông tin nhạy cảm"
        description="Thông tin lương, tài khoản và giấy tờ tuỳ thân chỉ hiển thị sau khi bạn xác thực lại. Phiên xem tự khoá sau 5 phút."
      >
        <form className="sensitive-form" onSubmit={confirm}>
          <label>
            <span>Mật khẩu SSO</span>
            <Input ref={inputRef} variant="fill" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="••••••••" />
          </label>
          <div className="sensitive-dialog-actions">
            <Button type="button" icon={<FingerprintSimple size={18} />} onClick={() => confirm()}>Dùng Face ID / vân tay</Button>
            <Button type="submit" variant="primary" disabled={password.length < 4}>Xác thực</Button>
          </div>
          <small>Mô phỏng — bản thật dùng SSO step-up authentication, có ghi audit log.</small>
        </form>
      </Modal>
    </>
  );
}
