import type { ReactNode } from 'react';
import { useState, type FormEvent } from 'react';
import { PaperPlaneTiltIcon as PaperPlaneTilt, SparkleIcon as Sparkle } from '@coreds/react/icons';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../AppState';
import { useLive } from '../lib/live/live-data';
import { Input, Button as DsButton } from '@coreds/react';
import { ChipButton } from './UI';

const CHIPS = [
  'Tôi có việc gì cần xác nhận?',
  'Đặt phòng họp 14:00 hôm nay',
  'Tạo request IT support',
  'Viết bài iWiki về quy trình onboarding',
];

/**
 * Hero launcher trên Trang chủ (phong cách "AI front door"): lời chào + ô nhập
 * lớn + chip gợi ý. Không chat tại chỗ — mọi câu hỏi chuyển sang trang
 * Trợ lý AI (/assistant?q=...) để xử lý trong hội thoại đầy đủ.
 */
export function AIAssistant({ subtitle, compact = false, children }: { subtitle?: string; compact?: boolean; children?: ReactNode }) {
  const { user } = useAppState();
  // Đã nối dữ liệu thật: chào bằng tên thật của người xem thay cho nhân vật mẫu.
  const livePerson = useLive().data?.person;
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const now = new Date();
  const weekday = now.toLocaleDateString('vi-VN', { weekday: 'long' });
  const dayMonth = now.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' });
  const greeting = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  function askAssistant(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    navigate(`/assistant?q=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    askAssistant(input);
  }

  return (
    <section className={`ai-hero ${compact ? 'ai-hero--compact' : ''}`} aria-labelledby="ai-hero-title">
      <p className="eyebrow">{`${weekday}, ${dayMonth}`.toUpperCase()}</p>
      <h1 id="ai-hero-title">
        <Sparkle size={26} variant="fill" className="ai-hero-spark" />
        {greeting} {livePerson?.shortName ?? user.shortName}, hôm nay mình giúp gì được?
      </h1>
      {subtitle && <p>{subtitle}</p>}
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
      {children}
      {!compact && <div className="ai-hero-chips">
        {CHIPS.map((chip) => (
          <ChipButton key={chip} onClick={() => askAssistant(chip)}>
            {chip}
          </ChipButton>
        ))}
      </div>}
    </section>
  );
}
