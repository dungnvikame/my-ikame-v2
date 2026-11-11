import { CheckCircleIcon as CheckCircle, MedalIcon as Medal } from '@coreds/react/icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { useToast } from '../components/toast';
import { Button, EmptyState, SectionHeader } from '../components/UI';
import { LIFECYCLE_BADGES } from '../data/onboarding-data';
import { earnedBadges, JOURNEY_LENGTH_DAYS } from '../lib/onboarding';
import { BuddyCard } from './onboarding/BuddyCard';
import { JourneyTimeline } from './onboarding/JourneyTimeline';
import { QuestChecklist } from './onboarding/QuestChecklist';

const SURVEY_QUEST_ID = 'q-survey-30';
const MOODS = [
  { key: 'great', emoji: '😄', label: 'Rất ổn' },
  { key: 'ok', emoji: '🙂', label: 'Ổn' },
  { key: 'meh', emoji: '😐', label: 'Bình thường' },
  { key: 'hard', emoji: '😟', label: 'Hơi khó' },
];

/** Khảo sát 30 ngày — một câu, trả lời tại chỗ; kết quả về Manager/COM ở dạng tổng hợp (không lộ cá nhân). */
function SurveyPanel({ done, onSubmit }: { done: boolean; onSubmit: () => void }) {
  const [mood, setMood] = useState<string | null>(null);
  return (
    <section id="survey" className="section-block journey-survey" aria-label="Khảo sát 30 ngày">
      <SectionHeader title="Khảo sát 30 ngày" meta="1 câu · 10 giây · tổng hợp ẩn danh cho team People" />
      {done ? (
        <p className="receipt" role="status"><CheckCircle size={16} />Đã gửi khảo sát — cảm ơn bạn. Manager sẽ thấy tín hiệu tổng hợp, không thấy câu trả lời cá nhân.</p>
      ) : (
        <>
          <p id="survey-title">Sau 30 ngày, bạn đang cảm thấy thế nào ở iKame?</p>
          <div className="journey-mood-row" role="radiogroup" aria-label="Mức độ hài lòng">
            {MOODS.map((item) => (
              <button key={item.key} type="button" role="radio" aria-checked={mood === item.key} className={`journey-mood ${mood === item.key ? 'is-active' : ''}`} onClick={() => setMood(item.key)}>
                <span aria-hidden="true">{item.emoji}</span>{item.label}
              </button>
            ))}
          </div>
          <Button variant="primary" disabled={!mood} onClick={onSubmit}>Gửi khảo sát</Button>
        </>
      )}
    </section>
  );
}

export function OnboardingPage() {
  const { user, journey, journeyDay, isNewJoiner, completeQuest, demoResetCount } = useAppState();
  const { showToast } = useToast();
  const [receipt, setReceipt] = useState<string | null>(null);
  useEffect(() => { setReceipt(null); }, [demoResetCount]);

  if (!isNewJoiner || !journey) {
    return (
      <div className="page">
        <EmptyState title="Hành trình 60 ngày dành cho người mới" body={`Bạn đã đồng hành cùng iKame ${journeyDay} ngày — huy hiệu và cột mốc nằm trong Hồ sơ.`} />
        <Link className="text-link" to="/profile">Mở Hồ sơ</Link>
      </div>
    );
  }

  const badges = earnedBadges(journeyDay, LIFECYCLE_BADGES, true);
  const surveyDone = journey.quests.find((quest) => quest.id === SURVEY_QUEST_ID)?.done ?? false;

  const complete = (questId: string) => {
    const quest = journey.quests.find((item) => item.id === questId);
    completeQuest(questId);
    const nowDone = journey.completed + 1;
    setReceipt(`Đã ghi nhận "${quest?.title ?? questId}" · ${nowDone}/${journey.total} cột mốc`);
    if (nowDone === journey.total) showToast('Bạn đã hoàn thành toàn bộ hành trình 60 ngày 🎓');
  };

  return (
    <div className="page onboarding-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">HÀNH TRÌNH 60 NGÀY · {user.team.toUpperCase()}</p>
          <h1>Ngày {journey.day}/{JOURNEY_LENGTH_DAYS} — còn {journey.daysLeft} ngày tới tốt nghiệp</h1>
          <p>{journey.completed}/{journey.total} cột mốc đã xong · {journey.due.length > 0 ? `${journey.due.length} việc đến hạn` : 'không có việc trễ'} · nguồn HRIS, iWiki, iGoal, buddy & manager</p>
        </div>
      </header>
      {receipt && <p className="resolve-receipt" role="status">{receipt}</p>}

      <div className="profile-grid">
        <div className="profile-main">
          <JourneyTimeline journey={journey} />
          <QuestChecklist journey={journey} onComplete={complete} />
          <SurveyPanel done={surveyDone} onSubmit={() => complete(SURVEY_QUEST_ID)} />
        </div>
        <aside className="profile-rail">
          <BuddyCard journey={journey} />
          <section className="side-info profile-section">
            <SectionHeader title="Huy hiệu" meta={`${badges.length}/${LIFECYCLE_BADGES.length}`} />
            <ul className="badge-list">
              {LIFECYCLE_BADGES.map((badge) => {
                const earned = badges.some((item) => item.id === badge.id);
                return (
                  <li key={badge.id} className={`badge-row ${earned ? 'is-earned' : ''}`}>
                    <span className="badge-emoji" aria-hidden="true">{earned ? badge.emoji : <Medal size={18} />}</span>
                    <div>
                      <strong>{badge.title}</strong>
                      <small>{earned ? badge.description : `Mở khoá ở ngày ${badge.dayRequired}`}</small>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="inline-guidance">Huy hiệu mốc hiện trên Hồ sơ và được My iKame đăng tự động lên iKame Feed — không có điểm hay đổi quà.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
