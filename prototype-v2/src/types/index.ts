export type LensKey = 'ikamer' | 'ikamer_new' | 'manager' | 'com_admin';

export type RoleKey = 'member' | 'manager' | 'com_admin' | 'finance';

export interface MilestoneBadge {
  id: string;
  label: string;
  kind: 'onboarding' | 'tenure';
  earnedAt: string;
  description: string;
}

export interface LeaveBalance {
  annualRemaining: number;
  annualTotal: number;
  carriedOver: number;
  sickRemaining: number;
  weddingLeave: number;
  syncedAt: string;
}

export interface HrDocument {
  id: string;
  title: string;
  category: string;
  status: 'complete' | 'expiring' | 'expired' | 'missing';
  dueDate?: string;
  updatedAt: string;
  note?: string;
}

export interface DeviceItem {
  id: string;
  name: string;
  serial: string;
  assignedAt: string;
  status: 'active' | 'maintenance';
}

export interface SensitiveProfileData {
  cccd: string;
  cccdIssued: string;
  bhxh: string;
  bankAccount: string;
  bankName: string;
  salaryBand: string;
  latestPayslip: { month: string; netMasked: string; status: string };
}

export interface PersonProfile {
  id: string;
  lensKey?: LensKey;
  roleKeys: RoleKey[];
  employeeCode: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  title: string;
  level: string;
  department: string;
  team: string;
  managerId?: string;
  managerName: string;
  buddyId?: string;
  joinedAt: string; // YYYY-MM-DD
  onboardingDay?: number; // <60 triggers overlay
  birthday: string; // MM-DD
  birthDateFull: string;
  gender: string;
  email: string;
  slack: string;
  phone: string;
  employmentType: string;
  workMode: string;
  location: string;
  hrisSyncedAt: string;
  badges: MilestoneBadge[];
  leaveBalance: LeaveBalance;
  documents: HrDocument[];
  devices: DeviceItem[];
  sensitive: SensitiveProfileData;
  // Manager 360 & team pulse fields (only visible to direct manager, never sensitive HR data)
  pulse?: {
    activeThisWeek: boolean;
    kudosReceived2Weeks: number;
    kudosGivenWeek: number;
    okrCheckinStatus: 'on_time' | 'late' | 'missing';
    eksScore: number; // 0-100
    reportCompliance: number; // %
    last1on1: string;
    next1on1?: string;
    aiSuggestions: string[];
    competencies: { name: string; level: string; progress: number }[];
    learningItems: { title: string; source: string; status: string }[];
    recentActivity: { text: string; source: string; time: string }[];
  };
}

export type FeedPostKind = 'official' | 'community' | 'kudos' | 'lifecycle';

export interface FeedComment {
  id: string;
  authorId: string;
  authorName: string;
  authorTitle: string;
  content: string;
  createdAt: string;
  mentions?: string[];
}

export interface FeedPost {
  id: string;
  kind: FeedPostKind;
  title?: string;
  summary?: string;
  content: string;
  keyTakeaways?: string[];
  actionRequiredText?: string;
  whyYouSeeThis?: string;
  authorId: string;
  authorName: string;
  authorTitle: string;
  authorTeam: string;
  audience: 'all' | string; // 'all' or specific team name
  createdAt: string;
  timeLabel: string;
  pinned?: boolean;
  pinExpiresAt?: string;
  mandatoryAck?: boolean;
  ackReason?: string;
  ackDeadline?: string; // ISO date
  ackOverdue?: boolean;
  ackedBy: Record<string, string>; // personId -> timestamp
  reachCount: number;
  readCount: number;
  totalAudienceCount: number;
  reminderCount: number; // max 3
  pushSent?: boolean;
  kudosRecipientId?: string;
  kudosRecipientName?: string;
  kudosTag?: string;
  lifecycleSource?: string;
  reactions: { heart: string[]; clap: string[] };
  comments: FeedComment[];
  savedBy: string[];
  tags: string[];
}

export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'cancelled';

export interface EventItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  status: EventStatus;
  featured?: boolean;
  audience: 'all' | string;
  startAt: string; // ISO
  endAt: string;
  dateLabel: string;
  monthGroup: string;
  timeLabel: string;
  format: 'Trực tiếp' | 'Online' | 'Hybrid';
  location: string;
  organizer: string;
  capacity: number;
  registeredIds: string[];
  waitlistIds: string[];
  rsvpDeadline: string;
  agenda: { time: string; title: string; speaker?: string }[];
  coverGradient: string;
  coverAccent: string;
  albumPhotos?: { id: string; caption: string; tone: string; photographer: string }[];
  driveUrl?: string;
  surveySubmittedBy: string[];
  surveyAvgScore?: number;
  relatedEventIds?: string[];
}

export interface InternalApp {
  id: string;
  name: string;
  shortDesc: string;
  category: 'Công việc' | 'Nhân sự' | 'Tri thức';
  allowedRoles: RoleKey[];
  internalRoute?: string;
  ssoUrl?: string;
  iconKey: string;
  accentBg: string;
  accentFg: string;
  statusNote?: string;
}

export type DayAttendanceCode =
  | 'on_time'
  | 'late'
  | 'leave'
  | 'half_day'
  | 'wfh'
  | 'holiday'
  | 'absent'
  | 'future';

export interface WeekAttendanceDay {
  dayLabel: string;
  dateLabel: string;
  code: DayAttendanceCode;
  checkIn?: string;
  checkOut?: string;
  isToday?: boolean;
}

export interface WorkRequest {
  id: string;
  personId: string;
  personName: string;
  type: 'Nghỉ phép' | 'WFH' | 'Quên chấm công' | 'Đi muộn / Về sớm' | 'Thiết bị / IT' | 'Đặt phòng họp';
  summary: string;
  dateRange: string;
  reason: string;
  status: 'Chờ duyệt' | 'Đang xử lý' | 'Đã duyệt' | 'Từ chối';
  createdAt: string;
  sourceTool: string;
  reviewerNote?: string;
}

export interface ObjectiveItem {
  id: string;
  ownerId: string;
  ownerName: string;
  team: string;
  title: string;
  progress: number;
  target: number;
  status: 'on_track' | 'at_risk' | 'behind';
  needsCheckin: boolean;
  lastCheckin: string;
  keyResults: { id: string; title: string; progress: number; metric: string }[];
}

export interface OnboardingQuest {
  id: string;
  milestoneId: 'm1' | 'm2' | 'm3' | 'm4';
  title: string;
  description: string;
  dueDay: number;
  source: 'My iKame' | 'iWiki' | 'iGoal' | 'HRIS' | 'Buddy' | 'Manager';
  completed: boolean;
  actionRoute?: string;
  externalApp?: string;
}

export type NotificationGroupKey =
  | 'mandatory'
  | 'com_news'
  | 'feed'
  | 'events'
  | 'work_icheck'
  | 'onboarding'
  | 'manager';

export interface AppNotification {
  id: string;
  recipientId: string;
  group: NotificationGroupKey;
  eventType: string;
  priority: 'critical' | 'required' | 'transactional' | 'informational';
  channels: ('push' | 'in-app' | 'digest')[];
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
  actionRoute: string;
  actionLabel?: string;
  source: string;
}

export interface NotificationPref {
  group: NotificationGroupKey;
  label: string;
  description: string;
  locked?: boolean;
  enabled: boolean;
  onlyForNewJoiner?: boolean;
  onlyForManager?: boolean;
}

export interface TodayActionItem {
  id: string;
  priorityGroup: 0 | 1 | 2 | 3 | 4 | 5; // P0..P5 deterministic
  severity: number; // higher = more urgent
  deadlineSort: number; // smaller = sooner
  official: boolean;
  recency: number; // higher = newer
  title: string;
  subtitle: string;
  source: 'COM' | 'iCheck' | 'HRIS' | 'iGoal' | 'Asana' | 'Lịch' | 'Hành trình';
  urgencyLabel: string;
  urgencyTone: 'error' | 'warning' | 'info' | 'neutral';
  actionLabel: string;
  actionRoute?: string;
  actionKind: 'ack_post' | 'checkin' | 'resolve_doc' | 'okr_checkin' | 'open_route' | 'open_ai' | 'complete_quest';
  targetId?: string;
  aiPrompt?: string;
}

export interface McpServerStatus {
  id: string;
  name: string;
  owner: string;
  status: 'connected' | 'degraded' | 'offline';
  readTools: string[];
  writeTools: string[];
  latencyMs: number;
}

export interface AiActionProposal {
  id: string;
  server: string;
  tool: string;
  title: string;
  description: string;
  fields: { key: string; label: string; value: string; type?: 'text' | 'date' | 'select'; options?: string[] }[];
  status: 'pending' | 'approved' | 'cancelled';
  receiptId?: string;
  executedAt?: string;
  durationSec?: number;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  todayItems?: TodayActionItem[];
  actionProposal?: AiActionProposal;
  warningNote?: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  summary: string;
  updatedAt: string;
  readTime: string;
  author: string;
  content: string[];
}
