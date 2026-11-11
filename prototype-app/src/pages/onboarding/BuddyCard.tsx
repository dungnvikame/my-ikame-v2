import { ChatCircleDotsIcon as ChatCircleDots, UsersThreeIcon as UsersThree } from '@coreds/react/icons';
import { memberProfiles, teamMembers, users } from '../../data/mockData';
import { SectionHeader } from '../../components/UI';
import type { JourneyView } from '../../lib/onboarding';
import { Avatar } from '@coreds/react';

/** Buddy + manager của người mới — lấy từ roster team (không nhập tay), kèm việc kế tiếp với từng người. */
export function BuddyCard({ journey }: { journey: JourneyView }) {
  const buddy = teamMembers.find((member) => member.id === journey.buddyMemberId);
  const buddyProfile = buddy ? memberProfiles[buddy.id] : undefined;
  const manager = Object.values(users).find((person) => person.personId === journey.managerPersonId);
  const buddyQuest = journey.quests.find((quest) => quest.source === 'Buddy' && !quest.done);
  const managerQuest = journey.quests.find((quest) => quest.source === 'Manager' && !quest.done);

  return (
    <section className="side-info profile-section">
      <SectionHeader title="Người đồng hành" />
      <ul className="buddy-list">
        {buddy && (
          <li className="buddy-row">
            <Avatar type="text" size="m" fallback={buddy.name.charAt(0)} alt="" aria-hidden="true" />
            <div>
              <strong>{buddy.name}</strong>
              <small>Buddy · {buddy.role}{buddyProfile ? ` · ${buddyProfile.slack}` : ''}</small>
              {buddyQuest && <p className="buddy-next"><ChatCircleDots size={14} />{buddyQuest.title}</p>}
            </div>
          </li>
        )}
        {manager && (
          <li className="buddy-row">
            <Avatar type="text" size="m" fallback={manager.shortName.slice(0, 1)} alt="" aria-hidden="true" />
            <div>
              <strong>{manager.name}</strong>
              <small>Quản lý trực tiếp · {manager.role}</small>
              {managerQuest && <p className="buddy-next"><UsersThree size={14} />{managerQuest.title}</p>}
            </div>
          </li>
        )}
      </ul>
      <p className="inline-guidance">Manager tham gia onboarding giúp tỷ lệ thành công tăng 3,4× — My iKame nhắc cả hai phía theo mốc.</p>
    </section>
  );
}
