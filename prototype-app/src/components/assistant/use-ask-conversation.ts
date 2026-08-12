import { useEffect, useRef, useState } from 'react';
import type { CheckInReport, EventRegistration, Post } from '../../types';
import type { AiScript, ScriptCtx } from '../../data/ai-scripts';

type NewPostInput = { body: string; cover?: Post['cover']; official?: boolean };
type SubmitReportInput = Omit<CheckInReport, 'id' | 'submittedAt'>;

export type AskConversationActions = {
  setEventRegistration: (id: string, next: EventRegistration) => void;
  addPost: (input: NewPostInput) => void;
  submitReport: (input: SubmitReportInput) => void;
};

export type Turn = {
  id: string;
  script: AiScript;
  ctx: ScriptCtx;
  revealed: boolean;
  draftText?: string;
  sent?: boolean;
  already?: boolean;
  receiptId?: string;
};

function generateReceiptId() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

/**
 * Owns the Ask iKame conversation state. Lifted out of the panel component so state
 * survives the panel's close/open render-null cycle (F4) and so AskIKamePanel.tsx
 * stays under the ~200-line file budget. Cleared ONLY when `demoResetCount` changes.
 */
export function useAskConversation(demoResetCount: number, actions: AskConversationActions) {
  const [conversation, setConversation] = useState<Turn[]>([]);
  const lockRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setConversation([]);
    lockRef.current.clear();
  }, [demoResetCount]);

  const hasPendingDraft = conversation.some((turn) => turn.script.action?.kind === 'draft' && !turn.sent && !turn.already);

  function askChip(script: AiScript, ctx: ScriptCtx) {
    const id = `turn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const turn: Turn = { id, script, ctx, revealed: false };
    const { action } = script;
    if (action?.kind === 'draft') {
      // F2: never offer a draft the current state can't honor (e.g. item already resolved).
      turn.already = !action.isApplicable(ctx);
      if (!turn.already) turn.draftText = action.draftText(ctx);
    }
    if (action?.kind === 'execute') {
      const target = ctx.events.find((event) => event.id === action.targetEventId);
      turn.already = target?.myRegistration === 'going';
    }
    setConversation((turns) => [...turns, turn]);
  }

  function markRevealed(turnId: string) {
    setConversation((turns) => turns.map((turn) => (turn.id === turnId ? { ...turn, revealed: true } : turn)));
  }

  function updateDraft(turnId: string, text: string) {
    setConversation((turns) => turns.map((turn) => (turn.id === turnId ? { ...turn, draftText: text } : turn)));
  }

  function cancelDraft(turnId: string) {
    setConversation((turns) => turns.filter((turn) => turn.id !== turnId));
  }

  /** Approving an A3 draft: `commit` decides whether this only prints a receipt (v1
   * behavior, default) or also writes to app state with the user-edited draft text
   * (Phase 6 — `addPost`/`submitReport`). */
  function sendDraft(turnId: string) {
    if (lockRef.current.has(turnId)) return; // synchronous double-click guard
    lockRef.current.add(turnId);
    const turn = conversation.find((item) => item.id === turnId);
    const action = turn?.script.action;
    if (turn && action?.kind === 'draft' && turn.draftText) {
      if (action.commit === 'post' && action.buildPost) {
        actions.addPost(action.buildPost(turn.ctx, turn.draftText));
      } else if (action.commit === 'report' && action.buildReport) {
        actions.submitReport(action.buildReport(turn.ctx, turn.draftText));
      }
    }
    const receiptId = generateReceiptId();
    setConversation((turns) => turns.map((t) => (t.id === turnId ? { ...t, sent: true, receiptId } : t)));
  }

  function confirmExecute(turnId: string, targetEventId: string) {
    if (lockRef.current.has(turnId)) return; // synchronous double-click guard
    lockRef.current.add(turnId);
    actions.setEventRegistration(targetEventId, 'going');
    const receiptId = generateReceiptId();
    setConversation((turns) => turns.map((turn) => (turn.id === turnId ? { ...turn, sent: true, receiptId } : turn)));
  }

  return { conversation, hasPendingDraft, askChip, markRevealed, updateDraft, cancelDraft, sendDraft, confirmExecute };
}
