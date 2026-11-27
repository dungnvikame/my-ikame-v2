import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Calendar,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  DoorOpen,
  FilePenLine,
  FileText,
  GripVertical,
  Home,
  Plane,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Target,
  Ticket,
  TimerReset,
  User,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INTERNAL_APPS } from '../data/mockData';
import {
  DEFAULT_QUICK_ACTION_IDS,
  QUICK_ACTIONS_CATALOG,
  QuickActionCategory,
  QuickActionDef,
} from '../lib/quickActions';
import { Modal } from './UI';

const MAX_QUICK_ACTIONS = 8;

const QuickActionGlyph: React.FC<{ iconKey: QuickActionDef['iconKey']; size?: number }> = ({
  iconKey,
  size = 17,
}) => {
  switch (iconKey) {
    case 'clock':
      return <Clock size={size} />;
    case 'plane':
      return <Plane size={size} />;
    case 'home':
      return <Home size={size} />;
    case 'timer':
      return <TimerReset size={size} />;
    case 'calendarClock':
      return <CalendarClock size={size} />;
    case 'award':
      return <Award size={size} />;
    case 'door':
      return <DoorOpen size={size} />;
    case 'target':
      return <Target size={size} />;
    case 'ticket':
      return <Ticket size={size} />;
    case 'calendarDays':
      return <CalendarDays size={size} />;
    case 'book':
      return <BookOpen size={size} />;
    case 'users':
      return <Users size={size} />;
    case 'calendar':
      return <Calendar size={size} />;
    case 'user':
      return <User size={size} />;
    case 'compass':
      return <Compass size={size} />;
    case 'filePen':
      return <FilePenLine size={size} />;
    case 'fileText':
      return <FileText size={size} />;
  }
};

export const QuickActionsBar: React.FC<{
  variant?: 'grid' | 'strip';
  excludeIds?: string[];
}> = ({ variant = 'grid', excludeIds = [] }) => {
  const {
    currentPerson,
    lens,
    quickActionIds,
    setQuickActionIds,
    isCheckedInToday,
    checkedInByPerson,
    performCheckIn,
    openAiWithPrompt,
    launchApp,
    pushToast,
  } = useApp();

  const navigate = useNavigate();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>(quickActionIds);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const availableCatalog = useMemo(
    () =>
      QUICK_ACTIONS_CATALOG.filter((item) => {
        if (item.onlyNewJoiner && lens !== 'ikamer_new') return false;
        return true;
      }),
    [lens]
  );

  const activeActions = useMemo(() => {
    return quickActionIds
      .filter((id) => !excludeIds.includes(id))
      .map((id) => availableCatalog.find((a) => a.id === id))
      .filter((a): a is QuickActionDef => Boolean(a));
  }, [quickActionIds, availableCatalog, excludeIds]);

  const openCustomize = () => {
    setDraftIds(quickActionIds.filter((id) => availableCatalog.some((a) => a.id === id)));
    setCustomizeOpen(true);
  };

  const toggleDraftId = (id: string) => {
    setDraftIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) {
          pushToast({ title: 'Giữ tối thiểu 2 thao tác nhanh', tone: 'warning' });
          return prev;
        }
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= MAX_QUICK_ACTIONS) {
        pushToast({ title: `Tối đa ${MAX_QUICK_ACTIONS} thao tác nhanh`, tone: 'warning' });
        return prev;
      }
      return [...prev, id];
    });
  };

  const moveDraft = (from: number, to: number) => {
    if (to < 0 || to >= draftIds.length) return;
    setDraftIds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleSave = () => {
    setQuickActionIds(draftIds);
    setCustomizeOpen(false);
    pushToast({ title: 'Đã lưu bộ Thao tác nhanh cá nhân', tone: 'success' });
  };

  const handleReset = () => {
    const defaults = DEFAULT_QUICK_ACTION_IDS[currentPerson.id] || DEFAULT_QUICK_ACTION_IDS['u-an'];
    setDraftIds(defaults);
  };

  const runAction = (action: QuickActionDef) => {
    if (action.kind === 'checkin') {
      if (isCheckedInToday) {
        navigate('/work');
      } else {
        performCheckIn();
      }
      return;
    }
    if (action.kind === 'ai' && action.aiPrompt) {
      openAiWithPrompt(action.aiPrompt);
      return;
    }
    if (action.kind === 'route' && action.route) {
      navigate(action.route);
      return;
    }
    if (action.kind === 'sso_app' && action.appId) {
      const app = INTERNAL_APPS.find((a) => a.id === action.appId);
      if (app) launchApp(app);
    }
  };

  const categories: QuickActionCategory[] = ['Phổ biến', 'Chấm công & Đơn từ', 'Công việc & AI', 'Văn hoá & Công cụ'];
  const checkInTime = checkedInByPerson[currentPerson.id];

  return (
    <section>
      {variant === 'grid' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Thao tác nhanh
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={openCustomize}>
            <SlidersHorizontal size={13} /> Tuỳ chỉnh
          </button>
        </div>
      )}

      {variant === 'strip' ? (
        <div className="qa-strip">
          {activeActions.map((action) => {
            const isCheckinDone = action.kind === 'checkin' && isCheckedInToday;
            return (
              <button
                key={action.id}
                type="button"
                className="qa-pill"
                onClick={() => runAction(action)}
              >
                <span
                  className="qa-pill-icon"
                  style={{
                    background: isCheckinDone ? 'var(--success-bg)' : action.accentBg,
                    color: isCheckinDone ? 'var(--success-fg)' : action.accentFg,
                  }}
                >
                  {isCheckinDone ? <CheckCircle2 size={13} /> : <QuickActionGlyph iconKey={action.iconKey} size={13} />}
                </span>
                <span>{isCheckinDone ? `Đã chấm · ${checkInTime}` : action.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            className="qa-pill"
            style={{ borderStyle: 'dashed', color: 'var(--text-tertiary)', padding: '0 12px' }}
            onClick={openCustomize}
            title="Tuỳ chỉnh lối tắt nhanh"
          >
            <SlidersHorizontal size={13} /> Tuỳ chỉnh
          </button>
        </div>
      ) : (
        <div className="quick-actions-grid">
          {activeActions.map((action) => {
            const isCheckinDone = action.kind === 'checkin' && isCheckedInToday;
            return (
              <button
                key={action.id}
                type="button"
                className="quick-action-tile"
                onClick={() => runAction(action)}
              >
                <span
                  className="quick-action-icon"
                  style={{
                    background: isCheckinDone ? 'var(--success-bg)' : action.accentBg,
                    color: isCheckinDone ? 'var(--success-fg)' : action.accentFg,
                  }}
                >
                  {isCheckinDone ? <CheckCircle2 size={17} /> : <QuickActionGlyph iconKey={action.iconKey} />}
                </span>
                <span className="quick-action-label">
                  {isCheckinDone ? `Đã chấm · ${checkInTime}` : action.label}
                </span>
              </button>
            );
          })}

          {activeActions.length < MAX_QUICK_ACTIONS && (
            <button
              type="button"
              className="quick-action-tile quick-action-add"
              onClick={openCustomize}
              aria-label="Thêm thao tác nhanh"
            >
              <span className="quick-action-icon" style={{ background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>
                <Plus size={16} />
              </span>
              <span className="quick-action-label" style={{ color: 'var(--text-tertiary)' }}>
                Thêm
              </span>
            </button>
          )}
        </div>
      )}

      {/* Personalize Quick Actions Modal */}
      <Modal
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        title="Tuỳ chỉnh Thao tác nhanh"
        subtitle={`Chọn 2–${MAX_QUICK_ACTIONS} lối tắt hay dùng nhất · Kéo thả hoặc bấm mũi tên để đổi thứ tự`}
        maxWidth={560}
        footer={
          <>
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginRight: 'auto' }} onClick={handleReset}>
              <RotateCcw size={13} /> Mặc định
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setCustomizeOpen(false)}>
              Huỷ
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Lưu ({draftIds.length}/{MAX_QUICK_ACTIONS})
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Selected & Reorderable List */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
              Đang ghim trên Trang chủ ({draftIds.length}/{MAX_QUICK_ACTIONS})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {draftIds.map((id, idx) => {
                const item = availableCatalog.find((a) => a.id === id);
                if (!item) return null;
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIdx !== null && dragIdx !== idx) {
                        moveDraft(dragIdx, idx);
                      }
                      setDragIdx(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--r-8)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-primary)',
                      cursor: 'grab',
                    }}
                  >
                    <GripVertical size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--r-6)',
                        background: item.accentBg,
                        color: item.accentFg,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <QuickActionGlyph iconKey={item.iconKey} size={14} />
                    </span>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>
                      {item.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ width: 26, height: 26 }}
                        disabled={idx === 0}
                        onClick={() => moveDraft(idx, idx - 1)}
                        aria-label="Lên trên"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ width: 26, height: 26 }}
                        disabled={idx === draftIds.length - 1}
                        onClick={() => moveDraft(idx, idx + 1)}
                        aria-label="Xuống dưới"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ width: 26, height: 26 }}
                        onClick={() => toggleDraftId(id)}
                        aria-label={`Bỏ ghim ${item.label}`}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Categorized Catalog */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categories.map((cat) => {
              const items = availableCatalog.filter((a) => a.category === cat);
              return (
                <div key={cat}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                    {cat}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {items.map((item) => {
                      const selected = draftIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleDraftId(item.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 7,
                            padding: '6px 11px',
                            borderRadius: 'var(--r-8)',
                            border: `1px solid ${selected ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
                            background: selected ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                            color: selected ? 'var(--brand-primary-fg)' : 'var(--text-primary)',
                            fontSize: 13,
                            fontWeight: selected ? 600 : 500,
                          }}
                        >
                          <QuickActionGlyph iconKey={item.iconKey} size={14} />
                          <span>{item.label}</span>
                          {selected && <Check size={13} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </section>
  );
};
