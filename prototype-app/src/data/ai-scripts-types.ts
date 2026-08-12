import type {
  AiLevel, BirthdayPerson, CheckInReport, EventItem, Goal, KnowledgeDoc,
  LeaveBalance, NewsPost, Perspective, Post, PostCover,
} from '../types';

/**
 * Ask iKame scripted engine — shared types (split out of `ai-scripts.ts` for the
 * ≤200-line file budget once Phase 6 added 6 more scripts + live ctx slices).
 * NO LLM, NO free-text — every response is 100% authored copy. `ScriptCtx` carries
 * LIVE counts/lists read from AppState so a re-asked chip reflects the CURRENT state
 * (RED TEAM F2) instead of reciting stale facts.
 */
export type ScriptCtx = {
  unackedMandatory: NewsPost[];
  registeredEvents: EventItem[];
  needsUpdateGoals: Goal[];
  /** Derived from the `event-response` attention item's open/resolved state. */
  unresponsiveCount: number;
  /** Full live events list — needed for S4 idempotent lookups by id. */
  events: EventItem[];
  pathname: string;
  /** Resolved from the `:postId` route param against the live news list, for S1. */
  currentNewsPost?: NewsPost;
  // Phase 6 additions — AI everywhere, all live from AppState (F2).
  posts: Post[];
  birthdays: BirthdayPerson[];
  /** Sorted ascending by `startsAt`, excludes past/cancelled/ineligible-audience. */
  upcomingEvents: EventItem[];
  /** Knowledge docs filtered by the current user's audience (never leaks Finance-only docs). */
  eligibleDocs: KnowledgeDoc[];
  /** Full live goals list (not just needs_update) — g3 needs title/progress/lastCheckIn. */
  goals: Goal[];
  leaveBalance: LeaveBalance;
  userName: string;
};

export type Citation = { title: string; source: string; href: string };

export type AiScriptAction =
  | {
    kind: 'draft';
    draftText: (ctx: ScriptCtx) => string;
    confirmLabel: string;
    receipt: string;
    /** F2: no draft offered when there is nothing left to act on (e.g. item already resolved). */
    isApplicable: (ctx: ScriptCtx) => boolean;
    /** What the approved draft commits to. Default 'message' = receipt only (v1 behavior). */
    commit?: 'message' | 'post' | 'report';
    buildReport?: (ctx: ScriptCtx, text: string) => Omit<CheckInReport, 'id' | 'submittedAt'>;
    buildPost?: (ctx: ScriptCtx, text: string) => { body: string; cover?: PostCover; official?: boolean };
  }
  | { kind: 'execute'; targetEventId: string; confirmLabel: string; receipt: string }
  | { kind: 'denied' };

export type AiScript = {
  id: string;
  chip: string;
  /** react-router patterns matched via matchPath; '*' = generic fallback (see scriptsForContext). */
  routes: string[];
  perspective?: Perspective;
  level: AiLevel;
  paragraphs: (ctx: ScriptCtx) => string[];
  citations?: (ctx: ScriptCtx) => Citation[];
  /** "Vì sao trả lời này?" — carries the explainability/feedback story (F11 — no thumbs buttons). */
  reason: string;
  action?: AiScriptAction;
};
