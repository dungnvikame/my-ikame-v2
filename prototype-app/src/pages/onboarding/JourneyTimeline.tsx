import { CheckCircle, Circle, Flag, WarningCircle } from '@phosphor-icons/react';
import type { JourneyView } from '../../lib/onboarding';
import { SectionHeader } from '../../components/UI';

const STATUS_LABEL = { done: 'Đã hoàn thành', open: 'Còn việc chưa xong', current: 'Đang ở đây', upcoming: 'Sắp tới' } as const;

/** Timeline 4 mốc — dùng chung cho trang Hành trình (người mới) và tab Hành trình trong hồ sơ 360° (manager). */
export function JourneyTimeline({ journey, title = 'Các mốc hành trình' }: { journey: JourneyView; title?: string }) {
  return (
    <section className="section-block">
      <SectionHeader title={title} meta={`${journey.completed}/${journey.total} cột mốc · còn ${journey.daysLeft} ngày`} />
      <ol className="journey-timeline">
        {journey.milestones.map((milestone) => (
          <li key={milestone.key} className={`journey-timeline-item journey-timeline-item--${milestone.status}`}>
            <span className="journey-timeline-dot" aria-hidden="true">
              {milestone.status === 'done' ? <CheckCircle size={20} weight="fill" />
                : milestone.status === 'open' ? <WarningCircle size={20} weight="fill" />
                  : milestone.status === 'current' ? <Flag size={18} weight="fill" /> : <Circle size={18} />}
            </span>
            <div>
              <div className="journey-timeline-head">
                <strong>Ngày {milestone.day} · {milestone.title}</strong>
                <small>{STATUS_LABEL[milestone.status]} · {milestone.done}/{milestone.total}</small>
              </div>
              <p>{milestone.subtitle}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
