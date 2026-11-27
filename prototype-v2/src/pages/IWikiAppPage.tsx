import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BookOpen,
  FileCheck2,
  PenLine,
  Search,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/UI';

interface WikiArticle {
  id: string;
  title: string;
  author: string;
  topic: 'Checkpoint' | 'EKS' | 'Chính sách' | 'Văn hóa';
  space: string;
  emoji: string;
  summary: string;
  body: string[];
  updatedAt: string;
}

const WIKI_ARTICLES: WikiArticle[] = [
  {
    id: 'w-1',
    title: 'Giờ làm việc, Chấm công, Ngày phép',
    author: 'Nguyễn Thị Nguyệt',
    topic: 'Chính sách',
    space: 'pod',
    emoji: '👩‍💼',
    summary: 'Quy định đầy đủ về khung giờ làm việc chuẩn, WFH Hybrid, số ngày phép năm và cách chốt công trên iCheck.',
    body: [
      'Khung giờ làm việc tiêu chuẩn tại iKame là 08:30 – 17:30 từ Thứ 2 đến Thứ 6 (nghỉ trưa 12:00 – 13:30).',
      'Nhân sự chính thức được hưởng 12–16 ngày phép năm theo thâm niên; tối đa 3 ngày phép dư được chuyển sang Q1 năm tiếp theo.',
      'Đăng ký nghỉ phép, WFH, đi muộn/về sớm hoặc bổ sung quên chấm công trực tiếp trên iCheck hoặc qua Trợ lý AI My iKame.',
    ],
    updatedAt: '18/11/2026',
  },
  {
    id: 'w-2',
    title: 'Hỏi đáp OKRs #2 - CFRs và check-in trong OKRs và EKS',
    author: 'Nguyễn Thị Nguyệt',
    topic: 'EKS',
    space: 'pod',
    emoji: '👩‍💼',
    summary: 'Giải đáp các câu hỏi thường gặp về tần suất check-in, cách dùng CFRs và cách liên kết EKS cá nhân với Team OKR.',
    body: [
      'Check-in tuần giúp phát hiện sớm rủi ro trước khi trễ mốc quý — không phải báo cáo hình thức.',
      'Mỗi buổi CFRs (Conversation – Feedback – Recognition) nên kéo dài 20–30 phút, tập trung gỡ vướng ưu tiên.',
    ],
    updatedAt: '12/11/2026',
  },
  {
    id: 'w-3',
    title: 'Checklist viết và check-in EKS dành cho Managers',
    author: 'Nguyễn Thị Nguyệt',
    topic: 'EKS',
    space: 'my-ikame',
    emoji: '👩‍💼',
    summary: '5 tiêu chí rà soát giúp Manager đồng bộ kỳ vọng rõ ràng ngay đầu kỳ H2 và chấm Checkpoint công bằng.',
    body: [
      'Đảm bảo mỗi thành viên có từ 2–3 Kỳ vọng (E) và mỗi E có tối đa 4 Kết quả then chốt (KS) đo lường được.',
      'Đặt lịch review tiến độ định kỳ giữa kỳ để không có bất ngờ vào cuối chu kỳ.',
    ],
    updatedAt: '09/11/2026',
  },
  {
    id: 'w-4',
    title: 'EKS - Kỳ vọng về công việc và sự phát triển cá nhân',
    author: 'Nguyễn Thị Nguyệt',
    topic: 'Checkpoint',
    space: 'pod',
    emoji: '👩‍💼',
    summary: 'Khung phương pháp EKS của iKame kết nối mục tiêu sản phẩm với lộ trình phát triển năng lực từng cá nhân.',
    body: [
      'EKS (Expectations & Key Standards) bổ trợ cho OKR bằng cách làm rõ chuẩn đầu ra cốt lõi ở từng vị trí.',
      'Kết hợp cùng Feedback 360 trên iGoal để tổng hợp bức tranh phát triển toàn diện mỗi 6 tháng.',
    ],
    updatedAt: '02/11/2026',
  },
  {
    id: 'w-5',
    title: 'OKRs & EKS training - Quản trị mục tiêu cùng với OKRs & EKS',
    author: 'Ngô Thị Thùy Linh',
    topic: 'Văn hóa',
    space: 'my-ikame',
    emoji: '🎯',
    summary: 'Slide bài giảng & ví dụ mẫu thực tế cho các team Product, Technology, iKame Apps và iKame Games.',
    body: [
      'Tài liệu đào tạo chuẩn hoá kèm ví dụ thực tế của khối Business Management, iKame Apps và iKame Games.',
      'Bao gồm template chuẩn hoá quy trình AI-Native Product Operating System.',
    ],
    updatedAt: '28/10/2026',
  },
  {
    id: 'w-6',
    title: 'Kiến trúc MCP chuẩn hoá dùng chung toàn iKame',
    author: 'Tâm Trần',
    topic: 'Chính sách',
    space: 'technology',
    emoji: '💻',
    summary: 'Đặc tả kết nối 7 MCP server (HRIS, iCheck, iGoal, iWiki, iRequest, Asana, Calendar) kèm nguyên tắc approval = human.',
    body: [
      'Mọi công cụ AI nội bộ đều đi qua MCP Gateway dùng chung, tuân thủ phân quyền HRIS và lưu vết audit.',
    ],
    updatedAt: '26/10/2026',
  },
];

const TOPIC_PILLS: { label: WikiArticle['topic']; bg: string; fg: string }[] = [
  { label: 'Checkpoint', bg: 'var(--info-bg)', fg: 'var(--info-fg)' },
  { label: 'EKS', bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' },
  { label: 'Chính sách', bg: 'var(--success-bg)', fg: 'var(--success-fg)' },
  { label: 'Văn hóa', bg: 'var(--violet-bg)', fg: 'var(--violet-fg)' },
];

const SPACE_LABELS: Record<string, string> = {
  'my-ikame': 'My iKame',
  'ikame-apps': 'iKame Apps',
  'ikame-games': 'iKame Games',
  technology: 'Technology',
  pod: 'P&OD',
  finance: 'Finance & Accounting',
  legal: 'Legal & Compliance',
};

export const IWikiAppPage: React.FC = () => {
  const { section, space } = useParams();
  const { currentPerson, openAiWithPrompt, pushToast } = useApp();
  const [articles, setArticles] = useState<WikiArticle[]>(WIKI_ARTICLES);
  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [readingDoc, setReadingDoc] = useState<WikiArticle | null>(null);
  const [writeOpen, setWriteOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [draftTopic, setDraftTopic] = useState<WikiArticle['topic']>('Văn hóa');

  const firstName = currentPerson.name.split(' ').slice(-1)[0];

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (space && a.space !== space && space !== 'my-ikame') return false;
      if (selectedTopic && a.topic !== selectedTopic) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
      }
      return true;
    });
  }, [articles, space, selectedTopic, query]);

  const handlePublishDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;
    const next: WikiArticle = {
      id: `w-${Date.now()}`,
      title: draftTitle.trim(),
      author: currentPerson.name,
      topic: draftTopic,
      space: space || 'my-ikame',
      emoji: '📝',
      summary: draftSummary.trim() || 'Tài liệu mới được chia sẻ trên iWiki.',
      body: [draftSummary.trim() || 'Nội dung tài liệu đang được cập nhật chi tiết.'],
      updatedAt: 'Vừa xong',
    };
    setArticles((prev) => [next, ...prev]);
    setDraftTitle('');
    setDraftSummary('');
    setWriteOpen(false);
    pushToast({ title: 'Đã xuất bản bài viết lên iWiki', tone: 'success' });
  };

  // Special iWiki Sidebar sections (iWiki AI, Review queue, Notifications, My Docs...)
  if (section === 'ai') {
    return (
      <div style={{ maxWidth: 740, margin: '24px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--brand-primary-fg)', fontWeight: 700 }}>
          <Sparkles size={20} /> iWiki AI
        </div>
        <h1 className="page-title" style={{ fontSize: 28 }}>Hỏi đáp tri thức iKame có trích nguồn</h1>
        <p className="page-desc">Tra cứu ngay chính sách, hướng dẫn OKR/EKS, quy trình kỹ thuật từ toàn bộ không gian iWiki</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {['Chính sách nghỉ phép thế nào?', 'Quy định WFH Hybrid?', 'Cách viết EKS chuẩn H2/2026?'].map((q) => (
            <button key={q} type="button" className="btn btn-dim" onClick={() => openAiWithPrompt(q)}>
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'review' || section === 'delete-requests' || section === 'my-docs' || section === 'archived' || section === 'notifications') {
    const titleMap: Record<string, string> = {
      review: 'Duyệt bài viết (90)',
      'delete-requests': 'Duyệt yêu cầu xóa (2)',
      'my-docs': 'Bài viết của tôi',
      archived: 'Bài viết lưu trữ',
      notifications: 'Thông báo iWiki (20)',
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">{titleMap[section]}</h1>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setWriteOpen(true)}>
            <PenLine size={14} /> Viết bài mới
          </button>
        </div>
        <section className="card">
          <div className="clean-list">
            {articles.slice(0, 4).map((a) => (
              <div key={a.id} className="clean-row">
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{a.author} · {a.updatedAt}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-dim btn-sm" onClick={() => setReadingDoc(a)}>Xem</button>
                  {section === 'review' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => pushToast({ title: `Đã duyệt bài "${a.title}"`, tone: 'success' })}
                    >
                      <FileCheck2 size={13} /> Duyệt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Main iWiki Home & Department Spaces (Exact Google-clean layout matching Screenshot 3!)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Centered Google-style Hero Search (Screenshot 3!) */}
      <section style={{ maxWidth: 680, width: '100%', margin: '12px auto 0', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 className="page-title" style={{ fontSize: 28 }}>
          {space ? `Không gian tri thức · ${SPACE_LABELS[space] || space}` : `Chào ${firstName}, bạn muốn tìm hiểu gì hôm nay?`}
        </h1>

        <div style={{ position: 'relative' }}>
          <input
            className="input"
            style={{
              height: 50,
              borderRadius: 'var(--r-full)',
              paddingLeft: 22,
              paddingRight: 56,
              fontSize: 15,
              boxShadow: 'var(--shadow-card)',
              borderColor: 'var(--border-primary)',
            }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Những điều cần biết về performance, EKS, chính sách..."
          />
          <button
            type="button"
            aria-label="Tìm trong iWiki"
            onClick={() => {
              if (query.trim()) openAiWithPrompt(`Chính sách ${query}`);
            }}
            style={{
              position: 'absolute',
              right: 6,
              top: 6,
              width: 38,
              height: 38,
              borderRadius: 'var(--r-full)',
              border: 'none',
              background: 'var(--brand-primary)',
              color: 'var(--text-on-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={17} />
          </button>
        </div>

        {/* 4 Soft Tonal Topic Pills matching Screenshot 3 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {TOPIC_PILLS.map((pill) => {
            const active = selectedTopic === pill.label;
            return (
              <button
                key={pill.label}
                type="button"
                onClick={() => setSelectedTopic(active ? null : pill.label)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--r-full)',
                  border: `1.5px solid ${active ? pill.fg : 'transparent'}`,
                  background: pill.bg,
                  color: pill.fg,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* "Dành cho bạn" Horizontal Card Grid (Screenshot 3!) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 className="card-title" style={{ fontSize: 15 }}>
            {selectedTopic ? `Chủ đề: ${selectedTopic}` : 'Dành cho bạn'}
          </h2>
          {selectedTopic && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedTopic(null)}>
              Xem tất cả
            </button>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="card empty-state">Không tìm thấy tài liệu khớp bộ lọc.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
            {filteredArticles.map((doc) => (
              <button
                key={doc.id}
                type="button"
                className="card"
                onClick={() => setReadingDoc(doc)}
                style={{
                  textAlign: 'left',
                  padding: '18px 18px',
                  minHeight: 176,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                  transition: 'border-color 150ms, box-shadow 150ms',
                }}
              >
                <div>
                  <div style={{ fontSize: 22, marginBottom: 10 }}>{doc.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.45 }}>
                    {doc.title}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={13} /> {doc.author}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA Banner matching Screenshot 3 ("Đừng để kiến thức của bạn ngừng chảy") */}
      <section
        className="card-tonal"
        style={{
          padding: '28px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          borderRadius: 'var(--r-16)',
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: 'var(--text-strong)' }}>
            Đừng để kiến thức của bạn ngừng chảy
          </h2>
          <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Đó chính là kho báu mà đồng nghiệp đang tìm kiếm. Viết lại hôm nay để ngày mai không ai phải "mò kim đáy bể" nữa.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setWriteOpen(true)}>
            <PenLine size={15} /> Chia sẻ bí kíp ngay
          </button>
        </div>

        <div
          style={{
            width: 148,
            height: 112,
            borderRadius: 'var(--r-16)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 36,
          }}
        >
          <span>💡📚</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-tertiary)' }}>iWiki Knowledge</span>
        </div>
      </section>

      {/* Document Reader Modal */}
      <Modal
        open={Boolean(readingDoc)}
        onClose={() => setReadingDoc(null)}
        title={readingDoc?.title || ''}
        subtitle={readingDoc ? `${readingDoc.author} · Cập nhật ${readingDoc.updatedAt} · Chủ đề ${readingDoc.topic}` : ''}
        maxWidth={620}
        footer={
          <button type="button" className="btn btn-primary" onClick={() => setReadingDoc(null)}>
            Đóng tài liệu
          </button>
        }
      >
        {readingDoc && (
          <div className="prose-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontWeight: 500, color: 'var(--text-strong)' }}>{readingDoc.summary}</p>
            {readingDoc.body.map((para, i) => (
              <p key={i} style={{ margin: 0 }}>{para}</p>
            ))}
          </div>
        )}
      </Modal>

      {/* Share Knowledge Modal */}
      <Modal
        open={writeOpen}
        onClose={() => setWriteOpen(false)}
        title="Chia sẻ bí kíp lên iWiki"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setWriteOpen(false)}>Huỷ</button>
            <button type="submit" form="wiki-create-form" className="btn btn-primary">Xuất bản ngay</button>
          </>
        }
      >
        <form id="wiki-create-form" onSubmit={handlePublishDraft} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="field-label">Tiêu đề tài liệu</label>
            <input className="input" required value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="VD: Checklist review thiết kế Material 3 tại iKame" />
          </div>
          <div>
            <label className="field-label">Chủ đề</label>
            <select className="select" value={draftTopic} onChange={(e) => setDraftTopic(e.target.value as WikiArticle['topic'])}>
              <option value="Checkpoint">Checkpoint</option>
              <option value="EKS">EKS</option>
              <option value="Chính sách">Chính sách</option>
              <option value="Văn hóa">Văn hóa</option>
            </select>
          </div>
          <div>
            <label className="field-label">Tóm tắt & nội dung chính</label>
            <textarea className="textarea" required value={draftSummary} onChange={(e) => setDraftSummary(e.target.value)} placeholder="Viết hướng dẫn ngắn gọn, rõ ràng cho đồng nghiệp..." />
          </div>
        </form>
      </Modal>
    </div>
  );
};
