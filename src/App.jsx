import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavTabs from './components/NavTabs.jsx';
import Home from './pages/Home.jsx';
import Cpu from './pages/Cpu.jsx';
import Memory from './pages/Memory.jsx';
import Disk from './pages/Disk.jsx';
import { SimulationProvider } from './context/SimulationContext.jsx';

export default function App() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <SimulationProvider>
      <div className="app-shell">
        {/* Header — hidden on homepage (it has its own hero) */}
        {!isHome && (
          <header className="app-header">
            <h1>VirtualOS Playground</h1>
            <p className="subtitle">
              Run CPU scheduling, page replacement and disk scheduling algorithms on your own input.
            </p>
            <NavTabs />
          </header>
        )}

        {/* Slim top-bar shown on homepage */}
        {isHome && (
          <div className="home-topbar">
            <span className="home-topbar-brand">VirtualOS Playground</span>
            <NavTabs />
          </div>
        )}

        {/* Main content */}
        <main className={isHome ? 'app-main-home fade-in' : 'app-main fade-in'}>
          <Routes>
            <Route path="/"       element={<Home />} />
            <Route path="/cpu"    element={<Cpu />} />
            <Route path="/memory" element={<Memory />} />
            <Route path="/disk"   element={<Disk />} />
            <Route path="*" element={
              <div className="sim-box">
                <h3>404 – Page Not Found</h3>
              </div>
            } />
          </Routes>
        </main>

        {/* Footer */}
        {!isHome && (
          <footer className="app-footer">
            © 2026 VirtualOS Playground – Educational tool for OS concepts
          </footer>
        )}
      </div>
    </SimulationProvider>
  );
}
