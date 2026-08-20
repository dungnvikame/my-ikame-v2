import { useRef, type KeyboardEvent, type ReactNode } from 'react';

export type TabDef<T extends string> = { key: T; label: ReactNode };

/**
 * Tablist dùng chung, chuẩn WAI-ARIA APG: roving tabindex (chỉ tab đang chọn
 * nằm trong tab-order) + điều hướng ArrowLeft/Right/Home/End với automatic
 * activation (focus tới đâu chọn tới đó). Mọi nhóm tab trong app đi qua đây
 * để hành vi bàn phím nhất quán.
 */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
  className = 'neutral-tabs',
  buttonClassName = '',
  idPrefix,
}: {
  tabs: TabDef<T>[];
  active: T;
  onChange: (key: T) => void;
  ariaLabel: string;
  className?: string;
  /** Class thêm cho từng nút (ví dụ events-v2-tab). */
  buttonClassName?: string;
  /** Có idPrefix → nút mang id/aria-controls khớp với TabPanel cùng prefix. */
  idPrefix?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.key === active);
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? tabs.length - 1
        : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
          : (index + 1) % tabs.length;
    onChange(tabs[nextIndex].key);
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
  }

  return (
    <div ref={listRef} className={className} role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          id={idPrefix ? `${idPrefix}-tab-${tab.key}` : undefined}
          aria-controls={idPrefix ? `${idPrefix}-panel-${tab.key}` : undefined}
          aria-selected={active === tab.key}
          tabIndex={active === tab.key ? 0 : -1}
          className={`${buttonClassName} ${active === tab.key ? 'is-active' : ''}`.trim()}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
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
