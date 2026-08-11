import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStateProvider, useAppState } from './AppState';
import { AppShell } from './components/AppShell';
import { EventDetailPage, EventsPage } from './pages/EventPages';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { GoalDetailPage, GoalsPage } from './pages/GoalPages';
import { HomePage } from './pages/HomePage';
import { KnowledgeDetailPage, KnowledgePage } from './pages/KnowledgePages';
import { ManagerPage } from './pages/ManagerPage';
import { ArticlePage, NewsPage } from './pages/NewsPages';
import { NotFoundPage } from './pages/NotFoundPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { TeamPage } from './pages/TeamPage';

function PerspectiveGuard({ children, expected }: { children: React.ReactNode; expected: 'ikamer' | 'manager' }) {
  const { perspective } = useAppState();
  if (perspective !== expected) return <Navigate to={perspective === 'manager' ? '/manager/overview' : '/home'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<PerspectiveGuard expected="ikamer"><HomePage /></PerspectiveGuard>} />
        <Route path="/manager" element={<Navigate to="/manager/overview" replace />} />
        <Route path="/manager/overview" element={<PerspectiveGuard expected="manager"><ManagerPage /></PerspectiveGuard>} />
        <Route path="/manager/team" element={<PerspectiveGuard expected="manager"><TeamPage /></PerspectiveGuard>} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:postId" element={<ArticlePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/knowledge/:documentId" element={<KnowledgeDetailPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/goals/:goalId" element={<GoalDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppStateProvider><AppRoutes /></AppStateProvider>
    </BrowserRouter>
  );
}
