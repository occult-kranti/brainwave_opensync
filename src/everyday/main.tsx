/**
 * Open Sync Everyday — entry for app/index.html (the calm half). Same
 * session layer and engine as the lab; hash routing so the page works from
 * a static host under any base without route shells.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { MotionConfig } from 'framer-motion';
import '@fontsource-variable/inter';
import '@/index.css';
import './everyday.css';
import { SessionProvider } from '@/ui/session/SessionContext';
import { registerPwa } from '@/app/pwa';
import EverydayApp from './EverydayApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <SessionProvider>
          <EverydayApp />
        </SessionProvider>
      </HashRouter>
    </MotionConfig>
  </StrictMode>,
);

registerPwa();
