import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Self-host Inter (variable, latin + vietnamese) — trước đây token khai báo Inter
// nhưng không load font nào, toàn app render Segoe UI fallback tùy máy.
import '@fontsource-variable/inter/index.css';
import './styles/core-ds-1.1.css';
import './styles/app.css';
import './styles/assistant.css';
import './styles/assistant-page.css';
import './styles/knowledge-goals.css';
import './styles/manager-vision.css';
import './styles/manager-team.css';
import './styles/search-palette.css';
import './styles/community.css';
import './styles/events-v2.css';
import './styles/goals-v2.css';
import './styles/profile-v2.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
