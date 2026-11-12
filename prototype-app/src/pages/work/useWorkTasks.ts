import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PROJECTS, loadTasks, newId, saveTasks, type WorkTask } from '../../data/work-tasks';
import { todayYmd } from '../../data/work-dates';

/** Danh sách việc của tôi, lưu localStorage. */
export function useWorkTasks() {
  const [tasks, setTasks] = useState<WorkTask[]>(loadTasks);
  useEffect(() => { saveTasks(tasks); }, [tasks]);

  const patch = useCallback((ids: string[], fn: (t: WorkTask) => WorkTask) => {
    setTasks((prev) => prev.map((t) => (ids.includes(t.id) ? fn(t) : t)));
  }, []);

  const setDone = useCallback((ids: string[], done: boolean) => {
    patch(ids, (t) => ({ ...t, done, doneAt: done ? todayYmd() : undefined }));
  }, [patch]);

  const setDue = useCallback((ids: string[], due: string | undefined) => {
    patch(ids, (t) => ({ ...t, due, scheduledAt: undefined }));
  }, [patch]);

  const add = useCallback((title: string, project: string, due?: string) => {
    const task: WorkTask = { id: newId(), title, project, due, subtasks: [], done: false };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const update = useCallback((task: WorkTask) => setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t))), []);
  const remove = useCallback((id: string) => setTasks((prev) => prev.filter((t) => t.id !== id)), []);
  const restore = useCallback((task: WorkTask) => setTasks((prev) => (prev.some((t) => t.id === task.id) ? prev : [task, ...prev])), []);

  const projects = useMemo(() => {
    const set = new Set(DEFAULT_PROJECTS);
    tasks.forEach((t) => set.add(t.project));
    return [...set];
  }, [tasks]);

  return { tasks, projects, setDone, setDue, add, update, remove, restore, patch };
}

export type WorkTasksApi = ReturnType<typeof useWorkTasks>;
