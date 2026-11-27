// PRD §7.11 MG-3 Early Signal calculation & §7.12 WAER breakdown helpers
import { PersonProfile } from '../types';

export type SignalLevel = 'risk' | 'watch' | 'healthy';

export interface MemberSignal {
  level: SignalLevel;
  label: string;
  reasons: string[];
}

export function evaluateEarlySignal(member: PersonProfile): MemberSignal {
  const p = member.pulse;
  if (!p) {
    return { level: 'healthy', label: 'Ổn định', reasons: [] };
  }

  const reasons: string[] = [];
  if (!p.activeThisWeek) reasons.push('Chưa có tương tác mới trong tuần này');
  if (p.kudosReceived2Weeks === 0) reasons.push('Chưa nhận ghi nhận (Kudos) trong 2 tuần');
  if (p.okrCheckinStatus !== 'on_time') {
    reasons.push(p.okrCheckinStatus === 'late' ? 'Check-in OKR trễ hạn' : 'Chưa check-in OKR tuần');
  }

  // PRD §7.11 MG-3:
  // risk = không hoạt động tuần này + chưa được ghi nhận 2 tuần + trễ check-in
  if (!p.activeThisWeek && p.kudosReceived2Weeks === 0 && p.okrCheckinStatus !== 'on_time') {
    return {
      level: 'risk',
      label: 'Cần quan tâm sớm',
      reasons,
    };
  }

  // watch = thiếu ghi nhận + trễ check-in
  if (p.kudosReceived2Weeks === 0 && p.okrCheckinStatus !== 'on_time') {
    return {
      level: 'watch',
      label: 'Cần theo dõi',
      reasons,
    };
  }

  return {
    level: 'healthy',
    label: 'Ổn định',
    reasons: reasons.length > 0 ? reasons : ['Nhịp hoạt động & check-in đều đặn'],
  };
}

// Generate real .ics file content for Calendar export (PRD §7.5 EV-4)
export function downloadEventIcs(params: {
  id: string;
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
}) {
  const toIcsDate = (iso: string) =>
    iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '').replace(/(\+\d{4})$/, '') + (iso.endsWith('Z') ? '' : '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//My iKame//Events//VI',
    'BEGIN:VEVENT',
    `UID:${params.id}@my.ikame.vn`,
    `DTSTART:${toIcsDate(params.startAt)}`,
    `DTEND:${toIcsDate(params.endAt)}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${params.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-ikame-${params.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
