import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AirplaneTiltIcon as AirplaneTilt, BuildingsIcon as Buildings, CaretDownIcon as CaretDown, ClockIcon as Clock, ClockCountdownIcon as ClockCountdown,
  DesktopTowerIcon as DesktopTower, HouseLineIcon as HouseLine, KeyIcon as Key, TicketIcon as Ticket, UserCircleIcon as UserCircle, WrenchIcon as Wrench,
} from '@coreds/react/icons';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { QuickRequest } from '../components/requests/QuickRequest';
import { RequestForm } from '../components/requests/RequestForm';
import { RequestSummary } from '../components/requests/RequestSummary';
import { loadLeavePlans, todayIso } from '../components/requests/request-context';
import {
  accountState, blankState, FORM_KINDS, KIND_META, stateFromSentence, type FormKind, type FormState,
} from '../components/requests/request-form-model';
import { EmptyState, StatusPill } from '../components/UI';
import { useLive } from '../lib/live/live-data';
import { trackFlow } from '../lib/metrics/metrics';
import { REQUEST_KIND_LABEL } from '../lib/request-parser';
import type { RequestItem, RequestStatus, RequestType } from '../types';

/**
 * Trung tâm đề xuất: thẻ tóm tắt phép/đơn chờ, một câu để tạo đề xuất, form có lịch chọn ngày,
 * các đề xuất nhanh và lịch sử. Gửi đơn là MÔ PHỎNG (nhãn DEMO) — chưa ghi sang iCheck / IT Platform.
 */
const STATUS_META: Record<RequestStatus, { label: string; tone: 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Chờ duyệt', tone: 'warning' },
  in_progress: { label: 'Đang xử lý', tone: 'info' },
  done: { label: 'Hoàn tất', tone: 'success' },
};

const TYPE_ICON: Record<RequestType, typeof Wrench> = {
  'IT support': Wrench,
  'Nhân sự': UserCircle,
  'Hành chính': Buildings,
  'Thiết bị': DesktopTower,
  'Chấm công': Clock,
};

const KIND_ICON: Record<FormKind, typeof Wrench> = {
  leave: AirplaneTilt, wfh: HouseLine, late: ClockCountdown, missing: Clock, it: Wrench, equipment: DesktopTower, admin: Buildings,
};

const QUICK_CARDS: { id: string; title: string; desc: string; icon: typeof Wrench; tone: string; make: () => FormState }[] = [
  { id: 'leave', title: 'Xin nghỉ', desc: 'Phép năm, nghỉ nửa buổi', icon: AirplaneTilt, tone: 'blue', make: () => blankState('leave') },
  { id: 'late', title: 'Đi muộn / về sớm', desc: 'Không bị tính muộn', icon: ClockCountdown, tone: 'amber', make: () => blankState('late') },
  { id: 'wfh', title: 'Làm từ xa / công tác', desc: 'Làm ở nhà, đi công tác', icon: HouseLine, tone: 'green', make: () => blankState('wfh') },
  { id: 'account', title: 'Cấp tài khoản', desc: 'Google, Slack, Figma, Jira…', icon: Key, tone: 'indigo', make: accountState },
];

function RequestRow({ request }: { request: RequestItem }) {
  const Icon = TYPE_ICON[request.type];
  const status = STATUS_META[request.status];
  return (
    <article className="request-row">
      <span className="request-icon" aria-hidden="true"><Icon size={20} /></span>
      <div className="request-copy">
        <strong>{request.title}</strong>
        <small>
          {request.type} · {request.createdAtLabel}
          {request.handlerLabel && ` · ${request.handlerLabel}`}
          {request.slaLabel && ` · ${request.slaLabel}`}
        </small>
      </div>
      <StatusPill tone={status.tone}>{status.label}</StatusPill>
    </article>
  );
}

function Collapsible({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rq-collapse">
      <button type="button" className="rq-collapse-head" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <h2>{title}</h2>
        <CaretDown size={18} className={open ? 'is-open' : ''} aria-hidden="true" />
      </button>
      {open && <div className="rq-collapse-body">{children}</div>}
    </section>
  );
}

export function RequestsPage() {
  const { requests, leaveBalance, hrProfile } = useAppState();
  const live = useLive().data;
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState<{ key: number; state: FormState }>();
  const [plans, setPlans] = useState(loadLeavePlans);
  const formRef = useRef<HTMLDivElement>(null);
  const consumedDraft = useRef<string | null>(null);

  const approver = live?.igoal?.managerName || hrProfile.managerName;
  const icheck = live?.icheck;
  const remaining = icheck ? icheck.leave.total : leaveBalance.annualRemaining;
  const used = icheck ? icheck.leave.annualUsed : leaveBalance.annualUsed;
  const leaveNote = icheck ? `năm nay ${icheck.leave.thisYear.toLocaleString('vi-VN')}, năm cũ ${icheck.leave.carriedOver.toLocaleString('vi-VN')}` : 'dùng được đến 31/3/2027';
  const leaveSource = icheck ? 'iCheck' : 'dữ liệu mẫu';

  const pending = requests.filter((request) => request.status === 'pending').length;
  const upcoming = useMemo(() => {
    const today = todayIso();
    return plans.filter((plan) => plan.end >= today).sort((a, b) => a.start.localeCompare(b.start))[0];
  }, [plans]);

  const openForm = (state: FormState) => {
    trackFlow('request', 'start');
    setForm((current) => ({ key: (current?.key ?? 0) + 1, state }));
  };

  // Trợ lý mở sẵn đề xuất: /requests?draft=<câu tự nhiên> — đọc đúng một lần rồi xoá param.
  useEffect(() => {
    const draft = searchParams.get('draft');
    if (!draft || consumedDraft.current === draft) return;
    consumedDraft.current = draft;
    openForm(stateFromSentence(draft));
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (form) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [form?.key]);

  const closeForm = () => { setForm(undefined); setPlans(loadLeavePlans()); };

  return (
    <div className="page requests-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">XIN NGHỈ · LÀM TỪ XA · HỖ TRỢ</p>
          <h1>Đề xuất</h1>
          <p>Gõ một câu để tạo đề xuất, theo dõi mọi yêu cầu ở một chỗ, xử lý ở đúng bộ phận.</p>
        </div>
      </header>

      <RequestSummary remaining={remaining} used={used} total={remaining + used} leaveNote={leaveNote} pending={pending} upcoming={upcoming} />

      <QuickRequest onOpen={openForm} />

      <div ref={formRef} className="rq-form-anchor">
        {form && (
          <RequestForm
            key={form.key}
            initial={form.state}
            leaveRemaining={remaining}
            leaveSource={leaveSource}
            approver={approver}
            meetings={live?.meetings}
            onClose={closeForm}
          />
        )}
      </div>

      <section className="section-block" aria-labelledby="rq-quick-title">
        <div className="rq-section-head"><h2 id="rq-quick-title">Đề xuất nhanh</h2><span>Chọn loại, form được điền sẵn</span></div>
        <div className="rq-quick-grid">
          {QUICK_CARDS.map(({ id, title, desc, icon: Icon, tone, make }) => (
            <button key={id} type="button" className="rq-quick-card" onClick={() => openForm(make())}>
              <span className={`rq-quick-icon rq-quick-icon--${tone}`} aria-hidden="true"><Icon size={22} variant="duotone" /></span>
              <span className="rq-quick-copy"><strong>{title}</strong><small>{desc}</small></span>
            </button>
          ))}
        </div>
      </section>

      <Collapsible title={`Tất cả loại đề xuất (${FORM_KINDS.length})`}>
        <div className="rq-all-grid">
          {FORM_KINDS.map((kind) => {
            const Icon = KIND_ICON[kind];
            return (
              <button key={kind} type="button" className="request-type-card" onClick={() => openForm(blankState(kind))}>
                <span className="request-icon" aria-hidden="true"><Icon size={20} /></span>
                <span className="request-type-copy"><strong>{REQUEST_KIND_LABEL[kind]}</strong><small>{KIND_META[kind].desc}</small></span>
              </button>
            );
          })}
        </div>
      </Collapsible>

      <Collapsible title={`Lịch sử (${requests.length})`} defaultOpen>
        {requests.length === 0 ? (
          <EmptyState icon={<Ticket size={44} variant="duotone" />} title="Chưa có đề xuất nào" body="Gõ một câu ở trên hoặc chọn một đề xuất nhanh." />
        ) : (
          <div className="request-list">{requests.map((request) => <RequestRow key={request.id} request={request} />)}</div>
        )}
      </Collapsible>
    </div>
  );
}
