import { CheckCircleIcon as CheckCircle, InfoIcon as Info, SealCheckIcon as SealCheck, SunIcon as Sun, WarningCircleIcon as WarningCircle } from '@coreds/react/icons';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { Tabs } from '../components/Tabs';
import { Button, EmptyState } from '../components/UI';
import type { NotificationItem } from '../types';
import { NotificationSettings } from './notifications/NotificationSettings';

type TabKey = 'all' | 'todo' | 'read' | 'settings';

const BUCKET_ORDER = ['Hôm nay', 'Hôm qua', 'Vài ngày trước', 'Trước đó'];

function dayBucket(time: string): string {
  if (/phút|giờ|vừa xong|hôm nay/i.test(time)) return 'Hôm nay';
  if (/Hôm qua/.test(time)) return 'Hôm qua';
  if (/ngày/.test(time)) return 'Vài ngày trước';
  return 'Trước đó';
}

function isTodo(item: NotificationItem) {
  return (item.priority === 'critical' || item.priority === 'required') && !item.read;
}

function groupByDay(items: NotificationItem[]) {
  const buckets = new Map<string, NotificationItem[]>();
  items.forEach((item) => buckets.set(dayBucket(item.time), [...(buckets.get(dayBucket(item.time)) ?? []), item]));
  return BUCKET_ORDER.filter((bucket) => buckets.has(bucket)).map((bucket) => ({ bucket, items: buckets.get(bucket)! }));
}

/** Groups consecutive items sharing a groupKey so related updates render under one count heading. */
function groupByKey(items: NotificationItem[]) {
  const rows: { key: string; items: NotificationItem[] }[] = [];
  items.forEach((item) => {
    const last = rows[rows.length - 1];
    if (item.groupKey && last && last.items[0].groupKey === item.groupKey) {
      last.items.push(item);
    } else {
      rows.push({ key: item.id, items: [item] });
    }
  });
  return rows;
}

export function NotificationList({
  items,
  compact = false,
  onItemOpen,
}: {
  items: NotificationItem[];
  compact?: boolean;
  onItemOpen?: () => void;
}) {
  const { markNotificationRead } = useAppState();
  const navigate = useNavigate();
  const visible = compact ? items.slice(0, 5) : items;
  const groups = compact ? [{ bucket: '', items: visible }] : groupByDay(visible);

  const openItem = (item: NotificationItem) => {
    markNotificationRead(item.id);
    onItemOpen?.();
    navigate(item.href);
  };

  return (
    <div className="notification-list">
      {groups.map((group) => (
        <div key={group.bucket || 'compact'}>
          {group.bucket && <p className="muted-text">{group.bucket}</p>}
          {groupByKey(group.items).map((row) => (
            <div key={row.key}>
              {row.items.length > 1 && <p className="muted-text">{row.items.length} thông báo liên quan</p>}
              {row.items.map((item) => (
                <button key={item.id} className={`notification-item ${item.read ? '' : 'is-unread'}`} onClick={() => openItem(item)}>
                  {/* Icon theo mức ưu tiên (không chỉ dựa vào màu chấm) + vẫn báo trạng thái đọc cho SR. */}
                  <span className={`notification-icon notification-icon--${item.groupKey === 'digest' ? 'digest' : item.priority}`} aria-label={item.read ? 'Đã đọc' : 'Chưa đọc'}>
                    {item.groupKey === 'digest' ? <Sun size={18} variant="fill" />
                      : item.priority === 'critical' ? <WarningCircle size={18} variant="fill" />
                        : item.priority === 'required' ? <SealCheck size={18} variant="fill" />
                          : item.priority === 'transactional' ? <CheckCircle size={18} variant="fill" />
                            : <Info size={18} variant="fill" />}
                  </span>
                  <span className="notification-copy">
                    <span className="notification-title">{item.title}</span>
                    <span>{item.body}</span>
                    {/* Bản tin gộp: các dòng việc ngay trong thông báo — không cần mở app mới biết hôm nay có gì. */}
                    {/* Chỉ phrasing content trong <button> — các dòng là <span> xếp block. */}
                    {item.lines && item.lines.length > 0 && (
                      <span className="notification-lines">
                        {item.lines.map((line) => <span key={line}>{line}</span>)}
                      </span>
                    )}
                    <span className="notification-time">{item.time}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const TAB_EMPTY_COPY: Record<Exclude<TabKey, 'settings'>, { title: string; body: string }> = {
  all: { title: 'Chưa có thông báo nào', body: 'Thông báo mới sẽ xuất hiện tại đây.' },
  todo: { title: 'Không có việc cần làm', body: 'Bạn đã xử lý hết các thông báo quan trọng.' },
  read: { title: 'Chưa có thông báo nào đã đọc', body: 'Các thông báo đã đọc sẽ hiển thị tại đây.' },
};

export function NotificationsPage() {
  const { notifications, markAllNotificationsRead } = useAppState();
  const [searchParams] = useSearchParams();
  // /notifications?tab=settings — link từ Hồ sơ mở thẳng Cài đặt.
  const [tab, setTab] = useState<TabKey>(searchParams.get('tab') === 'settings' ? 'settings' : 'all');
  const [receipt, setReceipt] = useState(false);

  const lists = useMemo(() => ({
    all: notifications,
    todo: notifications.filter(isTodo),
    read: notifications.filter((item) => item.read),
  }), [notifications]);

  const unreadTotal = notifications.filter((item) => !item.read).length;
  const activeList = tab === 'settings' ? [] : lists[tab];

  const markAll = () => {
    markAllNotificationsRead();
    setReceipt(true);
  };

  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">HỘP THƯ</p>
          <h1>Thông báo</h1>
          <p>{unreadTotal > 0 ? `${unreadTotal} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo.'}</p>
        </div>
        <div>
          <Button onClick={markAll}>Đánh dấu tất cả đã đọc</Button>
          {receipt && <span className="receipt" role="status"><CheckCircle size={16} />Đã đánh dấu tất cả là đã đọc</span>}
        </div>
      </header>

      <Tabs
        tabs={[
          { key: 'all' as TabKey, label: `Tất cả (${lists.all.length})` },
          { key: 'todo' as TabKey, label: `Cần làm (${lists.todo.length})` },
          { key: 'read' as TabKey, label: `Đã đọc (${lists.read.length})` },
          { key: 'settings' as TabKey, label: 'Cài đặt' },
        ]}
        active={tab}
        onChange={setTab}
        ariaLabel="Bộ lọc thông báo"
      />

      {tab === 'settings'
        ? <NotificationSettings />
        : activeList.length > 0 ? <NotificationList items={activeList} /> : <EmptyState title={TAB_EMPTY_COPY[tab].title} body={TAB_EMPTY_COPY[tab].body} />}
    </div>
  );
}
