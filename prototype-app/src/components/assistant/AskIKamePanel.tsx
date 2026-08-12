import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { X } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../AppState';
import { isEligible } from '../../lib/audience';
import { IconButton } from '../UI';
import { AskConversationList } from './AskConversationList';
import { useAskConversation } from './use-ask-conversation';
import { matchNewsPostId, scriptsForContext, type ScriptCtx } from '../../data/ai-scripts';

const ASK_TRIGGER_SELECTOR = 'button[aria-label="Hỏi iKame"]';

/**
 * Phase 2 fill of the Phase-1 stub. Adapted from AppShell's NotificationsDrawer
 * pattern with F4 deviations: conversation state (useAskConversation) persists across
 * close (only this component's return value is null, so hooks/state survive since
 * AppShell always mounts <AskIKamePanel/> unconditionally); focus-trap selector
 * includes textarea/input; Esc/backdrop-close is ignored while an S3 draft is pending;
 * citation/receipt links close-then-navigate.
 */
export function AskIKamePanel() {
  const {
    askOpen, setAskOpen, demoResetCount, perspective, news, events, goals, attention,
    posts, birthdays, knowledgeDocs, leaveBalance, user, checkInReports,
    setEventRegistration, addPost, submitReport,
  } = useAppState();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [closeBlockedNotice, setCloseBlockedNotice] = useState(false);

  const { conversation, hasPendingDraft, askChip, markRevealed, updateDraft, cancelDraft, sendDraft, confirmExecute } =
    useAskConversation(demoResetCount, { setEventRegistration, addPost, submitReport });

  useEffect(() => {
    if (askOpen) closeButtonRef.current?.focus();
  }, [askOpen]);

  const ctx = useMemo<ScriptCtx>(() => {
    const postId = matchNewsPostId(pathname);
    return {
      unackedMandatory: news.filter((item) => item.mandatory && !item.acknowledged),
      // "sắp tới" — exclude past/cancelled so the scripted answer never contradicts on-screen state (F2)
      registeredEvents: events.filter((item) => item.myRegistration === 'going' && item.status !== 'past' && item.status !== 'cancelled'),
      needsUpdateGoals: goals.filter((item) => item.status === 'needs_update'),
      unresponsiveCount: attention.some((item) => item.id === 'event-response' && item.state === 'open') ? 3 : 0,
      events,
      pathname,
      currentNewsPost: postId ? news.find((item) => item.id === postId) : undefined,
      // Phase 6 — AI everywhere: live slices for the new module scripts (F2).
      posts,
      birthdays,
      upcomingEvents: events
        .filter((item) => isEligible(user, item.audienceTeamIds) && item.status !== 'past' && item.status !== 'cancelled'
          && item.startsAt && new Date(item.startsAt).getTime() > Date.now())
        .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime()),
      eligibleDocs: knowledgeDocs.filter((doc) => isEligible(user, doc.audienceTeamIds)),
      goals,
      leaveBalance,
      userName: user.name,
      checkInReports,
    };
  }, [attention, birthdays, checkInReports, events, goals, knowledgeDocs, leaveBalance, news, pathname, posts, user]);

  const chips = useMemo(() => scriptsForContext(pathname, perspective), [pathname, perspective]);

  function attemptClose() {
    if (hasPendingDraft) {
      // Guard while a draft is unsent (F4) — with visible feedback so a dead Esc
      // never reads as a freeze on stage.
      setCloseBlockedNotice(true);
      return;
    }
    setCloseBlockedNotice(false);
    setAskOpen(false);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(ASK_TRIGGER_SELECTOR)?.focus());
  }

  function openLinkAndClose(href: string) {
    setAskOpen(false);
    navigate(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      attemptClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], textarea, input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!askOpen) return null;

  return (
    <div className="drawer-layer" role="presentation" onMouseDown={attemptClose}>
      <aside
        ref={panelRef}
        className="ask-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Ask iKame"
        onKeyDown={onKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="ask-panel-header">
          <div>
            <h2>Ask iKame</h2>
            <p className="ask-panel-disclosure">Concept · R4 — iKame trả lời bằng kịch bản dựng sẵn, chưa xử lý văn bản tự do.</p>
          </div>
          <IconButton ref={closeButtonRef} label="Đóng Ask iKame" onClick={attemptClose}><X size={20} /></IconButton>
        </div>

        <div className="ask-panel-body">
          <AskConversationList
            conversation={conversation}
            onRevealed={markRevealed}
            onOpenLink={openLinkAndClose}
            onDraftChange={updateDraft}
            onSendDraft={sendDraft}
            onCancelDraft={cancelDraft}
            onConfirmExecute={confirmExecute}
          />
        </div>

        {closeBlockedNotice && hasPendingDraft && (
          <p className="ask-panel-guard-note" role="status">
            Đang có bản nháp chưa gửi — bấm "Duyệt & gửi" hoặc "Hủy" trước khi đóng.
          </p>
        )}
        <div className="ask-panel-chips">
          {chips.map((script) => (
            <button key={script.id} type="button" className="ai-chip" onClick={() => askChip(script, ctx)}>
              {script.chip}
            </button>
          ))}
        </div>

        <form className="ask-panel-input" onSubmit={(event) => event.preventDefault()}>
          <input type="text" disabled placeholder="Nhập tự do sẽ mở ở R4" aria-label="Nhập câu hỏi (mở ở R4)" />
        </form>
      </aside>
    </div>
  );
}
