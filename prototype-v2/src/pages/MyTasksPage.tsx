import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PersonalTodo {
  id: string;
  title: string;
  source: string;
  due: string;
  done: boolean;
}

export const MyTasksPage: React.FC = () => {
  const { todayItems, performCheckIn, openAiWithPrompt } = useApp();
  const navigate = useNavigate();
  const [customTodos, setCustomTodos] = useState<PersonalTodo[]>([
    { id: 'pt-1', title: 'Chốt feedback thiết kế Google Material 3 cho My iKame', source: 'Cá nhân', due: 'Hôm nay 17:00', done: false },
    { id: 'pt-2', title: 'Đồng bộ phạm vi R1 với team COM & Engineering', source: 'Asana', due: 'Thứ 2, 30/11', done: false },
    { id: 'pt-3', title: 'Rà soát danh sách ứng dụng SSO trên iWiki', source: 'iWiki', due: 'Đã xong', done: true },
  ]);
  const [draft, setDraft] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setCustomTodos((prev) => [
      { id: `pt-${Date.now()}`, title: draft.trim(), source: 'Cá nhân', due: 'Hôm nay', done: false },
      ...prev,
    ]);
    setDraft('');
  };

  const toggleTodo = (id: string) => {
    setCustomTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Việc cần làm</h1>
          <p className="page-desc">Gộp việc ưu tiên từ hệ thống iKame và danh sách cá nhân của bạn</p>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={addTodo} style={{ display: 'flex', gap: 8 }}>
        <input
          className="input"
          style={{ borderRadius: 'var(--r-full)', paddingLeft: 18 }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Thêm việc cần làm cá nhân..."
        />
        <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
          <Plus size={15} /> Thêm việc
        </button>
      </form>

      {/* Priority System Items */}
      <section className="card">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <h2 className="card-title">
            Từ hệ thống iKame <span className="tab-count">{todayItems.length}</span>
          </h2>
        </div>
        {todayItems.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 10px' }}>Bạn đã hoàn tất tất cả việc từ hệ thống!</div>
        ) : (
          <div className="clean-list">
            {todayItems.map((item) => (
              <div key={item.id} className="clean-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, flex: 1 }}>
                  <span
                    className={
                      item.urgencyTone === 'error'
                        ? 'dot-urgent'
                        : item.urgencyTone === 'warning'
                          ? 'dot-warning'
                          : item.urgencyTone === 'info'
                            ? 'dot-info'
                            : 'dot-neutral'
                    }
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {item.source} · {item.urgencyLabel}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-dim btn-sm"
                  onClick={() => {
                    if (item.actionKind === 'checkin') performCheckIn();
                    else if (item.actionKind === 'open_ai' && item.aiPrompt) openAiWithPrompt(item.aiPrompt);
                    else if (item.actionRoute) navigate(item.actionRoute);
                  }}
                >
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Personal Checklist */}
      <section className="card">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <h2 className="card-title">
            Ghi chú cá nhân <span className="tab-count">{customTodos.filter((t) => !t.done).length}</span>
          </h2>
        </div>
        <div className="clean-list">
          {customTodos.map((t) => (
            <div key={t.id} className="clean-row" style={{ opacity: t.done ? 0.6 : 1 }}>
              <button
                type="button"
                onClick={() => toggleTodo(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  padding: 0,
                  flex: 1,
                }}
              >
                {t.done ? (
                  <CheckCircle2 size={19} style={{ color: 'var(--success-fg)', flexShrink: 0 }} />
                ) : (
                  <Circle size={19} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-strong)', textDecoration: t.done ? 'line-through' : 'none' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {t.source} · {t.due}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
