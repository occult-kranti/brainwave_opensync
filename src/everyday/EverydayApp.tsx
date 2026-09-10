/**
 * Everyday shell: three tabs (Play / Sounds / Settings) + About, the advisory
 * sheet mounted once above every screen, and the fixed tab bar.
 */

import { Navigate, Route, Routes } from 'react-router';
import { EverydayProvider } from './state';
import { TabBar } from './components/TabBar';
import { AdvisorySheet } from './components/AdvisorySheet';
import Play from './screens/Play';
import Sounds from './screens/Sounds';
import Settings from './screens/Settings';
import About from './screens/About';

export default function EverydayApp() {
  return (
    <EverydayProvider>
      <div className="ev" data-testid="everyday">
        <main>
          <Routes>
            <Route path="/" element={<Play />} />
            <Route path="/sounds" element={<Sounds />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <AdvisorySheet />
        <TabBar />
      </div>
    </EverydayProvider>
  );
}
