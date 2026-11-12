import { CheckCircleIcon as CheckCircle, LockKeyIcon as LockKey, SunIcon as Sun } from '@coreds/react/icons';
import { useEffect, useState } from 'react';
import { useAppState } from '../../AppState';
import { Button, SectionHeader } from '../../components/UI';
import { GROUP_META, RULES } from '../../lib/notification-rules';
import type { NotificationGroup } from '../../types';
import { Switch } from '@coreds/react';

const GROUP_ORDER: NotificationGroup[] = ['official', 'com', 'feed', 'events', 'work', 'onboarding', 'manager'];

/** Nhóm chỉ có nghĩa với một lăng kính — ẩn với người không liên quan (không phải khoá). */
function visibleGroups(isNewJoiner: boolean, isManager: boolean): NotificationGroup[] {
  return GROUP_ORDER.filter((group) => (group !== 'onboarding' || isNewJoiner) && (group !== 'manager' || isManager));
}

/**
 * Cài đặt thông báo — preference theo nhóm (rule engine lọc), nhóm bắt buộc khoá theo quy định COM,
 * giờ Bản tin sáng + giờ yên lặng chỉ hiển thị (bản thật đẩy xuống notification service).
 */
export function NotificationSettings() {
  const { preference, setPreferenceGroup, suppressedCount, resendMorningDigest, isNewJoiner, perspective, demoResetCount } = useAppState();
  const [receipt, setReceipt] = useState<string | null>(null);
  useEffect(() => { setReceipt(null); }, [demoResetCount]);

  const locked = new Set(Object.values(RULES).filter((rule) => rule.locked).map((rule) => rule.group));
  const groups = visibleGroups(isNewJoiner, perspective === 'manager');
  const offCount = groups.filter((group) => !locked.has(group) && !preference.groups[group]).length;
  const meta = suppressedCount > 0
    ? `Đã lọc ${suppressedCount} thông báo theo lựa chọn của bạn`
    : offCount > 0 ? `${offCount} nhóm đang tắt` : 'Mọi nhóm đang bật';

  return (
    <section className="notification-settings" aria-label="Cài đặt thông báo">
      <SectionHeader title="Nhận thông báo về" meta={meta} />
      <ul className="pref-list">
        {groups.map((group) => {
          const isLocked = locked.has(group);
          const on = isLocked || preference.groups[group];
          return (
            <li key={group} className={`pref-row ${isLocked ? 'is-locked' : ''}`}>
              <div className="pref-copy">
                <strong>{GROUP_META[group].label}</strong>
                <small>{GROUP_META[group].description}</small>
              </div>
              {isLocked ? (
                <span className="pref-locked"><LockKey size={14} /> Bắt buộc theo quy định COM</span>
              ) : (
                <Switch
                  checked={on}
                  aria-label={GROUP_META[group].label}
                  onCheckedChange={(checked) => setPreferenceGroup(group, checked)}
                />
              )}
            </li>
          );
        })}
      </ul>

      <div className="pref-digest">
        <div className="pref-copy">
          <strong><Sun size={16} /> Bản tin sáng lúc {preference.digestTime}</strong>
          <small>Gộp việc hôm nay thành một thông báo · giờ yên lặng {preference.quietHours} (mô phỏng — bản thật đặt trên notification service)</small>
        </div>
        <Button onClick={() => setReceipt(resendMorningDigest()
          ? 'Đã gửi lại Bản tin sáng — xem ở chuông thông báo.'
          : 'Bản tin sáng bị lọc vì nhóm "Công việc & iCheck" đang tắt.')}>
          Gửi lại Bản tin sáng
        </Button>
      </div>
      {receipt && <p className="receipt" role="status"><CheckCircle size={16} />{receipt}</p>}
    </section>
  );
}
