import { useEffect, useState } from 'react';
import { ArrowSquareOutIcon as ArrowSquareOut, BroomIcon as Broom, CheckCircleIcon as CheckCircle, ClockIcon as Clock } from '@coreds/react/icons';
import { Link } from 'react-router-dom';
import type { DigestItem } from '../../pages/assistant/daily-digest';
import { Button, ButtonLink, ChipButton, IconButton, TextButton } from '../UI';
import { trackFlow } from '../../lib/metrics/metrics';
import { homeActions, isSnoozed, useHomeState } from './home-store';
import { SnoozeMenu } from './SnoozeMenu';
import { TriageModal } from './TriageModal';
import { actionLabel, byUrgency, isToday, metaOf } from './task-utils';
import { useTaskActions } from './use-task-actions';

/**
 * "Cần làm ngay" trên Trang chủ. Hai nhóm: "Nên làm hôm nay" và "Có thể để sau". Mỗi dòng có MỘT nút
 * gọi đúng tên hành động và menu hoãn (chiều nay, sáng mai, Thứ Hai tới, bỏ qua) — không đổi dữ liệu
 * ở công cụ gốc. "Dọn việc" mở hộp thoại xử lý từng thẻ.
 */
export type TaskSuggestion = { id: string; kicker: string; title: string; meta: string; to: string; cta: string };

const LATER_VISIBLE = 3;

export function TodayTasks({ items, sourceNote, askHref, suggestions = [], now }: {
  items: DigestItem[];
  sourceNote: string;
  askHref: string;
  suggestions?: TaskSuggestion[];
  now: Date;
}) {
  const home = useHomeState();
  const actions = useTaskActions();
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [laterExpanded, setLaterExpanded] = useState(false);
  const [triage, setTriage] = useState(false);
  // Có việc đang chờ = bắt đầu luồng; bấm vào một hành động = làm xong luồng.
  useEffect(() => { if (items.length > 0) trackFlow('today', 'start'); }, [items.length]);

  const stamp = now.getTime();
  const open = byUrgency(items.filter((item) => !isSnoozed(home, item.id, stamp)));
  const pending = open.filter((item) => !home.handled.includes(item.id));
  const urgent = open.filter((item) => item.urgent).length;
  const snoozedCount = items.length - open.length;
  const filtered = onlyUrgent && urgent > 0 ? open.filter((item) => item.urgent) : open;
  const todayGroup = filtered.filter(isToday);
  const laterGroup = filtered.filter((item) => !isToday(item));
  const laterShown = laterExpanded ? laterGroup : laterGroup.slice(0, LATER_VISIBLE);
  const laterHidden = laterGroup.length - laterShown.length;

  const renderRow = (item: DigestItem) => {
    const handled = home.handled.includes(item.id);
    return (
      <li key={item.id} className={`today-task ${item.urgent ? 'is-urgent' : ''} ${handled ? 'is-handled' : ''}`} data-source={item.source}>
        <div className="today-task-copy">
          <strong>{item.label}</strong>
          <span><b>{item.source}</b>{metaOf(item)}{item.urgent && <em>Gấp</em>}{handled && <i>Đã mở</i>}</span>
        </div>
        {item.href
          ? <ButtonLink onClick={() => actions.open(item)} variant="dim" size="m" href={item.href}>{actionLabel(item)}<ArrowSquareOut size={14} aria-hidden="true" /></ButtonLink>
          : <ButtonLink onClick={() => actions.open(item)} variant="dim" size="m" to={item.to}>{actionLabel(item)}</ButtonLink>}
        <SnoozeMenu
          now={now}
          onPick={(option) => actions.snooze(item, option)}
          trigger={<IconButton label={`Hoãn: ${item.label}`}><Clock size={16} aria-hidden="true" /></IconButton>}
        />
      </li>
    );
  };

  return (
    <section className="today-tasks" aria-labelledby="today-tasks-title">
      <header className="today-tasks-head">
        <div>
          <h2 id="today-tasks-title">Cần làm ngay</h2>
          <p>{open.length === 0 ? 'Không còn việc nào đang chờ bạn' : `${pending.length} việc chờ bạn${urgent > 0 ? `, ${urgent} việc gấp lên đầu` : ''}`}</p>
        </div>
        <div className="today-tasks-head-actions">
          <Link className="text-link" to={askHref}>Hỏi Trợ lý AI</Link>
          <Button variant="primary" size="m" icon={<Broom size={16} aria-hidden="true" />} disabled={pending.length === 0} onClick={() => setTriage(true)}>Dọn việc</Button>
        </div>
      </header>

      {urgent > 0 && urgent < open.length && (
        <div className="today-tasks-filter" role="group" aria-label="Lọc việc">
          <ChipButton aria-pressed={!onlyUrgent} onClick={() => setOnlyUrgent(false)}>Tất cả <span>{open.length}</span></ChipButton>
          <ChipButton aria-pressed={onlyUrgent} onClick={() => setOnlyUrgent(true)}>Gấp <span>{urgent}</span></ChipButton>
        </div>
      )}

      {open.length === 0 ? (
        <div className="today-tasks-empty">
          <CheckCircle size={22} variant="duotone" aria-hidden="true" />
          <div><strong>Bạn đã xử lý hết việc hôm nay</strong><span>Việc mới sẽ hiện ở đây khi có.</span></div>
        </div>
      ) : (
        <>
          {todayGroup.length > 0 && (
            <div className="today-group">
              <h3 className="today-group-title">Nên làm hôm nay <span>{todayGroup.length}</span></h3>
              <ul className="today-tasks-list">{todayGroup.map(renderRow)}</ul>
            </div>
          )}
          {laterGroup.length > 0 && (
            <div className="today-group">
              <h3 className="today-group-title">Có thể để sau <span>{laterGroup.length}</span></h3>
              <ul className="today-tasks-list">{laterShown.map(renderRow)}</ul>
              {laterHidden > 0 && <div className="today-group-more"><TextButton onClick={() => setLaterExpanded(true)}>Xem thêm {laterHidden} việc</TextButton></div>}
              {laterExpanded && laterGroup.length > LATER_VISIBLE && <div className="today-group-more"><TextButton onClick={() => setLaterExpanded(false)}>Thu gọn</TextButton></div>}
            </div>
          )}
        </>
      )}

      {suggestions.length > 0 && (
        <div className="today-suggest">
          <h3 className="today-group-title">Gợi ý khi rảnh</h3>
          <div className="today-suggest-grid">
            {suggestions.map((suggestion) => (
              <Link key={suggestion.id} className="today-suggest-card" to={suggestion.to}>
                <small>{suggestion.kicker}</small>
                <strong>{suggestion.title}</strong>
                <span>{suggestion.meta}</span>
                <em>{suggestion.cta}</em>
              </Link>
            ))}
          </div>
        </div>
      )}

      <footer className="today-tasks-foot">
        <span>{sourceNote}</span>
        {snoozedCount > 0 && <TextButton onClick={() => homeActions.clearSnoozed()}>Hiện lại {snoozedCount} việc đã hoãn</TextButton>}
      </footer>

      {triage && <TriageModal items={pending} onClose={() => setTriage(false)} />}
    </section>
  );
}
