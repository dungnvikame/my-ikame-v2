import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  Home,
  Palmtree,
  TimerReset,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/UI';

type CalStatus = 'on_time' | 'late' | 'holiday' | 'wfh' | 'none';

interface CalCell {
  day: number;
  status: CalStatus;
  note?: string;
  isToday?: boolean;
}

// November 2026 calendar matching Screenshot 2!
const NOV_2026_CELLS: CalCell[] = [
  { day: 1, status: 'none' },
  { day: 2, status: 'late', note: 'Vào 08:38 · Muộn 8 phút' },
  { day: 3, status: 'late', note: 'Vào 08:41 · Muộn 11 phút' },
  { day: 4, status: 'on_time', note: 'Vào 08:21 · Đúng giờ' },
  { day: 5, status: 'on_time', note: 'Vào 08:19 · Đúng giờ' },
  { day: 6, status: 'on_time', note: 'Vào 08:25 · Đúng giờ' },
  { day: 7, status: 'none' },
  { day: 8, status: 'none' },
  { day: 9, status: 'late', note: 'Vào 09:30 · Xin đi muộn (Đã duyệt)' },
  { day: 10, status: 'late', note: 'Vào 08:36 · Muộn 6 phút' },
  { day: 11, status: 'late', note: 'Vào 08:40 · Muộn 10 phút' },
  { day: 12, status: 'late', note: 'Vào 08:35 · Muộn 5 phút' },
  { day: 13, status: 'on_time', note: 'Vào 09:30 · Đã duyệt đi muộn' },
  { day: 14, status: 'none' },
  { day: 15, status: 'none' },
  { day: 16, status: 'late', note: 'Về sớm 16:00 (Đã duyệt)' },
  { day: 17, status: 'late', note: 'Vào 08:44 · Muộn 14 phút' },
  { day: 18, status: 'late', note: 'Vào 08:39 · Muộn 9 phút' },
  { day: 19, status: 'late', note: 'Vào 08:37 · Muộn 7 phút' },
  { day: 20, status: 'on_time', note: 'Vào 08:20 · Đúng giờ' },
  { day: 21, status: 'none' },
  { day: 22, status: 'none' },
  { day: 23, status: 'late', note: 'Vào 08:36 · Muộn 6 phút' },
  { day: 24, status: 'holiday', note: 'Nghỉ phép năm 1 ngày' },
  { day: 25, status: 'on_time', note: 'Xin đi muộn 09:00 (Đã duyệt)' },
  { day: 26, status: 'late', note: 'Vào 08:40 · Muộn 10 phút' },
  { day: 27, status: 'late', note: 'Đã chấm công 08:42 · Muộn 12 phút', isToday: true },
  { day: 28, status: 'none' },
  { day: 29, status: 'none' },
  { day: 30, status: 'none' },
];

export const ICheckAppPage: React.FC = () => {
  const { pathname } = useLocation();
  const {
    currentPerson,
    people,
    checkedInByPerson,
    isCheckedInToday,
    performCheckIn,
    requests,
    openAiWithPrompt,
    pushToast,
  } = useApp();
  const [selectedDay, setSelectedDay] = useState<CalCell>(NOV_2026_CELLS[26]);

  // Watchers sub-view ("Người quan tâm")
  if (pathname.includes('/watchers')) {
    const teamToday = [
      { person: people[1], status: 'Đúng giờ · 08:24', badge: 'badge-success' },
      { person: people[2], status: 'Đúng giờ · 08:18', badge: 'badge-success' },
      { person: people[4], status: 'WFH hôm nay', badge: 'badge-info' },
      { person: people[5], status: 'Xin đi muộn 09:30', badge: 'badge-warning' },
      { person: people[6], status: 'Đúng giờ · 08:15', badge: 'badge-success' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="page-title">Người quan tâm</h1>
            <p className="page-desc">Trạng thái làm việc hôm nay (27/11/2026) của các đồng nghiệp bạn theo dõi</p>
          </div>
        </div>
        <section className="card">
          <div className="clean-list">
            {teamToday.map((row) => (
              <div key={row.person.id} className="clean-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar person={row.person} size={36} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{row.person.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
                      {row.person.title} · {row.person.team}
                    </div>
                  </div>
                </div>
                <span className={`badge ${row.badge}`}>{row.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const checkInTime = checkedInByPerson[currentPerson.id] || '08:42';
  const lb = currentPerson.leaveBalance;
  const myRequests = requests.filter((r) => r.personId === currentPerson.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Greeting Header matching Screenshot 2 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar person={currentPerson} size={42} />
          <div>
            <h1 className="page-title" style={{ fontSize: 21 }}>
              Chào buổi chiều, {currentPerson.name}
            </h1>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              Thứ sáu, ngày 27 tháng 11 năm 2026
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn-icon"
          title="Hướng dẫn chấm công"
          onClick={() => openAiWithPrompt('Chính sách chấm công & nghỉ phép thế nào?')}
        >
          <HelpCircle size={19} />
        </button>
      </div>

      {/* Top Row: Bold Green Check-in Hero + Leave Balance (matching Screenshot 2!) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1fr)', gap: 18 }}>
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Bold Green Status Banner (Click to check in if not yet!) */}
          <button
            type="button"
            onClick={() => {
              if (!isCheckedInToday) performCheckIn();
              else pushToast({ title: `Đã ghi nhận chấm công lúc ${checkInTime}`, tone: 'info' });
            }}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 'var(--r-12)',
              padding: '26px 20px',
              background: isCheckedInToday ? '#188038' : '#0B57D0',
              color: '#ffffff',
              textAlign: 'center',
              transition: 'opacity 150ms',
            }}
          >
            <div className="tabular" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
              {isCheckedInToday ? `Đã chấm công: ${checkInTime}` : 'Bấm để Chấm công ngay'}
            </div>
            <div style={{ fontSize: 14, opacity: 0.92, marginTop: 6 }}>
              {isCheckedInToday ? 'Đã ghi nhận hôm nay · Ca 08:30 – 17:30' : 'Ca tiêu chuẩn 08:30 – 17:30 · Tự đồng bộ iCheck'}
            </div>
          </button>

          {/* 4 Action Pills matching Screenshot 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
            {[
              { label: 'Xin đi muộn/ về sớm', icon: CalendarClock, prompt: 'Xin đi muộn 60 phút ngày mai' },
              { label: 'Xin nghỉ phép', icon: Calendar, prompt: 'Xin nghỉ phép năm ngày thứ 6' },
              { label: 'Quên chấm công', icon: TimerReset, prompt: 'Bổ sung quên chấm công sáng nay' },
              { label: 'Work from home', icon: Home, prompt: 'Đăng ký WFH thứ 2 tuần tới' },
            ].map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.label}
                  type="button"
                  className="btn btn-dim"
                  style={{ height: 40, borderRadius: 'var(--r-10)', padding: '0 12px', fontSize: 12.5 }}
                  onClick={() => openAiWithPrompt(act.prompt)}
                >
                  <Icon size={15} /> {act.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Leave Balance Card matching Screenshot 2 */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="card-title">Ngày phép còn lại</h2>
            <button
              type="button"
              className="btn btn-dim btn-sm"
              onClick={() => openAiWithPrompt('Số dư phép năm của tôi')}
            >
              Xem lịch sử
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 10, flex: 1 }}>
            <div className="card-sunk" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center', padding: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ngày phép hiện có</span>
              <span className="tabular" style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--text-strong)', margin: '6px 0' }}>
                {String(lb.annualRemaining).replace('.', ',')}
              </span>
              <div style={{ display: 'flex', gap: 18, fontSize: 12 }}>
                <div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Năm nay</div>
                  <strong className="tabular">{String(lb.annualRemaining).replace('.', ',')}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Năm cũ</div>
                  <strong className="tabular">{lb.carriedOver}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="card-sunk" style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Phép hỉ</div>
                <div className="tabular" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-strong)', marginTop: 2 }}>
                  {lb.weddingLeave}
                </div>
              </div>
              <div className="card-sunk" style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Phép hàng năm</div>
                <div className="tabular" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-strong)', marginTop: 2 }}>
                  {lb.annualTotal}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Row: Full Monthly Calendar + Đề xuất của bạn (matching Screenshot 2!) */}
      <div className="grid-2" style={{ gap: 18 }}>
        <section className="card">
          <div className="card-header" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-strong)' }}>Tháng 11, 2026</span>
              <button type="button" className="btn-icon" style={{ width: 28, height: 28 }} aria-label="Tháng trước">
                <ChevronLeft size={16} />
              </button>
              <button type="button" className="btn-icon" style={{ width: 28, height: 28 }} aria-label="Tháng sau">
                <ChevronRight size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn btn-dim btn-sm"
                onClick={() => pushToast({ title: 'Bảng công tháng 11 đang hợp lệ (20/20 ngày làm việc)', tone: 'success' })}
              >
                Kiểm tra công
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => pushToast({ title: 'Đã gửi xác nhận chốt công tháng 11/2026', tone: 'success' })}
              >
                Chốt công
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4, textAlign: 'center', marginBottom: 8, fontSize: 11.5, fontWeight: 600, color: 'var(--text-tertiary)' }}>
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
              <div key={d} style={{ padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
            {NOV_2026_CELLS.map((cell) => {
              const isSelected = selectedDay.day === cell.day;
              return (
                <button
                  key={cell.day}
                  type="button"
                  onClick={() => setSelectedDay(cell)}
                  style={{
                    height: 52,
                    borderRadius: 'var(--r-8)',
                    border: `1.5px solid ${isSelected ? 'var(--brand-primary)' : cell.isToday ? 'var(--brand-primary-border)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'var(--brand-primary-tint)' : cell.isToday ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <span className="tabular" style={{ fontSize: 12.5, fontWeight: cell.isToday ? 700 : 500, color: cell.status === 'none' ? 'var(--text-tertiary)' : 'var(--text-strong)' }}>
                    {cell.day}
                  </span>
                  {cell.status === 'on_time' && <CheckCircle2 size={14} style={{ color: 'var(--success-solid)' }} />}
                  {cell.status === 'late' && <Clock size={14} style={{ color: 'var(--ikame-orange)' }} />}
                  {cell.status === 'holiday' && <Palmtree size={14} style={{ color: 'var(--info-solid)' }} />}
                </button>
              );
            })}
          </div>

          {selectedDay.note && (
            <div className="card-sunk" style={{ marginTop: 12, fontSize: 12.5, display: 'flex', justifyContent: 'space-between' }}>
              <strong>Ngày {selectedDay.day}/11/2026</strong>
              <span style={{ color: 'var(--text-secondary)' }}>{selectedDay.note}</span>
            </div>
          )}

          {/* Compact Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', fontSize: 11.5, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={13} style={{ color: 'var(--success-solid)' }} /> Đúng giờ
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Clock size={13} style={{ color: 'var(--ikame-orange)' }} /> Muộn / Về sớm
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Palmtree size={13} style={{ color: 'var(--info-solid)' }} /> Nghỉ phép / Lễ
            </span>
          </div>
        </section>

        {/* Đề xuất của bạn matching Screenshot 2 */}
        <section className="card">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <h2 className="card-title">Đề xuất của bạn</h2>
            <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>Tháng 11, 2026</span>
          </div>

          <div className="clean-list">
            {myRequests.map((r) => (
              <div key={r.id} className="clean-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>{r.type}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {r.dateRange} · {r.summary}
                  </div>
                </div>
                <span className={`badge ${r.status === 'Đã duyệt' ? 'badge-success' : r.status === 'Từ chối' ? 'badge-error' : 'badge-warning'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
