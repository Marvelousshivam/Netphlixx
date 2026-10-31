import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Settings, Dices } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '../hooks/useLocalStorage';
import MovieRoulette from './MovieRoulette';
import SettingsCommandModal from './SettingsCommandModal';
import { haptics } from '../utils/audioHaptics';
import { squishTap } from '../utils/motionSprings';

export default function Navbar({
  onSearch,
  activeTab = 'Home',
  setActiveTab,
  isSearchOpen = false,
  setIsSearchOpen,
  searchQuery = '',
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [accentColor] = useLocalStorage('netphlix_accent', '#E50914');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  // Global hotkey '/' to focus search
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        haptics.playClick();
        if (location.pathname !== '/') {
          navigate('/?search=true');
        } else if (setIsSearchOpen) {
          setIsSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [location.pathname, setIsSearchOpen, navigate]);

  const handleSearchToggle = () => {
    haptics.playClick();
    if (isSearchOpen || searchQuery) {
      if (setIsSearchOpen) setIsSearchOpen(false);
      if (onSearch) onSearch('');
    } else {
      if (location.pathname !== '/') {
        navigate('/?search=true');
      } else if (setIsSearchOpen) {
        setIsSearchOpen(true);
      }
    }
  };

  const handleDestinationClick = (dest) => {
    haptics.playClick();
    if (setActiveTab) setActiveTab(dest);
    if (setIsSearchOpen) setIsSearchOpen(false);
    if (onSearch) onSearch('');

    if (location.pathname !== '/') {
      navigate('/', { state: { activeTab: dest } });
    }
  };

  const navDestinations = [
    { label: 'Home', value: 'Home' },
    { label: 'Movies', value: 'Movies' },
    { label: 'Shows', value: 'TV Shows' },
    { label: 'My List', value: 'My List' },
  ];

  const currentTab =
    activeTab === 'TV Shows' || activeTab === 'Shows' || activeTab === 'TV'
      ? 'TV Shows'
      : activeTab;

  return (
    <>
      {/* Top Floating Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-10 pt-3 md:pt-4 pointer-events-none select-none">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          {/* Brand Logo (Top Left) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleDestinationClick('Home')}
            className="pointer-events-auto cursor-pointer flex items-center space-x-2 py-1"
          >
            <h1 className="font-black text-xl md:text-2xl tracking-tighter text-[#E50914] font-display hover:opacity-90 transition-opacity flex items-center space-x-1.5">
              <span>NETPHLIX</span>
              <span className="nothing-rec-dot nothing-logo-dot" />
            </h1>
          </motion.div>

          {/* Desktop Rock-Solid Pill Navigation (Zero Layout Reflow, Zero Jitter) */}
          <div className="hidden md:flex items-center space-x-3 pointer-events-auto">
            <nav
              aria-label="Primary Navigation"
              className="apple-glass-pill rounded-full p-1.5 flex items-center shadow-xl select-none"
            >
              {/* Destination Tabs with Stable Fixed Positions */}
              <div className="flex items-center space-x-1">
                {navDestinations.map((dest) => {
                  const isActive =
                    currentTab === dest.value ||
                    (dest.value === 'Home' && !currentTab && location.pathname === '/');

                  return (
                    <motion.button
                      key={dest.value}
                      whileHover={{ y: -1 }}
                      whileTap={squishTap}
                      onClick={() => handleDestinationClick(dest.value)}
                      className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer select-none ${
                        isActive
                          ? 'is-active-tab text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNavTab"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          className="nav-active-pill"
                        />
                      )}
                      <span className="relative z-10">{dest.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Utility Actions (Clean spacing, zero harsh divider sticks) */}
              <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-white/10">
                {/* Search Toggle */}
                <motion.button
                  whileHover={{ y: -1, scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSearchToggle}
                  className={`w-8 h-8 rounded-full m3-icon-badge-a flex items-center justify-center transition-colors cursor-pointer ${
                    isSearchOpen || searchQuery
                      ? 'bg-white/25 text-white border border-white/25 shadow-sm'
                      : 'text-white/65 hover:text-white hover:bg-white/[0.08]'
                  }`}
                  title="Search (/)"
                  aria-label="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </motion.button>

                {/* Movie Roulette */}
                <motion.button
                  whileHover={{ y: -1, scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    haptics.playClick();
                    setShowRoulette(true);
                  }}
                  className="w-8 h-8 rounded-full m3-icon-badge-b text-white/65 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
                  title="Movie Roulette"
                  aria-label="Movie Roulette"
                >
                  <Dices className="w-3.5 h-3.5" />
                </motion.button>

                {/* Settings Command Modal */}
                <motion.button
                  whileHover={{ y: -1, scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    haptics.playClick();
                    setShowSettings(true);
                  }}
                  className="w-8 h-8 rounded-full m3-icon-badge-a text-white/65 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
                  title="Settings & Materials"
                  aria-label="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </nav>
          </div>

          {/* Mobile Top Header Actions */}
          <div className="md:hidden flex items-center space-x-2 pointer-events-auto">
            <motion.button
              whileTap={squishTap}
              onClick={handleSearchToggle}
              className={`w-9 h-9 rounded-full m3-icon-badge-a flex items-center justify-center shadow-md transition-colors ${
                isSearchOpen || searchQuery
                  ? 'bg-white/25 text-white border border-white/25'
                  : 'apple-glass-pill text-white/80 hover:text-white'
              }`}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={squishTap}
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 rounded-full m3-icon-badge-b apple-glass-pill text-white/80 hover:text-white flex items-center justify-center shadow-md"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Pill Navigation (Bottom Center, Thumb-Friendly) */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none select-none pb-[env(safe-area-inset-bottom)]">
        <nav className="pointer-events-auto apple-glass-pill rounded-full p-1.5 flex items-center space-x-1 shadow-2xl max-w-xs w-full justify-around">
          {navDestinations.map((dest) => {
            const isActive =
              currentTab === dest.value ||
              (dest.value === 'Home' && !currentTab && location.pathname === '/');

            return (
              <button
                key={dest.value}
                onClick={() => handleDestinationClick(dest.value)}
                className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors z-10 ${
                  isActive ? 'is-active-tab text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMobileNavTab"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="nav-active-pill"
                  />
                )}
                <span className="relative z-10">{dest.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Command Center Modal */}
      <SettingsCommandModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Movie Roulette Modal */}
      {showRoulette && <MovieRoulette onClose={() => setShowRoulette(false)} />}
    </>
  );
}
