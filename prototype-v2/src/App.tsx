import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { ManagerOverviewPage } from './pages/ManagerOverviewPage';
import { ManagerTeamPage } from './pages/ManagerTeamPage';
import { Member360Page } from './pages/Member360Page';
import { ManagerTasksPage } from './pages/ManagerTasksPage';
import { SupportCenterPage } from './pages/SupportCenterPage';
import { ICheckAppPage } from './pages/ICheckAppPage';
import { IGoalAppPage } from './pages/IGoalAppPage';
import { IComClubsPage } from './pages/IComClubsPage';
import { IWikiAppPage } from './pages/IWikiAppPage';
import { FeedPage } from './pages/FeedPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { AppsPage } from './pages/AppsPage';
import { AssistantPage } from './pages/AssistantPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SearchPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';
import { StatusPage } from './pages/StatusPage';
import { WorkPage } from './pages/WorkPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell>
          <Routes>
            {/* My iKame — App Tổng: Cá nhân */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/my-requests" element={<MyRequestsPage />} />
            <Route path="/my-tasks" element={<MyTasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* My iKame — App Tổng: Quản lý */}
            <Route path="/manager/overview" element={<ManagerOverviewPage />} />
            <Route path="/manager/team" element={<ManagerTeamPage />} />
            <Route path="/manager/team/:id" element={<Member360Page />} />
            <Route path="/manager/tasks" element={<ManagerTasksPage />} />

            {/* My iKame — App Tổng: Trung tâm hỗ trợ */}
            <Route path="/support" element={<SupportCenterPage />} />
            <Route path="/support/:topic" element={<SupportCenterPage />} />

            {/* Sub-App: iCheck */}
            <Route path="/icheck" element={<ICheckAppPage />} />
            <Route path="/icheck/watchers" element={<ICheckAppPage />} />

            {/* Sub-App: iGoal */}
            <Route path="/igoal" element={<Navigate to="/igoal/my-eks" replace />} />
            <Route path="/igoal/:section" element={<IGoalAppPage />} />
            <Route path="/goals" element={<Navigate to="/igoal/team" replace />} />

            {/* Sub-App: iCom (iKame Feed, Sự kiện, Câu lạc bộ, Tổng quan COM) */}
            <Route path="/icom" element={<Navigate to="/icom/feed" replace />} />
            <Route path="/icom/feed" element={<FeedPage />} />
            <Route path="/icom/events" element={<EventsPage />} />
            <Route path="/icom/events/:id" element={<EventDetailPage />} />
            <Route path="/icom/clubs" element={<IComClubsPage />} />
            <Route path="/icom/admin" element={<AdminPage />} />
            {/* Legacy / direct aliases */}
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/feed/article/:id" element={<ArticleDetailPage />} />
            <Route path="/news" element={<Navigate to="/icom/feed" replace />} />
            <Route path="/community" element={<Navigate to="/icom/feed" replace />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />

            {/* Sub-App: iWiki */}
            <Route path="/iwiki" element={<IWikiAppPage />} />
            <Route path="/iwiki/:section" element={<IWikiAppPage />} />
            <Route path="/iwiki/space/:space" element={<IWikiAppPage />} />

            {/* Utilities */}
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/403" element={<StatusPage code={403} />} />
            <Route path="*" element={<StatusPage code={404} />} />
          </Routes>
        </AppShell>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
