import { useMemo, useState } from 'react';
import { Input } from '@coreds/react';
import { CalendarBlankIcon as CalendarBlank, FolderSimpleIcon as FolderSimple, PlusIcon as Plus } from '@coreds/react/icons';
import { Button } from '../../components/UI';
import { dayLabel } from '../../data/work-dates';
import { parseQuickAdd } from './work-utils';

/** Ô thêm việc nhanh: hiểu "mai", "thứ 6", "dd/mm" và "#Dự án". */
export function QuickAdd({ projects, onAdd }: { projects: string[]; onAdd: (title: string, project: string, due?: string) => void }) {
  const [text, setText] = useState('');
  const parsed = useMemo(() => parseQuickAdd(text, projects), [text, projects]);

  const submit = () => {
    if (!parsed.title) return;
    onAdd(parsed.title, parsed.project ?? 'Cá nhân', parsed.due);
    setText('');
  };

  return (
    <form className="wk-quickadd" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="wk-quickadd-row">
        <Input
          size="l"
          variant="fill"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Thêm việc mới…"
          aria-label="Thêm việc mới"
          aria-describedby="wk-quickadd-hint"
        />
        <Button variant="primary" type="submit" icon={<Plus size={18} />} disabled={!parsed.title}>Thêm</Button>
      </div>
      <p className="wk-hint" id="wk-quickadd-hint">
        {text && parsed.title ? (
          <>
            <span className="wk-chip"><CalendarBlank size={14} aria-hidden="true" />{parsed.due ? dayLabel(parsed.due) : 'Không hạn'}</span>
            <span className="wk-chip"><FolderSimple size={14} aria-hidden="true" />{parsed.project ?? 'Cá nhân'}</span>
          </>
        ) : 'Gõ thử: "Gửi báo cáo thứ 6 #Core DS", "Đặt lịch review mai", "Soạn slide 20/11".'}
      </p>
    </form>
  );
}
