import React from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Home as HomeIcon,
  Plane,
  TimerReset,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INTERNAL_APPS } from '../data/mockData';

export const ICheckWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { currentPerson, checkedInByPerson, isCheckedInToday, performCheckIn, openAiWithPrompt, launchApp } =
    useApp();
  const checkInTime = checkedInByPerson[currentPerson.id];
  const icheckApp = INTERNAL_APPS.find((a) => a.id === 'app-icheck')!;

  const quickActions = [
    { label: 'Nghỉ phép', icon: Plane, prompt: 'Xin nghỉ phép năm ngày thứ 6' },
    { label: 'WFH', icon: HomeIcon, prompt: 'Đăng ký WFH thứ 2 tuần tới' },
    { label: 'Quên chấm', icon: TimerReset, prompt: 'Bổ sung quên chấm công sáng nay' },
    { label: 'Muộn / Sớm', icon: CalendarClock, prompt: 'Xin đi muộn 60 phút ngày mai' },
  ];

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} style={{ color: 'var(--brand-primary-fg)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)' }}>iCheck hôm nay</span>
        </div>
        <span className="tabular" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          Phép còn <strong>{currentPerson.leaveBalance.annualRemaining}</strong>d
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          paddingBottom: compact ? 0 : 14,
          borderBottom: compact ? 'none' : '1px solid var(--border-subtle)',
        }}
      >
        <div>
          {isCheckedInToday ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--success-fg)' }}>
              <CheckCircle2 size={16} />
              Đã vào · <span className="tabular">{checkInTime}</span>
            </div>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--warning-fg)' }}>
              Chưa chấm công
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Ca 08:30 – 17:30
          </div>
        </div>

        <button
          type="button"
          className={`btn btn-sm ${isCheckedInToday ? 'btn-dim' : 'btn-primary'}`}
          onClick={performCheckIn}
          disabled={isCheckedInToday}
        >
          {isCheckedInToday ? 'Đã ghi nhận' : 'Chấm công'}
        </button>
      </div>

      {!compact && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 6,
              marginTop: 14,
            }}
          >
            {quickActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.label}
                  type="button"
                  className="btn btn-dim btn-sm"
                  style={{ justifyContent: 'flex-start', padding: '0 10px', height: 32 }}
                  onClick={() => openAiWithPrompt(act.prompt)}
                >
                  <Icon size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => launchApp(icheckApp)}>
              Mở iCheck đầy đủ <ExternalLink size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
