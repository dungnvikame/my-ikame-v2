import { useEffect, useState } from 'react';
import { ChatsCircleIcon as ChatsCircle, PaperPlaneTiltIcon as PaperPlaneTilt, SquaresFourIcon as SquaresFour, UsersIcon as Users } from '@coreds/react/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { AIAssistant } from '../components/AIAssistant';
import { BriefModal } from '../components/home/BriefModal';
import { NextMeetingCard, nextMeetingOf } from '../components/home/NextMeetingCard';
import { RecapCard } from '../components/home/RecapCard';
import { homeActions, handledCount, isDone, useHomeState, type FocusBlock } from '../components/home/home-store';
import { byUrgency, focusSlotOf, hhmm } from '../components/home/task-utils';
import { useToast } from '../components/toast';
import { NewsCard } from '../components/ContentCards';
import { ICheckWidget } from '../components/icheck/ICheckWidget';
import { useLive } from '../lib/live/live-data';
import { buildLiveDigestItems } from '../lib/live/live-digest';
import { DayTimeline, type TimelineMeeting } from '../components/home/DayTimeline';
import { TodayTasks, type TaskSuggestion } from '../components/home/TodayTasks';
import { LiveDataBar } from '../components/live/LiveDataBar';
import { JourneyCard } from '../components/onboarding/JourneyCard';
import { buildDailyDigestItems } from './assistant/daily-digest';
import { journeyDigestQuests } from '../lib/onboarding';
import { documentReminders } from '../data/profile-data';
import { EventCardV2 } from './events/EventCardV2';
import { EmptyState, SectionHeader } from '../components/UI';
import { isEligible } from '../lib/audience';
import { rankCards, type RankableCard } from '../lib/ranking';
import type { EventItem, NewsPost } from '../types';

type HomeCard = { kind: 'news'; post: NewsPost } | { kind: 'event'; event: EventItem };

const HOUR_MS = 60 * 60 * 1000;

/** Vietnamese `dd/mm/yyyy` embedded in `dateLabel` + `HH:mm` from `time` — the only real timestamp mock events carry. */
function parseEventStart(event: EventItem): Date | undefined {
  const dateMatch = event.dateLabel.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!dateMatch) return undefined;
  const [, day, month, year] = dateMatch;
  const timeMatch = event.time.match(/(\d{2}):(\d{2})/);
  const hour = timeMatch ? timeMatch[1] : '00';
  const minute = timeMatch ? timeMatch[2] : '00';
  const start = new Date(`${year}-${month}-${day}T${hour}:${minute}:00+07:00`);
  return Number.isNaN(start.getTime()) ? undefined : start;
}

function isOverdue(dueLabel?: string): boolean {
  return !!dueLabel && /quá hạn/i.test(dueLabel);
}

/** Page-local priority-band adapter (spec §13.2) — news/events carry no band, this derives one from existing fields. */
function toRankable(card: HomeCard, now: Date): RankableCard {
  if (card.kind === 'news') {
    const { post } = card;
    const needsAction = !!post.mandatory && !post.acknowledged;
    const overdue = needsAction && isOverdue(post.dueLabel);
    return {
      id: post.id,
      priorityBand: needsAction ? (overdue ? 'P0' : 'P1') : post.official ? 'P4' : 'P5',
      severity: needsAction ? 'critical' : undefined,
      official: post.official,
      updatedAt: post.publishedAt,
    };
  }
  const { event } = card;
  const start = parseEventStart(event);
  const registered = event.myRegistration === 'going' || event.myRegistration === 'waitlisted';
  const startingSoon = !!start && start.getTime() >= now.getTime() && start.getTime() - now.getTime() <= 48 * HOUR_MS;
  const iso = start?.toISOString();
  return {
    id: event.id,
    priorityBand: registered || startingSoon ? 'P2' : 'P5',
    dueAt: iso,
    updatedAt: iso ?? event.dateLabel,
  };
}

function rankHomeCards(cards: HomeCard[], now: Date): HomeCard[] {
  const rankable = cards.map((card) => ({ ...toRankable(card, now), card }));
  return rankCards(rankable).map((entry) => entry.card);
}

function newsFrom(cards: HomeCard[]): NewsPost[] {
  return cards.flatMap((card) => (card.kind === 'news' ? [card.post] : []));
}

function eventsFrom(cards: HomeCard[]): EventItem[] {
  return cards.flatMap((card) => (card.kind === 'event' ? [card.event] : []));
}

/** Cột mốc gắn bó (joinedAt dd/mm/yyyy): tròn năm hôm nay / trong 7 ngày tới; người mới thì "Ngày thứ N". */
function tenureMilestone(joinedAt: string, now: Date, newJoinerDay?: number): string | undefined {
  if (newJoinerDay) return `Ngày thứ ${newJoinerDay} của bạn ở iKame`;
  const match = joinedAt.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const day = Number(match[1]); const month = Number(match[2]) - 1; const year = Number(match[3]);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const anniversary = new Date(now.getFullYear(), month, day);
  const years = now.getFullYear() - year;
  if (years < 1) return undefined;
  const diff = Math.round((anniversary.getTime() - today.getTime()) / (24 * HOUR_MS));
  if (diff === 0) return `Hôm nay bạn tròn ${years} năm ở iKame`;
  if (diff > 0 && diff <= 7) return `Còn ${diff} ngày nữa bạn tròn ${years} năm ở iKame`;
  return undefined;
}

/** Đồng hồ nhẹ: làm mới mỗi 30 giây để "sau N phút" và giờ tổng kết luôn đúng. */
function useNow(intervalMs = 30000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function HomePage() {
  const { user, news, events, goals, posts, dailyCheckIn, documents, isNewJoiner, journey, journeyDay, hrProfile } = useAppState();
  const now = useNow();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [briefOpen, setBriefOpen] = useState(false);
  // Đã nối iCheck thật: "Chấm công hôm nay" trong Việc hôm nay theo bản ghi thật, không theo kịch bản mẫu.
  const live = useLive().data;
  const checkedIn = live?.icheck ? live.icheck.checkIn.done : dailyCheckIn.done;
  // Người mới: quest đến hạn/trễ của hành trình 60 ngày lên Việc hôm nay (tối đa 2).
  const journeyQuests = isNewJoiner ? journeyDigestQuests(journey) : undefined;

  const eligibleNews = news.filter((post) => !post.expired && isEligible(user, post.audienceTeamIds));
  const eligibleEvents = events.filter((event) => event.status !== 'past' && event.status !== 'cancelled' && isEligible(user, event.audienceTeamIds));

  const heroCandidates = eligibleNews.filter((post) => post.mandatory && !post.acknowledged).map((post): HomeCard => ({ kind: 'news', post }));
  const heroCard = rankHomeCards(heroCandidates, now)[0];
  const hero = heroCard?.kind === 'news' ? heroCard.post : undefined;

  // "Việc hôm nay" — cùng nguồn với Trợ lý AI (Daily Work Hub), tối đa 5 mục trên Home.
  const mockDigest = buildDailyDigestItems({ news: eligibleNews, events: eligibleEvents, goals, checkedIn, documentReminders: documentReminders(documents), journeyQuests });
  // Đã nối dữ liệu thật: việc cá nhân lấy từ công cụ thật; chỉ giữ lại việc của chính My iKame
  // (tin cần xác nhận, sự kiện đã đăng ký) từ dữ liệu mẫu — không trộn việc của nhân vật mẫu.
  const fullDigest = live
    ? [...buildLiveDigestItems(live, now), ...mockDigest.filter((item) => item.source === 'COM' || item.source === 'My iKame')]
    : mockDigest;
  const urgentCount = fullDigest.filter((item) => item.urgent).length;

  const newsPreviewCandidates = eligibleNews.filter((post) => post.id !== hero?.id).map((post): HomeCard => ({ kind: 'news', post }));
  const newsPreview = newsFrom(rankHomeCards(newsPreviewCandidates, now)).slice(0, 4);

  const upcomingCandidates = eligibleEvents.map((event): HomeCard => ({ kind: 'event', event }));
  const upcomingEvents = eventsFrom(rankHomeCards(upcomingCandidates, now)).slice(0, 2);

  const statusLine = urgentCount > 0
    ? `Bạn có ${urgentCount} việc gấp hôm nay và ${eligibleEvents.length} sự kiện sắp diễn ra.`
    : `Hôm nay không có việc gấp, còn ${eligibleEvents.length} sự kiện sắp diễn ra.`;

  // Dải thời gian: lịch thật khi đã kết nối, nếu không dùng cuộc họp của kịch bản mẫu (khớp "Việc hôm nay").
  const at = (hour: number, minute = 0) => { const date = new Date(now); date.setHours(hour, minute, 0, 0); return date; };
  const timelineMeetings: TimelineMeeting[] = live
    ? (live.meetings ?? []).filter((meeting) => !meeting.allDay).map((meeting) => ({ id: meeting.id, title: meeting.title, start: meeting.start, end: meeting.end, url: meeting.url, guests: meeting.guests }))
    : [{ id: 'mock-product-sync', title: 'Họp nhóm Product', start: at(14), end: at(15), location: 'Mercury', guests: 6 }];

  // Trạng thái cá nhân trong ngày (đã xử lý, hoãn, khối tập trung).
  const home = useHomeState();
  const stamp = now.getTime();
  const handled = handledCount(fullDigest.map((item) => item.id), home, stamp);
  const pendingTasks = byUrgency(fullDigest.filter((item) => !isDone(home, item.id, stamp)));
  const nextMeeting = nextMeetingOf(timelineMeetings, now);
  const focusSuggestion = focusSlotOf(timelineMeetings, now);
  const focus = home.focus && home.focus.end > home.focus.start ? home.focus : undefined;
  const goalPercent = live?.objectives?.length
    ? Math.round(live.objectives.reduce((sum, objective) => sum + objective.progress, 0) / live.objectives.length)
    : goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : undefined;

  function changeFocus(next: FocusBlock | undefined) {
    homeActions.setFocus(next);
    showToast(next ? `Đã chặn ${hhmm(new Date(next.start))} đến ${hhmm(new Date(next.end))} làm giờ tập trung` : 'Đã bỏ chặn giờ tập trung');
  }

  // Tổng kết cuối ngày: từ 16:30, hoặc ?recap=1, hoặc bấm "Xem tổng kết".
  const [recapForced, setRecapForced] = useState(false);
  const recapShown = recapForced || searchParams.get('recap') === '1' || now.getHours() * 60 + now.getMinutes() >= 16 * 60 + 30;
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowMeeting = (live?.meetings ?? []).filter((meeting) => !meeting.allDay && meeting.start.toDateString() === tomorrow.toDateString())[0];
  const snoozedToTomorrow = fullDigest.filter((item) => home.snoozed[item.id]?.kind === 'snooze' && home.snoozed[item.id].until > stamp).length;

  const milestone = tenureMilestone(hrProfile.joinedAt, now, isNewJoiner ? journeyDay : undefined);

  // Gợi ý khi rảnh: việc không gấp, lấy từ lời mời sự kiện chưa trả lời và tin chưa đọc.
  const suggestions: TaskSuggestion[] = [];
  const invited = eligibleEvents.find((event) => event.status === 'open' && event.myRegistration === 'not_registered');
  if (invited) suggestions.push({ id: `inv-${invited.id}`, kicker: 'Lời mời chưa trả lời', title: invited.title, meta: invited.dateLabel, to: `/events/${invited.id}`, cta: 'Xem và đăng ký' });
  const unread = eligibleNews.find((post) => !post.read && !post.mandatory);
  if (unread) suggestions.push({ id: `news-${unread.id}`, kicker: 'Tin chưa đọc', title: unread.title, meta: `${unread.publisher} · ${unread.readingTime}`, to: `/feed/article/${unread.id}`, cta: 'Đọc và đánh giá' });

  const greetingWord = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const personName = live?.person.shortName ?? user.shortName;
  const railNews = newsPreview.slice(0, 3);

  return (
    <div className="page overview-page">
      <AIAssistant
        subtitle={statusLine}
        milestone={milestone}
        progress={{ handled, total: fullDigest.length, goalPercent }}
        onBrief={() => setBriefOpen(true)}
        onToggleRecap={() => setRecapForced(true)}
        recapShown={recapShown}
        aside={<NextMeetingCard meeting={nextMeeting} now={now} />}
      >
        <DayTimeline meetings={timelineMeetings} now={now} focus={focus} focusSuggestion={focusSuggestion} onFocusChange={changeFocus} />
      </AIAssistant>

      {briefOpen && (
        <BriefModal
          name={personName}
          greeting={greetingWord}
          tasks={pendingTasks}
          nextMeeting={nextMeeting}
          focusSlot={focus ? { start: new Date(focus.start), end: new Date(focus.end) } : focusSuggestion}
          newsNote={railNews[0] ? { id: railNews[0].id, title: railNews[0].title } : undefined}
          now={now}
          onClose={() => setBriefOpen(false)}
        />
      )}

      <LiveDataBar />

      {/* Tin bắt buộc không còn băng riêng: nó đứng đầu "Cần làm ngay" với nhãn Gấp, tránh hiện hai lần. */}
      {/* Overlay Người mới (joinedAt < 60 ngày): thẻ hành trình, gọn lại khi đã có hero bắt buộc. */}
      {isNewJoiner && journey && <JourneyCard journey={journey} />}

      <div className="home-grid">
        <section className="home-main">
          {recapShown && (
            <RecapCard
              handled={handled}
              total={fullDigest.length}
              meetingsPast={timelineMeetings.filter((meeting) => meeting.end <= now).length}
              meetingsTotal={timelineMeetings.length}
              snoozedToTomorrow={snoozedToTomorrow}
              tomorrowFirst={tomorrowMeeting ? `${tomorrowMeeting.title} lúc ${hhmm(tomorrowMeeting.start)}` : undefined}
              onHide={recapForced || searchParams.get('recap') === '1' ? () => { setRecapForced(false); if (searchParams.has('recap')) setSearchParams({}, { replace: true }); } : undefined}
            />
          )}

          {/* Việc cần làm đứng đầu cột chính: mở trang là thấy, không phải cuộn qua chấm công. */}
          <TodayTasks
            items={fullDigest}
            now={now}
            suggestions={suggestions}
            askHref="/assistant?q=Hôm nay tôi cần làm gì?"
            sourceNote={live ? 'Từ iCheck, iHiring, iGoal và Lịch của bạn, cộng tin cần xác nhận trên My iKame.' : 'Gom từ iCheck, COM, iGoal, Asana và lịch của bạn.'}
          />

          <section className="section-block">
            <SectionHeader title="Tin dành cho bạn" meta="Chính thức và phù hợp với vai trò của bạn" href="/feed" />
            {newsPreview.length > 0 ? (
              <div className="news-grid">
                {newsPreview.map((post, index) => <NewsCard key={post.id} post={post} compact={index > 0} />)}
              </div>
            ) : (
              <EmptyState title="Chưa có tin mới" body="Nội dung dành cho bạn sẽ xuất hiện ở đây." />
            )}
          </section>
        </section>

        <aside className="home-rail">
          <ICheckWidget compact />
          <section className="section-block home-rail-block">
            <SectionHeader title="Lối tắt" />
            <div className="home-shortcuts">
              <Link className="home-shortcut" to="/requests" title="Gõ một câu: xin nghỉ, làm từ xa, báo sự cố">
                <span className="home-shortcut-icon"><PaperPlaneTilt size={20} /></span>
                <strong>Tạo đề xuất</strong>
              </Link>
              <Link className="home-shortcut" to="/feed" title={`${posts.length} bài viết từ đồng nghiệp`}>
                <span className="home-shortcut-icon"><ChatsCircle size={20} /></span>
                <strong>iKame Feed</strong>
              </Link>
              <Link className="home-shortcut" to="/apps" title="Mở iGoal, iWiki, iHRM... với SSO chung">
                <span className="home-shortcut-icon"><SquaresFour size={20} /></span>
                <strong>Ứng dụng</strong>
              </Link>
              <Link className="home-shortcut" to="/search" title="Tìm đồng nghiệp, tin tức, tài liệu">
                <span className="home-shortcut-icon"><Users size={20} /></span>
                <strong>Danh bạ</strong>
              </Link>
            </div>
          </section>
          {railNews.length > 0 && (
            <section className="section-block home-rail-block">
              <SectionHeader title="iKame hôm nay" href="/feed" />
              <ul className="home-today-news">
                {railNews.map((post) => (
                  <li key={post.id}>
                    <Link to={`/feed/article/${post.id}`}>
                      <strong>{post.title}</strong>
                      <small>{post.publisher} · {post.readingTime}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="section-block home-rail-block">
            <SectionHeader title="Sự kiện sắp tới" href="/events" />
            {upcomingEvents.length > 0 ? (
              <div className="rail-stack">
                {upcomingEvents.map((event) => <EventCardV2 key={event.id} event={event} compact />)}
              </div>
            ) : (
              <EmptyState title="Chưa có sự kiện" body="Sự kiện sắp diễn ra sẽ xuất hiện ở đây." />
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
