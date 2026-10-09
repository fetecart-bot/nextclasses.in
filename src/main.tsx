import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import StudentAppPage from './pages/StudentAppPage.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import './index.css';

const studentAppEntry = window.location.pathname.replace(/\/$/, '') === '/student-app';
if (studentAppEntry) {
  document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.setAttribute('href', '/student-app.webmanifest');
  document.title = 'NextClasses Student Portal';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        {studentAppEntry ? <StudentAppPage /> : <App />}
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Offline support could not be registered', error);
    });
  });
}
