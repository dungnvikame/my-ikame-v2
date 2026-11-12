import { useState } from 'react';
import { Avatar, Field, Select } from '@coreds/react';
import { HeartIcon as Heart, TrashIcon as Trash } from '@coreds/react/icons';
import { useAppState } from '../../AppState';
import { Button, EmptyState, IconButton, SectionHeader } from '../../components/UI';
import { useToast } from '../../components/toast';
import { KUDOS_SUGGESTIONS, celebPeople, initials, seedKudos, type Kudos } from '../../data/people-celebrations';
import { useStoredState } from '../profile/useStoredState';
import { WishComposer } from './WishComposer';

const timeLabel = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** Bức tường cảm ơn nhỏ: lời cảm ơn mẫu + lời của người xem (lưu trên trình duyệt). */
export function KudosWall() {
  const { user } = useAppState();
  const { showToast } = useToast();
  const [mine, setMine] = useStoredState<Kudos[]>(`ikame.people.kudos.${user.personId}`, []);
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState('');
  const items = [...mine, ...seedKudos].sort((a, b) => b.at.localeCompare(a.at));
  const recipients = celebPeople.map((person) => ({ value: person.name, label: `${person.name} · ${person.team}` }));

  const send = (text: string) => {
    setMine([{ id: `k-${Date.now()}`, from: user.name, to, text, at: new Date().toISOString(), mine: true }, ...mine]);
    setOpen(false);
    setTo('');
    showToast(`Đã gửi lời cảm ơn tới ${to}.`);
  };

  return (
    <section className="pp-card pp-section" aria-label="Lời cảm ơn">
      <SectionHeader title="Lời cảm ơn" meta="Một câu cảm ơn làm ngày của ai đó tốt hơn" />
      <div className="pp-section-actions">
        <Button variant="primary" size="m" icon={<Heart size={18} />} onClick={() => setOpen(true)}>Gửi lời cảm ơn</Button>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={<Heart size={44} variant="duotone" />} title="Chưa có lời cảm ơn nào" body="Hãy là người đầu tiên cảm ơn một đồng nghiệp." />
      ) : (
        <ul className="pp-kudos">
          {items.map((item) => (
            <li key={item.id}>
              <Avatar type="text" size="m" fallback={initials(item.from)} alt={item.from} />
              <div>
                <p><strong>{item.from}</strong> cảm ơn <strong>{item.to}</strong></p>
                <blockquote>{item.text}</blockquote>
                <small>{timeLabel(item.at)}</small>
              </div>
              {item.mine && <IconButton label="Xoá lời cảm ơn" onClick={() => { setMine(mine.filter((k) => k.id !== item.id)); showToast('Đã xoá lời cảm ơn.'); }}><Trash size={16} /></IconButton>}
            </li>
          ))}
        </ul>
      )}
      <WishComposer
        open={open}
        onClose={() => setOpen(false)}
        title="Gửi lời cảm ơn"
        description="Lời cảm ơn hiện công khai trên bức tường này, kèm tên của bạn."
        suggestions={KUDOS_SUGGESTIONS}
        confirmLabel="Gửi lời cảm ơn"
        canSubmit={Boolean(to)}
        header={(
          <Field label="Người nhận">
            <Select options={recipients} value={to} onValueChange={(v) => setTo(String(v))} placeholder="Chọn đồng nghiệp" searchable size="m" />
          </Field>
        )}
        onConfirm={send}
      />
    </section>
  );
}
