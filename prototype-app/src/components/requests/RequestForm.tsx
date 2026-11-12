import { useState } from 'react';
import { PaperPlaneTiltIcon as PaperPlaneTilt, UserCheckIcon as UserCheck, XIcon as X } from '@coreds/react/icons';
import { Input, Modal, SegmentedControl, Select, Textarea } from '@coreds/react';
import { useAppState } from '../../AppState';
import { trackFlow } from '../../lib/metrics/metrics';
import type { LiveMeeting } from '../../lib/live/live-data';
import { REQUEST_KIND_LABEL, type DaySession, type RequestKind } from '../../lib/request-parser';
import { Button, ChipButton, IconButton } from '../UI';
import { useToast } from '../toast';
import { LeaveContextPanel } from './LeaveContextPanel';
import { MiniCalendar } from './MiniCalendar';
import { dateLabel, dayCount, leaveDaysOf, rangeLabel, saveLeavePlan, weekdayLabel } from './request-context';
import {
  ACCOUNT_TOOLS, FORM_KINDS, hasHalfDay, KIND_META, REASON_CHIPS, SESSION_LABEL, titleOf, usesDates,
  type FormState,
} from './request-form-model';

/**
 * Form đề xuất đầy đủ: chọn ngày bằng lịch, nửa ngày, lý do gợi ý, người duyệt, tóm tắt phép,
 * rồi xác nhận mới gửi. Gửi là MÔ PHỎNG: đơn chỉ vào lịch sử trong My iKame, chưa ghi sang iCheck / IT Platform.
 */
type Props = {
  initial: FormState;
  leaveRemaining: number;
  leaveSource: string;
  approver: string;
  meetings?: LiveMeeting[];
  onClose: () => void;
};

const SESSION_OPTIONS = (Object.keys(SESSION_LABEL) as DaySession[]).map((session) => ({ value: session, label: SESSION_LABEL[session] }));

export function RequestForm({ initial, leaveRemaining, leaveSource, approver, meetings, onClose }: Props) {
  const { addRequest } = useAppState();
  const { showToast } = useToast();
  const [state, setState] = useState<FormState>(initial);
  const [absent, setAbsent] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const patch = (changes: Partial<FormState>) => setState((current) => ({ ...current, ...changes }));
  const kind = state.kind;
  const meta = kind === 'unknown' ? undefined : KIND_META[kind];
  const dated = usesDates(kind);
  const isLeave = kind === 'leave';
  const used = isLeave ? leaveDaysOf(state.start, state.end, state.session) : 0;
  const after = leaveRemaining - used;
  const title = titleOf(state);

  const needsText = !dated && !state.accountMode;
  const invalid = !meta
    || (needsText && !state.source.trim())
    || (state.accountMode && state.accounts.length === 0)
    || (isLeave && used <= 0);

  const changeKind = (value: string) => {
    const next = value as RequestKind;
    // Đổi loại: giữ ngày/lý do đã chọn, chỉ đưa ngày về khoảng 1 ngày nếu loại mới không có khoảng.
    patch({ kind: next, accountMode: false, end: next === 'leave' ? state.end : state.start });
  };

  const pickDates = (start: string, end: string) => patch({ start, end: isLeave && state.session === 'full' ? end : start });
  const changeSession = (value: string) => {
    const session = value as DaySession;
    patch({ session, end: session === 'full' ? state.end : state.start });
  };
  const toggleAccount = (tool: string) => patch({
    accounts: state.accounts.includes(tool) ? state.accounts.filter((item) => item !== tool) : [...state.accounts, tool],
  });
  const toggleAbsent = (id: string) => setAbsent((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));

  const send = () => {
    if (!meta || invalid) return;
    const absentNote = isLeave && absent.length > 0 ? ` · báo vắng ${absent.length} cuộc họp` : '';
    addRequest({ type: meta.type, title, handlerLabel: meta.handler ?? `Người duyệt: ${approver}`, slaLabel: `${meta.sla}${absentNote}` });
    if (isLeave) saveLeavePlan({ start: state.start, end: state.end, session: state.session, days: used });
    trackFlow('request', 'done');
    setConfirmOpen(false);
    showToast(`Đã gửi đề xuất: ${title}`);
    onClose();
  };

  const close = () => { trackFlow('request', 'exit'); onClose(); };

  return (
    <section className="rq-form" aria-label="Form đề xuất">
      <header className="rq-form-head">
        <div>
          <h2>{state.accountMode ? 'Cấp tài khoản' : REQUEST_KIND_LABEL[kind]}</h2>
          <p>Kiểm tra lại thông tin rồi gửi cho {meta?.handler ?? approver}.</p>
        </div>
        <span className="demo-badge">DEMO</span>
        <IconButton label="Đóng form" onClick={close}><X size={18} /></IconButton>
      </header>

      {kind === 'unknown' && (
        <p className="rq-hint" role="status">Mình chưa đoán được loại đề xuất từ câu này. Chọn loại bên dưới rồi điền tiếp.</p>
      )}

      <div className={`rq-form-body ${isLeave ? 'has-context' : ''}`}>
        <div className="rq-form-main">
          <label className="rq-field">
            <span>Loại đề xuất</span>
            <Select
              variant="fill"
              placeholder="Chọn loại…"
              options={FORM_KINDS.map((item) => ({ value: item, label: REQUEST_KIND_LABEL[item] }))}
              value={kind === 'unknown' ? '' : kind}
              onValueChange={(value) => changeKind(String(value))}
            />
          </label>

          {dated && (
            <div className="rq-field">
              <span>{isLeave && state.session === 'full' ? 'Ngày nghỉ (bấm ngày đầu, rồi ngày cuối)' : 'Ngày'}</span>
              <MiniCalendar
                key={kind}
                start={state.start}
                end={state.end}
                range={isLeave && state.session === 'full'}
                allowPast={kind === 'missing'}
                onChange={pickDates}
              />
              <p className="rq-picked" role="status">
                {weekdayLabel(state.start)}, {dateLabel(state.start)}
                {state.end !== state.start && <> → {weekdayLabel(state.end)}, {dateLabel(state.end)} ({rangeLabel(state.start, state.end)})</>}
              </p>
            </div>
          )}

          {hasHalfDay(kind) && (
            <div className="rq-field">
              <span>Thời gian</span>
              <SegmentedControl size="m" options={SESSION_OPTIONS} value={state.session} onValueChange={changeSession} aria-label="Cả ngày hoặc nửa ngày" />
            </div>
          )}

          {kind === 'wfh' && (
            <div className="rq-field">
              <span>Hình thức</span>
              <SegmentedControl
                size="m"
                options={[{ value: 'remote', label: 'Làm từ xa' }, { value: 'trip', label: 'Công tác' }]}
                value={state.wfhMode}
                onValueChange={(value) => patch({ wfhMode: value as FormState['wfhMode'] })}
                aria-label="Hình thức làm việc"
              />
            </div>
          )}

          {kind === 'late' && (
            <div className="rq-row">
              <label className="rq-field">
                <span>Hình thức</span>
                <SegmentedControl
                  size="m"
                  options={[{ value: 'late', label: 'Đi muộn' }, { value: 'early', label: 'Về sớm' }]}
                  value={state.direction}
                  onValueChange={(value) => patch({ direction: value as 'late' | 'early' })}
                />
              </label>
              <label className="rq-field">
                <span>Số phút</span>
                <Input size="l" variant="fill" type="number" min={5} max={240} step={5} value={state.minutes} onChange={(event) => patch({ minutes: Math.min(240, Math.max(5, Number(event.target.value) || 30)) })} />
              </label>
            </div>
          )}

          {state.accountMode && (
            <div className="rq-field">
              <span>Công cụ cần cấp tài khoản</span>
              <div className="rq-chips" role="group" aria-label="Công cụ">
                {ACCOUNT_TOOLS.map((tool) => (
                  <ChipButton key={tool} aria-pressed={state.accounts.includes(tool)} onClick={() => toggleAccount(tool)}>
                    {tool}
                  </ChipButton>
                ))}
              </div>
            </div>
          )}

          {dated ? (
            <div className="rq-field">
              <span>Lý do <small>(không bắt buộc)</small></span>
              <div className="rq-chips" role="group" aria-label="Lý do gợi ý">
                {REASON_CHIPS.map((chip) => <ChipButton key={chip} onClick={() => patch({ reason: chip })}>{chip}</ChipButton>)}
              </div>
              <Textarea variant="fill" rows={2} value={state.reason} onChange={(event) => patch({ reason: event.target.value })} placeholder="Ví dụ: việc gia đình" aria-label="Lý do" />
            </div>
          ) : (
            <label className="rq-field">
              <span>{state.accountMode ? 'Ghi chú thêm' : 'Mô tả'}</span>
              <Textarea variant="fill" rows={3} value={state.source} onChange={(event) => patch({ source: event.target.value })} placeholder="Mô tả ngắn vấn đề hoặc nhu cầu" />
            </label>
          )}
        </div>

        {isLeave && (
          <LeaveContextPanel state={state} remaining={leaveRemaining} meetings={meetings} absent={absent} onToggleAbsent={toggleAbsent} />
        )}
      </div>

      {meta && (
        <dl className="rq-facts">
          <div><dt><UserCheck size={14} aria-hidden="true" />{meta.handler ? 'Nơi xử lý' : 'Người duyệt'}</dt><dd>{meta.handler ?? approver}</dd></div>
          <div><dt>Thời gian xử lý</dt><dd>{meta.sla}</dd></div>
          {!isLeave && <div><dt>Quy định</dt><dd>{meta.policy}</dd></div>}
        </dl>
      )}

      {isLeave && (
        <p className={`rq-summary ${after < 0 ? 'is-over' : ''}`} role="status">
          Bạn sẽ dùng <strong>{dayCount(used)} ngày</strong>, {after < 0 ? `vượt ${dayCount(-after)} ngày so với phép còn lại` : <>còn <strong>{dayCount(after)} ngày</strong></>}
          <small> · số phép theo {leaveSource}</small>
        </p>
      )}

      <footer className="rq-form-foot">
        <p>Bản demo: đơn chỉ được ghi trong My iKame, chưa gửi sang iCheck hay IT Platform.</p>
        <div>
          <Button onClick={close}>Bỏ</Button>
          <Button variant="primary" disabled={invalid} onClick={() => setConfirmOpen(true)} icon={<PaperPlaneTilt size={16} />}>Gửi đề xuất</Button>
        </div>
      </footer>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Xác nhận gửi đề xuất"
        description={`Đề xuất sẽ được gửi tới ${meta?.handler ?? approver}.`}
        size="sm"
        footer={(
          <>
            <Button variant="borderless" onClick={() => setConfirmOpen(false)}>Quay lại</Button>
            <Button variant="primary" onClick={send}>Gửi đề xuất</Button>
          </>
        )}
      >
        <p className="rq-confirm-title">{title}</p>
        {isLeave && <p className="rq-confirm-sub">Dùng {dayCount(used)} ngày phép, còn {dayCount(Math.max(after, 0))} ngày.{absent.length > 0 && ` Báo vắng ${absent.length} cuộc họp.`}</p>}
        {state.reason && dated && <p className="rq-confirm-sub">Lý do: {state.reason}</p>}
      </Modal>
    </section>
  );
}
