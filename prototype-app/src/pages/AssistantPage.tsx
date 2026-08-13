import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  AirplaneTilt, ArrowRight, CalendarPlus, CheckCircle, CircleNotch, ClockCounterClockwise,
  NotePencil, PaperPlaneTilt, SealCheck, Sparkle, Target, Trash, Wrench,
} from '@phosphor-icons/react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { Button, IconButton } from '../components/UI';
import { buildAgentReply, type AgentAction } from './assistant/agent-replies';
import {
  clearSessions, loadSessions, questionCount, sanitizeForStorage, saveSessions,
  sessionTimeLabel, type StoredSession, type ThreadMessage,
} from './assistant/assistant-history';
import { AssistantWorkspace, type OkrReportPayload } from './assistant/AssistantWorkspace';

/** Steps mặc định cho các intent không có workspace (hỏi đáp thuần). */
const GENERIC_STEPS = ['Đã hiểu yêu cầu của bạn', 'Đã tra cứu dữ liệu liên quan', 'Đã tổng hợp câu trả lời'];

function stepsOf(message: ThreadMessage): string[] {
  return message.workspace?.steps ?? GENERIC_STEPS;
}

const CAPABILITIES = [
  { icon: CalendarPlus, title: 'Đặt phòng họp', prompt: 'Đặt phòng họp 14:00 hôm nay cho 6 người' },
  { icon: Wrench, title: 'Request IT support', prompt: 'Tạo request IT support: laptop không kết nối được wifi' },
  { icon: Target, title: 'Mục tiêu & check-in', prompt: 'Mục tiêu nào của tôi cần cập nhật?' },
  { icon: NotePencil, title: 'Viết bài iWiki', prompt: 'Viết bài iWiki về quy trình onboarding thành viên mới' },
  { icon: AirplaneTilt, title: 'Nghỉ phép & HR', prompt: 'Tôi còn bao nhiêu ngày nghỉ phép?' },
  { icon: SealCheck, title: 'Việc cần xác nhận', prompt: 'Tôi có việc gì cần xác nhận?' },
];

const CHIPS = CAPABILITIES.map((capability) => capability.prompt);

function generateReceiptId() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

/** Id không đụng nhau kể cả khi mở lại phiên cũ từ lịch sử. */
function generateMessageId() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Khối "AI steps" trong bong bóng chat: đang xử lý thì tick dần, step cuối quay spinner. */
function AssistantSteps({ message }: { message: ThreadMessage }) {
  const steps = stepsOf(message);
  const revealed = message.revealedSteps ?? 0;
  const visible = message.processing ? steps.slice(0, Math.min(revealed + 1, steps.length)) : steps;
  return (
    <div className="assistant-steps" aria-label="AI steps">
      <p className="assistant-steps-title"><Sparkle size={13} weight="fill" />AI steps</p>
      <ul>
        {visible.map((step, index) => {
          const running = !!message.processing && revealed < steps.length && index === visible.length - 1;
          return (
            <li key={step} className={running ? 'is-running' : ''}>
              {running ? <CircleNotch size={14} className="assistant-step-spinner" /> : <CheckCircle size={14} weight="fill" />}
              <span>{step}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Danh sách phiên cũ — dùng chung cho popover lịch sử và mục "Gần đây" ở màn chào. */
function HistoryList({ sessions, onResume, onDelete }: {
  sessions: StoredSession[];
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (sessions.length === 0) return <p className="assistant-history-empty">Chưa có cuộc trò chuyện nào được lưu.</p>;
  return (
    <ul className="assistant-history-list">
      {sessions.map((session) => (
        <li key={session.id}>
          <button type="button" className="assistant-history-item" onClick={() => onResume(session.id)}>
            <strong>{session.title}</strong>
            <small>{sessionTimeLabel(session.savedAt)} · {questionCount(session)} lượt hỏi</small>
          </button>
          <IconButton label={`Xóa cuộc trò chuyện: ${session.title}`} onClick={() => onDelete(session.id)}><Trash size={15} /></IconButton>
        </li>
      ))}
    </ul>
  );
}

export function AssistantPage() {
  const { user, news, events, goals, knowledgeDocs, leaveBalance, demoResetCount, acknowledgeNews, submitReport, addRequest } = useAppState();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [input, setInput] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const threadRef = useRef<HTMLDivElement>(null);
  const consumedQueryRef = useRef<string | null>(null);
  const splitRef = useRef<HTMLDivElement>(null);

  // Lịch sử hội thoại — xem lại/tiếp tục các phiên cũ, lưu localStorage.
  const [sessions, setSessions] = useState<StoredSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Chat hẹp hơn workspace (mặc định 380px ≈ 1/3) — người dùng kéo thanh giữa để
  // tùy chỉnh, độ rộng được nhớ qua localStorage.
  const [chatWidth, setChatWidth] = useState(() => {
    try {
      const saved = Number(localStorage.getItem('my-ikame-assistant-chat-w'));
      return saved >= 300 && saved <= 900 ? saved : 380;
    } catch { return 380; }
  });

  function clampChatWidth(next: number): number {
    const containerWidth = splitRef.current?.getBoundingClientRect().width ?? 1200;
    return Math.max(300, Math.min(next, containerWidth * 0.6));
  }

  function persistChatWidth(width: number) {
    try { localStorage.setItem('my-ikame-assistant-chat-w', String(Math.round(width))); } catch { /* private mode */ }
  }

  function startResize(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const container = splitRef.current;
    if (!container) return;
    const containerLeft = container.getBoundingClientRect().left;
    const onMove = (move: PointerEvent) => setChatWidth(clampChatWidth(move.clientX - containerLeft));
    const onUp = (up: PointerEvent) => {
      setChatWidth((current) => { persistChatWidth(current); return current; });
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      void up;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function resizeByKeyboard(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setChatWidth((current) => {
      const next = clampChatWidth(current + (event.key === 'ArrowRight' ? 24 : -24));
      persistChatWidth(next);
      return next;
    });
  }

  // Chỉ xoá hội thoại khi resetDemo thực sự chạy — guard bằng ref vì StrictMode
  // gọi effect hai lần lúc mount, nếu không sẽ nuốt mất câu hỏi từ ?q=.
  const prevResetRef = useRef(demoResetCount);
  useEffect(() => {
    if (prevResetRef.current === demoResetCount) return;
    prevResetRef.current = demoResetCount;
    setMessages([]);
    setActiveSessionId(null);
    setSessions([]);
    clearSessions();
  }, [demoResetCount]);

  // Đồng bộ phiên đang chat vào lịch sử — chỉ lưu khi lượt đã "settle" (hết
  // processing/actionRunning) để bản ghi không dính trạng thái dở dang.
  useEffect(() => {
    if (!activeSessionId || messages.length === 0) return;
    if (messages.some((message) => message.processing || message.actionRunning)) return;
    setSessions((prev) => {
      const title = messages.find((message) => message.role === 'user')?.text.slice(0, 60) ?? 'Cuộc trò chuyện';
      const entry: StoredSession = { id: activeSessionId, title, savedAt: Date.now(), messages: sanitizeForStorage(messages) };
      const next = [entry, ...prev.filter((session) => session.id !== activeSessionId)];
      saveSessions(next);
      return next;
    });
  }, [messages, activeSessionId]);

  function startNewChat() {
    setActiveSessionId(null);
    setMessages([]);
    setHistoryOpen(false);
  }

  function resumeSession(id: string) {
    const session = sessions.find((item) => item.id === id);
    if (!session) return;
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setHistoryOpen(false);
  }

  function deleteSession(id: string) {
    setSessions((prev) => {
      const next = prev.filter((session) => session.id !== id);
      saveSessions(next);
      return next;
    });
    if (id === activeSessionId) startNewChat();
  }

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Staged reveal: mỗi ~600ms tick thêm một AI step của lượt đang xử lý; hết
  // steps thì nghỉ nhịp ngắn rồi mới lộ câu trả lời + workspace (hiệu ứng demo).
  useEffect(() => {
    const current = messages.find((message) => message.processing);
    if (!current) return;
    const total = stepsOf(current).length;
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
    if (!activeSessionId) setActiveSessionId(`s-${Date.now().toString(36)}`);
    const ctx = { user, news, events, goals, knowledgeDocs, leaveBalance };
    setMessages((prev) => [
      ...prev,
      { id: generateMessageId(), role: 'user', text: trimmed },
      { id: generateMessageId(), ...buildAgentReply(trimmed, ctx), processing: true, revealedSteps: 0 },
    ]);
  }

  // Deep link từ hero trang chủ: /assistant?q=... — chạy đúng một lần rồi xoá param
  // (guard bằng ref vì StrictMode gọi effect hai lần).
  useEffect(() => {
    const query = searchParams.get('q');
    if (!query || consumedQueryRef.current === query) return;
    consumedQueryRef.current = query;
    ask(query);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    ask(input);
    setInput('');
  }

  function runAction(messageId: string, action: AgentAction, payload?: OkrReportPayload) {
    const target = messages.find((message) => message.id === messageId);
    if (target?.actionRunning || target?.actionDone) return;
    // "Đang thực thi..." ~1s trước khi trả receipt — cùng lý do staged reveal.
    setMessages((prev) => prev.map((message) => (
      message.id === messageId ? { ...message, actionRunning: true } : message
    )));
    setTimeout(() => {
      if (action.kind === 'ack-news') acknowledgeNews(action.targetId);
      // Báo cáo OKR gửi THẬT vào AppState — trang Mục tiêu cập nhật ngay (đúng nghiệp vụ iGoal).
      if (action.kind === 'confirm' && action.commit === 'report' && payload) {
        submitReport({ ...payload, authorName: user.name, source: 'ai' });
      }
      // Request gửi THẬT vào iRequest center — theo dõi được ở /requests.
      if (action.kind === 'confirm' && action.commit === 'request' && action.request) {
        addRequest(action.request);
      }
      const receiptId = generateReceiptId();
      setMessages((prev) => prev.map((message) => (
        message.id === messageId ? { ...message, actionRunning: false, actionDone: true, receiptId } : message
      )));
    }, 1000);
  }

  const empty = messages.length === 0;
  // Workspace đang hoạt động = của lượt trả lời gần nhất có giao diện tác vụ,
  // và chỉ hiện sau khi các AI step đã chạy xong (staged reveal).
  const workspaceMessage = [...messages].reverse().find(
    (message) => message.role === 'assistant' && message.workspace && !message.processing,
  );

  const composer = (
    <div className="assistant-composer">
      <div className="assistant-chips">
        {CHIPS.map((chip) => (
          <button key={chip} type="button" className="ai-suggestion-chip" onClick={() => ask(chip)}>{chip}</button>
        ))}
      </div>
      <form className="assistant-input" onSubmit={handleSubmit}>
        <Sparkle size={20} weight="fill" className="assistant-input-spark" />
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Nhắn cho Trợ lý AI..."
          aria-label="Hỏi Trợ lý AI"
        />
        <button type="submit" className="assistant-send" aria-label="Gửi câu hỏi"><PaperPlaneTilt size={18} weight="fill" /></button>
      </form>
    </div>
  );

  if (empty) {
    return (
      <div className="page assistant-page assistant-page--empty">
        <div className="assistant-welcome">
          <span className="assistant-welcome-icon"><Sparkle size={26} weight="fill" /></span>
          <h1>Chào {user.shortName}, mình có thể giúp gì?</h1>
          <p>Hỏi đáp và nhờ Agent xử lý nghiệp vụ tại iKame — bạn duyệt, Agent thực thi.</p>
          <form className="assistant-input assistant-input--hero" onSubmit={handleSubmit}>
            <Sparkle size={20} weight="fill" className="assistant-input-spark" />
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder='Hỏi Trợ lý AI: "Đặt phòng họp 14:00 hôm nay..."'
              aria-label="Hỏi Trợ lý AI"
              autoFocus
            />
            <button type="submit" className="assistant-send" aria-label="Gửi câu hỏi"><PaperPlaneTilt size={18} weight="fill" /></button>
          </form>
          <div className="assistant-capabilities">
            {CAPABILITIES.map(({ icon: Icon, title, prompt }) => (
              <button key={title} type="button" className="assistant-capability" onClick={() => ask(prompt)}>
                <span className="assistant-capability-icon"><Icon size={20} /></span>
                <strong>{title}</strong>
                <small>“{prompt}”</small>
              </button>
            ))}
          </div>
          {sessions.length > 0 && (
            <div className="assistant-recent" aria-label="Cuộc trò chuyện gần đây">
              <p className="assistant-recent-title"><ClockCounterClockwise size={14} />Gần đây</p>
              <HistoryList sessions={sessions.slice(0, 4)} onResume={resumeSession} onDelete={deleteSession} />
            </div>
          )}
          <p className="assistant-disclosure">Concept demo — trả lời theo kịch bản trên dữ liệu mẫu, chưa xử lý văn bản tự do.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page assistant-page assistant-page--split">
      <div className="assistant-split" ref={splitRef} style={{ '--assistant-chat-w': `${chatWidth}px` } as React.CSSProperties}>
        <section className="assistant-chat" aria-label="Hội thoại với Trợ lý AI">
          <header className="assistant-chat-head">
            <div className="assistant-chat-head-copy">
              <strong>{messages.find((message) => message.role === 'user')?.text ?? 'Cuộc trò chuyện mới'}</strong>
              <small>{messages.filter((message) => message.role === 'user').length} lượt hỏi</small>
            </div>
            <IconButton label="Cuộc trò chuyện mới" onClick={startNewChat}><NotePencil size={18} /></IconButton>
            <IconButton label="Lịch sử trò chuyện" onClick={() => setHistoryOpen((open) => !open)}><ClockCounterClockwise size={18} /></IconButton>
            {historyOpen && (
              <div className="assistant-history-pop" role="dialog" aria-label="Lịch sử trò chuyện">
                <p className="assistant-history-pop-title">Lịch sử trò chuyện</p>
                <HistoryList sessions={sessions} onResume={resumeSession} onDelete={deleteSession} />
              </div>
            )}
          </header>
          <div className="assistant-thread" role="log" aria-live="polite" ref={threadRef}>
            {messages.map((message) => (
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
                            <Link key={link.to + link.label} className="text-link" to={link.to}>{link.label}<ArrowRight size={14} /></Link>
                          ))}
                        </div>
                      )}
                      {/* Tác vụ có workspace: nút duyệt nằm ở khung bên phải, chat chỉ giữ hội thoại. */}
                      {message.action && !message.workspace && !message.actionDone && (
                        <div className="assistant-actions">
                          <Button variant="primary" disabled={message.actionRunning} onClick={() => runAction(message.id, message.action!)}>
                            {message.actionRunning ? 'Đang thực thi...' : message.action.label}
                          </Button>
                        </div>
                      )}
                      {message.action && !message.workspace && message.actionDone && (
                        <p className="assistant-receipt"><CheckCircle size={16} weight="fill" />{message.action.receipt} <span>#RCPT-{message.receiptId}</span></p>
                      )}
                      {message.action && message.workspace && message.actionDone && (
                        <p className="assistant-receipt"><CheckCircle size={16} weight="fill" />{message.action.receipt}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {composer}
        </section>

        <div
          className="assistant-resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="Kéo để chỉnh độ rộng khung chat"
          tabIndex={0}
          onPointerDown={startResize}
          onKeyDown={resizeByKeyboard}
        >
          <span aria-hidden="true" />
        </div>

        <AssistantWorkspace
          key={workspaceMessage?.id ?? 'empty'}
          workspace={workspaceMessage?.workspace}
          action={workspaceMessage?.action}
          actionDone={workspaceMessage?.actionDone}
          actionRunning={workspaceMessage?.actionRunning}
          receiptId={workspaceMessage?.receiptId}
          onRunAction={workspaceMessage?.action ? (payload) => runAction(workspaceMessage.id, workspaceMessage.action!, payload) : undefined}
        />
      </div>
    </div>
  );
}
