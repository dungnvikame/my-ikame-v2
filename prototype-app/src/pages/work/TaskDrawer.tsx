import { useState } from 'react';
import { Checkbox, Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, Input, Textarea } from '@coreds/react';
import { PlusIcon as Plus, TrashIcon as Trash, XIcon as X } from '@coreds/react/icons';
import { Button, IconButton } from '../../components/UI';
import { useToast } from '../../components/toast';
import { newId, type Subtask, type WorkTask } from '../../data/work-tasks';
import type { WorkTasksApi } from './useWorkTasks';

/** Ngăn chi tiết việc: sửa tiêu đề, hạn, dự án, ghi chú và chia nhỏ thành các bước. */
export function TaskDrawer({ task, api, onClose }: { task: WorkTask; api: WorkTasksApi; onClose: () => void }) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState<WorkTask>(task);
  const [step, setStep] = useState('');
  const patch = (p: Partial<WorkTask>) => setDraft((d) => ({ ...d, ...p }));
  const setSubs = (fn: (s: Subtask[]) => Subtask[]) => setDraft((d) => ({ ...d, subtasks: fn(d.subtasks) }));

  const addStep = () => {
    const title = step.trim();
    if (!title) return;
    setSubs((s) => [...s, { id: newId(), title, done: false }]);
    setStep('');
  };

  const save = () => {
    const title = draft.title.trim();
    if (!title) { showToast('Tiêu đề việc không được để trống'); return; }
    api.update({ ...draft, title, project: draft.project.trim() || 'Cá nhân', due: draft.due || undefined });
    showToast('Đã lưu việc');
    onClose();
  };

  const remove = () => {
    api.remove(task.id);
    onClose();
    showToast(`Đã xoá "${task.title}"`, { label: 'Hoàn tác', onClick: () => api.restore(task) });
  };

  return (
    <Drawer open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerContent side="right" className="wk-drawer">
        <DrawerHeader>
          <div>
            <DrawerTitle>Chi tiết việc</DrawerTitle>
            <DrawerDescription>Chỉnh hạn, ghi chú và chia nhỏ thành các bước.</DrawerDescription>
          </div>
          <DrawerClose asChild><IconButton label="Đóng"><X size={20} /></IconButton></DrawerClose>
        </DrawerHeader>
        <DrawerBody>
          <form className="wk-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <label className="wk-field"><span>Tiêu đề</span>
              <Input size="l" variant="fill" value={draft.title} onChange={(e) => patch({ title: e.target.value })} required />
            </label>
            <div className="wk-field-row">
              <label className="wk-field"><span>Hạn</span>
                <Input size="l" variant="fill" type="date" value={draft.due ?? ''} onChange={(e) => patch({ due: e.target.value || undefined })} />
              </label>
              <label className="wk-field"><span>Dự án</span>
                <Input size="l" variant="fill" list="wk-projects" value={draft.project} onChange={(e) => patch({ project: e.target.value })} />
                <datalist id="wk-projects">{api.projects.map((p) => <option key={p} value={p} />)}</datalist>
              </label>
            </div>
            <label className="wk-field"><span>Ghi chú</span>
              <Textarea variant="fill" minRows={3} value={draft.notes ?? ''} onChange={(e) => patch({ notes: e.target.value })} placeholder="Bối cảnh, link tài liệu, việc cần hỏi ai…" />
            </label>

            <fieldset className="wk-field wk-steps">
              <legend>Chia nhỏ thành các bước</legend>
              {draft.subtasks.length === 0 && <p className="wk-muted">Chưa có bước nào. Chia nhỏ giúp việc lớn dễ bắt đầu hơn.</p>}
              <ul>
                {draft.subtasks.map((s) => (
                  <li key={s.id}>
                    <Checkbox aria-label={`Bước "${s.title}" đã xong`} checked={s.done} onCheckedChange={(v) => setSubs((list) => list.map((x) => (x.id === s.id ? { ...x, done: v === true } : x)))} />
                    <span data-done={s.done || undefined}>{s.title}</span>
                    <IconButton label={`Xoá bước "${s.title}"`} onClick={() => setSubs((list) => list.filter((x) => x.id !== s.id))}><Trash size={16} /></IconButton>
                  </li>
                ))}
              </ul>
              <div className="wk-step-add">
                <Input
                  size="m"
                  variant="fill"
                  value={step}
                  onChange={(e) => setStep(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStep(); } }}
                  placeholder="Thêm bước…"
                  aria-label="Thêm bước"
                />
                <Button variant="dim" size="m" icon={<Plus size={16} />} disabled={!step.trim()} onClick={addStep}>Thêm</Button>
              </div>
            </fieldset>

            <div className="wk-form-actions">
              <Button variant="danger" size="m" icon={<Trash size={16} />} onClick={remove}>Xoá</Button>
              <Button variant="primary" type="submit">Lưu</Button>
            </div>
          </form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
