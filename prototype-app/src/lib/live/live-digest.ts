import type { DigestItem } from '../../pages/assistant/daily-digest';
import type { LiveData } from './live-data';

/**
 * "Việc hôm nay" từ dữ liệu thật. Quy tắc: chỉ đưa lên thứ có hành động cho người xem.
 *
 * | Nguồn    | Điều kiện                                         | Khẩn            | Tối đa |
 * |----------|---------------------------------------------------|-----------------|--------|
 * | iCheck   | hôm nay chưa chấm công                            | có              | 1      |
 * | iHiring  | ứng viên ở vòng mình được giao, mình chưa kết luận | chờ từ 7 ngày   | 3 + gom|
 * | iGoal    | tuần này chưa có báo cáo tuần                     | từ thứ Năm      | 1      |
 * | Lịch     | cuộc họp hôm nay chưa kết thúc                    | không           | 3      |
 *
 * Thống kê (đi muộn, số phép) không lên đây — nằm ở khối iCheck.
 */
const MAX_CANDIDATES = 3;
const MAX_MEETINGS = 3;
const IHIRING_URL = 'https://ihiring.ikameglobal.com';
const IGOAL_URL = 'https://igoal.ikameglobal.com';

export function buildLiveDigestItems(live: LiveData, now: Date): DigestItem[] {
  const items: DigestItem[] = [];

  if (live.icheck && !live.icheck.checkIn.done) {
    items.push({ id: 'live-checkin', label: 'Chấm công hôm nay', meta: 'Chưa ghi nhận giờ vào', to: '/work', source: 'iCheck', urgent: true });
  }

  const candidates = live.candidates ?? [];
  for (const candidate of candidates.slice(0, MAX_CANDIDATES)) {
    items.push({
      id: `live-candidate-${candidate.id}`,
      label: `Đánh giá ứng viên: ${candidate.name}`,
      meta: `${candidate.roundName} · ${candidate.waitingDays === 0 ? 'mới chuyển vòng hôm nay' : `chờ ${candidate.waitingDays} ngày`}`,
      to: '/work',
      href: candidate.url,
      source: 'iHiring',
      urgent: candidate.waitingDays >= 7,
    });
  }
  if (candidates.length > MAX_CANDIDATES) {
    items.push({
      id: 'live-candidate-more',
      label: `${candidates.length - MAX_CANDIDATES} ứng viên khác đang chờ bạn đánh giá`,
      meta: 'Mở iHiring để xem đủ danh sách',
      to: '/work',
      href: IHIRING_URL,
      source: 'iHiring',
    });
  }

  if (live.igoal && !live.igoal.weekly.writtenThisWeek) {
    items.push({
      id: 'live-weekly-report',
      label: 'Viết báo cáo tuần',
      meta: live.igoal.weekly.latestTitle ? `Gần nhất: ${live.igoal.weekly.latestTitle}` : 'Chưa có báo cáo trong kỳ này',
      to: '/goals',
      href: IGOAL_URL,
      source: 'iGoal',
      // Thứ Năm trở đi mà chưa viết thì coi là khẩn.
      urgent: now.getDay() >= 4 || now.getDay() === 0,
    });
  }

  const upcoming = (live.meetings ?? []).filter((meeting) => meeting.allDay || meeting.start.getTime() + 60 * 60 * 1000 > now.getTime());
  for (const meeting of upcoming.slice(0, MAX_MEETINGS)) {
    items.push({
      id: `live-meeting-${meeting.id}`,
      label: `${meeting.startLabel} · ${meeting.title}`,
      meta: meeting.guests > 1 ? `${meeting.guests} người tham gia` : 'Lịch của bạn',
      to: '/work',
      href: meeting.url,
      source: 'Google Calendar',
    });
  }

  return items;
}
