/**
 * Chữ hiển thị trong Avatar của Core DS: tối đa 2 ký tự để không tràn khung.
 * - Đã ngắn (≤ 2 ký tự) hoặc dạng "+3": giữ nguyên.
 * - Tên người Việt ("Nguyễn Hoàng An", "QUÂN"): lấy chữ cái đầu của TÊN (từ cuối).
 * - Tên nhóm/đơn vị nhiều từ ("iKame People"): lấy chữ cái đầu của hai từ đầu.
 */
export function avatarText(value: string | number | undefined | null): string {
  const text = String(value ?? '').trim();
  if (text.length <= 2 || text.startsWith('+')) return text;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  const looksLikeOrg = /^(ikame|my|team|ban|phòng|blđ)/i.test(words[0]);
  if (looksLikeOrg) return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  return words[words.length - 1].charAt(0).toUpperCase();
}
