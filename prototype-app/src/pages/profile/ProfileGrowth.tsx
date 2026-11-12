import { useMemo, useState } from 'react';
import { Checkbox, Progress, Slider } from '@coreds/react';
import { ArrowCounterClockwiseIcon as ArrowCounterClockwise, ArrowLeftIcon as ArrowLeft } from '@coreds/react/icons';
import { Button, SectionHeader } from '../../components/UI';
import { CORE_VALUES, DISC_QUESTIONS, DISC_RESULT, type DiscType } from '../../data/profile-extras';
import { useStoredState } from './useStoredState';

const MAX_SCORE = 5;

/** Biểu đồ mạng nhện 6 trục, thang 1-5. */
function Radar({ scores }: { scores: number[] }) {
  const cx = 180;
  const cy = 150;
  const radius = 92;
  const n = scores.length;
  const point = (index: number, ratio: number, extra = 0) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = radius * ratio + extra;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r] as const;
  };
  const ring = (level: number) => CORE_VALUES.map((_, i) => point(i, level / MAX_SCORE).join(',')).join(' ');
  const shape = scores.map((score, i) => point(i, score / MAX_SCORE).join(',')).join(' ');

  return (
    <svg className="pp-radar" viewBox="0 0 360 300" role="img" aria-label={`Biểu đồ giá trị: ${CORE_VALUES.map((v, i) => `${v.short} ${scores[i]}/5`).join(', ')}`}>
      {[1, 2, 3, 4, 5].map((level) => <polygon key={level} className="pp-radar-ring" points={ring(level)} />)}
      {CORE_VALUES.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} className="pp-radar-axis" x1={cx} y1={cy} x2={x} y2={y} />;
      })}
      <polygon className="pp-radar-shape" points={shape} />
      {scores.map((score, i) => {
        const [x, y] = point(i, score / MAX_SCORE);
        return <circle key={i} className="pp-radar-dot" cx={x} cy={y} r={4} />;
      })}
      {CORE_VALUES.map((value, i) => {
        const [x, y] = point(i, 1, 20);
        const anchor = Math.abs(x - cx) < 8 ? 'middle' : x > cx ? 'start' : 'end';
        return <text key={value.id} className="pp-radar-label" x={x} y={y + 4} textAnchor={anchor}>{value.short}</text>;
      })}
    </svg>
  );
}

function SelfAssessment({ personId, scores, setScores }: { personId: string; scores: Record<string, number>; setScores: (next: Record<string, number>) => void }) {
  return (
    <section className="pp-card pp-section" aria-label="Tự đánh giá giá trị cốt lõi">
      <SectionHeader title="Tự đánh giá giá trị cốt lõi" meta="Kéo thanh từ 1 đến 5 · lưu trên trình duyệt này · giá trị mẫu để demo" />
      <div className="pp-values">
        <Radar scores={CORE_VALUES.map((v) => scores[v.id] ?? 3)} />
        <ul className="pp-sliders">
          {CORE_VALUES.map((value) => {
            const score = scores[value.id] ?? 3;
            return (
              <li key={`${personId}-${value.id}`}>
                <div className="pp-slider-head"><span>{value.label}</span><strong>{score}/5</strong></div>
                <Slider min={1} max={MAX_SCORE} step={1} value={[score]} onValueChange={(v) => setScores({ ...scores, [value.id]: v[0] })} aria-label={`${value.label}: ${score} trên 5`} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function DiscQuiz({ personId }: { personId: string }) {
  const [answers, setAnswers] = useStoredState<DiscType[]>(`ikame.profile.disc.${personId}`, []);
  const total = DISC_QUESTIONS.length;
  const finished = answers.length >= total;
  const result = useMemo(() => {
    if (!finished) return undefined;
    const tally: Record<DiscType, number> = { D: 0, I: 0, S: 0, C: 0 };
    answers.forEach((type) => { tally[type] += 1; });
    const order: DiscType[] = ['D', 'I', 'S', 'C'];
    const top = order.reduce((best, type) => (tally[type] > tally[best] ? type : best), 'D' as DiscType);
    return { tally, top };
  }, [answers, finished]);
  const question = DISC_QUESTIONS[answers.length];

  return (
    <section className="pp-card pp-section" aria-label="Trắc nghiệm DISC nhanh">
      <SectionHeader title="DISC nhanh" meta={finished ? 'Kết quả của bạn' : `Câu ${answers.length + 1}/${total} · chọn đáp án giống bạn nhất`} />
      {!finished && question && (
        <div className="pp-quiz">
          <Progress size="sm" value={Math.round((answers.length / total) * 100)} aria-label={`Đã trả lời ${answers.length} trên ${total} câu`} />
          <h3>{question.prompt}</h3>
          <div className="pp-quiz-options" role="group" aria-label={question.prompt}>
            {question.options.map((option) => (
              <button key={option.type} type="button" className="pp-option" onClick={() => setAnswers([...answers, option.type])}>{option.text}</button>
            ))}
          </div>
          {answers.length > 0 && (
            <Button size="s" variant="borderless" icon={<ArrowLeft size={16} />} onClick={() => setAnswers(answers.slice(0, -1))}>Câu trước</Button>
          )}
        </div>
      )}
      {result && (
        <div className="pp-quiz-result">
          <div className="pp-disc-badge" aria-hidden="true">{result.top}</div>
          <div>
            <h3>{DISC_RESULT[result.top].name}</h3>
            <p>{DISC_RESULT[result.top].summary}</p>
            <p className="pp-muted">{DISC_RESULT[result.top].tips}</p>
          </div>
          <ul className="pp-disc-bars" aria-label="Điểm từng nhóm">
            {(['D', 'I', 'S', 'C'] as DiscType[]).map((type) => (
              <li key={type}><span>{type}</span><Progress size="sm" value={Math.round((result.tally[type] / total) * 100)} aria-label={`${type}: ${result.tally[type]} trên ${total}`} /><small>{result.tally[type]}</small></li>
            ))}
          </ul>
          <Button size="s" icon={<ArrowCounterClockwise size={16} />} onClick={() => setAnswers([])}>Làm lại</Button>
        </div>
      )}
    </section>
  );
}

function LearningPlan({ personId, scores }: { personId: string; scores: Record<string, number> }) {
  const [done, setDone] = useStoredState<string[]>(`ikame.profile.plan.${personId}`, []);
  // Hai giá trị thấp nhất (điểm bằng nhau giữ thứ tự gốc) → mỗi giá trị hai tuần.
  const lowest = useMemo(
    () => CORE_VALUES.map((value, index) => ({ value, index, score: scores[value.id] ?? 3 }))
      .sort((a, b) => a.score - b.score || a.index - b.index).slice(0, 2),
    [scores],
  );
  const weeks = lowest.flatMap(({ value }) => value.weeks.map((week, i) => ({ ...week, valueId: value.id, valueLabel: value.label, weekIdx: i })));
  const taskKey = (valueId: string, weekIdx: number, taskIdx: number) => `${valueId}:${weekIdx}:${taskIdx}`;
  const allKeys = weeks.flatMap((w) => w.tasks.map((_, t) => taskKey(w.valueId, w.weekIdx, t)));
  const doneCount = allKeys.filter((key) => done.includes(key)).length;
  const percent = allKeys.length ? Math.round((doneCount / allKeys.length) * 100) : 0;

  const toggle = (key: string, checked: boolean) => setDone(checked ? [...new Set([...done, key])] : done.filter((k) => k !== key));

  return (
    <section className="pp-card pp-section" aria-label="Kế hoạch học 4 tuần">
      <SectionHeader title="Kế hoạch học 4 tuần" meta={`Tập trung: ${lowest.map((l) => l.value.short).join(' và ')} · ${doneCount}/${allKeys.length} việc xong`} />
      <Progress size="sm" value={percent} aria-label={`Hoàn thành ${percent}% kế hoạch`} />
      <div className="pp-weeks">
        {weeks.map((week, index) => (
          <article key={`${week.valueId}-${week.weekIdx}`} className="pp-week">
            <header>
              <small>Tuần {index + 1} · {week.valueLabel}</small>
              <h3>{week.title}</h3>
            </header>
            <ul>
              {week.tasks.map((task, t) => {
                const key = taskKey(week.valueId, week.weekIdx, t);
                return <li key={key}><Checkbox label={task} checked={done.includes(key)} onCheckedChange={(v) => toggle(key, v === true)} /></li>;
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProfileGrowth({ personId }: { personId: string }) {
  const [scores, setScores] = useStoredState<Record<string, number>>(`ikame.profile.values.${personId}`, {});
  return (
    <div className="pp-stack">
      <SelfAssessment personId={personId} scores={scores} setScores={setScores} />
      <div className="pp-two">
        <DiscQuiz personId={personId} />
        <LearningPlan personId={personId} scores={scores} />
      </div>
    </div>
  );
}
