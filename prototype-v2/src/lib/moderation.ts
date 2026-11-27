// PRD §7.3 FD-7 & §10: Vietnamese Unicode NFC Auto-Moderation (no pre-approval)
// Handles 3 categories: Account Security, C&B/Personal Data, Inappropriate Language
// Smart word boundary handling so "khen thưởng" is NOT blocked while sensitive leaks are caught.

export interface ModerationResult {
  allowed: boolean;
  category?: 'security' | 'cb_pii' | 'language';
  categoryLabel?: string;
  matchedTerm?: string;
  reason?: string;
  suggestion?: string;
}

interface ModerationRule {
  category: 'security' | 'cb_pii' | 'language';
  categoryLabel: string;
  terms: string[];
  exceptions?: string[];
  reason: string;
  suggestion: string;
}

const MODERATION_RULES: ModerationRule[] = [
  {
    category: 'security',
    categoryLabel: 'Thông tin bảo mật tài khoản',
    terms: ['mật khẩu', 'mat khau', 'password', 'mã otp', 'otp', 'api key', 'access token', 'secret key', 'private key'],
    reason: 'Bài viết chứa từ khoá liên quan đến mật khẩu hoặc khoá bảo mật nội bộ.',
    suggestion: 'Xoá thông tin đăng nhập/token khỏi bài đăng. Nếu cần hỗ trợ tài khoản, hãy gửi ticket qua iRequest (IT Support).',
  },
  {
    category: 'cb_pii',
    categoryLabel: 'Thông tin C&B & dữ liệu cá nhân',
    terms: ['mức lương', 'bảng lương', 'phiếu lương', 'số cccd', 'cccd', 'số tài khoản ngân hàng', 'thu nhập cá nhân', 'lương tháng'],
    exceptions: ['khen thưởng', 'phúc lợi chung', 'chính sách thưởng'],
    reason: 'Nội dung đề cập dữ liệu thu nhập cá nhân hoặc định danh nhạy cảm (PII/C&B).',
    suggestion: 'Không chia sẻ công khai thông tin lương/CCCD trên Feed. Bạn có thể xem phiếu lương riêng tư tại Hồ sơ hoặc liên hệ P&OD.',
  },
  {
    category: 'language',
    categoryLabel: 'Ngôn từ không phù hợp môi trường làm việc',
    terms: ['ngu ngốc', 'vô dụng', 'đồ điên', 'chửi bới', 'xúc phạm', 'đm', 'vcl'],
    reason: 'Phát hiện ngôn từ có thể gây tổn thương hoặc không phù hợp văn hoá giao tiếp iKame.',
    suggestion: 'Hãy diễn đạt góp ý theo hướng xây dựng, tập trung vào vấn đề và giải pháp thay vì công kích cá nhân.',
  },
];

function normalizeNFC(input: string): string {
  return input.normalize('NFC').toLowerCase();
}

function containsTermWithVietnameseBoundary(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Vietnamese Unicode letters range for accurate word boundaries
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'iu');
  return pattern.test(text);
}

export function moderateVietnameseContent(rawText: string): ModerationResult {
  const normalized = normalizeNFC(rawText);
  if (!normalized.trim()) {
    return { allowed: true };
  }

  for (const rule of MODERATION_RULES) {
    // Strip whitelisted benign phrases first (e.g., "khen thưởng")
    let sanitized = normalized;
    if (rule.exceptions) {
      for (const ex of rule.exceptions) {
        sanitized = sanitized.replaceAll(normalizeNFC(ex), ' ');
      }
    }

    for (const term of rule.terms) {
      const normalizedTerm = normalizeNFC(term);
      if (containsTermWithVietnameseBoundary(sanitized, normalizedTerm)) {
        return {
          allowed: false,
          category: rule.category,
          categoryLabel: rule.categoryLabel,
          matchedTerm: term,
          reason: rule.reason,
          suggestion: rule.suggestion,
        };
      }
    }
  }

  return { allowed: true };
}
