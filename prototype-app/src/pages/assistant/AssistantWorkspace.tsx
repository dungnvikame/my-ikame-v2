import { useRef, useState } from 'react';
import {
  CheckCircle, CircleDashed, ListBullets, Monitor, Sparkle,
  TextB, TextHTwo, TextItalic,
} from '@phosphor-icons/react';
import { Button } from '../../components/UI';
import { PlatformHandoffButton } from '../../components/PlatformHandoff';
import type { AgentAction, AgentWorkspace, EditorBlock, FormFieldSpec } from './agent-replies';

/** Payload gửi kèm khi duyệt báo cáo OKR — AssistantPage bổ sung author/source rồi submitReport thật. */
export type OkrReportPayload = {
  goalId: string;
  goalTitle: string;
  periodLabel: string;
  progressBefore: number;
  progressAfter: number;
  content: string;
  blockers: string;
};

type WorkspaceProps = {
  workspace?: AgentWorkspace;
  action?: AgentAction;
  actionDone?: boolean;
  actionRunning?: boolean;
  receiptId?: string;
  onRunAction?: (payload?: OkrReportPayload) => void;
};

function FormFieldControl({ field }: { field: FormFieldSpec }) {
  if (field.type === 'select') {
    return (
      <select className="workspace-input" defaultValue={field.value} aria-label={field.label}>
        {(field.options ?? [field.value]).map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }
  if (field.type === 'textarea') {
    return <textarea className="workspace-input" rows={4} defaultValue={field.value} aria-label={field.label} />;
  }
  return <input className="workspace-input" type={field.type ?? 'text'} defaultValue={field.value} aria-label={field.label} />;
}

/** Form nghiệp vụ chỉnh sửa được (đặt phòng họp, ticket IT). */
function WorkspaceForm({ fields }: { fields: FormFieldSpec[] }) {
  return (
    <div className="workspace-form">
      {fields.map((field) => (
        <label key={field.id} className={`workspace-form-field ${field.half ? 'is-half' : ''}`}>
          <span className="workspace-field-label">{field.label}</span>
          <FormFieldControl field={field} />
        </label>
      ))}
    </div>
  );
}

function blocksToHtml(docTitle: string, blocks: EditorBlock[]): string {
  const body = blocks.map((block) => {
    if (block.type === 'h2') return `<h2>${block.text}</h2>`;
    if (block.type === 'ul') return `<ul>${(block.items ?? []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
    return `<p>${block.text}</p>`;
  }).join('');
  return `<h1>${docTitle}</h1>${body}`;
}

/** Trình soạn thảo iWiki — toolbar + vùng contentEditable, đếm từ trực tiếp. */
function WorkspaceEditor({ docTitle, blocks }: { docTitle: string; blocks: EditorBlock[] }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialHtml = useRef(blocksToHtml(docTitle, blocks));
  const [wordCount, setWordCount] = useState(() =>
    initialHtml.current.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length);

  const updateCount = () => {
    const text = editorRef.current?.textContent ?? '';
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  // execCommand deprecated nhưng vẫn hoạt động mọi browser — đủ cho demo editor.
  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateCount();
  };

  return (
    <div className="workspace-editor">
      <div className="workspace-editor-toolbar" role="toolbar" aria-label="Định dạng văn bản">
        <button type="button" title="Tiêu đề mục" onClick={() => exec('formatBlock', '<h2>')}><TextHTwo size={16} /></button>
        <button type="button" title="Đậm" onClick={() => exec('bold')}><TextB size={16} /></button>
        <button type="button" title="Nghiêng" onClick={() => exec('italic')}><TextItalic size={16} /></button>
        <button type="button" title="Danh sách" onClick={() => exec('insertUnorderedList')}><ListBullets size={16} /></button>
        <span className="workspace-editor-count">{wordCount} từ</span>
      </div>
      <div
        ref={editorRef}
        className="workspace-editor-doc"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={`Soạn thảo: ${docTitle}`}
        onInput={updateCount}
        dangerouslySetInnerHTML={{ __html: initialHtml.current }}
      />
    </div>
  );
}

/** Trình tạo báo cáo check-in OKR — mirror đúng ReportForm của iGoal (kỳ, tiến độ, nội dung, vướng mắc). */
function WorkspaceOkr({
  workspace, actionDisabled, actionLabel, onSubmit,
}: {
  workspace: Extract<AgentWorkspace, { kind: 'okr' }>;
  actionDisabled: boolean;
  actionLabel: string;
  onSubmit?: (payload: OkrReportPayload) => void;
}) {
  const [periodLabel, setPeriodLabel] = useState(workspace.periodLabel);
  const [progressAfter, setProgressAfter] = useState(workspace.suggestedProgress);
  const [content, setContent] = useState(workspace.draftContent);
  const [blockers, setBlockers] = useState('');

  return (
    <div className="workspace-okr">
      <div className="workspace-okr-goal">
        <span className="workspace-field-label">Mục tiêu</span>
        <strong>{workspace.goalTitle}</strong>
        <small>Tiến độ hiện tại: {workspace.progressBefore}% · Check-in gần nhất đã quá hạn</small>
      </div>
      <div className="workspace-form">
        <label className="workspace-form-field is-half">
          <span className="workspace-field-label">Kỳ báo cáo</span>
          <input className="workspace-input" value={periodLabel} onChange={(event) => setPeriodLabel(event.target.value)} />
        </label>
        <label className="workspace-form-field is-half">
          <span className="workspace-field-label">Tiến độ mới: {progressAfter}%</span>
          <div className="workspace-okr-progress">
            <input
              type="range" min={0} max={100} value={progressAfter}
              onChange={(event) => setProgressAfter(Number(event.target.value))}
              aria-label="Tiến độ mới (%)"
            />
            <span className="workspace-okr-delta">{progressAfter >= workspace.progressBefore ? '+' : ''}{progressAfter - workspace.progressBefore}%</span>
          </div>
        </label>
        <label className="workspace-form-field">
          <span className="workspace-field-label">Nội dung cập nhật (AI soạn nháp — bạn hiệu chỉnh)</span>
          <textarea className="workspace-input" rows={5} value={content} onChange={(event) => setContent(event.target.value)} />
        </label>
        <label className="workspace-form-field">
          <span className="workspace-field-label">Vướng mắc (nếu có)</span>
          <textarea className="workspace-input" rows={2} value={blockers} placeholder="Không có vướng mắc" onChange={(event) => setBlockers(event.target.value)} />
        </label>
      </div>
      {onSubmit && (
        <div className="workspace-actions">
          <Button
            variant="primary"
            disabled={actionDisabled || !content.trim()}
            onClick={() => onSubmit({
              goalId: workspace.goalId,
              goalTitle: workspace.goalTitle,
              periodLabel: periodLabel.trim(),
              progressBefore: workspace.progressBefore,
              progressAfter,
              content: content.trim(),
              blockers: blockers.trim(),
            })}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Khung bên phải của trang Trợ lý AI (bố cục kiểu ServiceNow): giao diện nghiệp vụ
 * đúng loại tác vụ (form / editor / OKR composer / info) + checklist AI steps.
 */
export function AssistantWorkspace({ workspace, action, actionDone, actionRunning, receiptId, onRunAction }: WorkspaceProps) {
  if (!workspace) {
    return (
      <aside className="assistant-workspace assistant-workspace--empty" aria-label="Khu vực thao tác">
        <span className="assistant-workspace-empty-icon"><Monitor size={28} /></span>
        <strong>Khu vực thao tác</strong>
        <p>Khi bạn nhờ Agent thực hiện tác vụ (đặt phòng họp, ticket IT, viết iWiki, báo cáo OKR...), giao diện nghiệp vụ tương ứng sẽ hiển thị tại đây để bạn xem lại và duyệt.</p>
      </aside>
    );
  }

  const actionLabel = actionRunning ? 'Đang thực thi...' : action?.label ?? '';
  const showDefaultAction = action && !actionDone && onRunAction && workspace.kind !== 'okr';

  return (
    <aside className="assistant-workspace" aria-label={workspace.title}>
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb">{workspace.breadcrumb}</p>
          <h2>{workspace.title}</h2>
        </div>
        {workspace.badge && !actionDone && <span className="workspace-badge">{workspace.badge}</span>}
        {actionDone && <span className="workspace-badge workspace-badge--done"><CheckCircle size={14} weight="fill" />Hoàn tất</span>}
      </header>

      <div className="workspace-body">
        <div className="workspace-fields">
          {workspace.kind === 'info' && workspace.fields.map((field) => (
            <div key={field.label + field.value} className="workspace-field">
              <span className="workspace-field-label">{field.label}</span>
              <div className={`workspace-field-value ${field.multiline ? 'workspace-field-value--multiline' : ''}`}>{field.value}</div>
            </div>
          ))}
          {workspace.kind === 'form' && <WorkspaceForm fields={workspace.formFields} />}
          {workspace.kind === 'editor' && <WorkspaceEditor docTitle={workspace.docTitle} blocks={workspace.blocks} />}
          {workspace.kind === 'okr' && (
            <WorkspaceOkr
              workspace={workspace}
              actionDisabled={!!actionRunning || !!actionDone}
              actionLabel={actionLabel || 'Gửi báo cáo check-in'}
              onSubmit={!actionDone ? onRunAction : undefined}
            />
          )}

          {showDefaultAction && (
            <div className="workspace-actions">
              <Button variant="primary" disabled={actionRunning} onClick={() => onRunAction()}>{actionLabel}</Button>
            </div>
          )}
          {action && actionDone && (
            <p className="assistant-receipt"><CheckCircle size={16} weight="fill" />{action.receipt} <span>#RCPT-{receiptId}</span></p>
          )}
          {/* Việc dài hơi (biên tập, quản trị OKR) thuộc platform gốc — mở bằng SSO chung. */}
          {action && actionDone && workspace.kind === 'editor' && (
            <div className="workspace-actions">
              <PlatformHandoffButton platform="iWiki" action="tiếp tục biên tập bài viết" label="Tiếp tục biên tập trên iWiki" />
            </div>
          )}
          {action && actionDone && workspace.kind === 'okr' && (
            <div className="workspace-actions">
              <PlatformHandoffButton platform="iGoal" action="xem cây mục tiêu và lịch sử check-in" label="Xem trên iGoal" />
            </div>
          )}
        </div>

        <div className="workspace-steps" aria-label="AI steps">
          <p className="workspace-steps-title"><Sparkle size={14} weight="fill" />AI steps</p>
          <ul>
            {workspace.steps.map((step, index) => {
              const isLast = index === workspace.steps.length - 1;
              const pending = isLast && !!action && !actionDone;
              return (
                <li key={step} className={pending ? 'is-pending' : ''}>
                  {pending ? <CircleDashed size={15} /> : <CheckCircle size={15} weight="fill" />}
                  <span>{step}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
