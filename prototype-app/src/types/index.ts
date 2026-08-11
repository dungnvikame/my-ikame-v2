export type Perspective = 'ikamer' | 'manager';
export type PriorityBand = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
export type Severity = 'critical' | 'warning' | 'info';

export type User = {
  id: string;
  personId: string;
  name: string;
  shortName: string;
  role: string;
  team: string;
  teamId: string;
  perspective: Perspective;
  availablePerspectives: Perspective[];
  timezone: string;
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
  mandatoryReason?: string;
  dueLabel?: string;
  /** undefined/empty = company-wide */
  audienceTeamIds?: string[];
  expired?: boolean;
  read: boolean;
  acknowledged: boolean;
};

export type EventRegistration = 'not_registered' | 'going' | 'waitlisted';

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
  timezone: string;
  status: 'open' | 'going' | 'full' | 'cancelled' | 'past';
  audienceTeamIds?: string[];
  capacity?: number;
  remaining?: number;
  waitlistEnabled?: boolean;
  joinUrl?: string;
  myRegistration: EventRegistration;
};

export type AttentionItem = {
  id: string;
  title: string;
  people: string;
  reason: string;
  source: string;
  freshness: string;
  severity: Severity;
  required: boolean;
  dueAt?: string;
  action: string;
  teamId: string;
  state: 'open' | 'resolved' | 'dismissed';
};

export type TeamMemberStatus = 'needs_attention' | 'ok' | 'no_data';

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  teamId: string;
  attentionSummary: string;
  status: TeamMemberStatus;
  lastUpdated: string;
  momentType?: 'new_joiner' | 'birthday' | 'anniversary';
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  priority: 'critical' | 'required' | 'transactional' | 'informational';
  read: boolean;
  href: string;
  groupKey?: string;
};
