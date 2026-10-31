import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import NetflixIntro from './components/NetflixIntro';
import Dashboard from './pages/Dashboard';
import TitlePage from './pages/TitlePage';
import WatchPage from './pages/WatchPage';
import ProfilePage from './pages/ProfilePage';
import CategoryPage from './pages/CategoryPage';
import PersonPage from './pages/PersonPage';
import CompanyPage from './pages/CompanyPage';
import LiveTvPage from './pages/LiveTvPage';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import ScrollProgress from './components/ScrollProgress';
import FilmGrainOverlay from './components/FilmGrainOverlay';
import LiquidAuroraOverlay from './components/LiquidAuroraOverlay';
import SideDock from './components/SideDock';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [fadeLoader, setFadeLoader] = useState(false);
  const [themeMaterial] = useLocalStorage('netphlix_theme_material', 'obsidian');
  const location = useLocation();

  // Scroll to top instantly on every route change (prevents getting stuck at bottom)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMaterial);
  }, [themeMaterial]);

  useEffect(() => {
    // Cinematic intro sound and logo animation
    const fadeTimer = setTimeout(() => setFadeLoader(true), 3800);
    const removeTimer = setTimeout(() => setShowLoader(false), 4500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <ToastProvider>
      {showLoader && (
        <div
          className={`fixed inset-0 z-[9999] bg-[#0f1014] transition-opacity duration-700 ${
            fadeLoader ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <NetflixIntro />
        </div>
      )}

      {/* Top 2px scroll progress & Floating Back-to-Top */}
      <ScrollProgress />

      {/* 35mm Analog Film Grain Texture Overlay */}
      <FilmGrainOverlay />

      {/* Living Chromatic Liquid Aurora Canvas (Active in liquid-glass mode) */}
      <LiquidAuroraOverlay />

      {/* VisionOS Optical Magnification Liquid Glass Side Dock */}
      <SideDock />

      {/* Global Obsidian Glass Toast Stack */}
      <ToastContainer />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/title/:type/:id" element={<TitlePage />} />
          <Route path="/movie/:id" element={<TitlePage />} />
          <Route path="/tv/:id" element={<TitlePage />} />
          <Route path="/watch/:type/:id" element={<WatchPage />} />
          <Route path="/category/:title" element={<CategoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/person/:id" element={<PersonPage />} />
          <Route path="/company/:id" element={<CompanyPage />} />
          <Route path="/live" element={<LiveTvPage />} />
        </Routes>
      </AnimatePresence>
    </ToastProvider>
  );
}
