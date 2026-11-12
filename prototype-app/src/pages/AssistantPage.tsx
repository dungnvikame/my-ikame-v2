import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRightIcon as ArrowRight, CheckCircleIcon as CheckCircle, ClockCounterClockwiseIcon as ClockCounterClockwise, NotePencilIcon as NotePencil, PaperPlaneTiltIcon as PaperPlaneTilt, SparkleIcon as Sparkle, TrashIcon as Trash } from '@coreds/react/icons';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLive } from '../lib/live/live-data';
import { ActionCard } from '../components/assistant/ActionCard';
import { detectActionCard, executeCard, type ActionCard as ActionCardData } from './assistant/assistant-actions';
import { useAppState } from '../AppState';
import { Button, IconButton, ChipButton } from '../components/UI';
import { buildAgentReply, type AgentAction } from './assistant/agent-replies';
import {
  clearSessions, loadSessions, questionCount, sanitizeForStorage, saveSessions,
  sessionTimeLabel, type StoredSession, type ThreadMessage,
} from './assistant/assistant-history';
import { AssistantSteps, AssistantToolsFooter, capabilitiesFor, CONNECTORS, generateMessageId, generateReceiptId, stepsOf } from './assistant/assistant-shared';
import { AssistantWorkspace, type OkrReportPayload } from './assistant/AssistantWorkspace';
import { documentReminders } from '../data/profile-data';
import { journeyDigestQuests } from '../lib/onboarding';
import { AgentMetricsCard } from '../components/assistant/AgentMetricsCard';
import { Input, Button as DsButton, Popover } from '@coreds/react';
import { trackFlow } from '../lib/metrics/metrics';

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
  const {
    user, news, events, goals, knowledgeDocs, leaveBalance, demoResetCount,
    perspective, attention, memberEksStats, approvals, dailyCheckIn, documents, isNewJoiner, journey, hrProfile,
    acknowledgeNews, submitReport, addRequest, addAttendanceRequest, recordAgentTask,
  } = useAppState();
  const capabilities = capabilitiesFor(perspective, isNewJoiner);
  const navigate = useNavigate();
  const liveManager = useLive().data?.igoal?.managerName;
  const chips = capabilities.map((capability) => capability.prompt);
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
    if (question.trim()) trackFlow('assistant', 'done');
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    if (!activeSessionId) setActiveSessionId(`s-${Date.now().toString(36)}`);
    const ctx = { user, news, events, goals, knowledgeDocs, leaveBalance, perspective, attention, memberEksStats, approvals, checkedIn: dailyCheckIn.done, documentReminders: documentReminders(documents), journeyQuests: isNewJoiner ? journeyDigestQuests(journey) : undefined };
    setMessages((prev) => [
      ...prev,
      { id: generateMessageId(), role: 'user', text: trimmed },
      // Ý định "làm việc" (tạo việc, lịch họp, mở đề xuất, soạn Slack) → thẻ xác nhận; còn lại → engine cũ.
      { id: generateMessageId(), ...(detectActionCard(trimmed, { userName: user.name, managerName: liveManager || hrProfile.managerName, perspective }) ?? buildAgentReply(trimmed, ctx)), processing: true, revealedSteps: 0, askedAt: Date.now() },
    ]);
  }

  function updateCard(messageId: string, changes: Partial<ActionCardData>) {
    setMessages((prev) => prev.map((message) => (message.id === messageId && message.card ? { ...message, card: { ...message.card, ...changes } } : message)));
  }

  // Xác nhận thẻ: chạy hành động cục bộ, ghi đo lường; thẻ "đề xuất" thì chuyển sang form đã điền sẵn.
  function confirmCard(messageId: string) {
    const target = messages.find((message) => message.id === messageId);
    const card = target?.card;
    if (!card || card.status === 'done') return;
    const result = executeCard(card);
    recordAgentTask({ ms: Date.now() - (target?.askedAt ?? Date.now()), tool: card.tool });
    updateCard(messageId, { status: 'done', result });
    if (card.kind === 'request' && result.link) navigate(result.link.to);
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
      // Đơn chấm công qua MCP iCheck — vào iRequest + dải tuần ở tab Công việc.
      if (action.kind === 'confirm' && action.commit === 'attendance' && action.attendance) {
        addAttendanceRequest(action.attendance);
      }
      recordAgentTask({ ms: Date.now() - (target?.askedAt ?? Date.now()), tool: action.tool });
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
        {chips.map((chip) => (
          <ChipButton key={chip} onClick={() => ask(chip)}>{chip}</ChipButton>
        ))}
      </div>
      <form className="assistant-input" onSubmit={handleSubmit}>
        <Sparkle size={20} variant="fill" className="assistant-input-spark" />
        <Input
          variant="borderless"
          size="l"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Nhắn cho Trợ lý AI..."
          aria-label="Hỏi Trợ lý AI"
        />
        <DsButton type="submit" variant="primary" size="icon-l" className="send-button" aria-label="Gửi câu hỏi"><PaperPlaneTilt size={18} variant="fill" /></DsButton>
      </form>
      <AssistantToolsFooter />
    </div>
  );

  if (empty) {
    return (
      <div className="page assistant-page assistant-page--empty">
        <div className="assistant-welcome">
          <span className="assistant-welcome-icon"><Sparkle size={26} variant="fill" /></span>
          <h1>Chào {user.shortName}, mình có thể giúp gì?</h1>
          <p>Hỏi đáp và nhờ Agent xử lý nghiệp vụ tại iKame — bạn duyệt, Agent thực thi.</p>
          <div className="assistant-connectors" aria-label="Nguồn đang kết nối">
            <span>Đang kết nối qua MCP:</span>
            {CONNECTORS.map((connector) => (
              <span key={connector.name} className={`assistant-connector is-${connector.status}`} title={`${connector.tools} tool · ${connector.status === 'connected' ? 'hoạt động' : connector.status === 'degraded' ? 'chậm' : 'mất kết nối'}`}>
                {connector.name}
              </span>
            ))}
          </div>
          <AgentMetricsCard />
          <form className="assistant-input assistant-input--hero" onSubmit={handleSubmit}>
            <Sparkle size={20} variant="fill" className="assistant-input-spark" />
            <Input
              variant="borderless"
              size="l"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder='Hỏi Trợ lý AI: "Đặt phòng họp 14:00 hôm nay..."'
              aria-label="Hỏi Trợ lý AI"
              autoFocus
            />
            <DsButton type="submit" variant="primary" size="icon-l" className="send-button" aria-label="Gửi câu hỏi"><PaperPlaneTilt size={18} variant="fill" /></DsButton>
          </form>
          <div className="assistant-capabilities">
            {capabilities.map(({ icon: Icon, title, prompt }) => (
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
          <AssistantToolsFooter />
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
            <Popover
              side="bottom"
              trigger={<IconButton label="Lịch sử trò chuyện"><ClockCounterClockwise size={18} /></IconButton>}
            >
              <div className="assistant-history-popover">
                <p className="assistant-history-pop-title">Lịch sử trò chuyện</p>
                <HistoryList sessions={sessions} onResume={resumeSession} onDelete={deleteSession} />
              </div>
            </Popover>
          </header>
          <div className="assistant-thread" role="log" aria-live="polite" ref={threadRef}>
            {messages.map((message) => (
              <div key={message.id} className={`assistant-message assistant-message--${message.role}`}>
                {message.role === 'assistant' && (
                  <span className="assistant-avatar" aria-hidden="true"><Sparkle size={14} variant="fill" /></span>
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
                      {!!message.sources?.length && (
                        <div className="assistant-sources" aria-label="Nguồn dữ liệu">
                          <span className="assistant-sources-label">Nguồn</span>
                          {message.sources.map((source) => <span key={source}>{source}</span>)}
                        </div>
                      )}
                      {/* Tác vụ có workspace: nút duyệt nằm ở khung bên phải, chat chỉ giữ hội thoại. */}
                      {message.card && (
                        <ActionCard card={message.card} onChange={(changes) => updateCard(message.id, changes)} onConfirm={() => confirmCard(message.id)} />
                      )}
                      {message.action && !message.workspace && !message.actionDone && (
                        <div className="assistant-actions">
                          <Button variant="primary" disabled={message.actionRunning} onClick={() => runAction(message.id, message.action!)}>
                            {message.actionRunning ? 'Đang thực thi...' : message.action.label}
                          </Button>
                        </div>
                      )}
                      {message.action && !message.workspace && message.actionDone && (
                        <p className="assistant-receipt">
                          <CheckCircle size={16} variant="fill" />{message.action.receipt} <span>#RCPT-{message.receiptId}</span>
                          {message.action.tool && <span className="assistant-receipt-tool">via MCP · {message.action.tool}</span>}
                        </p>
                      )}
                      {message.action && message.workspace && message.actionDone && (
                        <p className="assistant-receipt"><CheckCircle size={16} variant="fill" />{message.action.receipt}</p>
                      )}
                      {!!message.toolCalls?.length && (
                        <p className="assistant-toolcalls" aria-label="Tool MCP đã gọi">
                          {message.toolCalls.map((tool) => <code key={tool}>{tool}</code>)}
                        </p>
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
