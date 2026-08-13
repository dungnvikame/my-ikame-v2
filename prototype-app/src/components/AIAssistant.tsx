import { useState, type FormEvent } from 'react';
import { PaperPlaneTilt, Sparkle } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../AppState';

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
export function AIAssistant({ subtitle }: { subtitle?: string }) {
  const { user } = useAppState();
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
    <section className="ai-hero" aria-labelledby="ai-hero-title">
      <p className="eyebrow">{`${weekday}, ${dayMonth}`.toUpperCase()}</p>
      <h1 id="ai-hero-title">
        <Sparkle size={26} weight="fill" className="ai-hero-spark" />
        {greeting} {user.shortName}, hôm nay mình giúp gì được?
      </h1>
      {subtitle && <p>{subtitle}</p>}
      <form className="assistant-input" onSubmit={handleSubmit}>
        <Sparkle size={20} weight="fill" className="assistant-input-spark" />
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder='Hỏi Trợ lý AI: "Đặt phòng họp 14:00 hôm nay..."'
          aria-label="Hỏi Trợ lý AI"
        />
        <button type="submit" className="assistant-send" aria-label="Gửi câu hỏi"><PaperPlaneTilt size={18} weight="fill" /></button>
      </form>
      <div className="ai-hero-chips">
        {CHIPS.map((chip) => (
          <button key={chip} type="button" className="ai-suggestion-chip" onClick={() => askAssistant(chip)}>
            {chip}
          </button>
        ))}
      </div>
    </section>
  );
}
