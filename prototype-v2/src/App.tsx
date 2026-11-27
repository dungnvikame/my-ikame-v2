import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { FeedPage } from './pages/FeedPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { WorkPage } from './pages/WorkPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { AppsPage } from './pages/AppsPage';
import { AssistantPage } from './pages/AssistantPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SearchPage } from './pages/SearchPage';
import { ManagerOverviewPage } from './pages/ManagerOverviewPage';
import { ManagerTeamPage } from './pages/ManagerTeamPage';
import { Member360Page } from './pages/Member360Page';
import { TeamGoalsPage } from './pages/TeamGoalsPage';
import { AdminPage } from './pages/AdminPage';
import { StatusPage } from './pages/StatusPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/feed/article/:id" element={<ArticleDetailPage />} />
            {/* PRD §7.1 SH-5: Legacy redirects */}
            <Route path="/news" element={<Navigate to="/feed" replace />} />
            <Route path="/community" element={<Navigate to="/feed" replace />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/search" element={<SearchPage />} />
            {/* Manager lens */}
            <Route path="/manager/overview" element={<ManagerOverviewPage />} />
            <Route path="/manager/team" element={<ManagerTeamPage />} />
            <Route path="/manager/team/:id" element={<Member360Page />} />
            <Route path="/goals" element={<TeamGoalsPage />} />
            {/* COM Admin lens */}
            <Route path="/admin" element={<AdminPage />} />
            {/* Status pages (SH-5) */}
            <Route path="/403" element={<StatusPage code={403} />} />
            <Route path="*" element={<StatusPage code={404} />} />
          </Routes>
        </AppShell>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
