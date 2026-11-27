import React, { useState } from 'react';
import { Calendar, Check, MapPin, Plus, Trophy, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ClubItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  members: number;
  schedule: string;
  location: string;
  lead: string;
  emoji: string;
  accentBg: string;
}

const INITIAL_CLUBS: ClubItem[] = [
  {
    id: 'club-run',
    name: 'iKame Runners Club',
    category: 'Thể thao',
    desc: 'Chạy bộ sáng thứ 7 quanh Hồ Tây, chuẩn bị giải bán marathon và chia sẻ bài tập nâng sức bền.',
    members: 64,
    schedule: '06:30 Thứ 7 hàng tuần',
    location: 'Vườn hoa Lạc Long Quân · Hồ Tây',
    lead: 'Ngô Minh Khoa',
    emoji: '🏃',
    accentBg: 'var(--success-bg)',
  },
  {
    id: 'club-badminton',
    name: 'CLB Cầu lông iKame Smash',
    category: 'Thể thao',
    desc: 'Giao lưu cầu lông mọi trình độ sau giờ làm, giải đấu nội bộ hàng quý có cúp lưu niệm.',
    members: 48,
    schedule: '18:00 Thứ 3 & Thứ 5',
    location: 'Nhà thi đấu Cầu Giấy',
    lead: 'Đặng Quốc Minh',
    emoji: '🏸',
    accentBg: 'var(--info-bg)',
  },
  {
    id: 'club-ai',
    name: 'AI & Book Guild',
    category: 'Học thuật',
    desc: 'Cùng đọc sách công nghệ, thảo luận prompt/MCP workflow mới và chia sẻ case study thực tế.',
    members: 52,
    schedule: '12:15 Thứ 4 cách tuần',
    location: 'Pantry Lounge Tầng 4 & Meet',
    lead: 'Nguyễn Việt Dũng',
    emoji: '🤖',
    accentBg: 'var(--violet-bg)',
  },
  {
    id: 'club-boardgame',
    name: 'Boardgame & Esports Friday',
    category: 'Giải trí',
    desc: 'Catan, Splendor, Ma Sói và giao hữu FIFA/Valorant tối thứ 6 mỗi tuần tại văn phòng.',
    members: 39,
    schedule: '17:45 Thứ 6 hàng tuần',
    location: 'Khu sinh hoạt chung · Tầng 5',
    lead: 'Phạm Gia Huy',
    emoji: '🎲',
    accentBg: 'var(--warning-bg)',
  },
  {
    id: 'club-english',
    name: 'iKame English Toastmasters',
    category: 'Kỹ năng',
    desc: 'Luyện giao tiếp tiếng Anh công sở, thuyết trình sản phẩm và phản biện tự tin không áp lực.',
    members: 31,
    schedule: '17:30 Thứ 4 hàng tuần',
    location: 'Phòng Hải Âu · Tầng 6',
    lead: 'Vũ Khánh Linh',
    emoji: '🎙️',
    accentBg: 'var(--error-bg)',
  },
];

export const IComClubsPage: React.FC = () => {
  const { pushToast } = useApp();
  const [joinedIds, setJoinedIds] = useState<string[]>(['club-run', 'club-ai']);
  const [category, setCategory] = useState<string>('Tất cả');

  const categories = ['Tất cả', 'Thể thao', 'Học thuật', 'Kỹ năng', 'Giải trí'];
  const filtered = category === 'Tất cả' ? INITIAL_CLUBS : INITIAL_CLUBS.filter((c) => c.category === category);

  const toggleJoin = (club: ClubItem) => {
    const joined = joinedIds.includes(club.id);
    setJoinedIds((prev) => (joined ? prev.filter((id) => id !== club.id) : [...prev, club.id]));
    pushToast({
      title: joined ? `Đã rời ${club.name}` : `Chào mừng bạn gia nhập ${club.name}!`,
      description: joined ? undefined : `Lịch sinh hoạt: ${club.schedule}`,
      tone: joined ? 'info' : 'success',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Câu lạc bộ iKame</h1>
          <p className="page-desc">Kết nối đồng đội cùng sở thích thể thao, học thuật và giải trí ngoài giờ làm</p>
        </div>
        <span className="badge badge-strong">
          <Trophy size={13} /> Đang tham gia {joinedIds.length} CLB
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-dim'}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid-2">
        {filtered.map((club) => {
          const joined = joinedIds.includes(club.id);
          return (
            <section key={club.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--r-12)',
                      background: club.accentBg,
                      fontSize: 22,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {club.emoji}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15.5, color: 'var(--text-strong)' }}>{club.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {club.category} · Chủ nhiệm: {club.lead}
                    </div>
                  </div>
                </div>
                <span className="badge badge-neutral tabular">
                  <Users size={12} /> {club.members + (joined ? 1 : 0)}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55, flex: 1 }}>
                {club.desc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={13} /> {club.schedule}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} /> {club.location}
                </span>
              </div>

              <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${joined ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => toggleJoin(club)}
                >
                  {joined ? <><Check size={14} /> Đã tham gia</> : <><Plus size={14} /> Tham gia CLB</>}
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
