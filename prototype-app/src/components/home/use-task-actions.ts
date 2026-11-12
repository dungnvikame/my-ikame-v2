import { useCallback } from 'react';
import type { DigestItem } from '../../pages/assistant/daily-digest';
import { trackFlow } from '../../lib/metrics/metrics';
import { useToast } from '../toast';
import { homeActions } from './home-store';
import type { SnoozeOption } from './task-utils';

/** Hành động chung trên một việc: mở (tính là đã xử lý), hoãn có hoàn tác, bỏ qua. */
export function useTaskActions() {
  const { showToast } = useToast();

  const open = useCallback((item: DigestItem) => {
    homeActions.markHandled(item.id);
    trackFlow('today', 'done');
  }, []);

  const snooze = useCallback((item: DigestItem, option: SnoozeOption) => {
    homeActions.snooze(item.id, option.until, option.key === 'skip' ? 'skip' : 'snooze');
    showToast(option.toast, { label: 'Hoàn tác', onClick: () => homeActions.unsnooze(item.id) });
  }, [showToast]);

  return { open, snooze };
}
