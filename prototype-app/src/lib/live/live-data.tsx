import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { AttendanceStatus, DailyCheckIn, WeekDayAttendance } from '../../types';
import { trackFlow } from '../metrics/metrics';

/**
 * Dữ liệu thật của người đang xem — chỉ có ở bản artifact (`__ARTIFACT__`). Trang gọi các
 * connector claude.ai của chính người xem (iCheck, iGoal, iHiring, Google Calendar, IT Platform), tất cả
 * đều là tool đọc. Bản web không có `window.claude` nên luôn `unavailable` và giữ dữ liệu mẫu.
 *
 * Quy ước:
 * - `connect()` chỉ gọi từ một cú bấm (lời gọi đầu làm claude.ai hỏi quyền).
 * - Mỗi nguồn lỗi riêng: một nguồn hỏng không làm mất các nguồn còn lại.
 * - Hình dạng kết quả lấy từ lời gọi thật; chỉ khai báo trường đang dùng.
 */
export type LiveSourceId = 'icheck' | 'igoal' | 'ihiring' | 'calendar' | 'itp';
export const LIVE_SOURCES: Record<LiveSourceId, { server: string; label: string }> = {
  icheck: { server: 'iCheck', label: 'iCheck' },
  igoal: { server: 'iGoal', label: 'iGoal' },
  ihiring: { server: 'IHiring', label: 'iHiring' },
  calendar: { server: 'Google Calendar', label: 'Lịch Google' },
  itp: { server: 'IT Platform', label: 'IT Platform' },
};

type McpError = { code?: string };
type McpNamespace = { callTool: (server: string, tool: string, input?: unknown) => Promise<{ payload?: unknown }> };
type PermissionsNamespace = { request: (names?: string[]) => Promise<unknown> };
type ClaudeRuntime = { use: (name: string) => Promise<unknown> };

/** Mỗi loại lỗi có cách xử lý riêng — không gộp thành một câu "có lỗi xảy ra". */
export type LiveErrorKind = 'not_connected' | 'needs_reauth' | 'denied' | 'unavailable' | 'other';
export type LiveStatus = 'unavailable' | 'idle' | 'loading' | 'ready' | 'error';

export type LiveICheck = {
  checkIn: DailyCheckIn;
  week: WeekDayAttendance[];
  leave: { total: number; thisYear: number; carriedOver: number; annualQuota: number; annualUsed: number };
  month: { checkedDays: number; lateDays: number };
};
export type LiveIGoal = {
  position: string;
  managerName: string;
  period: string;
  /** Báo cáo tuần gần nhất; `writtenThisWeek` = đã có báo cáo từ thứ Hai tuần này. */
  weekly: { latestTitle?: string; writtenThisWeek: boolean; managerResponded: boolean };
};
export type LiveKeyResult = { id: string; title: string; current: number; target: number; weight: number };
export type LiveObjective = { id: string; title: string; scope: string; progress: number; keyResults: LiveKeyResult[] };
export type LiveDevice = { id: string; code: string; name: string; category: string; allocatedLabel: string; health?: number };
export type LiveLicense = { id: string; name: string; kind: string };
export type LiveCandidate = { id: string; name: string; roundName: string; waitingDays: number; url: string };
export type LiveMeeting = { id: string; title: string; startLabel: string; endLabel: string; allDay: boolean; guests: number; url?: string; start: Date; end: Date };

export type LiveData = {
  person: { name: string; shortName: string; team: string; position: string };
  icheck?: LiveICheck;
  igoal?: LiveIGoal;
  /** Ứng viên đang ở vòng mình được giao và mình chưa kết luận. */
  candidates?: LiveCandidate[];
  meetings?: LiveMeeting[];
  /** Mục tiêu do mình sở hữu trong kỳ hiện tại (iGoal). */
  objectives?: LiveObjective[];
  /** Thiết bị đang giữ và license đang dùng (IT Platform). */
  devices?: LiveDevice[];
  licenses?: LiveLicense[];
  errors: Partial<Record<LiveSourceId, LiveErrorKind>>;
  loadedAt: Date;
};

type LiveContext = {
  status: LiveStatus;
  data?: LiveData;
  /** Lỗi cấp trang (không gọi được công cụ nào). */
  errorKind?: LiveErrorKind;
  connect: () => void;
  disconnect: () => void;
};

const Context = createContext<LiveContext>({ status: 'unavailable', connect: () => {}, disconnect: () => {} });

const pad = (value: number) => String(value).padStart(2, '0');
const isoDay = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const hhmm = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DAY_MS = 24 * 60 * 60 * 1000;

function mondayOf(today: Date): Date {
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return monday;
}

function toErrorKind(error: unknown): LiveErrorKind {
  switch ((error as McpError | undefined)?.code) {
    case 'server_not_connected':
    case 'selection_required':
    case 'server_not_found':
      return 'not_connected';
    case 'needs_reauth':
      return 'needs_reauth';
    case 'not_in_manifest':
    case 'approval_required':
    case 'blocked_by_policy':
    case 'not_granted':
    case 'consent_required':
      return 'denied';
    case 'capability_disabled':
    case 'capability_removed':
      return 'unavailable';
    default:
      return 'other';
  }
}

// ---- iCheck ----
type ICheckMe = { name?: string; teamName?: string };
type ICheckLeaveStats = {
  remaining?: { annualDayOffs?: number };
  summary?: { annualUsed?: number };
  finalBalance?: { annual?: number; excessPrevYearRemaining?: number; total?: number };
};
type ICheckDay = { date: string; checkInTime?: string; lateMinutes?: number; location?: string };
type ICheckMonth = { checkIns?: ICheckDay[] };

function dayStatus(day: ICheckDay | undefined, isPast: boolean, weekend: boolean): AttendanceStatus {
  if (day) return (day.lateMinutes ?? 0) > 0 ? 'late' : 'on_time';
  if (weekend) return 'holiday';
  return isPast ? 'absent' : 'none';
}

function shapeICheck(leave: ICheckLeaveStats, month: ICheckMonth, now: Date): LiveICheck {
  const checkIns = month.checkIns ?? [];
  const byDay = new Map(checkIns.map((day) => [day.date, day]));
  const today = byDay.get(isoDay(now));
  const monday = mondayOf(now);
  const week = Array.from({ length: 7 }, (_, index): WeekDayAttendance => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const isToday = date.toDateString() === now.toDateString();
    return {
      dateLabel: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`,
      weekday: WEEKDAYS[date.getDay()],
      status: dayStatus(byDay.get(isoDay(date)), date < now && !isToday, index >= 5),
      isToday,
    };
  });
  const carriedOver = leave.finalBalance?.excessPrevYearRemaining ?? 0;
  const thisYear = leave.finalBalance?.annual ?? 0;
  return {
    checkIn: today?.checkInTime
      ? {
          done: true,
          timeLabel: hhmm(new Date(today.checkInTime)),
          status: (today.lateMinutes ?? 0) > 0 ? 'late' : 'on_time',
          mode: today.location === 'in_company' ? 'WFO' : 'Remote',
        }
      : { done: false },
    week,
    leave: {
      total: leave.finalBalance?.total ?? thisYear + carriedOver,
      thisYear,
      carriedOver,
      annualQuota: leave.remaining?.annualDayOffs ?? 0,
      annualUsed: leave.summary?.annualUsed ?? 0,
    },
    month: { checkedDays: checkIns.length, lateDays: checkIns.filter((day) => (day.lateMinutes ?? 0) > 0).length },
  };
}

// ---- iGoal ----
type IGoalMe = {
  user?: { id?: string; name?: string; teamName?: string; positionName?: string };
  directManager?: { name?: string };
  currentPeriod?: { timePeriod?: string; year?: number };
};
type IGoalReports = { data?: { title?: string; createdAt?: string; isManagerResponded?: boolean }[] };

function shapeIGoal(me: IGoalMe, reports: IGoalReports, now: Date): LiveIGoal {
  const latest = reports.data?.[0];
  return {
    position: me.user?.positionName ?? '',
    managerName: me.directManager?.name ?? '',
    period: me.currentPeriod ? `${me.currentPeriod.timePeriod ?? ''} ${me.currentPeriod.year ?? ''}`.trim() : '',
    weekly: {
      latestTitle: latest?.title,
      writtenThisWeek: !!latest?.createdAt && new Date(latest.createdAt) >= mondayOf(now),
      managerResponded: !!latest?.isManagerResponded,
    },
  };
}

type IGoalOkrs = { data?: { id?: string; title?: string; refName?: string; progress?: number; keyResults?: { id?: string; title?: string; current?: number; target?: number; weight?: number }[] }[] };

function shapeObjectives(list: IGoalOkrs): LiveObjective[] {
  return (list.data ?? []).flatMap((okr) => (okr.id ? [{
    id: okr.id,
    title: okr.title ?? '(Chưa đặt tên)',
    scope: okr.refName ?? '',
    progress: okr.progress ?? 0,
    keyResults: (okr.keyResults ?? []).flatMap((kr) => (kr.id ? [{ id: kr.id, title: kr.title ?? '', current: kr.current ?? 0, target: kr.target ?? 100, weight: kr.weight ?? 0 }] : [])),
  }] : []));
}

// ---- IT Platform ----
type ItpMe = { id?: string };
type ItpDevices = { items?: { id?: string; code?: string; name?: string; category?: string; currentAllocationDate?: string; healthScore?: number; currentHolder?: { id?: string } }[] };
type ItpLicenses = { items?: { id?: string; name?: string; licenseType?: string }[] };

/** Người có quyền xem rộng hơn mức cá nhân sẽ nhận cả thiết bị của người khác — chỉ giữ thiết bị của chính mình. */
function shapeDevices(list: ItpDevices, myId?: string): LiveDevice[] {
  return (list.items ?? []).flatMap((item) => {
    if (!item.id || (myId && item.currentHolder?.id !== myId)) return [];
    const allocated = item.currentAllocationDate ? new Date(item.currentAllocationDate) : undefined;
    return [{
      id: item.id,
      code: item.code ?? '',
      name: item.name ?? 'Thiết bị',
      category: item.category ?? '',
      allocatedLabel: allocated ? `${pad(allocated.getDate())}/${pad(allocated.getMonth() + 1)}/${allocated.getFullYear()}` : '',
      health: item.healthScore,
    }];
  });
}

/** Chỉ lấy tên và loại — không hiển thị số ghế hay chi phí toàn công ty. */
function shapeLicenses(list: ItpLicenses): LiveLicense[] {
  return (list.items ?? []).flatMap((item) => (item.id ? [{ id: item.id, name: item.name ?? 'License', kind: item.licenseType === 'key' ? 'Theo key' : 'Theo tài khoản' }] : []));
}

// ---- iHiring ----
type HiringRound = { roundName?: string; isCurrentRound?: boolean; myEvaluation?: { status?: string } };
type HiringRow = { candidateId?: string; fullName?: string; roundUpdatedAt?: string; assignedRounds?: HiringRound[]; candidateUrl?: string };
type HiringList = { data?: HiringRow[] };

function shapeCandidates(list: HiringList, now: Date): LiveCandidate[] {
  return (list.data ?? []).flatMap((row) => {
    const round = (row.assignedRounds ?? []).find((item) => item.isCurrentRound && item.myEvaluation?.status !== 'decided');
    if (!round || !row.candidateId || !row.candidateUrl) return [];
    const since = row.roundUpdatedAt ? new Date(row.roundUpdatedAt) : now;
    return [{
      id: row.candidateId,
      name: row.fullName ?? 'Ứng viên',
      roundName: round.roundName ?? 'Vòng hiện tại',
      waitingDays: Math.max(0, Math.floor((now.getTime() - since.getTime()) / DAY_MS)),
      url: row.candidateUrl,
    }];
  }).sort((a, b) => b.waitingDays - a.waitingDays);
}

// ---- Google Calendar ----
type CalendarTime = { dateTime?: string; date?: string };
type CalendarEvent = {
  id?: string; summary?: string; status?: string; htmlLink?: string;
  start?: CalendarTime; end?: CalendarTime;
  attendees?: { self?: boolean; responseStatus?: string }[];
};
type CalendarList = { events?: CalendarEvent[] };

function shapeMeetings(list: CalendarList): LiveMeeting[] {
  return (list.events ?? []).flatMap((event) => {
    const declined = event.attendees?.some((guest) => guest.self && guest.responseStatus === 'declined');
    const startRaw = event.start?.dateTime ?? event.start?.date;
    if (!event.id || !startRaw || event.status === 'cancelled' || declined) return [];
    const allDay = !event.start?.dateTime;
    const start = new Date(startRaw);
    const end = new Date(event.end?.dateTime ?? event.end?.date ?? startRaw);
    return [{
      id: event.id,
      title: event.summary ?? '(Không có tiêu đề)',
      startLabel: allDay ? 'Cả ngày' : hhmm(start),
      endLabel: allDay ? '' : hhmm(end),
      allDay,
      guests: event.attendees?.length ?? 0,
      url: event.htmlLink,
      start,
      end,
    }];
  }).sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Tên gọi ngắn kiểu Việt: từ cuối của họ tên ("Nguyễn Văn An" → "An"). */
function shortNameOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

async function loadAll(mcp: McpNamespace, now: Date): Promise<LiveData> {
  const errors: LiveData['errors'] = {};
  const call = async <T,>(source: LiveSourceId, tool: string, input?: unknown): Promise<T> =>
    ((await mcp.callTool(LIVE_SOURCES[source].server, tool, input)).payload ?? {}) as T;
  /** Chạy một nguồn; lỗi được ghi vào `errors[source]` và nguồn đó trả undefined. */
  const guard = async <T,>(source: LiveSourceId, run: () => Promise<T>): Promise<T | undefined> => {
    try {
      return await run();
    } catch (error) {
      errors[source] = toErrorKind(error);
      return undefined;
    }
  };

  const period = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const dayStart = `${isoDay(now)}T00:00:00`;
  const dayEnd = `${isoDay(now)}T23:59:59`;

  const [icheck, igoal, candidates, meetings, itp] = await Promise.all([
    guard('icheck', async () => {
      const [me, leave, month] = await Promise.all([
        call<ICheckMe>('icheck', 'icheck_me'),
        call<ICheckLeaveStats>('icheck', 'icheck_leave_stats', period),
        call<ICheckMonth>('icheck', 'icheck_my_monthly_attendance_detail', period),
      ]);
      return { me, shaped: shapeICheck(leave, month, now) };
    }),
    guard('igoal', async () => {
      const [me, reports] = await Promise.all([
        call<IGoalMe>('igoal', 'get_me'),
        call<IGoalReports>('igoal', 'list_reports', { category: 'WEEKLY', limit: 1 }),
      ]);
      // Mục tiêu do mình sở hữu: cần id người dùng từ get_me. Lỗi ở đây không làm mất phần còn lại của iGoal.
      const objectives = me.user?.id
        ? await call<IGoalOkrs>('igoal', 'search_okr', { owner: me.user.id, limit: 10 }).then(shapeObjectives).catch(() => undefined)
        : undefined;
      return { me, shaped: shapeIGoal(me, reports, now), objectives };
    }),
    guard('ihiring', async () => shapeCandidates(await call<HiringList>('ihiring', 'list_my_evaluation_rounds', { limit: 20 }), now)),
    guard('calendar', async () => shapeMeetings(await call<CalendarList>('calendar', 'list_events', { startTime: dayStart, endTime: dayEnd, orderBy: 'startTime', pageSize: 20 }))),
    guard('itp', async () => {
      const me = await call<ItpMe>('itp', 'get_me');
      const [devices, licenses] = await Promise.all([
        call<ItpDevices>('itp', 'list_devices', { pageSize: 50 }),
        call<ItpLicenses>('itp', 'list_licenses', { pageSize: 50 }),
      ]);
      return { devices: shapeDevices(devices, me.id), licenses: shapeLicenses(licenses) };
    }),
  ]);

  const name = igoal?.me.user?.name ?? icheck?.me.name ?? 'Bạn';
  return {
    person: {
      name,
      shortName: shortNameOf(name),
      team: igoal?.me.user?.teamName ?? icheck?.me.teamName ?? '',
      position: igoal?.shaped.position ?? '',
    },
    icheck: icheck?.shaped,
    igoal: igoal?.shaped,
    candidates,
    meetings,
    objectives: igoal?.objectives,
    devices: itp?.devices,
    licenses: itp?.licenses,
    errors,
    loadedAt: now,
  };
}

export function LiveDataProvider({ children }: PropsWithChildren) {
  const runtime = __ARTIFACT__ ? (window as unknown as { claude?: ClaudeRuntime }).claude : undefined;
  const [status, setStatus] = useState<LiveStatus>(runtime ? 'idle' : 'unavailable');
  const [data, setData] = useState<LiveData>();
  const [errorKind, setErrorKind] = useState<LiveErrorKind>();

  const connect = useCallback(() => {
    if (!runtime) return;
    setStatus('loading');
    trackFlow('live', 'start');
    setErrorKind(undefined);
    void (async () => {
      try {
        const mcp = (await runtime.use('mcp')) as McpNamespace | null;
        if (!mcp) {
          setErrorKind('unavailable');
          setStatus('error');
          trackFlow('live', 'exit');
          return;
        }
        // Hỏi quyền mọi connector trong một hộp thoại, trước khi gọi song song.
        const permissions = (await runtime.use('permissions').catch(() => null)) as PermissionsNamespace | null;
        await permissions?.request(['mcp']).catch(() => undefined);

        const loaded = await loadAll(mcp, new Date());
        const failed = Object.values(loaded.errors);
        if (failed.length === Object.keys(LIVE_SOURCES).length) {
          // Mọi nguồn đều hỏng: coi là lỗi cấp trang, một thông báo thay vì bốn.
          setErrorKind(failed.every((kind) => kind === failed[0]) ? failed[0] : 'other');
          setStatus('error');
          trackFlow('live', 'exit');
          return;
        }
        setData(loaded);
        trackFlow('live', 'done');
        setStatus('ready');
      } catch (error) {
        setErrorKind(toErrorKind(error));
        setStatus('error');
        trackFlow('live', 'exit');
      }
    })();
  }, [runtime]);

  const disconnect = useCallback(() => {
    setData(undefined);
    setErrorKind(undefined);
    setStatus(runtime ? 'idle' : 'unavailable');
  }, [runtime]);

  const value = useMemo(() => ({ status, data, errorKind, connect, disconnect }), [status, data, errorKind, connect, disconnect]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** `data` chỉ có khi đã kết nối xong — gọi `useLive().data?.icheck` để lấy từng nguồn. */
export function useLive() {
  const context = useContext(Context);
  return { ...context, data: context.status === 'ready' ? context.data : undefined };
}
