import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Flag,
  MessageSquareText,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar, Modal } from '../components/UI';

interface KsItem {
  code: string;
  title: string;
  progress: number;
}

interface ExpectationItem {
  code: string;
  title: string;
  progress: number;
  kss: KsItem[];
}

const INITIAL_EKS: ExpectationItem[] = [
  {
    code: 'E1',
    title: 'Xây dựng My iKame, iGoal và iWiki thành các sản phẩm nội bộ tạo giá trị lớn và có chất lượng cao',
    progress: 40,
    kss: [
      {
        code: 'KS1',
        title: 'Launch và vận hành My iKame toàn công ty trước ngày 30/09; đạt WAU ≥80%, điểm hài lòng trung bình ≥4/5 và duy trì kết quả đến hết Q4',
        progress: 20,
      },
      {
        code: 'KS2',
        title: 'Hoàn thiện hành trình onboarding cho nhân sự mới 100% trên My iKame',
        progress: 5,
      },
      {
        code: 'KS3',
        title: 'Xây dựng iGoal theo 3 giai đoạn Thiết lập – Bám sát – Đánh giá, đạt MAU ≥70%, ≥80% mục tiêu được cảnh báo kịp thời và điểm hài lòng người dùng ≥4/5 trước 31/12',
        progress: 65,
      },
      {
        code: 'KS4',
        title: 'Launch iWiki 4.0 toàn công ty trong tháng 08/2026; đến cuối H2 đạt: MAU ≥60%, AI Answer Accuracy ≥70%, điểm hài lòng ≥4/5 và chứng minh giải quyết ít nhất 2 bài toán quản trị tri thức thực tế đã thống nhất với P&OD/PNLD.',
        progress: 65,
      },
    ],
  },
  {
    code: 'E2',
    title: 'Đưa team BM đạt level AI-native, vận hành & phát triển sản phẩm hiệu quả với AI Agent',
    progress: 55,
    kss: [
      {
        code: 'KS1',
        title: 'Hoàn thiện và áp dụng thực tế trước ngày 30/09 AI-native Product Operating System cho team BM, gồm 2 quy trình chuẩn hoá: quy trình phát triển sản phẩm và quy trình vận hành sản phẩm, kèm bộ Agents Kit hỗ trợ các nghiệp vụ PM, Dev, Design, QA',
        progress: 60,
      },
      {
        code: 'KS2',
        title: 'Áp dụng quy trình AI-native trên 3 sản phẩm chủ lực, 100% dự án mới có document chuẩn hoá (problem context, owner, quality gate, decision log, acceptance criteria, release evidence)',
        progress: 40,
      },
      {
        code: 'KS3',
        title: 'Xây dựng và đưa vào sử dụng Product Health Dashboard cho My iKame, iGoal và iWiki trước ngày 30/09, giúp PM và Manager theo dõi dữ liệu sức khỏe sản phẩm, milestone, rủi ro và critical alert.',
        progress: 55,
      },
    ],
  },
];

function barColor(pct: number): string {
  if (pct < 25) return 'var(--error-solid)';
  if (pct < 70) return 'var(--warning-solid)';
  return 'var(--success-solid)';
}

export const IGoalAppPage: React.FC = () => {
  const { section = 'my-eks' } = useParams();
  const { currentPerson, pushToast } = useApp();
  const [period, setPeriod] = useState('H2 2026');
  const [tab, setTab] = useState<'eks' | 'feedback' | 'history'>('eks');
  const [eksList, setEksList] = useState<ExpectationItem[]>(INITIAL_EKS);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedEIdx, setSelectedEIdx] = useState(0);
  const [draftProgress, setDraftProgress] = useState<Record<string, number>>({});

  const openUpdate = () => {
    const map: Record<string, number> = {};
    eksList.forEach((e, ei) => {
      e.kss.forEach((ks, ki) => {
        map[`${ei}-${ki}`] = ks.progress;
      });
    });
    setDraftProgress(map);
    setUpdateModalOpen(true);
  };

  const saveProgress = () => {
    setEksList((prev) =>
      prev.map((e, ei) => {
        const nextKss = e.kss.map((ks, ki) => ({
          ...ks,
          progress: draftProgress[`${ei}-${ki}`] ?? ks.progress,
        }));
        const avg = Math.round(nextKss.reduce((s, k) => s + k.progress, 0) / nextKss.length);
        return { ...e, progress: avg, kss: nextKss };
      })
    );
    setUpdateModalOpen(false);
    pushToast({ title: 'Đã cập nhật tiến độ EKS kỳ ' + period, tone: 'success' });
  };

  const handleCreateKs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setEksList((prev) =>
      prev.map((ex, idx) =>
        idx !== selectedEIdx
          ? ex
          : {
              ...ex,
              kss: [...ex.kss, { code: `KS${ex.kss.length + 1}`, title: newTitle.trim(), progress: 0 }],
            }
      )
    );
    setNewTitle('');
    setCreateModalOpen(false);
    pushToast({ title: 'Đã thêm kỳ vọng (KS) mới vào My EKS', tone: 'success' });
  };

  // Secondary iGoal Sidebar Views (iKame, Technology, Team OKR, Dự án, Checkpoint, Feedback 360)
  if (section !== 'my-eks') {
    const metaMap: Record<string, { title: string; subtitle: string; items: { code: string; name: string; owner: string; pct: number }[] }> = {
      company: {
        title: 'OKR Công ty · iKame',
        subtitle: `Định hướng cấp công ty kỳ ${period}`,
        items: [
          { code: 'O1', name: 'Xây dựng hệ sinh thái sản phẩm nội bộ AI-Native nâng hiệu suất toàn công ty', owner: 'Ban Điều hành', pct: 68 },
          { code: 'O2', name: 'Tăng trưởng doanh thu mảng iKame Apps & Games vượt mốc 140% kế hoạch', owner: 'Product & Growth', pct: 74 },
          { code: 'O3', name: 'Đạt chỉ số gắn kết nhân sự (eNPS) ≥70 và 100% onboarding chuẩn hoá', owner: 'P&OD × COM', pct: 62 },
        ],
      },
      technology: {
        title: 'OKR Khối · Technology',
        subtitle: `Hạ tầng, MCP Framework & Nền tảng dữ liệu ${period}`,
        items: [
          { code: 'T1', name: 'Chuẩn hoá MCP Framework dùng chung kết nối 7 hệ thống cốt lõi', owner: 'AI Platform (Tâm Trần)', pct: 72 },
          { code: 'T2', name: 'Nâng cấp SSO Passkey đạt 99.95% uptime toàn bộ công cụ nội bộ', owner: 'IT Platform', pct: 84 },
        ],
      },
      team: {
        title: 'Team OKR · Business Management',
        subtitle: `Mục tiêu chung của đội ngũ BM ${period}`,
        items: [
          { code: 'BM1', name: 'Đưa My iKame đạt WAU ≥80% và WAER ≥65% trong H2/2026', owner: 'Nguyễn Việt Dũng', pct: 55 },
          { code: 'BM2', name: 'Triển khai iGoal V2 và iWiki 4.0 đạt mức hài lòng ≥4.2/5', owner: 'Trần Thanh Mai', pct: 65 },
        ],
      },
      projects: {
        title: 'Dự án trọng điểm',
        subtitle: `Theo dõi tiến độ các dự án liên phòng ban ${period}`,
        items: [
          { code: 'PRJ-01', name: 'My iKame Employee Suite (Google Material 3 Redesign)', owner: 'Team BM', pct: 78 },
          { code: 'PRJ-02', name: 'iWiki 4.0 Semantic Search & AI Knowledge', owner: 'BM × AI Platform', pct: 65 },
          { code: 'PRJ-03', name: 'iCheck Real-time Sync & Mobile Check-in', owner: 'BM × P&OD', pct: 82 },
        ],
      },
      checkpoint: {
        title: 'Checkpoint · Đánh giá định kỳ',
        subtitle: `Kỳ đánh giá giữa kỳ & cuối kỳ ${period}`,
        items: [
          { code: 'CP-Mid', name: 'Checkpoint giữa kỳ H2/2026 — Đã hoàn tất tự đánh giá & 1:1', owner: currentPerson.name, pct: 100 },
          { code: 'CP-End', name: 'Checkpoint cuối kỳ H2/2026 — Mở cổng 15/12/2026', owner: currentPerson.name, pct: 25 },
        ],
      },
      'feedback-360': {
        title: 'Feedback 360',
        subtitle: 'Góp ý đa chiều từ quản lý, đồng đội và đối tác liên phòng ban',
        items: [
          { code: 'FB-01', name: 'Chị Nguyệt (P&OD): "Luồng Onboarding 60 ngày & Hồ sơ HRIS rất rõ ràng, minh bạch."', owner: 'P&OD', pct: 92 },
          { code: 'FB-02', name: 'Lê Bảo Ngọc (COM): "Kênh iCom hợp nhất Feed + Sự kiện + CLB giúp giảm hẳn tin rải rác."', owner: 'COM', pct: 88 },
        ],
      },
    };

    const view = metaMap[section] || metaMap.company;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="page-title">{view.title}</h1>
            <p className="page-desc">{view.subtitle}</p>
          </div>
          <select className="select" style={{ width: 130, borderRadius: 'var(--r-full)' }} value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="H2 2026">H2 2026</option>
            <option value="H1 2026">H1 2026</option>
          </select>
        </div>

        <section className="card">
          <div className="clean-list">
            {view.items.map((it) => (
              <div key={it.code} className="clean-row" style={{ gap: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <span className="badge badge-strong">{it.code}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>{it.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{it.owner}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 150, flexShrink: 0 }}>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${it.pct}%`, background: barColor(it.pct) }} />
                  </div>
                  <span className="tabular" style={{ fontSize: 13, fontWeight: 600, width: 34, textAlign: 'right' }}>
                    {it.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Default Main Screen: My EKS (Exact layout matching Screenshot 1!)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header + Period Selector */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">My EKS</h1>
        </div>
        <select
          className="select"
          style={{ width: 130, borderRadius: 'var(--r-full)', fontWeight: 600 }}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="Chọn kỳ OKR"
        >
          <option value="H2 2026">H2 2026</option>
          <option value="H1 2026">H1 2026</option>
        </select>
      </div>

      {/* Sub-tabs matching screenshot: Kỳ vọng & báo cáo · Góp ý · Lịch sử thay đổi */}
      <div className="tabs-bar">
        <button type="button" className={`tab-btn ${tab === 'eks' ? 'active' : ''}`} onClick={() => setTab('eks')}>
          Kỳ vọng & báo cáo
        </button>
        <button type="button" className={`tab-btn ${tab === 'feedback' ? 'active' : ''}`} onClick={() => setTab('feedback')}>
          Góp ý
        </button>
        <button type="button" className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          Lịch sử thay đổi
        </button>
      </div>

      {/* Main Content + Right Profile Card (matching Screenshot 1!) */}
      <div className="layout-with-rail" style={{ gridTemplateColumns: 'minmax(0, 1fr) 260px' }}>
        {tab === 'eks' && (
          <section className="card" style={{ padding: '20px 24px' }}>
            <div className="card-header" style={{ marginBottom: 16 }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ paddingLeft: 4, fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}
              >
                Kỳ vọng (EKS) <ChevronDown size={15} />
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={openUpdate}>
                  <RefreshCw size={13} /> Cập nhật tiến độ
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreateModalOpen(true)}>
                  <Plus size={14} /> Tạo mới
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {eksList.map((e) => (
                <div key={e.code}>
                  {/* Expectation Parent Row (Blue Circular E1 / E2 badge) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border-primary)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--r-full)',
                          background: 'var(--info-solid)',
                          color: '#ffffff',
                          fontSize: 11.5,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {e.code}
                      </span>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.45 }}>
                        {e.title}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 155, flexShrink: 0 }}>
                      <div className="progress-track" style={{ height: 9 }}>
                        <div className="progress-fill" style={{ width: `${e.progress}%`, background: barColor(e.progress) }} />
                      </div>
                      <span className="tabular" style={{ fontSize: 13, fontWeight: 700, width: 34, textAlign: 'right', color: 'var(--text-strong)' }}>
                        {e.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Child KS Rows */}
                  <div className="clean-list">
                    {e.kss.map((ks) => (
                      <div key={ks.code} className="clean-row" style={{ paddingLeft: 10, gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning-fg)', minWidth: 28, marginTop: 2 }}>
                            {ks.code}
                          </span>
                          <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {ks.title}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 155, flexShrink: 0 }}>
                          <div className="progress-track" style={{ height: 8 }}>
                            <div className="progress-fill" style={{ width: `${ks.progress}%`, background: barColor(ks.progress) }} />
                          </div>
                          <span className="tabular" style={{ fontSize: 12.5, fontWeight: 600, width: 34, textAlign: 'right', color: 'var(--text-secondary)' }}>
                            {ks.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'feedback' && (
          <section className="card">
            <h2 className="card-title" style={{ marginBottom: 12 }}>
              <MessageSquareText size={16} /> Góp ý từ Quản lý & Đồng đội
            </h2>
            <div className="clean-list">
              <div className="clean-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>Nguyễn Thành Long · BM Lead</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  "Hướng thiết kế My iKame dạng app tổng chuyển mượt sang iCheck, iGoal, iCom, iWiki rất đúng bài toán thực tế. Tập trung chốt R1 nhanh nhé!"
                </div>
              </div>
              <div className="clean-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>Chị Nguyệt · P&OD</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  "Cần đẩy nhanh KS2 hành trình onboarding 100% nhân sự mới trong tháng 12."
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === 'history' && (
          <section className="card">
            <h2 className="card-title" style={{ marginBottom: 12 }}>Lịch sử cập nhật kỳ {period}</h2>
            <div className="clean-list">
              <div className="clean-row">
                <div>
                  <div style={{ fontWeight: 600 }}>Cập nhật E2 · KS1 lên 60%</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>25/11/2026 · {currentPerson.name}</div>
                </div>
                <span className="badge badge-success">+10%</span>
              </div>
              <div className="clean-row">
                <div>
                  <div style={{ fontWeight: 600 }}>Cập nhật E1 · KS4 (iWiki 4.0) lên 65%</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>20/11/2026 · {currentPerson.name}</div>
                </div>
                <span className="badge badge-success">+15%</span>
              </div>
            </div>
          </section>
        )}

        {/* Right User Profile Card (matching Screenshot 1!) */}
        <aside>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Avatar person={currentPerson} size={52} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-strong)' }}>{currentPerson.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{currentPerson.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 4 }}>
                {currentPerson.department}
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Tổng tiến độ {period}</span>
                <strong className="tabular" style={{ color: 'var(--brand-primary-fg)' }}>
                  {Math.round(eksList.reduce((s, x) => s + x.progress, 0) / eksList.length)}%
                </strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Check-in gần nhất</span>
                <span style={{ color: 'var(--success-fg)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <CheckCircle2 size={13} /> Đúng hạn
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Update Progress Modal */}
      <Modal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title={`Cập nhật tiến độ My EKS (${period})`}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setUpdateModalOpen(false)}>Huỷ</button>
            <button type="button" className="btn btn-primary" onClick={saveProgress}>Lưu tiến độ</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {eksList.map((e, ei) => (
            <div key={e.code}>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>{e.code}: {e.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {e.kss.map((ks, ki) => {
                  const key = `${ei}-${ki}`;
                  const val = draftProgress[key] ?? ks.progress;
                  return (
                    <div key={ks.code} className="card-sunk" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1, fontSize: 12.5 }}>
                        <strong>{ks.code}:</strong> {ks.title.slice(0, 82)}...
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={val}
                        onChange={(ev) => setDraftProgress((prev) => ({ ...prev, [key]: Number(ev.target.value) }))}
                        style={{ width: 90 }}
                      />
                      <span className="tabular" style={{ width: 34, fontWeight: 700, fontSize: 12.5, textAlign: 'right' }}>
                        {val}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Create New KS Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Tạo kỳ vọng mới (KS)"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>Huỷ</button>
            <button type="submit" form="create-ks-form" className="btn btn-primary">Tạo mới</button>
          </>
        }
      >
        <form id="create-ks-form" onSubmit={handleCreateKs} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="field-label">Thuộc mục tiêu (E)</label>
            <select className="select" value={selectedEIdx} onChange={(e) => setSelectedEIdx(Number(e.target.value))}>
              {eksList.map((ex, i) => (
                <option key={ex.code} value={i}>{ex.code} — {ex.title.slice(0, 64)}...</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Mô tả kết quả then chốt (KS)</label>
            <textarea className="textarea" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="VD: Đạt ≥85% hài lòng cho giao diện mới..." />
          </div>
        </form>
      </Modal>
    </div>
  );
};
