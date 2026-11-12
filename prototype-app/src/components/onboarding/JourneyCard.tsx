import { ArrowRightIcon as ArrowRight, CompassIcon as Compass } from '@coreds/react/icons';
import { Link } from 'react-router-dom';
import type { JourneyView } from '../../lib/onboarding';
import { JOURNEY_LENGTH_DAYS } from '../../lib/onboarding';
import { ButtonLink } from '../UI';
import { Progress } from '@coreds/react';

/**
 * Thẻ "Hành trình của bạn" trên Home của người mới — overlay trên lăng kính iKamer.
 * `compact` khi Home đã có hero bắt buộc (một hàng, không đẩy Việc hôm nay xuống xa).
 */
export function JourneyCard({ journey, compact = false }: { journey: JourneyView; compact?: boolean }) {
  const current = journey.milestones.find((milestone) => milestone.status === 'current');
  return (
    <section className={`journey-card ${compact ? 'is-compact' : ''}`} aria-labelledby="journey-card-title">
      <div className="journey-card-head">
        <span className="journey-card-icon" aria-hidden="true"><Compass size={20} variant="duotone" /></span>
        <div className="journey-card-copy">
          <p className="eyebrow">HÀNH TRÌNH 60 NGÀY · {current?.title.toUpperCase() ?? 'TỐT NGHIỆP'}</p>
          <h2 id="journey-card-title">Ngày {journey.day}/{JOURNEY_LENGTH_DAYS} · {journey.completed}/{journey.total} cột mốc</h2>
          {!compact && journey.next && <p>Tiếp theo: {journey.next.title}</p>}
        </div>
        <ButtonLink variant="primary" to="/onboarding">Mở hành trình<ArrowRight size={16} /></ButtonLink>
      </div>
      <div className="journey-progress journey-progress--ds" role="progressbar" aria-valuemin={0} aria-valuemax={JOURNEY_LENGTH_DAYS} aria-valuenow={journey.day} aria-label={`Ngày ${journey.day} trên ${JOURNEY_LENGTH_DAYS}`}>
        <Progress className="journey-progress-bar" size="md" value={journey.percent} aria-hidden="true" />
        {journey.milestones.map((milestone) => (
          <span key={milestone.key} className={`journey-progress-tick journey-progress-tick--${milestone.status}`} style={{ left: `${(milestone.day / JOURNEY_LENGTH_DAYS) * 100}%` }} title={`${milestone.title} · ngày ${milestone.day}`} />
        ))}
      </div>
      {!compact && (
        <ul className="journey-milestone-row" aria-label="Các mốc">
          {journey.milestones.map((milestone) => (
            <li key={milestone.key} className={`journey-milestone-chip journey-milestone-chip--${milestone.status}`}>
              <strong>{milestone.title}</strong><small>{milestone.done}/{milestone.total}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
