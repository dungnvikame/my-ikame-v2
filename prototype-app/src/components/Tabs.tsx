import type { ReactNode } from 'react';
import { Tabs as DsTabs } from '@coreds/react';

export type TabDef<T extends string> = { key: T; label: ReactNode };

/**
 * Tablist dùng chung, dựng trên Tabs của Core DS (Radix): roving tabindex (chỉ tab đang chọn
 * nằm trong tab-order) + điều hướng ArrowLeft/Right/Home/End với automatic
 * activation (focus tới đâu chọn tới đó). Mọi nhóm tab trong app đi qua đây
 * để hành vi bàn phím nhất quán.
 */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
}: {
  tabs: TabDef<T>[];
  active: T;
  onChange: (key: T) => void;
  ariaLabel: string;
  /** Giữ lại cho tương thích nơi gọi cũ; style tab giờ do Core DS quyết định. */
  className?: string;
  buttonClassName?: string;
  idPrefix?: string;
}) {
  return (
    <DsTabs
      className="app-tabs"
      variant="underline"
      color="orange"
      aria-label={ariaLabel}
      value={active}
      onValueChange={(value) => onChange(value as T)}
      items={tabs.map((tab) => ({ value: tab.key, label: tab.label, content: null }))}
    />
  );
}

/** Panel đi kèm — id/aria-labelledby khớp idPrefix của Tabs. */
export function TabPanel<T extends string>({ idPrefix, tabKey, children }: { idPrefix: string; tabKey: T; children: ReactNode }) {
  return (
    <div id={`${idPrefix}-panel-${tabKey}`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${tabKey}`}>
      {children}
    </div>
  );
}
