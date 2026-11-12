import { useMemo, useState } from 'react';
import { Avatar, SegmentedControl, Textarea } from '@coreds/react';
import { CakeIcon as Cake, ConfettiIcon as Confetti, HandWavingIcon as HandWaving, PencilSimpleIcon as PencilSimple, TrashIcon as Trash, UserPlusIcon as UserPlus } from '@coreds/react/icons';
import { useAppState } from '../AppState';
import { Button, EmptyState, SectionHeader, StatusPill, TextButton } from '../components/UI';
import { useToast } from '../components/toast';
import {
  BIRTHDAY_SUGGESTIONS, WELCOME_SUGGESTIONS, anniversarySuggestions, buildCelebEvents, celebPeople, daysFromToday, dmLabel,
  initials, newJoiners, type BirthdayVisibility, type CelebEvent, type CelebPerson,
} from '../data/people-celebrations';
import { DEMO_TODAY } from '../data/profile-extras';
import { useStoredState } from './profile/useStoredState';
import { KudosWall } from './people/KudosWall';
import { WishComposer } from './people/WishComposer';

type WishKind = 'birthday' | 'anniversary' | 'welcome';
type Wish = { id: string; toId: string; toName: string; kind: WishKind; text: string; at: string };
type Target = { person: CelebPerson; kind: WishKind; years?: number };
type Period = 'week' | 'month';

const KIND_LABEL: Record<WishKind, string> = { birthday: 'Sinh nhật', anniversary: 'Tròn năm làm việc', welcome: 'Chào mừng' };
const CONSENT_OPTIONS: { value: BirthdayVisibility; label: string }[] = [
  { value: 'team', label: 'Cho team' },
  { value: 'company', label: 'Toàn công ty' },
  { value: 'none', label: 'Không' },
];

const timeLabel = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return Number.isNaN(d.getTime()) ? '' : `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

function relativeLabel(date: Date): string {
  const diff = daysFromToday(date);
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Ngày mai';
  return diff > 1 ? `Còn ${diff} ngày` : 'Đã qua';
}

const eventTitle = (event: CelebEvent) => (event.kind === 'birthday' ? 'Sinh nhật' : `Tròn ${event.years} năm`);

export function PeoplePage() {
  const { user } = useAppState();
  const { showToast } = useToast();
  const [consent, setConsent] = useStoredState<BirthdayVisibility | null>(`ikame.people.consent.${user.personId}`, null);
  const [changingConsent, setChangingConsent] = useState(false);
  const [wishes, setWishes] = useStoredState<Wish[]>(`ikame.people.wishes.${user.personId}`, []);
  const [period, setPeriod] = useState<Period>('week');
  const [target, setTarget] = useState<Target | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const events = useMemo(() => buildCelebEvents(), []);
  const joiners = useMemo(() => newJoiners(), []);
  const today = DEMO_TODAY;

  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  const inPeriod = (date: Date) => (period === 'week'
    ? date >= monday && date <= new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59)
    : date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear());
  const listed = events.filter((event) => inPeriod(event.date));
  const highlights = events.filter((event) => daysFromToday(event.date) === 0);
  const wished = (personId: string, kind: WishKind) => wishes.some((wish) => wish.toId === personId && wish.kind === kind);

  const suggestions = !target ? [] : target.kind === 'birthday' ? BIRTHDAY_SUGGESTIONS : target.kind === 'welcome' ? WELCOME_SUGGESTIONS : anniversarySuggestions(target.years);

  const post = (text: string) => {
    if (!target) return;
    setWishes([{ id: `w-${Date.now()}`, toId: target.person.id, toName: target.person.name, kind: target.kind, text, at: new Date().toISOString() }, ...wishes]);
    showToast(`Đã đăng lời chúc tới ${target.person.name} lên iCOM.`);
    setTarget(null);
  };

  const saveEdit = () => {
    const text = editText.trim();
    if (!text || !editingId) return;
    setWishes(wishes.map((wish) => (wish.id === editingId ? { ...wish, text } : wish)));
    setEditingId(null);
    showToast('Đã cập nhật lời chúc.');
  };

  const consentLabel = CONSENT_OPTIONS.find((option) => option.value === consent)?.label;

  return (
    <div className="page pp-page pp-people">
      <header className="pp-page-head">
        <h1>Gắn kết</h1>
        <p>Chúc mừng sinh nhật, đón người mới và gửi lời cảm ơn tới đồng nghiệp.</p>
      </header>

      {(consent === null || changingConsent) ? (
        <section className="pp-card pp-consent" aria-label="Chia sẻ sinh nhật">
          <div>
            <h2>Bạn có muốn đồng nghiệp chúc mừng sinh nhật của mình không?</h2>
            <p>Chỉ hiện ngày và tháng. Bạn có thể đổi lựa chọn bất cứ lúc nào.</p>
          </div>
          <div className="pp-consent-actions" role="group" aria-label="Ai được thấy sinh nhật của bạn">
            {CONSENT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={consent === option.value ? 'primary' : 'dim'}
                size="m"
                aria-pressed={consent === option.value}
                onClick={() => { setConsent(option.value); setChangingConsent(false); showToast(`Đã lưu: ${option.label}.`); }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </section>
      ) : (
        <p className="pp-consent-note">
          Sinh nhật của bạn đang chia sẻ: <strong>{consentLabel}</strong>.
          <TextButton onClick={() => setChangingConsent(true)}>Đổi lựa chọn</TextButton>
        </p>
      )}

      <section aria-label="Nổi bật hôm nay" className="pp-today">
        <SectionHeader title="Hôm nay" meta={`${dmLabel(today)} · ${highlights.length} dịp đáng mừng`} />
        {highlights.length === 0 ? (
          <div className="pp-card"><EmptyState icon={<Confetti size={44} variant="duotone" />} title="Hôm nay chưa có dịp đặc biệt" body="Xem danh sách sắp tới bên dưới để chuẩn bị lời chúc." /></div>
        ) : (
          <div className="pp-today-grid">
            {highlights.map((event) => (
              <article key={event.id} className="pp-card pp-celebrate">
                <span className="pp-confetti" aria-hidden="true" />
                <Avatar type="text" size="xl" fallback={initials(event.person.name)} alt={event.person.name} />
                <div>
                  <small>{event.kind === 'birthday' ? 'Sinh nhật hôm nay' : 'Tròn năm làm việc'}</small>
                  <h3>{event.person.name}</h3>
                  <p>{event.person.team} · {event.kind === 'birthday' ? 'Chúc mừng sinh nhật!' : `Tròn ${event.years} năm cùng iKame`}</p>
                </div>
                {wished(event.person.id, event.kind) ? <StatusPill tone="success">Đã chúc</StatusPill> : (
                  <Button variant="primary" size="m" icon={<Confetti size={18} />} onClick={() => setTarget({ person: event.person, kind: event.kind, years: event.years })}>Gửi lời chúc</Button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="pp-people-grid">
        <div className="pp-stack">
          <section className="pp-card pp-section" aria-label="Sinh nhật và ngày vào làm">
            <SectionHeader title="Sinh nhật và ngày vào làm" meta={period === 'week' ? `Tuần ${dmLabel(monday)} – ${dmLabel(sunday)}` : `Tháng ${today.getMonth() + 1}/${today.getFullYear()}`} />
            <SegmentedControl
              aria-label="Khoảng thời gian"
              size="s"
              options={[{ value: 'week', label: 'Tuần này' }, { value: 'month', label: 'Tháng này' }]}
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
            />
            {listed.length === 0 ? (
              <EmptyState icon={<Cake size={44} variant="duotone" />} title="Chưa có dịp nào" body="Khi có sinh nhật hoặc ngày vào làm trong khoảng này, bạn sẽ thấy ở đây." />
            ) : (
              <ul className="pp-celeb-list">
                {listed.map((event) => {
                  const diff = daysFromToday(event.date);
                  return (
                    <li key={event.id} className={diff < 0 ? 'is-past' : undefined}>
                      <Avatar type="text" size="m" fallback={initials(event.person.name)} alt={event.person.name} />
                      <div>
                        <strong>{event.person.name}</strong>
                        <small>{event.person.team} · {eventTitle(event)} · {dmLabel(event.date)}</small>
                      </div>
                      <span className={`pp-rel${diff === 0 ? ' is-today' : ''}`}>{relativeLabel(event.date)}</span>
                      {wished(event.person.id, event.kind)
                        ? <StatusPill tone="success">Đã chúc</StatusPill>
                        : <Button size="s" onClick={() => setTarget({ person: event.person, kind: event.kind, years: event.years })}>Gửi lời chúc</Button>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="pp-card pp-section" aria-label="Lời chúc đã gửi">
            <SectionHeader title="Lời chúc đã gửi" meta={`${wishes.length} lời chúc trên iCOM`} />
            {wishes.length === 0 ? (
              <EmptyState icon={<HandWaving size={44} variant="duotone" />} title="Bạn chưa gửi lời chúc nào" body="Lời chúc đã đăng lên iCOM sẽ hiện ở đây để bạn sửa hoặc xoá." />
            ) : (
              <ul className="pp-wishes">
                {wishes.map((wish) => (
                  <li key={wish.id}>
                    <small>Gửi tới <strong>{wish.toName}</strong> · {KIND_LABEL[wish.kind]} · {timeLabel(wish.at)}</small>
                    {editingId === wish.id ? (
                      <div className="pp-edit">
                        <Textarea variant="fill" minRows={3} maxLength={400} value={editText} onChange={(event) => setEditText(event.target.value)} aria-label="Sửa lời chúc" />
                        <div className="pp-edit-actions">
                          <Button size="s" variant="primary" disabled={!editText.trim()} onClick={saveEdit}>Lưu</Button>
                          <Button size="s" variant="borderless" onClick={() => setEditingId(null)}>Huỷ</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p>{wish.text}</p>
                        <div className="pp-edit-actions">
                          <Button size="s" variant="borderless" icon={<PencilSimple size={16} />} onClick={() => { setEditingId(wish.id); setEditText(wish.text); }}>Sửa</Button>
                          <Button size="s" variant="borderless" icon={<Trash size={16} />} onClick={() => { setWishes(wishes.filter((w) => w.id !== wish.id)); showToast('Đã xoá lời chúc.'); }}>Xoá</Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="pp-stack">
          <section className="pp-card pp-section" aria-label="Người mới tháng này">
            <SectionHeader title="Người mới tháng này" meta={`${joiners.length} đồng nghiệp mới`} />
            {joiners.length === 0 ? (
              <EmptyState icon={<UserPlus size={44} variant="duotone" />} title="Tháng này chưa có người mới" body="Khi có đồng nghiệp mới vào, bạn có thể gửi lời chào ngay tại đây." />
            ) : (
              <ul className="pp-joiners">
                {joiners.map((person) => (
                  <li key={person.id}>
                    <Avatar type="text" size="l" fallback={initials(person.name)} alt={person.name} />
                    <strong>{person.name}</strong>
                    <small>{person.team}</small>
                    <small>Vào làm {person.joinedAt.slice(0, 5)}</small>
                    {wished(person.id, 'welcome')
                      ? <StatusPill tone="success">Đã chào</StatusPill>
                      : <Button size="s" icon={<HandWaving size={16} />} onClick={() => setTarget({ person, kind: 'welcome' })}>Chào mừng</Button>}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <KudosWall />
        </div>
      </div>

      <WishComposer
        open={target !== null}
        onClose={() => setTarget(null)}
        title={target ? (target.kind === 'welcome' ? `Chào mừng ${target.person.name}` : `Gửi lời chúc tới ${target.person.name}`) : 'Gửi lời chúc'}
        description="Lời chúc đăng công khai trên iCOM, kèm tên của bạn."
        suggestions={suggestions}
        confirmLabel="Đăng lên iCOM"
        onConfirm={post}
      />
    </div>
  );
}
