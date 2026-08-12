export type Perspective = 'ikamer' | 'manager';

/** AI maturity ladder (spec §23): A1 Tóm tắt · A2 Xuyên nguồn · A3 Soạn thảo · A4 Thực thi. */
export type AiLevel = 'A1' | 'A2' | 'A3' | 'A4';
/** Release tags for concept labeling: R1 shipped-grade carries no badge. */
export type ReleaseTag = 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

export type KnowledgeDoc = {
  id: string;
  title: string;
  summary: string;
  body: string[];
  source: 'iWiki';
  topic: string;
  updatedAt: string;
  /** undefined/empty = company-wide (same audience contract as NewsPost/EventItem) */
  audienceTeamIds?: string[];
};

export type GoalStatus = 'needs_update' | 'on_track' | 'at_risk' | 'done';

export type Goal = {
  id: string;
  title: string;
  status: GoalStatus;
  /** 0-100 */
  progress: number;
  cycle: string;
  lastCheckIn: string;
  nextDue: string;
  owner: string;
};
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
