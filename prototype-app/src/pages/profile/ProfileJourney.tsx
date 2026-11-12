import type { ReactNode } from 'react';
import {
  BriefcaseIcon as Briefcase, ConfettiIcon as Confetti, CopyIcon as Copy, DownloadSimpleIcon as DownloadSimple,
  RocketLaunchIcon as RocketLaunch, SealCheckIcon as SealCheck, TrophyIcon as Trophy,
} from '@coreds/react/icons';
import { Button, EmptyState, SectionHeader } from '../../components/UI';
import { useToast } from '../../components/toast';
import { JOURNEY_KIND_LABEL, type JourneyItem, type JourneyKind } from '../../data/profile-extras';
import { resolveToken } from './profile-utils';

const KIND_ICON: Record<JourneyKind, ReactNode> = {
  join: <RocketLaunch size={18} />, official: <SealCheck size={18} />, project: <Briefcase size={18} />,
  award: <Trophy size={18} />, event: <Confetti size={18} />,
};

/** Dải cuộn ngang các cột mốc (scroll-snap). */
export function ProfileJourney({ items }: { items: JourneyItem[] }) {
  return (
    <section className="pp-card pp-section" aria-label="Hành trình">
      <SectionHeader title="Hành trình" meta="Các cột mốc của bạn tại iKame · vuốt ngang để xem tiếp" />
      {items.length === 0 ? (
        <EmptyState title="Chưa có cột mốc" body="Cột mốc từ HRIS sẽ hiện ở đây khi có dữ liệu." />
      ) : (
        <ol className="pp-reel" tabIndex={0} aria-label="Các cột mốc, cuộn ngang">
          {items.map((item) => (
            <li key={item.id} className={`pp-reel-card kind-${item.kind}`}>
              <span className="pp-reel-icon" aria-hidden="true">{KIND_ICON[item.kind]}</span>
              <small>{JOURNEY_KIND_LABEL[item.kind]} · {item.dateLabel}</small>
              <strong>{item.title}</strong>
              <p>{item.note}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export type YearStats = { workDays: number; events: number; okrDone: number; okrTotal: number };

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) { lines.push(line); line = word; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Vẽ thẻ năm ra canvas 1080x1350 (bố cục chữ đơn giản) rồi trả blob PNG. */
function renderYearCard(name: string, role: string, stats: YearStats, greeting: string): Promise<Blob> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Trình duyệt không hỗ trợ vẽ ảnh.'));

  const from = resolveToken('--bg-accent-primary', 'orangered');
  const to = resolveToken('--bg-purple-contrast', 'purple');
  const ink = resolveToken('--fg-on-accent', 'white');
  const font = getComputedStyle(document.body).fontFamily || 'sans-serif';

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, from);
  gradient.addColorStop(1, to);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = ink;
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 0.85;
  ctx.font = `600 40px ${font}`;
  ctx.fillText('THẺ NĂM 2026 · MY IKAME', 80, 90);
  ctx.globalAlpha = 1;
  ctx.font = `700 84px ${font}`;
  wrapLines(ctx, name, width - 160).slice(0, 2).forEach((line, i) => ctx.fillText(line, 80, 170 + i * 96));
  ctx.globalAlpha = 0.9;
  ctx.font = `400 38px ${font}`;
  ctx.fillText(role, 80, 380);
  ctx.globalAlpha = 1;

  const cells: [string, string][] = [
    [String(stats.workDays), 'ngày làm việc'],
    [String(stats.events), 'sự kiện tham gia'],
    [`${stats.okrDone}/${stats.okrTotal}`, 'OKR hoàn thành'],
  ];
  cells.forEach(([value, label], i) => {
    const y = 500 + i * 170;
    ctx.font = `700 110px ${font}`;
    ctx.fillText(value, 80, y);
    ctx.font = `400 38px ${font}`;
    ctx.globalAlpha = 0.9;
    ctx.fillText(label, 80 + Math.max(260, ctx.measureText(value).width + 40), y + 52);
    ctx.globalAlpha = 1;
  });

  ctx.font = `italic 400 40px ${font}`;
  wrapLines(ctx, `"${greeting}"`, width - 160).slice(0, 4).forEach((line, i) => ctx.fillText(line, 80, 1040 + i * 56));

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Không tạo được ảnh.'))), 'image/png');
  });
}

export function YearCard({ name, role, stats, greeting }: { name: string; role: string; stats: YearStats; greeting: string }) {
  const { showToast } = useToast();

  const download = async () => {
    try {
      const blob = await renderYearCard(name, role, stats, greeting);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'the-nam-2026-my-ikame.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Đã tải ảnh thẻ năm 2026.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không tải được ảnh.');
    }
  };

  const copyIntro = async () => {
    const text = `${name} · ${role} — Năm 2026 cùng iKame: ${stats.workDays} ngày làm việc, ${stats.events} sự kiện, hoàn thành ${stats.okrDone}/${stats.okrTotal} OKR. ${greeting}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Đã sao chép lời giới thiệu.');
    } catch {
      showToast('Trình duyệt chặn sao chép. Hãy chọn và sao chép thủ công.');
    }
  };

  return (
    <section className="pp-card pp-section" aria-label="Thẻ năm 2026">
      <SectionHeader title="Thẻ năm 2026" meta="Tổng kết một năm của bạn, sẵn sàng để chia sẻ" />
      <div className="pp-yearcard">
        <div className="pp-yearcard-face">
          <small>THẺ NĂM 2026</small>
          <h3>{name}</h3>
          <p>{role}</p>
          <dl>
            <div><dt>Ngày làm việc</dt><dd>{stats.workDays}</dd></div>
            <div><dt>Sự kiện tham gia</dt><dd>{stats.events}</dd></div>
            <div><dt>OKR hoàn thành</dt><dd>{stats.okrDone}/{stats.okrTotal}</dd></div>
          </dl>
          <blockquote>{greeting}</blockquote>
        </div>
        <div className="pp-yearcard-actions">
          <Button variant="primary" icon={<DownloadSimple size={18} />} onClick={() => void download()}>Tải ảnh</Button>
          <Button icon={<Copy size={18} />} onClick={() => void copyIntro()}>Sao chép lời giới thiệu</Button>
        </div>
      </div>
    </section>
  );
}
