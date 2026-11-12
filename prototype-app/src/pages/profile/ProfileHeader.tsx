import { useRef, useState, type ReactNode } from 'react';
import { Progress } from '@coreds/react';
import { CakeIcon as Cake, CameraIcon as Camera, CalendarCheckIcon as CalendarCheck, TrashIcon as Trash } from '@coreds/react/icons';
import { Button, StatusPill } from '../../components/UI';
import { useToast } from '../../components/toast';
import { daysToBirthday, formatTenure, nextAnniversary } from './profile-utils';
import { readStored, useStoredState, writeStored } from './useStoredState';

const AVATAR_MAX_BYTES = 300 * 1024;
const AVATAR_SIZE = 256;
const avatarKey = (personId: string) => `ikame.profile.avatar.${personId}`;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không đọc được ảnh'));
    img.src = src;
  });
}

/** Ảnh chọn từ máy → cắt vuông, thu nhỏ bằng canvas, nén JPEG đến khi ≤ ~300KB. */
async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Vui lòng chọn một tệp ảnh.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Ảnh quá lớn (tối đa 10MB).');
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
    let quality = 0.88;
    let data = canvas.toDataURL('image/jpeg', quality);
    while (data.length * 0.75 > AVATAR_MAX_BYTES && quality > 0.3) {
      quality -= 0.1;
      data = canvas.toDataURL('image/jpeg', quality);
    }
    return data;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Ảnh đại diện lưu theo người dùng; trả về [dataUrl, mở chọn ảnh, xoá]. */
export function useAvatar(personId: string) {
  const { showToast } = useToast();
  const [avatar, setAvatar] = useStoredState<string | null>(avatarKey(personId), null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const data = await fileToAvatarDataUrl(file);
      // Kiểm tra trước khi lưu để báo lỗi rõ nếu hết dung lượng trình duyệt.
      if (!writeStored(avatarKey(personId), data)) throw new Error('Không lưu được ảnh trên trình duyệt này.');
      setAvatar(data);
      showToast('Đã cập nhật ảnh đại diện.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không đổi được ảnh đại diện.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return { avatar, busy, inputRef, onFile, pick: () => inputRef.current?.click(), clear: () => { setAvatar(null); showToast('Đã xoá ảnh đại diện.'); } };
}

/** Ảnh đại diện đã lưu của một người (dùng cho thẻ năm). */
export const readAvatar = (personId: string) => readStored<string | null>(avatarKey(personId), null);

type Props = {
  personId: string;
  name: string;
  initial: string;
  subtitle: string;
  statusLabel: string;
  statusTone?: 'success' | 'info' | 'warning' | 'neutral';
  birthDate?: Date;
  joinedAt?: Date;
  /** Dòng phụ dưới (chip liên hệ…). */
  extra?: ReactNode;
};

export function ProfileHeader({ personId, name, initial, subtitle, statusLabel, statusTone = 'success', birthDate, joinedAt, extra }: Props) {
  const { avatar, busy, inputRef, onFile, pick, clear } = useAvatar(personId);
  const birthdayIn = birthDate ? daysToBirthday(birthDate) : undefined;
  const milestone = joinedAt ? nextAnniversary(joinedAt) : undefined;

  return (
    <section className="pp-card pp-identity" aria-label="Thông tin cá nhân">
      <div className="pp-identity-cover" aria-hidden="true" />
      <div className="pp-identity-body">
        <div className="pp-avatar-col">
          {avatar
            ? <img className="pp-avatar" src={avatar} alt={`Ảnh đại diện của ${name}`} />
            : <span className="pp-avatar" aria-hidden="true">{initial}</span>}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => void onFile(event.target.files?.[0])} aria-label="Chọn ảnh đại diện" />
        </div>
        <div className="pp-identity-main">
          <div className="pp-identity-name">
            <h1>{name}</h1>
            <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
          </div>
          <p className="pp-identity-role">{subtitle}</p>
          <div className="pp-chip-row">
            {birthdayIn !== undefined && (
              <span><Cake size={14} aria-hidden="true" />{birthdayIn === 0 ? 'Hôm nay là sinh nhật bạn' : `Sinh nhật còn ${birthdayIn} ngày`}</span>
            )}
            {joinedAt && <span><CalendarCheck size={14} aria-hidden="true" />{formatTenure(joinedAt)}</span>}
          </div>
          {milestone && (
            <div className="pp-milestone">
              <p>Còn <strong>{milestone.daysLeft} ngày</strong> tới mốc {milestone.years} năm</p>
              <Progress size="sm" value={milestone.percent} aria-label={`Đã đi ${milestone.percent}% chặng tới mốc ${milestone.years} năm`} />
            </div>
          )}
          {extra}
        </div>
        <div className="pp-identity-actions">
          <Button size="s" icon={<Camera size={16} />} onClick={pick} disabled={busy}>Đổi ảnh đại diện</Button>
          {avatar && <Button size="s" variant="borderless" icon={<Trash size={16} />} onClick={clear}>Xoá ảnh</Button>}
        </div>
      </div>
    </section>
  );
}

export type KpiItem = { id: string; label: string; value: string; hint?: string };

export function ProfileKpis({ items }: { items: KpiItem[] }) {
  return (
    <ul className="pp-kpis" aria-label="Chỉ số nhanh">
      {items.map((item) => (
        <li key={item.id} className="pp-card pp-kpi">
          <span className="pp-kpi-label">{item.label}</span>
          <strong>{item.value}</strong>
          {item.hint && <small>{item.hint}</small>}
        </li>
      ))}
    </ul>
  );
}
