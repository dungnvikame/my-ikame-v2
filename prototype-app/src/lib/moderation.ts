/**
 * Kiểm duyệt tự động khi đăng bài (thống nhất COM × Tech 06/08): KHÔNG duyệt trước,
 * hệ thống lọc từ khóa nhạy cảm → trả bài về kèm lý do, Admin/Moderator hậu kiểm.
 * Bản mock: danh sách rule cố định; bản thật thay bằng dịch vụ lọc nội dung.
 */
export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string; matched: string; hint: string };

type Rule = { terms: string[]; reason: string; hint: string };

const SENSITIVE_RULES: Rule[] = [
  {
    terms: ['mật khẩu', 'password', 'mã otp', 'otp', 'api key', 'token'],
    reason: 'Thông tin bảo mật tài khoản',
    hint: 'Không chia sẻ mật khẩu, OTP hay khóa truy cập trên kênh chung — gửi qua IT support.',
  },
  {
    terms: ['lương', 'tiền thưởng', 'mức thưởng', 'payslip', 'bảng lương', 'số tài khoản', 'cmnd', 'cccd'],
    reason: 'Thông tin C&B / dữ liệu cá nhân',
    hint: 'Thông tin lương thưởng và giấy tờ cá nhân chỉ trao đổi riêng với HR.',
  },
  {
    terms: ['vãi', 'vcl', 'đm', 'đéo', 'ngu'],
    reason: 'Ngôn từ không phù hợp',
    hint: 'Giữ tinh thần tôn trọng — bạn có thể diễn đạt lại nhẹ nhàng hơn.',
  },
];

/**
 * `\b` của JS chỉ coi [A-Za-z0-9_] là ký tự từ nên hỏng với chữ có dấu ("đm", "lương").
 * Dùng lookaround theo \p{L}\p{N} để biên từ đúng với tiếng Việt; input chuẩn hoá NFC
 * để dấu tổ hợp (NFD) không lọt lưới.
 */
function wordPattern(terms: string[]): RegExp {
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(?<![\\p{L}\\p{N}_])(?:${escaped.join('|')})(?![\\p{L}\\p{N}_])`, 'u');
}

const COMPILED_RULES = SENSITIVE_RULES.map((rule) => ({ ...rule, pattern: wordPattern(rule.terms) }));

export function checkContent(text: string): ModerationResult {
  const normalized = text.normalize('NFC').toLocaleLowerCase('vi');
  for (const rule of COMPILED_RULES) {
    const match = normalized.match(rule.pattern);
    if (match) return { ok: false, reason: rule.reason, matched: match[0], hint: rule.hint };
  }
  return { ok: true };
}
