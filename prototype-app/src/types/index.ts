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
  /** Demo v2 — Tri thức learning hub. */
  authorName?: string;
  authorShort?: string;
  emoji?: string;
  readingTime?: string;
  recommended?: boolean;
  recentlyViewedLabel?: string;
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
  /** Bình luận trên bài Tin tức — undefined coi như chưa có bình luận nào. */
  comments?: Comment[];
};

export type EventRegistration = 'not_registered' | 'going' | 'waitlisted';

/** Demo v2 — Events upgrade (agenda + live timeline). */
export type EventAgendaItem = { time: string; title: string; speaker?: string };

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
  /** ISO timestamp w/ +07:00 offset — powers live countdown + 6-month timeline (demo v2). */
  startsAt?: string;
  agenda?: EventAgendaItem[];
  participantNames?: string[];
  closingSoon?: boolean;
  registrationDeadlineLabel?: string;
  featured?: boolean;
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

/** Shared AI citation shape — reused by the search-answer store. ai-scripts.ts keeps its
 * own structurally identical local `Citation` (Phase 6 may re-point it, 1-line, safe). */
export type Citation = { title: string; source: string; href: string };

/** Cộng đồng (Demo v2 social module). */
export type ReactionKind = 'heart' | 'clap';
export type PostCover = { pattern: 'aurora' | 'grid' | 'wave' | 'confetti'; emoji: string; caption?: string };
export type Comment = { id: string; authorName: string; authorShort: string; role?: string; text: string; time: string };
export type Post = {
  id: string;
  authorName: string;
  authorShort: string;
  role: string;
  time: string;
  body: string;
  topic?: string;
  cover?: PostCover;
  official?: boolean;
  pinned?: boolean;
  pinnedUntilLabel?: string;
  mentionsMe?: boolean;
  saved?: boolean;
  reactions: Record<ReactionKind, number>;
  myReactions: ReactionKind[];
  comments: Comment[];
  /** undefined/empty = company-wide (same audience contract as NewsPost/EventItem) */
  audienceTeamIds?: string[];
};

/** Right rail + profile. */
export type BirthdayPerson = { id: string; name: string; shortName: string; role: string; team: string; dateLabel: string; postId: string; congratulated: boolean };
export type Milestone = { id: string; name: string; shortName: string; years: number; dateLabel: string; note: string };
export type TopFan = { id: string; name: string; shortName: string; points: number; note: string };
export type DailyCheckIn = { done: boolean; mode?: 'WFO' | 'Remote'; timeLabel?: string };
export type LeaveBalance = { annualTotal: number; annualUsed: number; annualRemaining: number; carriedOver: number; sickUsed: number; insuranceLabel: string; healthCheckLabel: string };
/** Lương & hợp đồng (Hồ sơ) — số tiền che mặc định, xem chi tiết qua handoff iHRM. */
export type Payslip = { id: string; periodLabel: string; amountMasked: string; amountRevealed: string; statusLabel: string };
export type ContractInfo = { type: string; signedAt: string; validity: string; workMode: string };
/** iRequest center (demo) — mọi request tạo qua AI front door đều theo dõi được ở đây. */
export type RequestType = 'IT support' | 'Nhân sự' | 'Hành chính' | 'Thiết bị';
export type RequestStatus = 'pending' | 'in_progress' | 'done';
export type RequestItem = {
  id: string;
  type: RequestType;
  title: string;
  status: RequestStatus;
  createdAtLabel: string;
  slaLabel?: string;
  handlerLabel?: string;
};
export type Equipment = { id: string; name: string; model: string; serial: string; assignedAt: string; condition: string };
export type SeniorityEntry = { id: string; dateLabel: string; title: string; note: string };

/** Mục tiêu — iGoal-style OKR tree. */
export type OkrLevel = 'company' | 'team' | 'personal';
export type KeyResult = { id: string; title: string; progress: number; unitLabel: string; status: GoalStatus };
export type Objective = {
  id: string;
  title: string;
  level: OkrLevel;
  parentId?: string;
  ownerName: string;
  ownerShort: string;
  progress: number;
  cycle: string;
  keyResults: KeyResult[];
  linkedGoalId?: string;
};
/** EKS — Employee Key Success (iGoal-style personal scorecard, demo v2.1).
 * Structure mirrors the real iGoal EKS screen: E-objectives with KS children. */
export type KeySuccess = {
  id: string;
  /** Display code within its objective: "KS1", "KS2"... */
  code: string;
  title: string;
  progress: number;
  status: GoalStatus;
  /** Optional bridge to the v1 personal Goal cards (check-in flow reuse). */
  linkedGoalId?: string;
};
export type EksObjective = {
  id: string;
  /** Display code: "E1", "E2"... */
  code: string;
  title: string;
  progress: number;
  keySuccesses: KeySuccess[];
};
/** Manager Goals tab "Thành viên" — per-member EKS + report compliance row. */
export type MemberEksStat = {
  id: string;
  name: string;
  shortName: string;
  role: string;
  eksStatus: GoalStatus;
  eksProgress: number;
  reportsSubmitted: number;
  reportsExpected: number;
  lastCheckInLabel: string;
};

export type CheckInReport = {
  id: string;
  goalId: string;
  goalTitle: string;
  authorName: string;
  periodLabel: string;
  progressBefore: number;
  progressAfter: number;
  content: string;
  blockers?: string;
  submittedAt: string;
  source: 'manual' | 'ai';
};

/** Search AI answers — empty store filled by Phase 6; palette itself never changes. */
export type SearchSeedAnswer = { id: string; keywords: string[]; question: string; level: AiLevel; paragraphs: string[]; citations: Citation[] };
