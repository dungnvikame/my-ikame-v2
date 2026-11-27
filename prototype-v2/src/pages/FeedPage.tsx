import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  Bookmark,
  Cake,
  Calendar,
  CheckCircle2,
  Flame,
  Heart,
  MessageCircle,
  Pin,
  PinOff,
  Plus,
  Send,
  Share2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { moderateVietnameseContent, ModerationResult } from '../lib/moderation';
import { Avatar, Modal } from '../components/UI';

type FeedTab = 'all' | 'team' | 'official' | 'saved';

export const FeedPage: React.FC = () => {
  const {
    posts,
    events,
    people,
    currentPerson,
    lens,
    acknowledgePost,
    toggleReaction,
    toggleSavePost,
    addComment,
    createPost,
    togglePinPost,
    wishBirthday,
    pushToast,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<'share' | 'kudos'>('share');
  const [draftContent, setDraftContent] = useState('');
  const [draftAudience, setDraftAudience] = useState<string>('all');
  const [kudosRecipientId, setKudosRecipientId] = useState<string>('');
  const [kudosTag, setKudosTag] = useState<string>('Chủ động & Tinh gọn');
  const [moderationBlock, setModerationBlock] = useState<ModerationResult | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [showComModal, setShowComModal] = useState(false);

  // COM CMS modal state (FD-13)
  const [comTitle, setComTitle] = useState('');
  const [comBody, setComBody] = useState('');
  const [comAudience, setComAudience] = useState('all');
  const [comMandatory, setComMandatory] = useState(true);
  const [comDeadline, setComDeadline] = useState('05/12/2026');
  const [comPinned, setComPinned] = useState(true);

  // Deep-link ?compose=kudos&to=... (PRD §7.3 FD-11)
  useEffect(() => {
    const mode = searchParams.get('compose');
    const to = searchParams.get('to');
    if (mode === 'kudos') {
      setComposeMode('kudos');
      setComposerOpen(true);
      if (to && to !== currentPerson.id) {
        setKudosRecipientId(to);
      }
    }
  }, [searchParams, currentPerson.id]);

  // Audience-filtered posts (R-L4)
  const visiblePosts = useMemo(
    () => posts.filter((p) => p.audience === 'all' || p.audience === currentPerson.team || lens === 'com_admin'),
    [posts, currentPerson.team, lens]
  );

  // Pinned carousel items (FD-2)
  const pinnedPosts = useMemo(() => visiblePosts.filter((p) => p.pinned), [visiblePosts]);

  // Mention notification banner (FD-11)
  const mentionedPost = useMemo(
    () =>
      visiblePosts.find((p) =>
        p.comments.some((c) => c.mentions?.includes(currentPerson.id))
      ),
    [visiblePosts, currentPerson.id]
  );

  // Filtered feed list (FD-1, FD-3: unacked mandatory pushed to top)
  const filteredPosts = useMemo(() => {
    let list = visiblePosts;
    if (activeTab === 'team') {
      list = visiblePosts.filter((p) => p.audience === currentPerson.team || p.authorTeam === currentPerson.team);
    } else if (activeTab === 'official') {
      list = visiblePosts.filter((p) => p.kind === 'official');
    } else if (activeTab === 'saved') {
      list = visiblePosts.filter((p) => p.savedBy.includes(currentPerson.id));
    }
    return [...list].sort((a, b) => {
      const aUnacked = lens !== 'com_admin' && a.mandatoryAck && !a.ackedBy[currentPerson.id] ? 1 : 0;
      const bUnacked = lens !== 'com_admin' && b.mandatoryAck && !b.ackedBy[currentPerson.id] ? 1 : 0;
      if (aUnacked !== bUnacked) return bUnacked - aUnacked;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [visiblePosts, activeTab, currentPerson, lens]);

  const eligibleRecipients = people.filter((p) => p.id !== currentPerson.id);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftContent.trim()) return;
    if (composeMode === 'kudos' && !kudosRecipientId) {
      pushToast({ title: 'Vui lòng chọn đồng nghiệp nhận Kudos', tone: 'warning' });
      return;
    }

    // PRD §7.3 FD-7: Real-time Vietnamese Unicode NFC auto-moderation (no pre-approval)
    const mod = moderateVietnameseContent(draftContent);
    if (!mod.allowed) {
      setModerationBlock(mod);
      return;
    }

    setModerationBlock(null);
    createPost({
      kind: composeMode === 'kudos' ? 'kudos' : 'community',
      content: draftContent.trim(),
      audience: composeMode === 'kudos' ? 'all' : draftAudience,
      kudosRecipientId: composeMode === 'kudos' ? kudosRecipientId : undefined,
      kudosTag: composeMode === 'kudos' ? kudosTag : undefined,
    });
    setDraftContent('');
    setKudosRecipientId('');
    setComposerOpen(false);
    if (searchParams.get('compose')) {
      setSearchParams({});
    }
  };

  const handlePublishCom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comTitle.trim() || !comBody.trim()) return;
    createPost({
      kind: 'official',
      title: comTitle.trim(),
      content: comBody.trim(),
      audience: comAudience,
      mandatoryAck: comMandatory,
      ackDeadline: comDeadline,
      pinned: comPinned,
    });
    setComTitle('');
    setComBody('');
    setShowComModal(false);
  };

  const upcomingEvents = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').slice(0, 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">iKame Feed</h1>
        </div>
        {lens === 'com_admin' && (
          <button type="button" className="btn btn-primary" onClick={() => setShowComModal(true)}>
            <Plus size={15} /> Soạn thông báo
          </button>
        )}
      </div>

      {/* Mention Banner (FD-11) */}
      {mentionedPost && (
        <div className="banner banner-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageCircle size={17} style={{ color: 'var(--info-fg)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-strong)' }}>
              Bài viết <strong>"{mentionedPost.title}"</strong> có bình luận mới nhắc tên bạn.
            </span>
          </div>
          <Link to={`/feed/article/${mentionedPost.id}`} className="btn btn-secondary btn-sm">
            Xem bình luận
          </Link>
        </div>
      )}

      {/* Pinned Carousel (FD-2 + inline unpin for COM Admin fixing PRD §13.6!) */}
      {pinnedPosts.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>
              <Pin size={14} style={{ color: 'var(--brand-primary-fg)' }} /> Bài ghim chính thức ({pinnedPosts.length})
            </div>
          </div>
          <div className="grid-2">
            {pinnedPosts.map((p) => {
              const isUnacked = lens !== 'com_admin' && p.mandatoryAck && !p.ackedBy[currentPerson.id];
              return (
                <div
                  key={p.id}
                  className="card-compact"
                  style={{
                    borderColor: isUnacked ? 'var(--error-border)' : 'var(--border-strong)',
                    background: isUnacked ? 'var(--error-bg)' : 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-strong">COM Ghim</span>
                      {p.mandatoryAck && (
                        <span className={`badge ${p.ackedBy[currentPerson.id] ? 'badge-success' : p.ackOverdue ? 'badge-error' : 'badge-warning'}`}>
                          {lens === 'com_admin'
                            ? `${Math.round(((162 + Object.keys(p.ackedBy).length) / p.totalAudienceCount) * 100)}% đã đọc`
                            : p.ackedBy[currentPerson.id]
                              ? 'Đã xác nhận'
                              : p.ackOverdue
                                ? 'Quá hạn xác nhận'
                                : `Hạn ${p.ackDeadline}`}
                        </span>
                      )}
                    </div>
                    {lens === 'com_admin' && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => togglePinPost(p.id)}
                        title="Bỏ ghim tại chỗ"
                      >
                        <PinOff size={14} /> Bỏ ghim
                      </button>
                    )}
                  </div>
                  <Link
                    to={`/feed/article/${p.id}`}
                    style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-strong)', lineHeight: 1.35 }}
                  >
                    {p.title}
                  </Link>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{p.summary}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 4 }}>
                    <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                      Ghim tới {p.pinExpiresAt || '05/12/2026'}
                    </span>
                    <Link to={`/feed/article/${p.id}`} className="btn btn-secondary btn-sm">
                      {isUnacked ? 'Đọc & xác nhận' : 'Xem chi tiết'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Content + Right Rail */}
      <div className="layout-with-rail">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Collapsible Lark/Slack-style Composer (Progressive Disclosure!) */}
          {!composerOpen ? (
            <div
              className="card-compact"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
              }}
            >
              <Avatar person={currentPerson} size={34} />
              <button
                type="button"
                onClick={() => {
                  setComposeMode('share');
                  setComposerOpen(true);
                }}
                style={{
                  flex: 1,
                  height: 36,
                  textAlign: 'left',
                  padding: '0 14px',
                  borderRadius: 'var(--r-full)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-tertiary)',
                  fontSize: 13.5,
                }}
              >
                Chia sẻ cập nhật cùng iKamer...
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setComposeMode('kudos');
                  setComposerOpen(true);
                }}
              >
                <Award size={14} style={{ color: 'var(--violet-fg)' }} /> Gửi Kudos
              </button>
            </div>
          ) : (
          <form className="card" onSubmit={handleSubmitPost}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${composeMode === 'share' ? 'btn-secondary' : 'btn-ghost'}`}
                  onClick={() => {
                    setComposeMode('share');
                    setModerationBlock(null);
                  }}
                >
                  Chia sẻ
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${composeMode === 'kudos' ? 'btn-secondary' : 'btn-ghost'}`}
                  onClick={() => {
                    setComposeMode('kudos');
                    setModerationBlock(null);
                  }}
                >
                  <Award size={14} style={{ color: 'var(--violet-fg)' }} /> Ghi nhận (Kudos)
                </button>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setComposerOpen(false);
                  setModerationBlock(null);
                }}
              >
                Thu gọn
              </button>
            </div>

            {composeMode === 'kudos' && (
              <div className="grid-2" style={{ marginBottom: 10, gap: 10 }}>
                <div>
                  <label className="field-label">Chọn người nhận (không tự ghi nhận mình)</label>
                  <select
                    className="select"
                    value={kudosRecipientId}
                    onChange={(e) => setKudosRecipientId(e.target.value)}
                  >
                    <option value="">— Chọn đồng nghiệp iKame —</option>
                    {eligibleRecipients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.team}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Giá trị cốt lõi</label>
                  <select className="select" value={kudosTag} onChange={(e) => setKudosTag(e.target.value)}>
                    <option value="Chủ động & Tinh gọn">Chủ động & Tinh gọn</option>
                    <option value="Đồng đội tuyệt vời">Đồng đội tuyệt vời</option>
                    <option value="Tư duy AI-Native">Tư duy AI-Native</option>
                    <option value="Tận tâm với người dùng">Tận tâm với người dùng</option>
                  </select>
                </div>
              </div>
            )}

            <textarea
              className="textarea"
              value={draftContent}
              onChange={(e) => {
                setDraftContent(e.target.value);
                if (moderationBlock) setModerationBlock(null);
              }}
              placeholder={
                composeMode === 'kudos'
                  ? 'Chia sẻ lý do bạn muốn gửi lời cảm ơn/khen thưởng đồng nghiệp (VD: "Cảm ơn Huy đã hỗ trợ...")'
                  : 'Chia sẻ tin vui, bài học hoặc cập nhật cùng iKamer... (Thử gõ "mật khẩu" để kiểm chứng bộ lọc tự động)'
              }
            />

            {/* Moderation Warning Box (FD-7) */}
            {moderationBlock && !moderationBlock.allowed && (
              <div
                style={{
                  marginTop: 10,
                  padding: '11px 13px',
                  borderRadius: 'var(--r-8)',
                  background: 'var(--error-bg)',
                  border: '1px solid var(--error-border)',
                  display: 'flex',
                  gap: 10,
                }}
              >
                <ShieldAlert size={18} style={{ color: 'var(--error-fg)', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 12.5 }}>
                  <div style={{ fontWeight: 700, color: 'var(--error-fg)' }}>
                    Chưa thể đăng — {moderationBlock.categoryLabel}
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginTop: 2 }}>{moderationBlock.reason}</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                    <strong>Gợi ý:</strong> {moderationBlock.suggestion}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
              {composeMode === 'share' ? (
                <select
                  className="select"
                  style={{ width: 'auto', padding: '5px 10px', fontSize: 12.5 }}
                  value={draftAudience}
                  onChange={(e) => setDraftAudience(e.target.value)}
                >
                  <option value="all">Hiển thị: Toàn công ty</option>
                  <option value={currentPerson.team}>Chỉ Team {currentPerson.team}</option>
                </select>
              ) : (
                <span className="badge badge-violet">Hiển thị công khai để lan toả ghi nhận</span>
              )}

              <button
                type="submit"
                className={`btn btn-sm ${lens !== 'com_admin' ? 'btn-primary' : 'btn-secondary'}`}
                disabled={!draftContent.trim()}
              >
                <Send size={13} /> {composeMode === 'kudos' ? 'Gửi Kudos' : 'Đăng bài'}
              </button>
            </div>
          </form>
          )}

          {/* 4 Feed Tabs (FD-1) */}
          <div className="tabs-bar" role="tablist">
            {(
              [
                { id: 'all', label: 'Toàn công ty', count: visiblePosts.length },
                { id: 'team', label: `Team của mình (${currentPerson.team})`, count: visiblePosts.filter((p) => p.audience === currentPerson.team || p.authorTeam === currentPerson.team).length },
                { id: 'official', label: 'Thông báo', count: visiblePosts.filter((p) => p.kind === 'official').length },
                { id: 'saved', label: 'Đã lưu', count: visiblePosts.filter((p) => p.savedBy.includes(currentPerson.id)).length },
              ] as { id: FeedTab; label: string; count: number }[]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label} <span className="tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Posts Stream */}
          {filteredPosts.length === 0 ? (
            <div className="card empty-state">
              <div style={{ fontWeight: 600, color: 'var(--text-strong)', marginBottom: 4 }}>
                Chưa có bài viết trong mục này
              </div>
              <div style={{ fontSize: 13 }}>
                Bạn có thể bấm biểu tượng lưu trên bất kỳ thông báo chính thức hoặc bài cộng đồng nào để xem lại sau.
              </div>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isAcked = Boolean(post.ackedBy[currentPerson.id]);
              const isSaved = post.savedBy.includes(currentPerson.id);
              const hearted = post.reactions.heart.includes(currentPerson.id);
              const clapped = post.reactions.clap.includes(currentPerson.id);
              const commentsVisible = openComments[post.id] || post.comments.length > 0;

              return (
                <article
                  key={post.id}
                  className="card"
                  style={{
                    borderColor:
                      post.kind === 'official'
                        ? post.mandatoryAck && !isAcked && lens !== 'com_admin'
                          ? 'var(--error-border)'
                          : 'var(--border-strong)'
                        : 'var(--border-primary)',
                  }}
                >
                  {/* Post Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar
                        person={people.find((p) => p.id === post.authorId)}
                        initials={post.kind === 'lifecycle' ? 'HR' : post.authorName.slice(0, 2).toUpperCase()}
                        size={36}
                      />
                      <div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>
                            {post.authorName}
                          </span>
                          {post.kind === 'official' && <span className="badge badge-strong">COM Chính thức</span>}
                          {post.kind === 'kudos' && <span className="badge badge-violet">Kudos</span>}
                          {post.kind === 'lifecycle' && (
                            <span className="badge badge-info">{post.lifecycleSource || 'HRIS Tự động'}</span>
                          )}
                          {post.audience !== 'all' && (
                            <span className="badge badge-neutral">Team {post.audience}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                          {post.authorTitle} · {post.timeLabel}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {lens === 'com_admin' && post.kind === 'official' && (
                        <button
                          type="button"
                          className="btn-icon"
                          title={post.pinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                          onClick={() => togglePinPost(post.id)}
                        >
                          {post.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => toggleSavePost(post.id)}
                        title={isSaved ? 'Bỏ lưu' : 'Lưu bài viết'}
                        aria-label={isSaved ? 'Bỏ lưu' : 'Lưu bài viết'}
                      >
                        <Bookmark
                          size={16}
                          fill={isSaved ? 'currentColor' : 'none'}
                          style={{ color: isSaved ? 'var(--brand-primary-fg)' : undefined }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Kudos Banner */}
                  {post.kind === 'kudos' && post.kudosRecipientName && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--r-10)',
                        background: 'var(--violet-bg)',
                        border: '1px solid var(--violet-border)',
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--violet-fg)', fontWeight: 600 }}>
                        <Award size={16} /> Ghi nhận gửi tới {post.kudosRecipientName}
                      </div>
                      {post.kudosTag && <span className="badge badge-violet">{post.kudosTag}</span>}
                    </div>
                  )}

                  {/* Title + Body */}
                  {post.title && (
                    <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.35 }}>
                      {post.kind === 'official' ? (
                        <Link to={`/feed/article/${post.id}`}>{post.title}</Link>
                      ) : (
                        post.title
                      )}
                    </h3>
                  )}
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.62, whiteSpace: 'pre-line' }}>
                    {post.kind === 'official' && post.summary ? post.summary : post.content}
                  </p>

                  {/* Mandatory Ack Strip (FD-3) */}
                  {post.mandatoryAck && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: '10px 13px',
                        borderRadius: 'var(--r-8)',
                        background: isAcked ? 'var(--success-bg)' : post.ackOverdue ? 'var(--error-bg)' : 'var(--warning-bg)',
                        border: `1px solid ${isAcked ? 'var(--success-border)' : post.ackOverdue ? 'var(--error-border)' : 'var(--warning-border)'}`,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                      }}
                    >
                      <div style={{ fontSize: 12.5 }}>
                        {lens === 'com_admin' ? (
                          <span style={{ color: 'var(--text-strong)', fontWeight: 600 }}>
                            Phân phối COM: {post.readCount}/{post.totalAudienceCount} đã đọc · Nhắc {post.reminderCount}/3 lần
                          </span>
                        ) : isAcked ? (
                          <span style={{ color: 'var(--success-fg)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <CheckCircle2 size={15} /> Bạn đã xác nhận lúc {post.ackedBy[currentPerson.id]}
                          </span>
                        ) : (
                          <span style={{ color: post.ackOverdue ? 'var(--error-fg)' : 'var(--warning-fg)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <AlertCircle size={15} /> {post.ackReason} · {post.ackOverdue ? 'Quá hạn' : `Hạn ${post.ackDeadline}`}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/feed/article/${post.id}`} className="btn btn-secondary btn-sm">
                          Đọc toàn văn
                        </Link>
                        {lens !== 'com_admin' && !isAcked && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => acknowledgePost(post.id)}
                          >
                            Xác nhận đã đọc
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions Row (FD-6) */}
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${hearted ? 'btn-secondary' : 'btn-ghost'}`}
                        onClick={() => toggleReaction(post.id, 'heart')}
                      >
                        <Heart size={14} fill={hearted ? 'var(--error-solid)' : 'none'} style={{ color: hearted ? 'var(--error-solid)' : undefined }} />
                        <span className="tabular">{post.reactions.heart.length}</span>
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${clapped ? 'btn-secondary' : 'btn-ghost'}`}
                        onClick={() => toggleReaction(post.id, 'clap')}
                      >
                        👏 <span className="tabular">{post.reactions.clap.length}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setOpenComments((prev) => ({ ...prev, [post.id]: !commentsVisible }))}
                      >
                        <MessageCircle size={14} /> <span className="tabular">{post.comments.length}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(`${window.location.origin}/feed/article/${post.id}`);
                        pushToast({ title: 'Đã sao chép đường dẫn bài viết', tone: 'info' });
                      }}
                    >
                      <Share2 size={14} /> Chia sẻ
                    </button>
                  </div>

                  {/* Comments */}
                  {commentsVisible && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {post.comments.map((c) => (
                        <div key={c.id} className="card-sunk" style={{ padding: '8px 11px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                            <strong style={{ color: 'var(--text-strong)' }}>{c.authorName}</strong>
                            <span style={{ color: 'var(--text-tertiary)' }}>{c.createdAt}</span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c.content}</div>
                        </div>
                      ))}
                      <form
                        style={{ display: 'flex', gap: 6 }}
                        onSubmit={(e) => {
                          e.preventDefault();
                          const val = commentDrafts[post.id] || '';
                          if (!val.trim()) return;
                          addComment(post.id, val);
                          setCommentDrafts((prev) => ({ ...prev, [post.id]: '' }));
                        }}
                      >
                        <input
                          className="input"
                          style={{ padding: '6px 10px', fontSize: 13 }}
                          value={commentDrafts[post.id] || ''}
                          onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Viết bình luận..."
                        />
                        <button type="submit" className="btn btn-secondary btn-sm">
                          Gửi
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Right Rail (PRD §7.3 FD-9) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Sinh nhật hôm nay */}
          <div className="card-compact">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 10 }}>
              <Cake size={15} style={{ color: 'var(--brand-primary-fg)' }} /> Sinh nhật hôm nay (27/11)
            </div>
            <div className="card-sunk" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar person={people[0]} size={32} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>Nguyễn Hoàng An</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Product Design</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => wishBirthday('Nguyễn Hoàng An')}
              >
                Chúc mừng 🎂
              </button>
            </div>
          </div>

          {/* Cột mốc thâm niên */}
          <div className="card-compact">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 10 }}>
              <Sparkles size={15} style={{ color: 'var(--info-fg)' }} /> Cột mốc thâm niên tuần này
            </div>
            <div className="card-sunk" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>Ngô Minh Khoa</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tròn 2 năm · Product Engineering</div>
              </div>
              <span className="badge badge-info">2 năm</span>
            </div>
          </div>

          {/* Fan iKame tuần */}
          <div className="card-compact">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 10 }}>
              <Flame size={15} style={{ color: 'var(--brand-primary-fg)' }} /> Fan iKame tuần 48
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'Nguyễn Hoàng An', stat: '3 Kudos · 2 chia sẻ', p: people[0] },
                { name: 'Ngô Minh Khoa', stat: '2 Kudos · 100% đúng hạn', p: people[6] },
                { name: 'Vũ Khánh Linh', stat: '1 Kudos · 4 bình luận', p: people[5] },
              ].map((fan, i) => (
                <div key={fan.name} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span className="tabular" style={{ width: 18, fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>
                    #{i + 1}
                  </span>
                  <Avatar person={fan.p} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{fan.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{fan.stat}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sự kiện sắp tới */}
          <div className="card-compact">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>
                <Calendar size={15} /> Sự kiện sắp tới
              </span>
              <Link to="/events" style={{ fontSize: 12, color: 'var(--info-fg)' }}>Xem thêm</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcomingEvents.map((ev) => (
                <Link key={ev.id} to={`/events/${ev.id}`} className="card-sunk" style={{ display: 'block' }}>
                  <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-strong)' }}>{ev.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{ev.dateLabel}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* COM Official Announcement CMS Modal (FD-13) */}
      <Modal
        open={showComModal}
        onClose={() => setShowComModal(false)}
        title="Soạn thông báo chính thức (COM CMS)"
        subtitle="Xuất bản trực tiếp lên iKame Feed với phân quyền đối tượng & yêu cầu xác nhận"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowComModal(false)}>
              Huỷ
            </button>
            <button type="submit" form="com-publish-form" className="btn btn-primary">
              Xuất bản thông báo
            </button>
          </>
        }
      >
        <form id="com-publish-form" onSubmit={handlePublishCom} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="field-label">Tiêu đề thông báo</label>
            <input
              className="input"
              required
              value={comTitle}
              onChange={(e) => setComTitle(e.target.value)}
              placeholder="VD: Lịch nghỉ Tết Dương lịch 2027 & quy định trực vận hành"
            />
          </div>
          <div>
            <label className="field-label">Nội dung chi tiết</label>
            <textarea
              className="textarea"
              required
              value={comBody}
              onChange={(e) => setComBody(e.target.value)}
              placeholder="Nhập nội dung chính thức từ COM..."
            />
          </div>
          <div className="grid-2">
            <div>
              <label className="field-label">Đối tượng nhận (Audience)</label>
              <select className="select" value={comAudience} onChange={(e) => setComAudience(e.target.value)}>
                <option value="all">Toàn công ty (184 iKamer)</option>
                <option value="Product Design">Team Product Design</option>
                <option value="Product Engineering">Team Product Engineering</option>
              </select>
            </div>
            <div>
              <label className="field-label">Hạn xác nhận</label>
              <input className="input" value={comDeadline} onChange={(e) => setComDeadline(e.target.value)} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={comMandatory} onChange={(e) => setComMandatory(e.target.checked)} />
            Đánh dấu <strong>Bắt buộc xác nhận đã đọc</strong> (tự đẩy banner & nhắc 24h × 3)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={comPinned} onChange={(e) => setComPinned(e.target.checked)} />
            Ghim lên Carousel đầu trang iKame Feed
          </label>
        </form>
      </Modal>
    </div>
  );
};
