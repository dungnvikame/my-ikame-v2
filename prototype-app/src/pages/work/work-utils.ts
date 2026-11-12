import { addDays, dayLabel, diffDays, dm, fold, parseDayWord, startOfWeek, todayYmd } from '../../data/work-dates';
import type { WorkTask } from '../../data/work-tasks';

export type QuickParse = { title: string; due?: string; project?: string };

/** Tách "mai", "thứ 6", "dd/mm" và "#Dự án" khỏi câu nhập nhanh. */
export function parseQuickAdd(input: string, projects: string[]): QuickParse {
  let text = input;
  let project: string | undefined;

  const f = fold(text);
  const known = [...projects].sort((a, b) => b.length - a.length).find((p) => f.includes(`#${fold(p)}`));
  if (known) {
    const i = f.indexOf(`#${fold(known)}`);
    text = text.slice(0, i) + text.slice(i + known.length + 1);
    project = known;
  } else {
    const m = /#(\S+)/.exec(text);
    if (m) {
      project = m[1].replace(/_/g, ' ');
      text = text.replace(m[0], '');
    }
  }

  const day = parseDayWord(text);
  if (day) text = text.slice(0, day.start) + text.slice(day.end);
  return { title: text.replace(/\s+/g, ' ').trim(), due: day?.date, project };
}

export type DueGroupKey = 'overdue' | 'today' | 'week' | 'later' | 'none';

export const DUE_GROUPS: { key: DueGroupKey; label: string }[] = [
  { key: 'overdue', label: 'Quá hạn' },
  { key: 'today', label: 'Hôm nay' },
  { key: 'week', label: 'Tuần này' },
  { key: 'later', label: 'Sau' },
  { key: 'none', label: 'Không hạn' },
];

export function dueGroupOf(task: WorkTask, today = todayYmd()): DueGroupKey {
  if (!task.due) return 'none';
  if (task.due < today) return 'overdue';
  if (task.due === today) return 'today';
  const weekEnd = addDays(startOfWeek(today), 6);
  return task.due <= weekEnd ? 'week' : 'later';
}

export const byDue = (a: WorkTask, b: WorkTask) => (a.due ?? '9999').localeCompare(b.due ?? '9999');

export function dueText(task: WorkTask, today = todayYmd()): string {
  if (!task.due) return 'Không hạn';
  const diff = diffDays(task.due, today);
  if (diff < 0) return `Quá hạn ${-diff} ngày`;
  return diff <= 1 ? dayLabel(task.due, today) : `${dayLabel(task.due, today)}`;
}

export const dueShort = (due: string) => dm(due);

/** Việc nên làm tiếp: quá hạn (lâu nhất trước) → hạn gần nhất → không hạn. */
export function pickNext(tasks: WorkTask[], skipped: string[]): WorkTask | null {
  const open = tasks.filter((t) => !t.done).sort(byDue);
  return open.find((t) => !skipped.includes(t.id)) ?? null;
}

export function nextReason(task: WorkTask, today = todayYmd()): string {
  if (!task.due) return `Chưa có hạn nhưng thuộc dự án ${task.project}, làm trước để nhẹ đầu.`;
  const diff = diffDays(task.due, today);
  if (diff < 0) return `Vì quá hạn ${-diff} ngày, thuộc dự án ${task.project}.`;
  if (diff === 0) return `Vì hạn là hôm nay, thuộc dự án ${task.project}.`;
  return `Vì hạn gần nhất (${diff === 1 ? 'ngày mai' : `sau ${diff} ngày`}), thuộc dự án ${task.project}.`;
}

/** Số việc xong mỗi ngày, n ngày gần nhất (cũ → mới, kết thúc ở hôm nay). */
export function doneCounts(tasks: WorkTask[], n = 5, today = todayYmd()) {
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(today, i - (n - 1));
    return { date, count: tasks.filter((t) => t.done && t.doneAt === date).length };
  });
}

export function doneThisWeek(tasks: WorkTask[], today = todayYmd()): number {
  const from = startOfWeek(today);
  return tasks.filter((t) => t.done && t.doneAt && t.doneAt >= from && t.doneAt <= today).length;
}

export function summaryLine(tasks: WorkTask[], today = todayYmd()): string {
  const open = tasks.filter((t) => !t.done);
  const overdue = open.filter((t) => t.due && t.due < today).length;
  const soon = open.filter((t) => t.due && t.due >= today && diffDays(t.due, today) <= 7).length;
  return `${overdue} quá hạn, ${soon} việc trong 7 ngày tới. Tuần này bạn đã xong ${doneThisWeek(tasks, today)} việc.`;
}
