import { useState, type FormEvent } from 'react';
import { ArrowRightIcon as ArrowRight, SparkleIcon as Sparkle } from '@coreds/react/icons';
import { Input } from '@coreds/react';
import { parseRequest, REQUEST_KIND_LABEL, type DaySession } from '../../lib/request-parser';
import { trackFlow } from '../../lib/metrics/metrics';
import { Button, ChipButton } from '../UI';
import { dateLabel } from './request-context';
import { stateFromSentence, usesDates, type FormState } from './request-form-model';

/**
 * Đề xuất bằng một câu: gõ câu tự nhiên → đọc ra loại, ngày, buổi (gợi ý ngay khi gõ) →
 * "Điền form" mở form đầy đủ ở trang Đề xuất. Không đi vòng qua Trợ lý AI.
 */
const EXAMPLES = ['Mai em xin nghỉ buổi sáng', 'Thứ 6 em xin làm ở nhà', 'Hôm qua em quên chấm công', 'Laptop không vào được wifi'];
const SESSION_WORD: Record<DaySession, string> = { full: 'cả ngày', morning: 'buổi sáng', afternoon: 'buổi chiều' };

export function QuickRequest({ onOpen }: { onOpen: (state: FormState) => void }) {
  const [text, setText] = useState('');

  const read = (value: string) => {
    if (!value.trim()) return;
    trackFlow('request', 'start');
    onOpen(stateFromSentence(value));
  };
  const onRead = (event: FormEvent) => {
    event.preventDefault();
    read(text);
  };

  // Gợi ý "mình hiểu thế này" ngay khi gõ — parser chạy bằng luật nên rất nhẹ.
  const preview = text.trim().length >= 4 ? parseRequest(text) : undefined;
  const previewText = preview && preview.kind !== 'unknown'
    ? `${REQUEST_KIND_LABEL[preview.kind]}${usesDates(preview.kind) ? ` · ${dateLabel(preview.date)}` : ''}${preview.kind === 'leave' || preview.kind === 'wfh' ? ` · ${SESSION_WORD[preview.session]}` : ''}`
    : undefined;

  return (
    <section className="quick-request" aria-label="Đề xuất bằng một câu">
      <form className="rq-ask" onSubmit={onRead}>
        <label htmlFor="quick-request-text"><Sparkle size={16} variant="fill" aria-hidden="true" />Bạn cần gì?</label>
        <div className="rq-ask-row">
          <Input
            id="quick-request-text"
            size="l"
            variant="fill"
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Bạn cần gì? Ví dụ: mai em xin nghỉ buổi sáng"
            autoComplete="off"
          />
          <Button variant="primary" type="submit" disabled={!text.trim()} icon={<ArrowRight size={16} />}>Điền form</Button>
        </div>
        {previewText && <p className="rq-ask-preview" role="status">Mình hiểu: <strong>{previewText}</strong> — nhấn Enter để điền form.</p>}
        <div className="rq-ask-examples" role="group" aria-label="Câu gợi ý">
          {EXAMPLES.map((example) => (
            <ChipButton key={example} onClick={() => { setText(example); read(example); }}>{example}</ChipButton>
          ))}
        </div>
      </form>
    </section>
  );
}
