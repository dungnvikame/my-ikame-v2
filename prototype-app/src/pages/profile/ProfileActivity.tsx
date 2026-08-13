import { CalendarCheck, CheckCircle, Newspaper, PenNib } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, SectionHeader } from '../../components/UI';
import type { CheckInReport, EventItem, NewsPost, Post, User } from '../../types';

type ActivityRow = { id: string; icon: ReactNode; label: string; href: string };

type ProfileActivityProps = {
  user: User;
  news: NewsPost[];
  events: EventItem[];
  checkInReports: CheckInReport[];
  posts: Post[];
};

/** "Hoạt động gần đây" — the ONE live section in Hồ sơ (F2): acknowledged news,
 * registered/waitlisted events, submitted reports and authored posts, all derived
 * from current AppState so it changes as the presenter clicks through the golden path. */
export function ProfileActivity({ user, news, events, checkInReports, posts }: ProfileActivityProps) {
  const rows: ActivityRow[] = [
    ...news.filter((item) => item.acknowledged).map((item): ActivityRow => ({
      id: `news-${item.id}`, icon: <CheckCircle size={18} weight="duotone" />,
      label: `Đã xác nhận đã đọc: ${item.title}`, href: `/news/${item.id}`,
    })),
    ...events.filter((item) => item.myRegistration === 'going' || item.myRegistration === 'waitlisted').map((item): ActivityRow => ({
      id: `event-${item.id}`, icon: <CalendarCheck size={18} weight="duotone" />,
      label: `${item.myRegistration === 'going' ? 'Đã đăng ký' : 'Đang chờ'}: ${item.title}`, href: `/events/${item.id}`,
    })),
    ...checkInReports.filter((report) => report.authorName === user.name).map((report): ActivityRow => ({
      id: `report-${report.id}`, icon: <PenNib size={18} weight="duotone" />,
      label: `Đã gửi báo cáo check-in: ${report.goalTitle}`, href: `/goals/${report.goalId}`,
    })),
    ...posts.filter((post) => post.authorName === user.name).map((post): ActivityRow => ({
      id: `post-${post.id}`, icon: <Newspaper size={18} weight="duotone" />,
      label: `Đã đăng lên iKame Feed: ${post.body.slice(0, 60)}${post.body.length > 60 ? '…' : ''}`, href: '/community',
    })),
  ].slice(0, 6);

  return (
    <section className="side-info profile-section">
      <SectionHeader title="Hoạt động gần đây" />
      {rows.length === 0 ? (
        <EmptyState title="Chưa có hoạt động nào" body="Xác nhận tin tức, đăng ký sự kiện, gửi báo cáo hoặc đăng bài trong iKame Feed để thấy ở đây." />
      ) : (
        <ul className="profile-activity-list">
          {rows.map((row) => (
            <li key={row.id}>
              {row.icon}
              <Link to={row.href}>{row.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
