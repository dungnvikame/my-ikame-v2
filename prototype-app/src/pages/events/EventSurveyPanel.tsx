import { CheckCircleIcon as CheckCircle, ClipboardTextIcon as ClipboardText, StarIcon as Star } from '@coreds/react/icons';
import { useState } from 'react';
import { Button, StatusPill } from '../../components/UI';
import type { EventItem } from '../../types';
import { Select, Textarea } from '@coreds/react';

type EventSurveyPanelProps = {
  survey: NonNullable<EventItem['survey']>;
  onComplete: () => void;
};

const HIGHLIGHTS = ['Nội dung chia sẻ', 'Không khí & kết nối', 'Tổ chức & hậu cần', 'Ẩm thực'];

/**
 * Khảo sát 1 phút sau sự kiện (yêu cầu COM): nhắc trong ≤3 ngày nếu chưa làm; 3 câu
 * ngắn để tỷ lệ phản hồi cao. Kết quả mock — bản thật đổ về Analytics dashboard của COM.
 */
export function EventSurveyPanel({ survey, onComplete }: EventSurveyPanelProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [highlight, setHighlight] = useState(HIGHLIGHTS[0]);
  const [note, setNote] = useState('');

  if (survey.done) {
    return (
      <div className="rsvp-panel is-complete" role="status">
        <CheckCircle size={28} variant="duotone" />
        <h2>Cảm ơn bạn đã phản hồi</h2>
        <p>Khảo sát đã được ghi nhận — COM dùng kết quả này để cải thiện sự kiện tiếp theo.</p>
      </div>
    );
  }

  return (
    <div className="rsvp-panel events-v2-survey">
      <div className="card-badges"><StatusPill tone="warning">{survey.dueLabel}</StatusPill></div>
      <ClipboardText size={28} variant="duotone" />
      <h2>Khảo sát {survey.minutes} phút</h2>
      <p>{survey.questions} câu hỏi ngắn — giúp COM biết sự kiện có đáng để tổ chức lại không.</p>
      {!open ? (
        <Button variant="primary" onClick={() => setOpen(true)}>Làm khảo sát</Button>
      ) : (
        <form className="events-v2-survey-form" onSubmit={(event) => { event.preventDefault(); if (rating) onComplete(); }}>
          <fieldset>
            <legend>1. Bạn đánh giá sự kiện thế nào?</legend>
            <div className="events-v2-survey-stars" role="radiogroup" aria-label="Điểm đánh giá">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} sao`} className={value <= rating ? 'is-active' : ''} onClick={() => setRating(value)}>
                  <Star size={22} variant={value <= rating ? 'fill' : 'line'} />
                </button>
              ))}
            </div>
          </fieldset>
          <label>
            <span>2. Phần bạn thích nhất</span>
            <Select
              variant="fill"
              options={HIGHLIGHTS.map((item) => ({ value: item, label: item }))}
              value={highlight}
              onValueChange={(value) => setHighlight(String(value))}
            />
          </label>
          <label>
            <span>3. Góp ý cho lần sau (tuỳ chọn)</span>
            <Textarea variant="fill" rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Một điều bạn muốn khác đi…" />
          </label>
          <Button variant="primary" type="submit" disabled={!rating}>Gửi phản hồi</Button>
        </form>
      )}
    </div>
  );
}
