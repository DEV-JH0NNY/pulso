import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './app/App';
import { UpdatePrompt } from './ui/components/UpdatePrompt';
import { initTheme } from './ui/theme';
import { requestPersistentStorage } from './data/storage';

initTheme();
void requestPersistentStorage();

const root = document.getElementById('root');
if (!root) throw new Error('No se encontró el elemento #root');

createRoot(root).render(
  <StrictMode>
    <App />
    <UpdatePrompt />
  </StrictMode>,
);
