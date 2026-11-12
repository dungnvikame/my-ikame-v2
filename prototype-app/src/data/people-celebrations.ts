import { DEMO_TODAY } from './profile-extras';

/** Dữ liệu mẫu cho trang Gắn kết — nhân vật hư cấu, không phải nhân viên thật. */
export type BirthdayVisibility = 'team' | 'company' | 'none';

export type CelebPerson = {
  id: string;
  name: string;
  team: string;
  /** dd/mm — chỉ ngày và tháng, không có năm sinh. */
  birthday: string;
  /** dd/mm/yyyy */
  joinedAt: string;
  birthdayVisibility: BirthdayVisibility;
};

/** Team của người xem demo (khớp `user.team` của An) để áp quy tắc "Cho team". */
export const VIEWER_TEAM = 'Team Product';

export const celebPeople: CelebPerson[] = [
  { id: 'cp-01', name: 'Lê Thu Hà', team: 'Team Marketing', birthday: '12/11', joinedAt: '02/03/2022', birthdayVisibility: 'company' },
  { id: 'cp-02', name: 'Đặng Quốc Việt', team: 'Team Engineering', birthday: '03/05', joinedAt: '12/11/2023', birthdayVisibility: 'company' },
  { id: 'cp-03', name: 'Vũ Minh Châu', team: 'Team Product', birthday: '13/11', joinedAt: '20/08/2025', birthdayVisibility: 'team' },
  { id: 'cp-04', name: 'Bùi Tuấn Kiệt', team: 'Team Engineering', birthday: '14/11', joinedAt: '15/11/2021', birthdayVisibility: 'company' },
  { id: 'cp-05', name: 'Ngô Phương Linh', team: 'Team People & Culture', birthday: '09/11', joinedAt: '04/04/2024', birthdayVisibility: 'company' },
  { id: 'cp-06', name: 'Hoàng Gia Bảo', team: 'Team Product', birthday: '17/11', joinedAt: '03/11/2026', birthdayVisibility: 'team' },
  { id: 'cp-07', name: 'Trịnh Khánh Vy', team: 'Team Sales', birthday: '21/11', joinedAt: '03/11/2026', birthdayVisibility: 'company' },
  { id: 'cp-08', name: 'Phan Đức Long', team: 'Team Engineering', birthday: '25/11', joinedAt: '26/11/2020', birthdayVisibility: 'team' },
  { id: 'cp-09', name: 'Đỗ Ngọc Anh', team: 'Team Finance', birthday: '28/11', joinedAt: '09/11/2026', birthdayVisibility: 'company' },
  { id: 'cp-10', name: 'Lương Thế Vinh', team: 'Team Data', birthday: '02/12', joinedAt: '14/11/2022', birthdayVisibility: 'company' },
  { id: 'cp-11', name: 'Mai Thanh Tâm', team: 'Team Marketing', birthday: '05/01', joinedAt: '18/11/2024', birthdayVisibility: 'company' },
  { id: 'cp-12', name: 'Cao Bảo Ngọc', team: 'Team Operations', birthday: '30/11', joinedAt: '30/11/2025', birthdayVisibility: 'none' },
  { id: 'cp-13', name: 'Tạ Hải Đăng', team: 'Team Engineering', birthday: '10/11', joinedAt: '06/07/2023', birthdayVisibility: 'company' },
  { id: 'cp-14', name: 'Lý Mỹ Duyên', team: 'Team Product', birthday: '19/11', joinedAt: '22/11/2023', birthdayVisibility: 'company' },
  { id: 'cp-15', name: 'Đinh Công Hậu', team: 'Team Engineering', birthday: '08/08', joinedAt: '02/11/2026', birthdayVisibility: 'company' },
];

export type CelebKind = 'birthday' | 'anniversary';
export type CelebEvent = { id: string; person: CelebPerson; kind: CelebKind; date: Date; years?: number };

const dayOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const pad = (n: number) => String(n).padStart(2, '0');
export const dmLabel = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
export const daysFromToday = (d: Date, today: Date = DEMO_TODAY) => Math.round((dayOnly(d).getTime() - dayOnly(today).getTime()) / 86_400_000);

/** Initials hai chữ: họ + tên ("Lê Thu Hà" → "LH"). */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  return `${words[0]?.[0] ?? ''}${words.length > 1 ? words[words.length - 1][0] : ''}`.toUpperCase();
}

/** Ai được thấy sinh nhật của người này: "none" ẩn hết; "team" chỉ cùng team với người xem. */
export function canSeeBirthday(person: CelebPerson, viewerTeam: string = VIEWER_TEAM): boolean {
  if (person.birthdayVisibility === 'none') return false;
  if (person.birthdayVisibility === 'team') return person.team === viewerTeam;
  return true;
}

/** Sự kiện sinh nhật và tròn năm làm việc rơi trong năm của `today`. */
export function buildCelebEvents(people: CelebPerson[] = celebPeople, today: Date = DEMO_TODAY, viewerTeam: string = VIEWER_TEAM): CelebEvent[] {
  const year = today.getFullYear();
  const events: CelebEvent[] = [];
  for (const person of people) {
    if (canSeeBirthday(person, viewerTeam)) {
      const [d, m] = person.birthday.split('/').map(Number);
      events.push({ id: `${person.id}-birthday`, person, kind: 'birthday', date: new Date(year, m - 1, d) });
    }
    const [jd, jm, jy] = person.joinedAt.split('/').map(Number);
    const years = year - jy;
    if (years >= 1) events.push({ id: `${person.id}-anniversary`, person, kind: 'anniversary', date: new Date(year, jm - 1, jd), years });
  }
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Người vào làm trong tháng của `today`. */
export function newJoiners(people: CelebPerson[] = celebPeople, today: Date = DEMO_TODAY): CelebPerson[] {
  return people.filter((person) => {
    const [, jm, jy] = person.joinedAt.split('/').map(Number);
    return jy === today.getFullYear() && jm === today.getMonth() + 1;
  });
}

// ---------- Lời cảm ơn ----------
export type Kudos = { id: string; from: string; to: string; text: string; at: string; mine?: boolean };

export const seedKudos: Kudos[] = [
  { id: 'k-1', from: 'Vũ Minh Châu', to: 'Lê Thu Hà', text: 'Cảm ơn chị đã hỗ trợ bộ ảnh cho buổi ra mắt, kịp từng phút một.', at: '2026-11-10T16:20:00' },
  { id: 'k-2', from: 'Phan Đức Long', to: 'Tạ Hải Đăng', text: 'Cảm ơn Đăng đã ở lại hỗ trợ xử lý lỗi tối thứ Ba. Cả nhóm nhẹ cả người.', at: '2026-11-11T09:05:00' },
  { id: 'k-3', from: 'Ngô Phương Linh', to: 'Đỗ Ngọc Anh', text: 'Cảm ơn bạn đã giải thích kỹ quy trình thanh toán cho người mới.', at: '2026-11-11T17:40:00' },
];

export const BIRTHDAY_SUGGESTIONS = [
  'Chúc mừng sinh nhật! Chúc bạn thật nhiều sức khoẻ và niềm vui.',
  'Sinh nhật vui vẻ nhé, năm mới thuận lợi và nhiều thành công!',
  'Happy birthday! Cảm ơn bạn đã luôn đồng hành cùng team.',
];
export const anniversarySuggestions = (years?: number) => [
  `Chúc mừng tròn ${years ?? ''} năm đồng hành cùng iKame! Cảm ơn những đóng góp của bạn.`.replace('  ', ' '),
  'Cảm ơn bạn đã gắn bó và lan toả năng lượng tích cực cho cả đội.',
  'Chặng đường tiếp theo cùng nhau thật rực rỡ nhé!',
];
export const WELCOME_SUGGESTIONS = [
  'Chào mừng bạn đến với iKame! Cần gì cứ nhắn mình nhé.',
  'Rất vui được làm việc cùng bạn. Hẹn một buổi cà phê làm quen nhé!',
];
export const KUDOS_SUGGESTIONS = [
  'Cảm ơn bạn đã hỗ trợ kịp thời, giúp mình hoàn thành việc đúng hạn.',
  'Cảm ơn bạn đã chia sẻ kinh nghiệm, mình học được rất nhiều.',
  'Cảm ơn bạn đã chủ động giúp đỡ cả nhóm.',
];
