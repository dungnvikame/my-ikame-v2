import type { ReactNode } from 'react';
import { TabPanel, Tabs } from '../../components/Tabs';

export type GoalsTabDef<T extends string> = { key: T; label: string };

type GoalsTabsProps<T extends string> = {
  tabs: GoalsTabDef<T>[];
  active: T;
  onChange: (key: T) => void;
  ariaLabel: string;
};

/** Shared page-heading tabs — delegate sang Tabs dùng chung (roving tabindex + arrow keys). */
export function GoalsTabs<T extends string>({ tabs, active, onChange, ariaLabel }: GoalsTabsProps<T>) {
  return <Tabs idPrefix="goals" tabs={tabs} active={active} onChange={onChange} ariaLabel={ariaLabel} />;
}

/** Wraps one tab panel with the id/aria wiring `GoalsTabs` expects (DRY across views). */
export function GoalsTabPanel<T extends string>({ tabKey, children }: { tabKey: T; children: ReactNode }) {
  return <TabPanel idPrefix="goals" tabKey={tabKey}>{children}</TabPanel>;
}
