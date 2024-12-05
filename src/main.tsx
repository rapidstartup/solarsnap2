import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexClientProvider } from './providers/ConvexClientProvider';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexClientProvider>
      <App />
    </ConvexClientProvider>
  </StrictMode>
);