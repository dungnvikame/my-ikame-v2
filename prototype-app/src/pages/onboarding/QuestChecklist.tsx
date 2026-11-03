import { ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PlatformHandoffButton } from '../../components/PlatformHandoff';
import { SectionHeader, StatusPill } from '../../components/UI';
import type { JourneyView } from '../../lib/onboarding';
import { JOURNEY_MILESTONES } from '../../lib/onboarding';

/**
 * Checklist quest theo mốc — checkbox thật (không EXP/coin). Quest ở platform gốc có nút handoff;
 * quest trong My iKame có link; tick xong là ghi nhận vào hành trình.
 */
export function QuestChecklist({ journey, onComplete }: { journey: JourneyView; onComplete: (questId: string) => void }) {
  return (
    <section className="section-block">
      <SectionHeader title="Việc cần làm theo mốc" meta="Tick khi xong · quest trễ được nhắc trên Việc hôm nay" />
      {JOURNEY_MILESTONES.map((milestone) => {
        const quests = journey.quests.filter((quest) => quest.milestone === milestone.key);
        return (
          <div key={milestone.key} className="quest-group">
            <p className="quest-group-title">Ngày {milestone.day} · {milestone.title}</p>
            <ul className="quest-list">
              {quests.map((quest) => (
                <li key={quest.id} className={`quest-item ${quest.done ? 'is-done' : ''} ${quest.late ? 'is-late' : ''}`}>
                  <label className="quest-check">
                    <input type="checkbox" checked={quest.done} disabled={quest.done} onChange={() => onComplete(quest.id)} />
                    <span className="quest-title">{quest.title}</span>
                  </label>
                  <div className="quest-meta">
                    {quest.late && <StatusPill tone="warning">Trễ {journey.day - quest.dueDay} ngày</StatusPill>}
                    {!quest.done && !quest.late && quest.dueDay === journey.day && <StatusPill tone="info">Hạn hôm nay</StatusPill>}
                    <small>{quest.source}{quest.done ? ' · đã xong' : ` · hạn ngày ${quest.dueDay}`}</small>
                    {!quest.done && quest.platform && <PlatformHandoffButton platform={quest.platform} action={quest.title.toLowerCase()} variant="link" />}
                    {!quest.done && quest.href && !quest.href.includes('#') && <Link className="text-link" to={quest.href}>Mở<ArrowRight size={14} /></Link>}
                    {!quest.done && quest.href?.includes('#') && <a className="text-link" href={quest.href}>Trả lời<ArrowRight size={14} /></a>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
