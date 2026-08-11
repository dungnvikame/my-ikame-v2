export type Perspective = 'ikamer' | 'manager';

export type User = {
  id: string;
  name: string;
  shortName: string;
  role: string;
  team: string;
  perspective: Perspective;
};

export type NewsPost = {
  id: string;
  title: string;
  summary: string;
  body: string[];
  publisher: string;
  publishedAt: string;
  readingTime: string;
  topic: string;
  official?: boolean;
  highlighted?: boolean;
  mandatory?: boolean;
  dueLabel?: string;
  acknowledged?: boolean;
};

export type EventItem = {
  id: string;
  title: string;
  summary: string;
  dateLabel: string;
  day: string;
  month: string;
  time: string;
  location: string;
  organizer: string;
  format: 'Trực tiếp' | 'Online' | 'Hybrid';
  status: 'open' | 'going' | 'full' | 'cancelled' | 'past';
  remaining?: number;
  registered?: boolean;
};

export type AttentionItem = {
  id: string;
  title: string;
  people: string;
  reason: string;
  source: string;
  freshness: string;
  severity: 'critical' | 'warning' | 'info';
  required: boolean;
  action: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  priority: 'required' | 'transactional' | 'informational';
  read: boolean;
  href: string;
};

