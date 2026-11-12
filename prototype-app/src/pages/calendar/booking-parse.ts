import { fold, parseDayWord, todayYmd } from '../../data/work-dates';

export type BookingRequest = {
  people: number;
  date: string;
  from: number;
  to: number;
  duration: number;
  part: 'sáng' | 'chiều' | null;
};

/** Hiểu câu kiểu "họp 6 người chiều mai 1 tiếng". Trả null nếu câu rỗng. */
export function parseBooking(text: string, fallbackDate = todayYmd()): BookingRequest | null {
  const f = fold(text).trim();
  if (!f) return null;

  const peopleMatch = /(\d{1,2})\s*(nguoi|ban|nhan su)/.exec(f);
  const people = Math.min(30, Math.max(2, peopleMatch ? Number(peopleMatch[1]) : 4));

  let duration = 60;
  const half = /(\d+)\s*(tieng|gio|h)\s*ruoi/.exec(f);
  const hours = /(\d+(?:[.,]\d+)?)\s*(tieng|gio|h)(?![a-z])/.exec(f);
  const mins = /(\d{2,3})\s*phut/.exec(f);
  if (half) duration = Number(half[1]) * 60 + 30;
  else if (mins) duration = Number(mins[1]);
  else if (hours) duration = Math.round(Number(hours[1].replace(',', '.')) * 60);
  duration = Math.min(240, Math.max(15, Math.round(duration / 15) * 15));

  const part = /(?<![a-z])sang(?![a-z])/.test(f) ? 'sáng' : /(?<![a-z])chieu(?![a-z])/.test(f) ? 'chiều' : null;
  const day = parseDayWord(text, todayYmd());
  const from = part === 'chiều' ? 13 * 60 : 8 * 60;
  const to = part === 'sáng' ? 12 * 60 : 18 * 60;

  return { people, date: day?.date ?? fallbackDate, from, to, duration, part };
}
