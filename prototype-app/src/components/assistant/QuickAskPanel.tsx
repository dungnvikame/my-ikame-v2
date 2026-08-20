import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowRight, ArrowsOutSimple, CheckCircle, PaperPlaneTilt, Sparkle, X } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '../../AppState';
import { buildAgentReply, type AgentAction } from '../../pages/assistant/agent-replies';
import type { ThreadMessage } from '../../pages/assistant/assistant-history';
import {
  AssistantSteps, capabilitiesFor, generateMessageId, generateReceiptId,
} from '../../pages/assistant/assistant-shared';
import { Button, IconButton } from '../UI';

const ASK_TRIGGER_SELECTOR = 'button[aria-label="Hỏi iKame"]';

/**
 * Panel hỏi nhanh (nút Sparkle trên topbar) — CÙNG engine `buildAgentReply` với
 * trang Trợ lý AI: một bộ intent, một staged reveal, một giọng trả lời.
 * Panel hẹp nên không render workspace nghiệp vụ; tác vụ có workspace hiện nút
 * "Mở trong Trợ lý AI" chuyển sang /assistant với đúng câu hỏi để thao tác đầy đủ.
 */
export function QuickAskPanel() {
  const {
    askOpen, setAskOpen, demoResetCount, perspective, user,
    news, events, goals, knowledgeDocs, leaveBalance, attention, memberEksStats, approvals,
    acknowledgeNews,
  } = useAppState();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<(ThreadMessage & { question?: string })[]>([]);
  const [input, setInput] = useState('');

  const capabilities = capabilitiesFor(perspective);

  // Reset hội thoại khi resetDemo (guard ref vì StrictMode gọi effect 2 lần lúc mount).
  const prevResetRef = useRef(demoResetCount);
  useEffect(() => {
    if (prevResetRef.current === demoResetCount) return;
    prevResetRef.current = demoResetCount;
    setMessages([]);
  }, [demoResetCount]);

  useEffect(() => {
    if (askOpen) closeButtonRef.current?.focus();
  }, [askOpen]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Staged reveal — cùng nhịp với trang Trợ lý AI (~600ms/step).
  useEffect(() => {
    const current = messages.find((message) => message.processing);
    if (!current) return;
    const total = (current.workspace?.steps ?? ['a', 'b', 'c']).length;
    const revealed = current.revealedSteps ?? 0;
    const timer = setTimeout(() => {
      setMessages((prev) => prev.map((message) => {
        if (message.id !== current.id) return message;
        if ((message.revealedSteps ?? 0) < total) return { ...message, revealedSteps: (message.revealedSteps ?? 0) + 1 };
        return { ...message, processing: false };
      }));
    }, revealed < total ? 600 : 400);
    return () => clearTimeout(timer);
  }, [messages]);

  const busy = messages.some((message) => message.processing || message.actionRunning);

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    const ctx = { user, news, events, goals, knowledgeDocs, leaveBalance, perspective, attention, memberEksStats, approvals };
    setMessages((prev) => [
      ...prev,
      { id: generateMessageId(), role: 'user' as const, text: trimmed },
      { id: generateMessageId(), ...buildAgentReply(trimmed, ctx), question: trimmed, processing: true, revealedSteps: 0 },
    ]);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    ask(input);
    setInput('');
  }

  function runInlineAction(messageId: string, action: AgentAction) {
    const target = messages.find((message) => message.id === messageId);
    if (target?.actionRunning || target?.actionDone) return;
    setMessages((prev) => prev.map((message) => (message.id === messageId ? { ...message, actionRunning: true } : message)));
    setTimeout(() => {
      if (action.kind === 'ack-news') acknowledgeNews(action.targetId);
      const receiptId = generateReceiptId();
      setMessages((prev) => prev.map((message) => (
        message.id === messageId ? { ...message, actionRunning: false, actionDone: true, receiptId } : message
      )));
    }, 1000);
  }

  function close() {
    setAskOpen(false);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(ASK_TRIGGER_SELECTOR)?.focus());
  }

  function openFull(question?: string) {
    setAskOpen(false);
    navigate(question ? `/assistant?q=${encodeURIComponent(question)}` : '/assistant');
  }

  function openLink(href: string) {
    setAskOpen(false);
    navigate(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], textarea, input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  if (!askOpen) return null;

  return (
    <div className="drawer-layer" role="presentation" onMouseDown={close}>
      <aside
        ref={panelRef}
        className="ask-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Trợ lý AI — hỏi nhanh"
        onKeyDown={onKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="ask-panel-header">
          <div>
            <h2><Sparkle size={16} weight="fill" /> Trợ lý AI</h2>
            <p className="ask-panel-disclosure">Hỏi nhanh — tác vụ đầy đủ mở ở trang Trợ lý AI.</p>
          </div>
          <div className="ask-panel-header-actions">
            <IconButton label="Mở toàn màn hình" onClick={() => openFull()}><ArrowsOutSimple size={18} /></IconButton>
            <IconButton ref={closeButtonRef} label="Đóng Trợ lý AI" onClick={close}><X size={20} /></IconButton>
          </div>
        </div>

        <div className="ask-panel-body" ref={bodyRef}>
          {messages.length === 0 ? (
            <p className="ask-panel-empty">Chọn một gợi ý bên dưới hoặc nhập câu hỏi để bắt đầu.</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`assistant-message assistant-message--${message.role}`}>
                {message.role === 'assistant' && (
                  <span className="assistant-avatar" aria-hidden="true"><Sparkle size={14} weight="fill" /></span>
                )}
                <div className="assistant-bubble">
                  {message.role === 'assistant' && <AssistantSteps message={message} />}
                  {!message.processing && (
                    <>
                      <p>{message.text}</p>
                      {!!message.links?.length && (
                        <div className="assistant-links">
                          {message.links.map((link) => (
                            <Link
                              key={link.to + link.label}
                              className="text-link"
                              to={link.to}
                              onClick={(event) => { event.preventDefault(); openLink(link.to); }}
                            >
                              {link.label}<ArrowRight size={14} />
                            </Link>
                          ))}
                        </div>
                      )}
                      {/* Tác vụ có workspace → chuyển sang trang đầy đủ để thao tác form/editor. */}
                      {message.workspace && !message.actionDone && (
                        <div className="assistant-actions">
                          <Button variant="primary" icon={<ArrowsOutSimple size={15} />} onClick={() => openFull(message.question)}>
                            Mở trong Trợ lý AI để thao tác
                          </Button>
                        </div>
                      )}
                      {message.action && !message.workspace && !message.actionDone && (
                        <div className="assistant-actions">
                          <Button variant="primary" disabled={message.actionRunning} onClick={() => runInlineAction(message.id, message.action!)}>
                            {message.actionRunning ? 'Đang thực thi...' : message.action.label}
                          </Button>
                        </div>
                      )}
                      {message.action && message.actionDone && (
                        <p className="assistant-receipt"><CheckCircle size={16} weight="fill" />{message.action.receipt} <span>#RCPT-{message.receiptId}</span></p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="ask-panel-chips">
          {capabilities.map((capability) => (
            <button key={capability.prompt} type="button" className="ai-chip" onClick={() => ask(capability.prompt)}>
              {capability.title}
            </button>
          ))}
        </div>

        <form className="ask-panel-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Nhắn cho Trợ lý AI..."
            aria-label="Hỏi Trợ lý AI"
          />
          <button type="submit" className="assistant-send" aria-label="Gửi câu hỏi" disabled={!input.trim() || busy}>
            <PaperPlaneTilt size={16} weight="fill" />
          </button>
        </form>
      </aside>
    </div>
  );
}
