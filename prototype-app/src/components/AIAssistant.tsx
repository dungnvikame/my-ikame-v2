import type { ReactNode } from 'react';
import { useState, type FormEvent } from 'react';
import { NewspaperIcon as Newspaper, PaperPlaneTiltIcon as PaperPlaneTilt, SparkleIcon as Sparkle } from '@coreds/react/icons';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../AppState';
import { useLive } from '../lib/live/live-data';
import { Input, Button as DsButton } from '@coreds/react';
import { Button, TextButton } from './UI';

export type HeroProgress = { handled: number; total: number; goalPercent?: number };

/** Vòng tiến độ nhỏ: màu theo token, đọc được bằng nhãn văn bản bên cạnh nên ẩn khỏi trình đọc màn hình. */
function ProgressRing({ value }: { value: number }) {
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg className="hero-ring" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r={radius} className="hero-ring-track" />
      <circle cx="14" cy="14" r={radius} className="hero-ring-value" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - Math.min(1, Math.max(0, value)))} transform="rotate(-90 14 14)" />
    </svg>
  );
}

/**
 * Hero trên Trang chủ: lời chào + cột mốc, tiến độ xử lý việc trong ngày, ô hỏi Trợ lý AI,
 * nút "Bản tin 30 giây" và (bên phải) thẻ cuộc họp kế tiếp. Không chat tại chỗ —
 * câu hỏi chuyển sang /assistant?q=... để xử lý trong hội thoại đầy đủ.
 */
export function AIAssistant({ subtitle, milestone, progress, onBrief, onToggleRecap, recapShown, aside, children }: {
  subtitle?: string;
  milestone?: string;
  progress?: HeroProgress;
  onBrief?: () => void;
  onToggleRecap?: () => void;
  recapShown?: boolean;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const { user } = useAppState();
  // Đã nối dữ liệu thật: chào bằng tên thật của người xem thay cho nhân vật mẫu.
  const livePerson = useLive().data?.person;
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const now = new Date();
  const weekday = now.toLocaleDateString('vi-VN', { weekday: 'long' });
  const dayMonth = now.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' });
  const greeting = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (trimmed) navigate(`/assistant?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section className="ai-hero ai-hero--compact hero-v3" aria-labelledby="ai-hero-title">
      <div className="hero-v3-top">
        <div className="hero-v3-main">
          <p className="eyebrow">{`${weekday}, ${dayMonth}`.toUpperCase()}</p>
          <h1 id="ai-hero-title">
            <Sparkle size={26} variant="fill" className="ai-hero-spark" />
            {greeting}, {livePerson?.shortName ?? user.shortName}
          </h1>
          {milestone && <p className="hero-v3-milestone">{milestone}</p>}
          {subtitle && <p className="hero-v3-sub">{subtitle}</p>}
          {progress && progress.total > 0 && (
            <div className="hero-v3-progress">
              <ProgressRing value={progress.handled / progress.total} />
              <span><strong>{progress.handled}/{progress.total}</strong> việc đã xử lý</span>
              {progress.goalPercent !== undefined && <span className="hero-v3-goal">Mục tiêu <strong>{progress.goalPercent}%</strong></span>}
              {onToggleRecap && !recapShown && <TextButton onClick={onToggleRecap}>Xem tổng kết</TextButton>}
            </div>
          )}
          <form className="assistant-input" onSubmit={handleSubmit}>
            <Sparkle size={20} variant="fill" className="assistant-input-spark" />
            <Input
              variant="borderless"
              size="l"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder='Hỏi Trợ lý AI: "Đặt phòng họp 14:00 hôm nay..."'
              aria-label="Hỏi Trợ lý AI"
            />
            <DsButton type="submit" variant="primary" size="icon-l" className="send-button" aria-label="Gửi câu hỏi"><PaperPlaneTilt size={18} variant="fill" /></DsButton>
          </form>
          {onBrief && (
            <div className="hero-v3-brief">
              <Button variant="dim" size="m" icon={<Newspaper size={16} aria-hidden="true" />} onClick={onBrief}>Bản tin 30 giây</Button>
            </div>
          )}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
