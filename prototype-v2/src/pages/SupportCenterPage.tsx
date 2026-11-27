import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Clock,
  GraduationCap,
  HeartHandshake,
  LifeBuoy,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SupportTopic {
  slug: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  toneBg: string;
  toneFg: string;
  highlights: { title: string; desc: string }[];
  actions: { label: string; to?: string; aiPrompt?: string; primary?: boolean }[];
}

const SUPPORT_TOPICS: SupportTopic[] = [
  {
    slug: 'about',
    title: 'Về iKame',
    tagline: 'Sứ mệnh, giá trị cốt lõi, cấu trúc khối/phòng ban và lộ trình hội nhập 60 ngày.',
    icon: Building2,
    toneBg: 'var(--info-bg)',
    toneFg: 'var(--info-fg)',
    highlights: [
      { title: 'Văn hoá & Giá trị cốt lõi', desc: 'Chủ động & Tinh gọn · Đồng đội tin cậy · Tư duy AI-Native · Lấy trải nghiệm người dùng làm trung tâm.' },
      { title: 'Cơ cấu tổ chức', desc: 'Gồm các khối Product & Engineering, Business Management (BM), iKame Apps, iKame Games, P&OD, Finance và Legal.' },
      { title: 'Hành trình 60 ngày người mới', desc: '4 cột mốc từ Welcome Pack Ngày 1 đến Tốt nghiệp Ngày 60 cùng Buddy chuyên môn.' },
    ],
    actions: [
      { label: 'Xem Sổ tay iKame trên iWiki', to: '/iwiki/space/my-ikame', primary: true },
      { label: 'Khám phá iKame Feed & Văn hoá', to: '/icom/feed' },
      { label: 'Tìm danh bạ đồng nghiệp', to: '/search?tab=people' },
    ],
  },
  {
    slug: 'goals',
    title: 'Mục tiêu (OKR & EKS)',
    tagline: 'Hướng dẫn thiết lập kỳ vọng EKS, chu kỳ H2/2026, CFRs và lịch check-in định kỳ.',
    icon: Target,
    toneBg: 'var(--ikame-orange-subtle)',
    toneFg: 'var(--ikame-orange)',
    highlights: [
      { title: 'Chu kỳ OKR / EKS H2 2026', desc: 'Thiết lập đầu kỳ (Tháng 7), bám sát hàng tuần/tháng qua iGoal, đánh giá Checkpoint cuối kỳ (Tháng 12).' },
      { title: 'Nguyên tắc viết Kỳ vọng (E1, E2 · KS)', desc: 'Mỗi mục tiêu E gắn 2–4 kết quả then chốt (KS) đo lường rõ ràng, có mốc thời gian và tiêu chí nghiệm thu.' },
      { title: 'Check-in & Feedback 360', desc: 'Cập nhật tiến độ trước 17:00 Thứ 6 hàng tuần; nhận góp ý đa chiều qua Feedback 360 trên iGoal.' },
    ],
    actions: [
      { label: 'Mở iGoal · My EKS', to: '/igoal/my-eks', primary: true },
      { label: 'Check-in OKR nhanh với AI', aiPrompt: 'Check-in OKR tuần 48' },
      { label: 'Đọc Hỏi đáp OKRs trên iWiki', to: '/iwiki' },
    ],
  },
  {
    slug: 'knowledge',
    title: 'Tri thức (iWiki 4.0)',
    tagline: 'Cách tìm kiếm, đóng góp tài liệu chuẩn hoá và quy trình duyệt tri thức toàn công ty.',
    icon: BookOpen,
    toneBg: 'var(--warning-bg)',
    toneFg: 'var(--warning-fg)',
    highlights: [
      { title: 'Không gian tri thức theo khối', desc: 'Tài liệu được phân nhóm theo My iKame, iKame Apps, iKame Games, Technology, P&OD, Finance và Legal.' },
      { title: 'iWiki AI tìm kiếm ngữ nghĩa', desc: 'Hỏi bằng ngôn ngữ tự nhiên về quy trình, performance, chính sách và nhận câu trả lời có trích nguồn.' },
      { title: 'Chia sẻ bí kíp nội bộ', desc: 'Mọi iKamer đều có thể viết bài hướng dẫn, kinh nghiệm dự án để lan toả cho đồng đội.' },
    ],
    actions: [
      { label: 'Mở iWiki Home', to: '/iwiki', primary: true },
      { label: 'Hỏi iWiki AI', to: '/iwiki/ai' },
      { label: 'Soạn nháp bài viết qua AI', aiPrompt: 'Soạn nháp tài liệu iWiki mới' },
    ],
  },
  {
    slug: 'learning',
    title: 'Học tập & phát triển',
    tagline: 'Khung năng lực theo cấp bậc, ngân sách đào tạo năm và các khoá học nội bộ.',
    icon: GraduationCap,
    toneBg: 'var(--violet-bg)',
    toneFg: 'var(--violet-fg)',
    highlights: [
      { title: 'Khung năng lực (Competency)', desc: 'Lộ trình rõ ràng từ L2 đến L5/M3 cho chuyên môn Product, Engineering, Design, Data và QA.' },
      { title: 'Ngân sách học tập & Chứng chỉ', desc: 'Hỗ trợ chi phí khoá học Coursera Enterprise, hội thảo chuyên ngành và thi chứng chỉ công nghệ.' },
      { title: 'Workshop & Tech Talk hàng tháng', desc: 'Chuỗi Hands-on MCP, AI-Native UX và Product Thinking đăng ký trực tiếp trên iCom Sự kiện.' },
    ],
    actions: [
      { label: 'Xem lịch Workshop trên iCom', to: '/icom/events', primary: true },
      { label: 'Gửi đề xuất tài trợ khoá học', aiPrompt: 'Tạo request hỗ trợ đăng ký khoá học chuyên môn' },
      { label: 'Xem năng lực trên Hồ sơ', to: '/profile' },
    ],
  },
  {
    slug: 'policies',
    title: 'Chính sách & phúc lợi',
    tagline: 'Giờ làm việc, chấm công, phép năm, WFH Hybrid và gói Bảo hiểm iKame Care 2027.',
    icon: HeartHandshake,
    toneBg: 'var(--success-bg)',
    toneFg: 'var(--success-fg)',
    highlights: [
      { title: 'Giờ làm việc & Chấm công (iCheck)', desc: 'Ca tiêu chuẩn 08:30 – 17:30 (Thứ 2 – Thứ 6). Hybrid tối đa 2 ngày WFH/tuần theo thống nhất quản lý.' },
      { title: 'Ngày phép năm & Phép chế độ', desc: '12–16 ngày phép năm theo thâm niên; tối đa 3 ngày chuyển sang năm sau; phép ốm hưởng lương và phép hỉ.' },
      { title: 'Bảo hiểm iKame Care 2027', desc: 'Hạn mức ngoại trú 18 triệu/năm, 6 phiên tư vấn tinh thần EAP miễn phí, hỗ trợ 50% cho 1 người thân.' },
    ],
    actions: [
      { label: 'Mở iCheck chấm công & phép', to: '/icheck', primary: true },
      { label: 'Xin nghỉ phép / WFH nhanh', aiPrompt: 'Xin nghỉ phép năm ngày thứ 6' },
      { label: 'Hỏi AI về chính sách nghỉ phép', aiPrompt: 'Chính sách nghỉ phép thế nào?' },
    ],
  },
];

export const SupportCenterPage: React.FC = () => {
  const { topic } = useParams();
  const { openAiWithPrompt } = useApp();
  const navigate = useNavigate();

  const currentTopic = topic ? SUPPORT_TOPICS.find((t) => t.slug === topic) : null;

  // Topic Detail Page (Purely clear structured info + actionable CTAs)
  if (currentTopic) {
    const Icon = currentTopic.icon;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-tertiary)' }}>
          <Link to="/support" style={{ color: 'var(--brand-primary-fg)', fontWeight: 500 }}>
            Trung tâm hỗ trợ
          </Link>
          <span>/</span>
          <span>{currentTopic.title}</span>
        </div>

        <section className="card-tonal" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, maxWidth: 640 }}>
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--r-12)',
                background: currentTopic.toneBg,
                color: currentTopic.toneFg,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={24} />
            </span>
            <div>
              <h1 className="page-title">{currentTopic.title}</h1>
              <p className="page-desc" style={{ marginTop: 4 }}>{currentTopic.tagline}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {currentTopic.actions.map((act) => (
              <button
                key={act.label}
                type="button"
                className={`btn ${act.primary ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => {
                  if (act.to) navigate(act.to);
                  else if (act.aiPrompt) openAiWithPrompt(act.aiPrompt);
                }}
              >
                {act.label} <ArrowRight size={13} />
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="card-title" style={{ marginBottom: 10 }}>Thông tin cốt lõi & hướng dẫn</h2>
          <div className="clean-list">
            {currentTopic.highlights.map((h) => (
              <div key={h.title} className="clean-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--text-strong)' }}>{h.title}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{h.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Overview Page (/support) — Google Help Center aesthetic
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section className="card-tonal" style={{ padding: '28px 28px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--brand-primary-fg)', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
          <LifeBuoy size={16} /> Trung tâm hỗ trợ My iKame
        </div>
        <h1 className="page-title" style={{ fontSize: 28 }}>Bạn cần hướng dẫn hay thông tin gì?</h1>
        <p className="page-desc" style={{ maxWidth: 520, margin: '6px auto 18px' }}>
          Tổng hợp chính sách, hướng dẫn nghiệp vụ từng ứng dụng và lối tắt hành động nhanh
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => openAiWithPrompt('Chính sách nghỉ phép thế nào?')}>
            <Sparkles size={15} /> Hỏi Trợ lý AI ngay
          </button>
          <Link to="/icheck" className="btn btn-secondary">
            <Clock size={15} /> Mở iCheck
          </Link>
          <Link to="/igoal/my-eks" className="btn btn-secondary">
            <Target size={15} /> Mở iGoal
          </Link>
        </div>
      </section>

      <div className="grid-3">
        {SUPPORT_TOPICS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.slug}
              to={`/support/${item.slug}`}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', gap: 12, transition: 'border-color 150ms' }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--r-12)',
                  background: item.toneBg,
                  color: item.toneFg,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={20} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15.5, color: 'var(--text-strong)', marginBottom: 4 }}>
                  {item.title}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.tagline}
                </p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-primary-fg)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Xem chi tiết <ArrowRight size={14} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
