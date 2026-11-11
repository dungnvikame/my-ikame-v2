import { useState, type FormEvent } from 'react';
import { ArrowRightIcon as ArrowRight, CheckCircleIcon as CheckCircle, PaperPlaneTiltIcon as PaperPlaneTilt } from '@coreds/react/icons';
import { useAppState } from '../../AppState';
import { useLive } from '../../lib/live/live-data';
import { leaveDeduction, parseRequest, REQUEST_KIND_LABEL, type DaySession, type RequestDraft, type RequestKind } from '../../lib/request-parser';
import type { RequestType } from '../../types';
import { Input, Select } from '@coreds/react';
import { Button, ChipButton } from '../UI';
import { trackFlow } from '../../lib/metrics/metrics';

/**
 * Đề xuất bằng một câu: gõ câu tự nhiên → form điền sẵn ngay tại chỗ (loại, ngày, buổi, người
 * duyệt, phép còn lại, quy định liên quan) → xem lại → gửi. Không đi vòng qua Trợ lý AI.
 *
 * Gửi đơn là thao tác MÔ PHỎNG (nhãn DEMO): đơn chỉ vào danh sách trong My iKame, chưa ghi
 * sang iCheck / IT Platform. Số phép và người duyệt lấy từ dữ liệu thật khi đã kết nối.
 */
const EXAMPLES = ['Mai em xin nghỉ buổi sáng', 'Thứ 6 em xin làm ở nhà', 'Hôm qua em quên chấm công', 'Laptop không vào được wifi'];

const KIND_OPTIONS: RequestKind[] = ['leave', 'wfh', 'late', 'missing', 'it', 'equipment', 'admin'];
const SESSION_LABEL: Record<DaySession, string> = { full: 'Cả ngày', morning: 'Buổi sáng', afternoon: 'Buổi chiều' };

/** Loại đề xuất → nhóm request hiện có, nơi xử lý, hạn xử lý, quy định tóm tắt (nội dung mẫu). */
const KIND_META: Record<Exclude<RequestKind, 'unknown'>, { type: RequestType; handler?: string; sla: string; policy: string }> = {
  leave: { type: 'Nhân sự', sla: 'Quản lý duyệt trong 1 ngày làm việc', policy: 'Nghỉ từ 1 ngày trở lên cần gửi trước ít nhất 1 ngày làm việc; nghỉ nửa buổi trừ 0,5 ngày phép.' },
  wfh: { type: 'Chấm công', sla: 'Quản lý duyệt trước ngày làm từ xa', policy: 'Làm việc từ xa cần quản lý trực tiếp duyệt trước và vẫn chấm công như ngày thường.' },
  late: { type: 'Chấm công', sla: 'Quản lý duyệt trong ngày', policy: 'Đi muộn hoặc về sớm có đơn được duyệt thì không tính vào số buổi muộn trong tháng.' },
  missing: { type: 'Chấm công', sla: 'Quản lý duyệt trong 2 ngày làm việc', policy: 'Bổ sung chấm công cần gửi trong vòng 3 ngày làm việc kể từ ngày quên chấm.' },
  it: { type: 'IT support', handler: 'IT Helpdesk', sla: 'Phản hồi trong 4 giờ làm việc', policy: 'Sự cố chặn công việc được ưu tiên xử lý trong ngày.' },
  equipment: { type: 'Thiết bị', handler: 'IT Platform', sla: 'Phản hồi trong 2 ngày làm việc', policy: 'Cấp mới hoặc đổi thiết bị cần quản lý trực tiếp xác nhận nhu cầu.' },
  admin: { type: 'Hành chính', handler: 'Hành chính', sla: 'Phản hồi trong 1 ngày làm việc', policy: 'Yêu cầu hành chính được xử lý theo thứ tự tiếp nhận.' },
};

const dateLabel = (iso: string) => {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
};
const days = (value: number) => value.toLocaleString('vi-VN');

/** Tiêu đề đơn dựng từ bản nháp, ví dụ "Xin nghỉ phép · Buổi sáng 12/11/2026". */
function titleOf(draft: RequestDraft): string {
  const label = REQUEST_KIND_LABEL[draft.kind];
  switch (draft.kind) {
    case 'leave':
      return `${label} · ${draft.session === 'full' ? `${days(draft.days)} ngày từ` : SESSION_LABEL[draft.session]} ${dateLabel(draft.date)}`;
    case 'wfh':
      return `${label} · ${SESSION_LABEL[draft.session]} ${dateLabel(draft.date)}`;
    case 'late':
      return `${draft.direction === 'early' ? 'Xin về sớm' : 'Xin đi muộn'} ${draft.minutes ?? 30} phút · ${dateLabel(draft.date)}`;
    case 'missing':
      return `${label} · ${dateLabel(draft.date)}`;
    default:
      return `${label}: ${draft.source}`;
  }
}

export function QuickRequest() {
  const { addRequest, leaveBalance, hrProfile } = useAppState();
  const live = useLive().data;
  const [text, setText] = useState('');
  const [draft, setDraft] = useState<RequestDraft>();
  const [sentTitle, setSentTitle] = useState<string>();

  const approver = live?.igoal?.managerName || hrProfile.managerName;
  const leaveRemaining = live?.icheck ? live.icheck.leave.total : leaveBalance.annualRemaining;
  const leaveSource = live?.icheck ? 'iCheck' : 'dữ liệu mẫu';

  const read = (value: string) => {
    if (!value.trim()) return;
    setDraft(parseRequest(value));
    trackFlow('request', 'start');
    setSentTitle(undefined);
  };
  const onRead = (event: FormEvent) => {
    event.preventDefault();
    read(text);
  };
  const patch = (changes: Partial<RequestDraft>) => setDraft((current) => (current ? { ...current, ...changes } : current));

  const meta = draft && draft.kind !== 'unknown' ? KIND_META[draft.kind] : undefined;
  const deduction = draft ? leaveDeduction(draft) : 0;
  const overBalance = deduction > leaveRemaining;
  const usesDate = draft && ['leave', 'wfh', 'late', 'missing'].includes(draft.kind);

  const send = (event: FormEvent) => {
    event.preventDefault();
    if (!draft || !meta) return;
    const title = titleOf(draft);
    addRequest({ type: meta.type, title, handlerLabel: meta.handler ?? `Người duyệt: ${approver}`, slaLabel: meta.sla });
    setSentTitle(title);
    trackFlow('request', 'done');
    setDraft(undefined);
    setText('');
  };

  return (
    <section className="quick-request" aria-label="Đề xuất bằng một câu">
      <form className="quick-request-input" onSubmit={onRead}>
        <label htmlFor="quick-request-text">Bạn cần đề xuất gì? Gõ một câu như đang nhắn cho quản lý.</label>
        <div className="quick-request-row">
          <Input
            id="quick-request-text"
            size="l"
            variant="fill"
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Ví dụ: mai em xin nghỉ buổi sáng"
            autoComplete="off"
          />
          <Button variant="primary" type="submit" disabled={!text.trim()} icon={<ArrowRight size={16} />}>Điền form</Button>
        </div>
        <div className="quick-request-examples" role="group" aria-label="Câu gợi ý">
          {EXAMPLES.map((example) => (
            <ChipButton key={example} onClick={() => { setText(example); read(example); }}>{example}</ChipButton>
          ))}
        </div>
      </form>

      {sentTitle && (
        <p className="quick-request-receipt" role="status">
          <CheckCircle size={18} variant="fill" aria-hidden="true" />
          <span>Đã thêm vào "Đang theo dõi": <strong>{sentTitle}</strong></span>
          <span className="demo-badge">DEMO</span>
        </p>
      )}

      {draft && (
        <form className="quick-request-form" onSubmit={send} aria-label="Xem lại đề xuất">
          <header>
            <h3>Xem lại trước khi gửi</h3>
            <span className="demo-badge">DEMO</span>
          </header>
          {draft.kind === 'unknown' && (
            <p className="quick-request-hint" role="status">Mình chưa đoán được loại đề xuất từ câu này. Chọn loại bên dưới rồi điền tiếp.</p>
          )}

          <div className="quick-request-fields">
            <label>
              <span>Loại đề xuất</span>
              <Select
                id="quick-request-kind"
                variant="fill"
                placeholder="Chọn loại…"
                options={KIND_OPTIONS.map((kind) => ({ value: kind, label: REQUEST_KIND_LABEL[kind] }))}
                value={draft.kind === 'unknown' ? '' : draft.kind}
                onValueChange={(value) => patch({ kind: String(value) as RequestKind })}
              />
            </label>
            {usesDate && (
              <label>
                <span>Ngày</span>
                <Input id="quick-request-date" size="l" variant="fill" type="date" value={draft.date} onChange={(event) => patch({ date: event.target.value })} required />
              </label>
            )}
            {(draft.kind === 'leave' || draft.kind === 'wfh') && (
              <label>
                <span>Buổi</span>
                <Select
                  id="quick-request-session"
                  variant="fill"
                  options={(Object.keys(SESSION_LABEL) as DaySession[]).map((session) => ({ value: session, label: SESSION_LABEL[session] }))}
                  value={draft.session}
                  onValueChange={(value) => patch({ session: String(value) as DaySession })}
                />
              </label>
            )}
            {draft.kind === 'leave' && draft.session === 'full' && (
              <label>
                <span>Số ngày</span>
                <Input id="quick-request-days" size="l" variant="fill" type="number" min={1} max={30} step={1} value={draft.days} onChange={(event) => patch({ days: Math.max(1, Number(event.target.value) || 1) })} />
              </label>
            )}
            {draft.kind === 'late' && (
              <>
                <label>
                  <span>Hình thức</span>
                  <Select
                    id="quick-request-direction"
                    variant="fill"
                    options={[{ value: 'late', label: 'Đi muộn' }, { value: 'early', label: 'Về sớm' }]}
                    value={draft.direction ?? 'late'}
                    onValueChange={(value) => patch({ direction: String(value) as 'late' | 'early' })}
                  />
                </label>
                <label>
                  <span>Số phút</span>
                  <Input id="quick-request-minutes" size="l" variant="fill" type="number" min={5} max={240} step={5} value={draft.minutes ?? 30} onChange={(event) => patch({ minutes: Number(event.target.value) || 30 })} />
                </label>
              </>
            )}
            <label className="quick-request-wide">
              <span>{usesDate ? 'Lý do' : 'Mô tả'}</span>
              <Input
                id="quick-request-reason"
                size="l"
                variant="fill"
                type="text"
                value={usesDate ? draft.reason : draft.source}
                onChange={(event) => patch(usesDate ? { reason: event.target.value } : { source: event.target.value })}
                placeholder={usesDate ? 'Không bắt buộc' : 'Mô tả ngắn vấn đề hoặc nhu cầu'}
              />
            </label>
          </div>

          {meta && (
            <dl className="quick-request-facts">
              <div><dt>{meta.handler ? 'Nơi xử lý' : 'Người duyệt'}</dt><dd>{meta.handler ?? approver}</dd></div>
              <div><dt>Thời gian xử lý</dt><dd>{meta.sla}</dd></div>
              {draft.kind === 'leave' && (
                <div>
                  <dt>Ngày phép</dt>
                  <dd className={overBalance ? 'is-over' : ''}>
                    Còn {days(leaveRemaining)} ngày, đơn này trừ {days(deduction)}
                    {overBalance ? ' (vượt số phép còn lại)' : `, còn lại ${days(leaveRemaining - deduction)}`}
                    <small> · theo {leaveSource}</small>
                  </dd>
                </div>
              )}
              <div className="quick-request-policy"><dt>Quy định liên quan</dt><dd>{meta.policy}<small> · nội dung mẫu, chưa trích từ iWiki</small></dd></div>
            </dl>
          )}

          <footer>
            <p>Bản demo: đơn chỉ được ghi trong My iKame, chưa gửi sang iCheck hay IT Platform.</p>
            <div>
              <Button type="button" onClick={() => { setDraft(undefined); trackFlow('request', 'exit'); }}>Bỏ</Button>
              <Button variant="primary" type="submit" disabled={!meta} icon={<PaperPlaneTilt size={16} />}>Gửi đề xuất</Button>
            </div>
          </footer>
        </form>
      )}
    </section>
  );
}
