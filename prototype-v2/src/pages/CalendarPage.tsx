import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, DoorOpen, MapPin, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CalSlot {
  id: string;
  dayIndex: number; // 0=T2..6=CN
  time: string;
  title: string;
  location: string;
  tone: 'blue' | 'green' | 'orange' | 'violet';
  link?: string;
}

const DAYS = [
  { label: 'T2', date: '23' },
  { label: 'T3', date: '24' },
  { label: 'T4', date: '25' },
  { label: 'T5', date: '26' },
  { label: 'T6', date: '27', isToday: true },
  { label: 'T7', date: '28' },
  { label: 'CN', date: '29' },
];

const SLOTS: CalSlot[] = [
  { id: 's1', dayIndex: 0, time: '09:30 – 10:30', title: 'Weekly Sync Team BM', location: 'Phòng Sao Hoả · Tầng 5', tone: 'blue' },
  { id: 's2', dayIndex: 1, time: '14:00 – 15:00', title: 'Review iGoal EKS H2/2026', location: 'Google Meet', tone: 'orange', link: '/igoal/my-eks' },
  { id: 's3', dayIndex: 2, time: '10:00 – 11:00', title: '1:1 với Nguyễn Hoàng An', location: 'Focus Booth B2', tone: 'violet' },
  { id: 's4', dayIndex: 3, time: '15:00 – 16:30', title: 'Sync MCP Gateway × AI Platform', location: 'Hội trường Tầng 5', tone: 'blue' },
  { id: 's5', dayIndex: 4, time: '09:30 – 11:00', title: 'iKame Coffee Talk (Đang diễn ra)', location: 'Pantry Lounge · Tầng 4', tone: 'green', link: '/icom/events/ev-coffee-talk' },
  { id: 's6', dayIndex: 4, time: '14:00 – 15:00', title: 'Review UI Google Material 3 My iKame', location: 'Phòng Sao Hoả · Tầng 5', tone: 'blue' },
  { id: 's7', dayIndex: 4, time: '16:30 – 17:00', title: 'Check-in OKR Tuần 48', location: 'iGoal', tone: 'orange', link: '/igoal/my-eks' },
];

const TONE_STYLE: Record<CalSlot['tone'], { bg: string; fg: string; border: string }> = {
  blue: { bg: 'var(--info-bg)', fg: 'var(--info-fg)', border: 'var(--info-border)' },
  green: { bg: 'var(--success-bg)', fg: 'var(--success-fg)', border: 'var(--success-border)' },
  orange: { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', border: 'var(--warning-border)' },
  violet: { bg: 'var(--violet-bg)', fg: 'var(--violet-fg)', border: 'var(--violet-border)' },
};

export const CalendarPage: React.FC = () => {
  const { openAiWithPrompt } = useApp();
  const [selectedDay, setSelectedDay] = useState(4); // Friday 27/11

  const daySlots = SLOTS.filter((s) => s.dayIndex === selectedDay);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Lịch làm việc</h1>
          <p className="page-desc">Tháng 11, 2026 · Đồng bộ Google Calendar & Sự kiện iKame</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openAiWithPrompt('Đặt phòng họp chiều nay')}
        >
          <Plus size={16} /> Đặt phòng họp
        </button>
      </div>

      {/* Google Calendar-style Week Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 8 }}>
        {DAYS.map((d, idx) => {
          const active = selectedDay === idx;
          const count = SLOTS.filter((s) => s.dayIndex === idx).length;
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => setSelectedDay(idx)}
              style={{
                padding: '12px 8px',
                borderRadius: 'var(--r-12)',
                border: `1.5px solid ${active ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
                background: active ? 'var(--brand-primary-tint)' : 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 11.5, fontWeight: 600, color: active ? 'var(--brand-primary-fg)' : 'var(--text-tertiary)' }}>
                {d.label}
              </span>
              <span
                className="tabular"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--r-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 700,
                  background: d.isToday ? 'var(--brand-primary)' : 'transparent',
                  color: d.isToday ? 'var(--text-on-brand)' : 'var(--text-strong)',
                }}
              >
                {d.date}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                {count > 0 ? `${count} lịch` : 'Trống'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Agenda */}
      <section className="card">
        <div className="card-header" style={{ marginBottom: 10 }}>
          <h2 className="card-title">
            <CalendarDays size={16} /> Lịch trình {DAYS[selectedDay].label}, {DAYS[selectedDay].date}/11/2026
          </h2>
          <button
            type="button"
            className="btn btn-dim btn-sm"
            onClick={() => openAiWithPrompt('Đặt phòng họp chiều nay')}
          >
            <DoorOpen size={14} /> Tìm phòng trống
          </button>
        </div>

        {daySlots.length === 0 ? (
          <div className="empty-state" style={{ padding: '28px 16px' }}>
            Không có cuộc họp nào trong ngày này — thời gian tập trung sâu!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {daySlots.map((slot) => {
              const st = TONE_STYLE[slot.tone];
              const body = (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--r-12)',
                    background: st.bg,
                    borderLeft: `4px solid ${st.fg}`,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-strong)' }}>{slot.title}</div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} className="tabular">
                        <Clock size={13} /> {slot.time}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={13} /> {slot.location}
                      </span>
                    </div>
                  </div>
                  {slot.link && <span className="badge badge-neutral">Mở →</span>}
                </div>
              );
              return slot.link ? (
                <Link key={slot.id} to={slot.link}>
                  {body}
                </Link>
              ) : (
                <div key={slot.id}>{body}</div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
