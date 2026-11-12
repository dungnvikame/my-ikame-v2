import { Modal } from '@coreds/react';
import { Link } from 'react-router-dom';
import type { DigestItem } from '../../pages/assistant/daily-digest';
import { ButtonLink, Button } from '../UI';
import type { TimelineMeeting } from './DayTimeline';
import { startsInLabel } from './NextMeetingCard';
import { actionLabel, hhmm, metaOf, type Slot } from './task-utils';
import { useTaskActions } from './use-task-actions';

export type BriefProps = {
  name: string;
  greeting: string;
  /** Việc còn chờ, đã sắp theo độ gấp. */
  tasks: DigestItem[];
  nextMeeting?: TimelineMeeting;
  focusSlot?: Slot;
  newsNote?: { id: string; title: string };
  now: Date;
  onClose: () => void;
};

/** "Bản tin 30 giây": tóm tắt theo luật (không dùng LLM) — việc nên làm trước, giờ tập trung, họp kế tiếp, một dòng tin. */
export function BriefModal({ name, greeting, tasks, nextMeeting, focusSlot, newsNote, now, onClose }: BriefProps) {
  const actions = useTaskActions();
  const top = tasks.slice(0, 3);
  const urgent = tasks.filter((task) => task.urgent).length;

  return (
    <Modal
      open
      onOpenChange={(open) => { if (!open) onClose(); }}
      size="md"
      title="Bản tin 30 giây"
      description={`${greeting} ${name}. ${tasks.length === 0 ? 'Bạn không còn việc nào đang chờ.' : `Còn ${tasks.length} việc, ${urgent} việc gấp.`}`}
      footer={<Button variant="primary" onClick={onClose}>Bắt đầu ngày mới</Button>}
    >
      <div className="brief">
        <section aria-labelledby="brief-tasks">
          <h3 id="brief-tasks">{top.length > 0 ? `${top.length} việc nên làm trước` : 'Việc cần làm'}</h3>
          {top.length === 0 ? <p className="brief-muted">Không có việc nào cần bạn xử lý. Một ngày nhẹ nhàng.</p> : (
            <ol className="brief-tasks">
              {top.map((task) => (
                <li key={task.id}>
                  <div>
                    <strong>{task.label}</strong>
                    <span>{task.source}{metaOf(task) ? ` · ${metaOf(task)}` : ''}{task.urgent ? ' · Gấp' : ''}</span>
                  </div>
                  {task.href
                    ? <ButtonLink variant="dim" size="s" href={task.href} onClick={() => actions.open(task)}>{actionLabel(task)}</ButtonLink>
                    : <ButtonLink variant="dim" size="s" to={task.to} onClick={() => { actions.open(task); onClose(); }}>{actionLabel(task)}</ButtonLink>}
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="brief-row" aria-label="Lịch hôm nay">
          <div>
            <h3>Giờ tập trung</h3>
            <p>{focusSlot ? `Nên dành ${hhmm(focusSlot.start)}–${hhmm(focusSlot.end)} để làm việc sâu, không bị cuộc họp chen vào.` : 'Hôm nay lịch kín, hãy giữ ít việc nhưng chắc.'}</p>
          </div>
          <div>
            <h3>Họp kế tiếp</h3>
            <p>{nextMeeting ? `${nextMeeting.title}. ${startsInLabel(nextMeeting, now)}, ${hhmm(nextMeeting.start)}–${hhmm(nextMeeting.end)}.` : 'Không còn cuộc họp nào hôm nay.'}</p>
          </div>
        </section>

        {newsNote && (
          <p className="brief-news">Tin đáng đọc: <Link to={`/feed/article/${newsNote.id}`} onClick={onClose}>{newsNote.title}</Link></p>
        )}
      </div>
    </Modal>
  );
}
