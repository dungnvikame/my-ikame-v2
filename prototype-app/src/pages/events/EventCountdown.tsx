import { useEffect, useState } from 'react';
import { parseStartsAt } from './event-dates';

export type CountdownState = 'upcoming' | 'live' | 'past';
export type CountdownValue = { state: CountdownState; days: number; hours: number; minutes: number; seconds: number };

/** Events read as "Đang diễn ra" up to 3h after `startsAt` — heuristic, fixtures carry no `endsAt`. */
export const LIVE_WINDOW_MS = 3 * 60 * 60 * 1000;

function computeCountdown(date: Date | undefined, now: number): CountdownValue {
  if (!date) return { state: 'past', days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = date.getTime() - now;
  if (diff <= 0) {
    return { state: diff > -LIVE_WINDOW_MS ? 'live' : 'past', days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    state: 'upcoming',
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * One `setInterval(1000)` per mount while ticking; skipped entirely under reduced-motion
 * (computed once instead). Never renders negative time — past/cancelled degrade to labels.
 */
export function useCountdown(startsAt?: string): CountdownValue {
  const [reduced] = useState(prefersReducedMotion);
  const date = parseStartsAt(startsAt);
  const [value, setValue] = useState<CountdownValue>(() => computeCountdown(date, Date.now()));

  useEffect(() => {
    setValue(computeCountdown(date, Date.now()));
    if (reduced || !date) return;
    const timer = window.setInterval(() => setValue(computeCountdown(date, Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [startsAt, reduced, date?.getTime()]);

  return value;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function EventCountdown({ startsAt, cancelled = false }: { startsAt?: string; cancelled?: boolean }) {
  const countdown = useCountdown(cancelled ? undefined : startsAt);
  const [reduced] = useState(prefersReducedMotion);

  if (cancelled) return <p className="events-v2-countdown events-v2-countdown--muted">Đã hủy</p>;
  if (countdown.state === 'live') return <p className="events-v2-countdown events-v2-countdown--live">● Đang diễn ra</p>;
  if (countdown.state === 'past') return <p className="events-v2-countdown events-v2-countdown--muted">Đã diễn ra</p>;

  if (reduced) {
    return (
      <p className="events-v2-countdown">
        Còn {countdown.days} ngày · {pad(countdown.hours)}:{pad(countdown.minutes)}
      </p>
    );
  }

  return (
    <p className="events-v2-countdown" aria-live="off">
      <span><strong>{countdown.days}</strong> ngày</span>
      <span><strong>{pad(countdown.hours)}</strong> giờ</span>
      <span><strong>{pad(countdown.minutes)}</strong> phút</span>
      <span><strong>{pad(countdown.seconds)}</strong> giây</span>
    </p>
  );
}
