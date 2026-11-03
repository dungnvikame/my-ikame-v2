import type { EngagementActions, MemberWeekEngagement } from '../data/team-engagement';
import type { SignalTone, TeamMember } from '../types';

/** Hàm thuần tính "Nhịp team" + tín hiệu sớm từ dữ liệu engagement tuần — Manager và COM dùng chung. */

export function isActive(actions: EngagementActions): boolean {
  return actions.ack + actions.post + actions.kudosGiven + actions.request > 0 || actions.checkInOnTime;
}

export type Ratio = { count: number; total: number; percent: number };

function ratio(count: number, total: number): Ratio {
  return { count, total, percent: total ? Math.round((count / total) * 100) : 0 };
}

export function teamWaer(rows: MemberWeekEngagement[], week: 'thisWeek' | 'lastWeek'): Ratio {
  return ratio(rows.filter((row) => isActive(row[week])).length, rows.length);
}

export function checkInOnTime(rows: MemberWeekEngagement[], week: 'thisWeek' | 'lastWeek'): Ratio {
  return ratio(rows.filter((row) => row[week].checkInOnTime).length, rows.length);
}

export function kudosStats(rows: MemberWeekEngagement[]) {
  const given = rows.reduce((sum, row) => sum + row.thisWeek.kudosGiven, 0);
  const received = rows.reduce((sum, row) => sum + row.thisWeek.kudosReceived, 0);
  const unrecognized = rows.filter((row) => row.thisWeek.kudosReceived + row.lastWeek.kudosReceived === 0).map((row) => row.memberId);
  return { given, received, unrecognized };
}

export type Trend = { delta: number; tone: SignalTone; label: string };

export function trend(current: number, previous: number): Trend {
  const delta = current - previous;
  if (delta > 0) return { delta, tone: 'good', label: `▲ +${delta} điểm so tuần trước` };
  if (delta < 0) return { delta, tone: delta <= -20 ? 'risk' : 'watch', label: `▼ ${delta} điểm so tuần trước` };
  return { delta, tone: 'neutral', label: 'Giữ nguyên so tuần trước' };
}

/** `risk` = im lặng hẳn (bản tin AI nhắc đích danh); `watch` = chỉ thiếu ghi nhận + trễ check-in. */
export type EarlySignal = { memberId: string; name: string; reason: string; suggestion: string; severity: 'risk' | 'watch' };

/**
 * Tín hiệu sớm trước khi thành "vấn đề": không hoạt động tuần này + chưa được ghi nhận 2 tuần
 * + trễ check-in. Chỉ xét thành viên trong roster được truyền vào (scope team của manager).
 */
export function earlySignals(rows: MemberWeekEngagement[], roster: TeamMember[]): EarlySignal[] {
  return rows.flatMap((row): EarlySignal[] => {
    const member = roster.find((item) => item.id === row.memberId);
    if (!member) return [];
    const quiet = !isActive(row.thisWeek);
    const unrecognized = row.thisWeek.kudosReceived + row.lastWeek.kudosReceived === 0;
    const lateCheckIn = !row.thisWeek.checkInOnTime;
    if (quiet && unrecognized && lateCheckIn) {
      return [{
        memberId: member.id,
        name: member.name,
        reason: `Không hoạt động trên My iKame tuần này · chưa được ghi nhận 2 tuần · trễ check-in OKR${member.attentionSummary ? ` · ${member.attentionSummary}` : ''}`,
        suggestion: 'Một lời ghi nhận và một buổi 1:1 trong tuần này — trước khi tín hiệu thành vấn đề.',
        severity: 'risk' as const,
      }];
    }
    if (unrecognized && lateCheckIn) {
      return [{
        memberId: member.id,
        name: member.name,
        reason: 'Chưa được ghi nhận 2 tuần · trễ check-in OKR',
        suggestion: 'Ghi nhận một việc cụ thể bạn thấy tốt tuần này.',
        severity: 'watch' as const,
      }];
    }
    return [];
  }).sort((a, b) => Number(b.severity === 'risk') - Number(a.severity === 'risk'));
}
