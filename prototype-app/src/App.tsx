import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import { AppStateProvider, useAppState } from './AppState';
import { AppShell } from './components/AppShell';
import { ToastProvider } from './components/toast';

// Route-level code splitting — mỗi trang một chunk, initial bundle chỉ còn shell.
// Data đều là mock cục bộ nên fallback trống là đủ (không cần skeleton).
const AssistantPage = lazy(() => import('./pages/AssistantPage').then((m) => ({ default: m.AssistantPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then((m) => ({ default: m.CommunityPage })));
const EventsPage = lazy(() => import('./pages/EventPages').then((m) => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import('./pages/EventPages').then((m) => ({ default: m.EventDetailPage })));
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })));
const GoalsPage = lazy(() => import('./pages/GoalPages').then((m) => ({ default: m.GoalsPage })));
const GoalDetailPage = lazy(() => import('./pages/GoalPages').then((m) => ({ default: m.GoalDetailPage })));
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const KnowledgePage = lazy(() => import('./pages/KnowledgePages').then((m) => ({ default: m.KnowledgePage })));
const KnowledgeDetailPage = lazy(() => import('./pages/KnowledgePages').then((m) => ({ default: m.KnowledgeDetailPage })));
const ManagerPage = lazy(() => import('./pages/ManagerPage').then((m) => ({ default: m.ManagerPage })));
const MemberDetailPage = lazy(() => import('./pages/MemberDetailPage').then((m) => ({ default: m.MemberDetailPage })));
const NewsPage = lazy(() => import('./pages/NewsPages').then((m) => ({ default: m.NewsPage })));
const ArticlePage = lazy(() => import('./pages/NewsPages').then((m) => ({ default: m.ArticlePage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const RequestsPage = lazy(() => import('./pages/RequestsPage').then((m) => ({ default: m.RequestsPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })));

/** Điều hướng tiến (PUSH) cuộn về đầu trang; Back/Forward (POP) giữ nguyên vị trí (state preservation). */
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navigationType]);
  return null;
}

function PerspectiveGuard({ children, expected }: { children: React.ReactNode; expected: 'ikamer' | 'manager' }) {
  const { perspective } = useAppState();
  if (perspective !== expected) return <Navigate to={perspective === 'manager' ? '/manager/overview' : '/home'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <AppShell>
      <ScrollToTop />
      <Suspense fallback={<div className="page" aria-busy="true" />}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<PerspectiveGuard expected="ikamer"><HomePage /></PerspectiveGuard>} />
        {/* Accessible in both perspectives — no PerspectiveGuard by design. */}
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/manager" element={<Navigate to="/manager/overview" replace />} />
        <Route path="/manager/overview" element={<PerspectiveGuard expected="manager"><ManagerPage /></PerspectiveGuard>} />
        <Route path="/manager/team" element={<PerspectiveGuard expected="manager"><TeamPage /></PerspectiveGuard>} />
        <Route path="/manager/team/:memberId" element={<PerspectiveGuard expected="manager"><MemberDetailPage /></PerspectiveGuard>} />
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
      </Suspense>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppStateProvider><ToastProvider><AppRoutes /></ToastProvider></AppStateProvider>
    </BrowserRouter>
  );
}
