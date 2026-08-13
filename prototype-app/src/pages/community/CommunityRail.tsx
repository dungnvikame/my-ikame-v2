import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/UI';
import { isEligible } from '../../lib/audience';
import type { BirthdayPerson, EventItem, Milestone, TopFan, User } from '../../types';

/** Phase 3 owns its own copy of this helper in its own file — duplication accepted over cross-phase edits. */
function daysUntil(startsAt: string): string {
  const diffMs = new Date(startsAt).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diffMs / 86_400_000));
  return days === 0 ? 'Hôm nay' : `còn ${days} ngày`;
}

const FAN_MEDALS = ['🥇', '🥈', '🥉'];

type CommunityRailProps = {
  user: User;
  events: EventItem[];
  topFans: TopFan[];
  birthdays: BirthdayPerson[];
  milestones: Milestone[];
  onCongratulate: (personId: string, postId: string, name: string) => void;
};

export function CommunityRail({ user, events, topFans, birthdays, milestones, onCongratulate }: CommunityRailProps) {
  const upcoming = useMemo(() => events
    .filter((event) => isEligible(user, event.audienceTeamIds)
      && event.status !== 'cancelled' && event.status !== 'past'
      && event.startsAt && new Date(event.startsAt).getTime() > Date.now())
    .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime())
    .slice(0, 3), [events, user]);

  return (
    <aside className="community-rail" aria-label="Hoạt động iKame Feed">
      {birthdays.length > 0 && (
        <section className="community-widget community-widget--birthday">
          <header className="community-widget-head">
            <span className="community-widget-emoji" aria-hidden="true">🎂</span>
            <h2>Sinh nhật hôm nay</h2>
          </header>
          <ul className="community-rail-list">
            {birthdays.map((person) => (
              <li key={person.id} className="community-rail-row">
                <span className="avatar" aria-hidden="true">{person.shortName}</span>
                <div className="community-rail-copy">
                  <strong>{person.name}</strong>
                  <small>{person.role} · {person.team}</small>
                </div>
                <Button
                  variant={person.congratulated ? 'dim' : 'primary'}
                  disabled={person.congratulated}
                  onClick={() => onCongratulate(person.id, person.postId, person.shortName)}
                >
                  {person.congratulated ? 'Đã chúc ✓' : 'Chúc 🎉'}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="community-widget">
        <header className="community-widget-head">
          <span className="community-widget-emoji" aria-hidden="true">📅</span>
          <h2>Sự kiện sắp tới</h2>
          <Link className="community-widget-link" to="/events">Tất cả</Link>
        </header>
        {upcoming.length === 0 ? (
          <p className="community-widget-empty">Chưa có sự kiện sắp tới.</p>
        ) : (
          <ul className="community-rail-list">
            {upcoming.map((event) => (
              <li key={event.id} className="community-rail-row">
                <span className="community-date-badge" aria-hidden="true">
                  <small>{event.month}</small>
                  <strong>{event.day}</strong>
                </span>
                <div className="community-rail-copy">
                  <Link to={`/events/${event.id}`}>{event.title}</Link>
                  <small>{event.time} · {daysUntil(event.startsAt!)}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="community-widget">
        <header className="community-widget-head">
          <span className="community-widget-emoji" aria-hidden="true">🏆</span>
          <h2>Fan iKame tuần</h2>
        </header>
        <ul className="community-rail-list">
          {topFans.map((fan, index) => (
            <li key={fan.id} className="community-rail-row">
              <span className="community-fan-rank" aria-label={`Hạng ${index + 1}`}>{FAN_MEDALS[index] ?? index + 1}</span>
              <span className="avatar" aria-hidden="true">{fan.shortName}</span>
              <div className="community-rail-copy">
                <strong>{fan.name}</strong>
                <small>{fan.note}</small>
              </div>
              <span className="community-fan-points">{fan.points}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="community-widget">
        <header className="community-widget-head">
          <span className="community-widget-emoji" aria-hidden="true">🎖️</span>
          <h2>Cột mốc thâm niên</h2>
        </header>
        <ul className="community-rail-list">
          {milestones.map((entry) => (
            <li key={entry.id} className="community-rail-row">
              <span className="avatar" aria-hidden="true">{entry.shortName}</span>
              <div className="community-rail-copy">
                <strong>{entry.name}</strong>
                <small>{entry.dateLabel} · {entry.note}</small>
              </div>
              <span className="community-years-badge">{entry.years} năm</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
