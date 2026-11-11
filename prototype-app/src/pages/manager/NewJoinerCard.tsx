import { ArrowRightIcon as ArrowRight, CalendarPlusIcon as CalendarPlus, CheckCircleIcon as CheckCircle } from '@coreds/react/icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../../AppState';
import { Button, StatusPill } from '../../components/UI';
import { teamMembers } from '../../data/mockData';
import { JOURNEY_LENGTH_DAYS } from '../../lib/onboarding';
import type { TeamMember } from '../../types';
import { Avatar, Progress } from '@coreds/react';
import { avatarText } from '../../lib/avatar-text';

/**
 * Người mới trong team (Tổng quan Manager): tiến độ hành trình 60 ngày + việc của manager tuần này.
 * Dữ liệu từ cùng state tiến độ với trang Hành trình của người mới — không tính lại.
 */
export function NewJoinerCard({ member }: { member: TeamMember }) {
  const { journeyFor, attention, resolveAttentionItem, demoResetCount } = useAppState();
  const [receipt, setReceipt] = useState<string | null>(null);
  useEffect(() => { setReceipt(null); }, [demoResetCount]);

  const journey = member.personId ? journeyFor(member.personId) : undefined;
  if (!journey) return null;

  const managerQuest = journey.quests.find((quest) => quest.source === 'Manager' && !quest.done);
  const buddyName = teamMembers.find((item) => item.id === journey.buddyMemberId)?.name ?? 'chưa gán';
  const oneOnOne = attention.find((item) => item.id === 'new-joiner');
  const oneOnOneOpen = oneOnOne?.state === 'open';

  const bookOneOnOne = () => {
    if (oneOnOne) resolveAttentionItem(oneOnOne.id);
    setReceipt('Đã đặt 1:1 mốc 30 ngày · thứ Năm 10:00 · Google Calendar qua MCP (mô phỏng)');
  };

  return (
    <article className="moment-card newjoiner-card">
      <Avatar type="text" size="l" fallback={avatarText(member.name.charAt(0))} alt="" aria-hidden="true" />
      <div className="newjoiner-card-body">
        <StatusPill tone="info">NGƯỜI MỚI · NGÀY {journey.day}/{JOURNEY_LENGTH_DAYS}</StatusPill>
        <h3><Link to={`/manager/team/${member.id}`}>{member.name}</Link></h3>
        <p>{journey.completed}/{journey.total} cột mốc · {journey.due.length > 0 ? `${journey.due.length} việc đến hạn` : 'đúng nhịp'} · buddy {buddyName}</p>
        <Progress className="journey-progress-ds" size="md" value={journey.percent} aria-label={`Ngày ${journey.day} trên ${JOURNEY_LENGTH_DAYS}`} />
        <p className="newjoiner-card-task">
          <strong>Việc của bạn tuần này:</strong> {oneOnOneOpen ? '1:1 mốc 30 ngày (chưa đặt)' : '1:1 mốc 30 ngày đã đặt'}{managerQuest ? ` · ${managerQuest.title}` : ''}
        </p>
        {receipt ? (
          <p className="receipt" role="status"><CheckCircle size={16} />{receipt}</p>
        ) : oneOnOneOpen && (
          <Button variant="primary" icon={<CalendarPlus size={16} />} onClick={bookOneOnOne}>Đặt 1:1</Button>
        )}
        <Link className="text-link" to={`/manager/team/${member.id}?tab=journey`}>Xem hành trình<ArrowRight size={14} /></Link>
      </div>
    </article>
  );
}
