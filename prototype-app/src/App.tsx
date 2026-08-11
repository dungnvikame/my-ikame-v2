import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStateProvider, useAppState } from './AppState';
import { AppShell } from './components/AppShell';
import { EventDetailPage, EventsPage } from './pages/EventPages';
import { HomePage } from './pages/HomePage';
import { ManagerPage } from './pages/ManagerPage';
import { ArticlePage, NewsPage } from './pages/NewsPages';
import { NotFoundPage } from './pages/NotFoundPage';
import { SearchPage } from './pages/SearchPage';
import { TeamPage } from './pages/TeamPage';

function PerspectiveGuard({ children, expected }: { children: React.ReactNode; expected: 'ikamer' | 'manager' }) {
  const { perspective } = useAppState();
  if (perspective !== expected) return <Navigate to={perspective === 'manager' ? '/manager' : '/'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<PerspectiveGuard expected="ikamer"><HomePage /></PerspectiveGuard>} />
        <Route path="/manager" element={<PerspectiveGuard expected="manager"><ManagerPage /></PerspectiveGuard>} />
        <Route path="/manager/team" element={<PerspectiveGuard expected="manager"><TeamPage /></PerspectiveGuard>} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:postId" element={<ArticlePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
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

