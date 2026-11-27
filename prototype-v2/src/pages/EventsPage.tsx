import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CalendarPlus,
  Clock,
  Image,
  MapPin,
  Plus,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { downloadEventIcs } from '../lib/signals';
import { Modal } from '../components/UI';

type EventTab = 'upcoming' | 'ongoing' | 'past' | 'mine';

export const EventsPage: React.FC = () => {
  const { events, currentPerson, lens, toggleEventRsvp, createEvent } = useApp();
  const [tab, setTab] = useState<EventTab>('upcoming');
  const [showCreate, setShowCreate] = useState(false);

  // Create event modal form (EV-8)
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [dateLabel, setDateLabel] = useState('Thứ 6, 12/12/2026');
  const [timeLabel, setTimeLabel] = useState('15:00 – 17:00');
  const [format, setFormat] = useState<'Trực tiếp' | 'Online' | 'Hybrid'>('Hybrid');
  const [location, setLocation] = useState('Hội trường Tầng 5 & Google Meet');
  const [capacity, setCapacity] = useState(80);

  const visibleEvents = useMemo(
    () => events.filter((e) => e.audience === 'all' || e.audience === currentPerson.team || lens === 'com_admin'),
    [events, currentPerson.team, lens]
  );

  const featuredEvent = visibleEvents.find((e) => e.featured && e.status === 'upcoming');

  const filtered = useMemo(() => {
    if (tab === 'upcoming') return visibleEvents.filter((e) => e.status === 'upcoming' || e.status === 'cancelled');
    if (tab === 'ongoing') return visibleEvents.filter((e) => e.status === 'ongoing');
    if (tab === 'past') return visibleEvents.filter((e) => e.status === 'past');
    return visibleEvents.filter(
      (e) => e.registeredIds.includes(currentPerson.id) || e.waitlistIds.includes(currentPerson.id)
    );
  }, [visibleEvents, tab, currentPerson.id]);

  // Group by month timeline (EV-1)
  const groupedByMonth = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const ev of filtered) {
      const arr = map.get(ev.monthGroup) || [];
      arr.push(ev);
      map.set(ev.monthGroup, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createEvent({ title: title.trim(), tagline: tagline.trim() || title.trim(), dateLabel, timeLabel, format, location, capacity });
    setTitle('');
    setTagline('');
    setShowCreate(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Sự kiện</h1>
        </div>
        {lens === 'com_admin' && (
          <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Tạo sự kiện
          </button>
        )}
      </div>

      {/* Featured Event Hero + Countdown (EV-1) */}
      {featuredEvent && (
        <section
          style={{
            borderRadius: 'var(--r-16)',
            background: featuredEvent.coverGradient,
            color: '#ffffff',
            padding: '26px 28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div style={{ maxWidth: 620 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <span style={{ background: 'rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600 }}>
                Sự kiện nổi bật
              </span>
              <span style={{ background: 'rgba(247,98,38,0.9)', padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600 }} className="tabular">
                Còn 21 ngày · 08 giờ
              </span>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, lineHeight: 1.25 }}>
              {featuredEvent.title}
            </h2>
            <p style={{ margin: '0 0 14px', fontSize: 14, opacity: 0.9, lineHeight: 1.55 }}>
              {featuredEvent.tagline}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, opacity: 0.92 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={15} /> {featuredEvent.dateLabel} · {featuredEvent.timeLabel}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={15} /> {featuredEvent.location}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Link
              to={`/events/${featuredEvent.id}`}
              className="btn"
              style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', borderColor: 'rgba(255,255,255,0.28)' }}
            >
              Xem chi tiết & Agenda
            </Link>
            <button
              type="button"
              className={`btn ${featuredEvent.registeredIds.includes(currentPerson.id) ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => toggleEventRsvp(featuredEvent.id)}
            >
              {featuredEvent.registeredIds.includes(currentPerson.id) ? 'Đã đăng ký (Huỷ)' : 'Đăng ký ngay'}
            </button>
          </div>
        </section>
      )}

      {/* 4 Tabs (EV-1) */}
      <div className="tabs-bar">
        {(
          [
            { id: 'upcoming', label: 'Sắp diễn ra', count: visibleEvents.filter((e) => e.status === 'upcoming' || e.status === 'cancelled').length },
            { id: 'ongoing', label: 'Đang diễn ra', count: visibleEvents.filter((e) => e.status === 'ongoing').length },
            { id: 'past', label: 'Đã diễn ra', count: visibleEvents.filter((e) => e.status === 'past').length },
            { id: 'mine', label: 'Của tôi', count: visibleEvents.filter((e) => e.registeredIds.includes(currentPerson.id) || e.waitlistIds.includes(currentPerson.id)).length },
          ] as { id: EventTab; label: string; count: number }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label} <span className="tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Monthly Timeline List */}
      {groupedByMonth.length === 0 ? (
        <div className="card empty-state">Chưa có sự kiện nào trong mục này.</div>
      ) : (
        groupedByMonth.map(([month, items]) => (
          <section key={month} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {month}
            </h3>
            <div className="grid-2">
              {items.map((ev) => {
                const isReg = ev.registeredIds.includes(currentPerson.id);
                const isWait = ev.waitlistIds.includes(currentPerson.id);
                const seatsLeft = Math.max(0, ev.capacity - ev.registeredIds.length);
                return (
                  <div
                    key={ev.id}
                    className="card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: ev.status === 'cancelled' ? 0.78 : 1,
                    }}
                  >
                    <div
                      style={{
                        height: 86,
                        background: ev.coverGradient,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 'var(--r-full)',
                        }}
                      >
                        {ev.format}
                      </span>
                      {ev.status === 'cancelled' ? (
                        <span className="badge badge-error">Đã huỷ / Dời lịch</span>
                      ) : ev.status === 'ongoing' ? (
                        <span className="badge badge-success">Đang diễn ra</span>
                      ) : ev.status === 'past' ? (
                        <span className="badge badge-neutral">
                          <Image size={12} /> Có album ảnh
                        </span>
                      ) : isReg ? (
                        <span className="badge badge-success">Đã đăng ký</span>
                      ) : isWait ? (
                        <span className="badge badge-warning">Danh sách chờ</span>
                      ) : seatsLeft === 0 ? (
                        <span className="badge badge-warning">Hết chỗ</span>
                      ) : null}
                    </div>

                    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                      <Link
                        to={`/events/${ev.id}`}
                        style={{ fontWeight: 700, fontSize: 15.5, color: 'var(--text-strong)', lineHeight: 1.35 }}
                      >
                        {ev.title}
                      </Link>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{ev.tagline}</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} /> {ev.dateLabel} · {ev.timeLabel}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={13} /> {ev.location}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} className="tabular">
                          <Users size={13} /> {ev.registeredIds.length}/{ev.capacity} người đăng ký
                          {ev.status === 'upcoming' && ` · Hạn ${ev.rsvpDeadline}`}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                        <Link to={`/events/${ev.id}`} className="btn btn-ghost btn-sm">
                          Chi tiết
                        </Link>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {isReg && ev.status !== 'past' && ev.status !== 'cancelled' && (
                            <button
                              type="button"
                              className="btn btn-dim btn-sm"
                              onClick={() => downloadEventIcs(ev)}
                              title="Tải tệp .ics thêm vào Google Calendar / Outlook"
                            >
                              <CalendarPlus size={13} /> .ics
                            </button>
                          )}
                          {ev.status === 'upcoming' || ev.status === 'ongoing' ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => toggleEventRsvp(ev.id)}
                            >
                              {isReg
                                ? 'Huỷ đăng ký'
                                : isWait
                                  ? 'Rời danh sách chờ'
                                  : seatsLeft === 0
                                    ? 'Vào danh sách chờ'
                                    : 'Đăng ký'}
                            </button>
                          ) : ev.status === 'past' ? (
                            <Link to={`/events/${ev.id}`} className="btn btn-secondary btn-sm">
                              Xem album & khảo sát
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {/* COM Create Event Modal (EV-8) */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Tạo sự kiện nội bộ mới"
        subtitle="Mở cổng đăng ký trong ứng dụng thay thế Google Form"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
              Huỷ
            </button>
            <button type="submit" form="create-event-form" className="btn btn-primary">
              Xuất bản sự kiện
            </button>
          </>
        }
      >
        <form id="create-event-form" onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="field-label">Tên sự kiện</label>
            <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: iKame Tech Talk #12" />
          </div>
          <div>
            <label className="field-label">Mô tả ngắn</label>
            <textarea className="textarea" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Nội dung nổi bật dành cho iKamer..." />
          </div>
          <div className="grid-2">
            <div>
              <label className="field-label">Ngày tổ chức</label>
              <input className="input" value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Khung giờ</label>
              <input className="input" value={timeLabel} onChange={(e) => setTimeLabel(e.target.value)} />
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label className="field-label">Hình thức</label>
              <select className="select" value={format} onChange={(e) => setFormat(e.target.value as 'Trực tiếp' | 'Online' | 'Hybrid')}>
                <option value="Trực tiếp">Trực tiếp</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="field-label">Số chỗ tối đa</label>
              <input className="input" type="number" min={5} max={500} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="field-label">Địa điểm / Link phòng</label>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </form>
      </Modal>
    </div>
  );
};
