import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initCloudSync } from './lib/cloudSync';
import './index.css';

void initCloudSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
