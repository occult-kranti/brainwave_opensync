import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MotionConfig } from 'framer-motion';
import './index.css';
import App from './App.tsx';
import { registerPwa } from './app/pwa';

// Router basename follows the deploy base (`/` locally, `/brainwave_opensync/`
// on GitHub Pages) so deep links and share links resolve on both.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* P0-1: framer-motion honors the OS reduced-motion setting globally. */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);

registerPwa();
