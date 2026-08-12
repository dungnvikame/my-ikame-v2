import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, StatusPill } from '../../components/UI';
import { isEligible } from '../../lib/audience';
import type { BirthdayPerson, DailyCheckIn, EventItem, Milestone, TopFan, User } from '../../types';

/** Phase 3 owns its own copy of this helper in its own file — duplication accepted over cross-phase edits. */
function daysUntil(startsAt: string): string {
  const diffMs = new Date(startsAt).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diffMs / 86_400_000));
  return days === 0 ? 'Hôm nay' : `còn ${days} ngày`;
}

type CommunityRailProps = {
  user: User;
  dailyCheckIn: DailyCheckIn;
  submitDailyCheckIn: (mode: 'WFO' | 'Remote') => void;
  events: EventItem[];
  topFans: TopFan[];
  birthdays: BirthdayPerson[];
  milestones: Milestone[];
  onCongratulate: (personId: string, postId: string, name: string) => void;
};

export function CommunityRail({
  user, dailyCheckIn, submitDailyCheckIn, events, topFans, birthdays, milestones, onCongratulate,
}: CommunityRailProps) {
  const upcoming = useMemo(() => events
    .filter((event) => isEligible(user, event.audienceTeamIds)
      && event.status !== 'cancelled' && event.status !== 'past'
      && event.startsAt && new Date(event.startsAt).getTime() > Date.now())
    .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime())
    .slice(0, 2), [events, user]);

  return (
    <aside className="community-rail" aria-label="Hoạt động cộng đồng">
      <section className="community-widget">
        <h2>Hôm nay của tôi</h2>
        {dailyCheckIn.done ? (
          <StatusPill tone="success">Đã check-in {dailyCheckIn.timeLabel} · {dailyCheckIn.mode}</StatusPill>
        ) : (
          <div className="community-checkin-actions">
            <Button variant="primary" onClick={() => submitDailyCheckIn('WFO')}>Ở văn phòng</Button>
            <Button variant="dim" onClick={() => submitDailyCheckIn('Remote')}>Làm từ xa</Button>
          </div>
        )}
      </section>

      <section className="community-widget">
        <h2>Sự kiện sắp tới</h2>
        {upcoming.length === 0 ? (
          <p className="community-widget-empty">Chưa có sự kiện sắp tới.</p>
        ) : (
          <ul className="community-event-list">
            {upcoming.map((event) => (
              <li key={event.id}>
                <Link to={`/events/${event.id}`}>{event.title}</Link>
                <span className="community-widget-meta">{event.dateLabel} · {daysUntil(event.startsAt!)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="community-widget">
        <h2>Fan iKame tuần</h2>
        <ul className="community-fan-list">
          {topFans.map((fan) => (
            <li key={fan.id}>
              <span className="avatar" aria-hidden="true">{fan.shortName}</span>
              <div>
                <strong>{fan.name}</strong>
                <span className="community-widget-meta">{fan.note}</span>
              </div>
              <span className="community-fan-points">{fan.points} điểm</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="community-widget">
        <h2>Sinh nhật hôm nay</h2>
        <ul className="community-birthday-list">
          {birthdays.map((person) => (
            <li key={person.id} className="community-birthday-row">
              <span className="avatar" aria-hidden="true">{person.shortName}</span>
              <div>
                <strong>{person.name}</strong>
                <span className="community-birthday-meta">{person.role} · {person.team}</span>
              </div>
              <Button
                variant={person.congratulated ? 'dim' : 'primary'}
                disabled={person.congratulated}
                onClick={() => onCongratulate(person.id, person.postId, person.shortName)}
              >
                {person.congratulated ? 'Đã chúc ✓' : 'Chúc'}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="community-widget">
        <h2>Cột mốc thâm niên</h2>
        <ul className="community-milestone-list">
          {milestones.map((entry) => (
            <li key={entry.id}>
              <span className="avatar" aria-hidden="true">{entry.shortName}</span>
              <div>
                <strong>{entry.name} · {entry.years} năm</strong>
                <span className="community-widget-meta">{entry.dateLabel} · {entry.note}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
