import type { ReactNode } from 'react';

/** Generic a11y pill sub-tabs row — shared by iKamer + Manager Mục tiêu views (DRY). */
export type GoalsTabDef<T extends string> = { key: T; label: string };

type GoalsTabsProps<T extends string> = {
  tabs: GoalsTabDef<T>[];
  active: T;
  onChange: (key: T) => void;
  ariaLabel: string;
};

export function GoalsTabs<T extends string>({ tabs, active, onChange, ariaLabel }: GoalsTabsProps<T>) {
  return (
    <div className="neutral-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          id={`goals-tab-${tab.key}`}
          aria-selected={active === tab.key}
          aria-controls={`goals-panel-${tab.key}`}
          className={active === tab.key ? 'is-active' : ''}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** Wraps one tab panel with the id/aria wiring `GoalsTabs` expects (DRY across views). */
export function GoalsTabPanel<T extends string>({ tabKey, children }: { tabKey: T; children: ReactNode }) {
  return (
    <div id={`goals-panel-${tabKey}`} role="tabpanel" aria-labelledby={`goals-tab-${tabKey}`}>
      {children}
    </div>
  );
}
