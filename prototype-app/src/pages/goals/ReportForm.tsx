import { PaperPlaneTilt, X } from '@phosphor-icons/react';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../components/UI';
import type { Goal } from '../../types';

type ReportFormProps = {
  goal: Goal;
  authorName: string;
  onCancel: () => void;
  onSubmit: (input: { periodLabel: string; progressAfter: number; content: string; blockers: string }) => void;
};

const DEFAULT_PERIOD_LABEL = 'Tuần 33 · 10-16/08';

/** Money moment #3 UI — the mutator itself lives in `submitReport` (AppState). Never call
 * `checkInGoal` here too; `submitReport` already flips the goal (see phase-05 risk note). */
export function ReportForm({ goal, authorName, onCancel, onSubmit }: ReportFormProps) {
  const [periodLabel, setPeriodLabel] = useState(DEFAULT_PERIOD_LABEL);
  const [progressAfter, setProgressAfter] = useState(() => Math.min(100, goal.progress + 10));
  const [content, setContent] = useState(`Cập nhật tiến độ cho "${goal.title}": `);
  const [blockers, setBlockers] = useState('');

  // Reopening the form for a different goal (or after reset) must re-prefill, not carry over stale values.
  useEffect(() => {
    setPeriodLabel(DEFAULT_PERIOD_LABEL);
    setProgressAfter(Math.min(100, goal.progress + 10));
    setContent(`Cập nhật tiến độ cho "${goal.title}": `);
    setBlockers('');
  }, [goal.id, goal.progress, goal.title]);

  function handleProgressChange(raw: string) {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    setProgressAfter(Math.max(0, Math.min(100, Math.round(parsed))));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    onSubmit({ periodLabel: periodLabel.trim(), progressAfter, content: content.trim(), blockers: blockers.trim() });
  }

  return (
    <form className="okr-report-form" onSubmit={handleSubmit} aria-label={`Tạo báo cáo cho ${goal.title}`}>
      <div className="okr-report-form-head">
        <div>
          <h3>Tạo báo cáo · {goal.title}</h3>
          <p>Người báo cáo: {authorName}</p>
        </div>
        <button type="button" className="icon-button" aria-label="Đóng" onClick={onCancel}><X size={18} /></button>
      </div>

      <label className="okr-form-field">
        <span>Kỳ báo cáo</span>
        <input value={periodLabel} onChange={(event) => setPeriodLabel(event.target.value)} required />
      </label>

      <label className="okr-form-field">
        <span>Tiến độ mới (%)</span>
        <input type="number" min={0} max={100} value={progressAfter} onChange={(event) => handleProgressChange(event.target.value)} />
      </label>

      <label className="okr-form-field">
        <span>Nội dung cập nhật</span>
        <textarea rows={3} value={content} onChange={(event) => setContent(event.target.value)} required />
      </label>

      <label className="okr-form-field">
        <span>Vướng mắc (nếu có)</span>
        <textarea rows={2} value={blockers} onChange={(event) => setBlockers(event.target.value)} placeholder="Không có vướng mắc" />
      </label>

      <div className="okr-report-form-actions">
        <Button type="button" variant="dim" onClick={onCancel}>Huỷ</Button>
        <Button type="submit" variant="primary" icon={<PaperPlaneTilt size={16} />}>Gửi báo cáo</Button>
      </div>
    </form>
  );
}
