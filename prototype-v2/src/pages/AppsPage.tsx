import React, { useMemo, useState } from 'react';
import { ExternalLink, Search, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INTERNAL_APPS } from '../data/mockData';
import { AppIconGlyph } from '../components/UI';

type AppCategory = 'Tất cả' | 'Công việc' | 'Nhân sự' | 'Tri thức';

export const AppsPage: React.FC = () => {
  const { currentPerson, launchApp, pinnedAppIds, togglePinApp } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AppCategory>('Tất cả');

  // Strict role-based visibility (unauthorized apps are hidden) + Pinned apps float to top!
  const visibleApps = useMemo(() => {
    const filtered = INTERNAL_APPS.filter((app) => {
      const hasPermission = app.allowedRoles.some((r) => currentPerson.roleKeys.includes(r));
      if (!hasPermission) return false;
      if (category !== 'Tất cả' && app.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return app.name.toLowerCase().includes(q) || app.shortDesc.toLowerCase().includes(q);
      }
      return true;
    });
    return [...filtered].sort((a, b) => {
      const aPin = pinnedAppIds.includes(a.id) ? 0 : 1;
      const bPin = pinnedAppIds.includes(b.id) ? 0 : 1;
      return aPin - bPin;
    });
  }, [currentPerson.roleKeys, category, query, pinnedAppIds]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Ứng dụng</h1>
          <p className="page-desc">Mở 1 chạm qua SSO · Ghim ngôi sao để ưu tiên trên thanh công cụ</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['Tất cả', 'Công việc', 'Nhân sự', 'Tri thức'] as AppCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${category === cat ? 'btn-secondary' : 'btn-dim'}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 240, flex: '0 1 300px' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            className="input"
            style={{ paddingLeft: 32, height: 34 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm ứng dụng..."
          />
        </div>
      </div>

      {/* Clean Clickable App Cards */}
      {visibleApps.length === 0 ? (
        <div className="card empty-state">Không có ứng dụng khớp "{query}".</div>
      ) : (
        <div className="grid-3">
          {visibleApps.map((app) => {
            const isPinned = pinnedAppIds.includes(app.id);
            return (
              <div
                key={app.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'border-color 140ms, transform 120ms',
                }}
                onClick={() => launchApp(app)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--r-10)',
                        background: app.accentBg,
                        color: app.accentFg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <AppIconGlyph iconKey={app.iconKey} size={19} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-strong)', lineHeight: 1.25 }}>
                        {app.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{app.category}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-icon"
                    title={isPinned ? 'Bỏ ghim ứng dụng' : 'Ghim lên đầu'}
                    aria-label={isPinned ? `Bỏ ghim ${app.name}` : `Ghim ${app.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinApp(app.id);
                    }}
                  >
                    <Star
                      size={15}
                      fill={isPinned ? 'var(--warning-solid)' : 'none'}
                      style={{ color: isPinned ? 'var(--warning-solid)' : 'var(--text-tertiary)' }}
                    />
                  </button>
                </div>

                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                  {app.shortDesc}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)' }}>
                  <span>{app.statusNote || 'SSO tự động'}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Mở <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
