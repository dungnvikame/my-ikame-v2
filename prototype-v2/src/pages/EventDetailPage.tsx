import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ExternalLink,
  Image,
  MapPin,
  Star,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { downloadEventIcs } from '../lib/signals';
import { Avatar, Modal } from '../components/UI';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const { events, people, currentPerson, toggleEventRsvp, submitEventSurvey } = useApp();
  const [rating, setRating] = useState(5);
  const [favoritePart, setFavoritePart] = useState('Không khí gắn kết & tổ chức chỉn chu');
  const [suggestion, setSuggestion] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState<{ caption: string; tone: string; photographer: string } | null>(null);

  const ev = events.find((e) => e.id === id);
  if (!ev) {
    return (
      <div className="card empty-state">
        <h2>Không tìm thấy sự kiện</h2>
        <Link to="/events" className="btn btn-secondary">
          Quay lại danh sách sự kiện
        </Link>
      </div>
    );
  }

  const isReg = ev.registeredIds.includes(currentPerson.id);
  const isWait = ev.waitlistIds.includes(currentPerson.id);
  const seatsLeft = Math.max(0, ev.capacity - ev.registeredIds.length);
  const surveyDone = ev.surveySubmittedBy.includes(currentPerson.id);
  const attendees = ev.registeredIds.map((pid) => people.find((p) => p.id === pid)).filter(Boolean);
  const related = (ev.relatedEventIds || []).map((rid) => events.find((e) => e.id === rid)).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link to="/events" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={15} /> Quay lại Sự kiện
      </Link>

      {/* Hero Cover */}
      <section
        style={{
          borderRadius: 'var(--r-16)',
          background: ev.coverGradient,
          color: '#ffffff',
          padding: '28px 28px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600 }}>
            {ev.format}
          </span>
          {ev.status === 'cancelled' && <span className="badge badge-error">Đã huỷ / Dời lịch</span>}
          {ev.status === 'ongoing' && <span className="badge badge-success">Đang diễn ra</span>}
          {ev.status === 'past' && <span className="badge badge-neutral">Đã kết thúc</span>}
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, lineHeight: 1.25 }}>{ev.title}</h1>
        <p style={{ margin: 0, fontSize: 14.5, opacity: 0.92, maxWidth: 680 }}>{ev.tagline}</p>
      </section>

      <div className="layout-with-rail">
        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <section className="card">
            <h2 className="card-title" style={{ marginBottom: 10 }}>Giới thiệu sự kiện</h2>
            <div className="prose-body">{ev.description}</div>
          </section>

          {ev.agenda.length > 0 && (
            <section className="card">
              <h2 className="card-title" style={{ marginBottom: 14 }}>Lịch trình (Agenda)</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ev.agenda.map((item, idx) => (
                  <div key={idx} className="card-sunk" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span className="tabular" style={{ fontWeight: 700, fontSize: 13, color: 'var(--brand-primary-fg)', minWidth: 46 }}>
                      {item.time}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{item.title}</div>
                      {item.speaker && (
                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                          Diễn giả: {item.speaker}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Post-event Photo Album (EV-5) */}
          {ev.status === 'past' && ev.albumPhotos && (
            <section className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    <Image size={16} /> Album ảnh sự kiện ({ev.albumPhotos.length} bộ nổi bật)
                  </h2>
                  <p className="card-subtitle">Gắn trực tiếp vào trang sự kiện thay cho link Drive rời rạc</p>
                </div>
                {ev.driveUrl && (
                  <a href={ev.driveUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    Mở thư mục Drive gốc <ExternalLink size={13} />
                  </a>
                )}
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                {ev.albumPhotos.map((ph) => (
                  <button
                    key={ph.id}
                    type="button"
                    onClick={() => setLightboxPhoto(ph)}
                    style={{
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--r-12)',
                      overflow: 'hidden',
                      padding: 0,
                      textAlign: 'left',
                      background: 'var(--bg-surface)',
                    }}
                  >
                    <div
                      style={{
                        height: 124,
                        background: ph.tone,
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: 12,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      📸 {ph.photographer}
                    </div>
                    <div style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {ph.caption}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Quick 3-question Post-event Survey (EV-6) */}
          {ev.status === 'past' && (
            <section className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Khảo sát nhanh sau sự kiện (1 phút · 3 câu)</h2>
                  <p className="card-subtitle">Tự động nhắc trong vòng 3 ngày sau sự kiện · Điểm hiện tại {ev.surveyAvgScore}/5</p>
                </div>
              </div>

              {surveyDone ? (
                <div className="banner" style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success-fg)', fontWeight: 600 }}>
                    <CheckCircle2 size={17} /> Bạn đã hoàn thành khảo sát cho sự kiện này. Cảm ơn đóng góp của bạn!
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitEventSurvey(ev.id, rating, `${favoritePart} | ${suggestion}`);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  <div>
                    <label className="field-label">1. Mức độ hài lòng chung của bạn?</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`btn btn-sm ${rating >= star ? 'btn-secondary' : 'btn-ghost'}`}
                          onClick={() => setRating(star)}
                        >
                          <Star size={14} fill={rating >= star ? 'var(--warning-solid)' : 'none'} style={{ color: rating >= star ? 'var(--warning-solid)' : undefined }} />
                          {star}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="field-label">2. Điểm bạn thích nhất ở sự kiện?</label>
                    <select className="select" value={favoritePart} onChange={(e) => setFavoritePart(e.target.value)}>
                      <option value="Không khí gắn kết & tổ chức chỉn chu">Không khí gắn kết & tổ chức chỉn chu</option>
                      <option value="Nội dung chia sẻ thiết thực">Nội dung chia sẻ thiết thực</option>
                      <option value="Địa điểm, đồ ăn và trải nghiệm check-in">Địa điểm, đồ ăn và trải nghiệm check-in</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">3. Một điều COM có thể làm tốt hơn ở lần tới?</label>
                    <input
                      className="input"
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      placeholder="Chia sẻ ngắn gọn (không bắt buộc)..."
                    />
                  </div>
                  <div>
                    <button type="submit" className="btn btn-primary">
                      Gửi khảo sát (1 phút)
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}
        </div>

        {/* Right Fact Sheet & RSVP Card (EV-2, EV-3, EV-4) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 12 }}>Thông tin tham dự</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 9 }}>
                <Calendar size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{ev.dateLabel}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{ev.timeLabel}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 9 }}>
                <MapPin size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{ev.location}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Ban tổ chức: {ev.organizer}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 9 }}>
                <Users size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }} />
                <div className="tabular">
                  <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>
                    {ev.registeredIds.length}/{ev.capacity} người đã đăng ký
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {seatsLeft > 0 ? `Còn ${seatsLeft} chỗ` : `Hết chỗ (${ev.waitlistIds.length} người chờ)`} · Hạn {ev.rsvpDeadline}
                  </div>
                </div>
              </div>
            </div>

            {ev.status === 'upcoming' || ev.status === 'ongoing' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  className={`btn ${isReg || isWait ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%' }}
                  onClick={() => toggleEventRsvp(ev.id)}
                >
                  {isReg
                    ? 'Đã đăng ký · Bấm để huỷ'
                    : isWait
                      ? 'Đang ở danh sách chờ · Rời hàng'
                      : seatsLeft === 0
                        ? 'Đăng ký vào danh sách chờ'
                        : 'Đăng ký tham gia'}
                </button>
                {isReg && (
                  <button
                    type="button"
                    className="btn btn-dim"
                    style={{ width: '100%' }}
                    onClick={() => downloadEventIcs(ev)}
                  >
                    <CalendarPlus size={15} /> Thêm vào lịch (.ics)
                  </button>
                )}
                {isReg && (
                  <div style={{ fontSize: 11.5, color: 'var(--success-fg)', display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                    <Clock size={12} /> Tự động nhắc trước sự kiện 1 ngày
                  </div>
                )}
              </div>
            ) : ev.status === 'cancelled' ? (
              <div className="badge badge-error" style={{ width: '100%', justifyContent: 'center', height: 32 }}>
                Sự kiện đã tạm huỷ / dời lịch
              </div>
            ) : null}
          </div>

          <div className="card-compact">
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 10 }}>
              Đồng nghiệp tham gia ({attendees.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {attendees.map((p) => (
                <span key={p!.id} className="badge badge-neutral" style={{ height: 28, paddingLeft: 4, gap: 6 }}>
                  <Avatar person={p!} size={20} /> {p!.name}
                </span>
              ))}
            </div>
          </div>

          {related.length > 0 && (
            <div className="card-compact">
              <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 8 }}>
                Sự kiện liên quan
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {related.map((rel) => (
                  <Link key={rel!.id} to={`/events/${rel!.id}`} className="card-sunk" style={{ display: 'block' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>{rel!.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{rel!.dateLabel}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Lightbox Modal for Photo Album */}
      <Modal
        open={Boolean(lightboxPhoto)}
        onClose={() => setLightboxPhoto(null)}
        title="Xem ảnh sự kiện"
        subtitle={lightboxPhoto?.photographer}
      >
        {lightboxPhoto && (
          <div>
            <div
              style={{
                height: 240,
                borderRadius: 'var(--r-12)',
                background: lightboxPhoto.tone,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                padding: 20,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              {lightboxPhoto.caption}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Nguồn: Album chính thức My iKame Events · {lightboxPhoto.photographer}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
