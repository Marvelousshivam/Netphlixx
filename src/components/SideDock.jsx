import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  Home,
  Film,
  Tv,
  Dices,
  Bookmark,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { haptics } from '../utils/audioHaptics';
import { squishTap } from '../utils/motionSprings';
import MovieRoulette from './MovieRoulette';
import SettingsCommandModal from './SettingsCommandModal';

// Vertical Optical Magnification Dock Item for Side Rail (liquidglass.dev inspired)
function SideDockItem({
  mouseY,
  item,
  isActive,
  onClick,
}) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseY, (val) => {
    if (val === null || val === undefined || !isFinite(val)) return 9999;
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds || bounds.height === 0) return 9999;
    return val - bounds.y - bounds.height / 2;
  });

  // Dynamic Gaussian height and scale expansion
  const sizeSync = useTransform(distance, [-90, 0, 90], [42, 58, 42]);
  const size = useSpring(sizeSync, { mass: 0.08, stiffness: 480, damping: 28 });

  const scaleSync = useTransform(distance, [-90, 0, 90], [1, 1.28, 1]);
  const scale = useSpring(scaleSync, { mass: 0.08, stiffness: 480, damping: 28 });

  // Floating horizontal protrusion towards screen center
  const xSync = useTransform(distance, [-90, 0, 90], [0, 8, 0]);
  const x = useSpring(xSync, { mass: 0.08, stiffness: 480, damping: 28 });

  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      style={{ height: size, width: size, scale, x }}
      className="relative flex items-center justify-center flex-none origin-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        onClick={onClick}
        whileTap={squishTap}
        aria-label={item.label}
        title={item.label}
        className={`w-full h-full rounded-[14px] flex items-center justify-center cursor-pointer transition-shadow relative overflow-hidden shadow-lg border border-white/20 select-none ${item.gradient}`}
      >
        {/* Optical Glass Meniscus Highlight on Top Half */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-[13px]" />

        {/* Inner Refractive Rim */}
        <div className="absolute inset-0 rounded-[14px] border-t border-white/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),inset_0_-1px_1.5px_rgba(0,0,0,0.3)] pointer-events-none" />

        {/* Icon */}
        <Icon className="w-5 h-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] z-10" />

        {/* Active Indicator Pip */}
        {isActive && (
          <motion.div
            layoutId="sideDockActivePip"
            className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-white rounded-r-full shadow-[0_0_8px_white]"
          />
        )}
      </motion.button>

      {/* Floating Tooltip Lozenge */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="pointer-events-none absolute left-full ml-3 px-3 py-1.5 rounded-xl apple-glass text-white text-xs font-bold tracking-wide whitespace-nowrap shadow-2xl z-50 border border-white/25 flex items-center space-x-2"
          >
            <span>{item.label}</span>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white/90 uppercase tracking-widest font-mono">
                {item.badge}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SideDock({ activeTab = 'Home', setActiveTab, onSearch }) {
  const [dockLayout] = useLocalStorage('netphlix_dock_layout', 'top');
  const [isCollapsed, setIsCollapsed] = useLocalStorage('netphlix_sidedock_collapsed', false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const dockRef = useRef(null);
  const mouseY = useMotionValue(Infinity);
  const lensY = useMotionValue(0);
  const lensOpacity = useMotionValue(0);
  const smoothLensY = useSpring(lensY, { mass: 0.08, stiffness: 600, damping: 32 });
  const smoothLensOpacity = useSpring(lensOpacity, { mass: 0.08, stiffness: 450, damping: 28 });

  // Only render if enabled in dock layout settings and on desktop viewports
  if (dockLayout === 'top') {
    return null;
  }

  const handleMouseMove = (e) => {
    mouseY.set(e.clientY);
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      lensY.set(e.clientY - rect.top);
      lensOpacity.set(1);
    }
  };

  const handleMouseLeave = () => {
    mouseY.set(Infinity);
    lensOpacity.set(0);
  };

  const handleNavigate = (val) => {
    haptics.playClick();
    if (setActiveTab) setActiveTab(val);
    if (location.pathname !== '/') {
      navigate('/', { state: { activeTab: val } });
    }
  };

  const items = [
    {
      id: 'Home',
      label: 'Home Feed',
      icon: Home,
      gradient: 'bg-gradient-to-br from-[#E50914] via-[#D00812] to-[#99050C]',
      action: () => handleNavigate('Home'),
    },
    {
      id: 'Movies',
      label: 'Feature Films',
      icon: Film,
      gradient: 'bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8]',
      action: () => handleNavigate('Movies'),
    },
    {
      id: 'TV Shows',
      label: 'Series & Anime',
      icon: Tv,
      gradient: 'bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857]',
      action: () => handleNavigate('TV Shows'),
    },
    {
      id: 'My List',
      label: 'My Watchlist',
      icon: Bookmark,
      gradient: 'bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309]',
      action: () => handleNavigate('My List'),
    },
    {
      id: 'Roulette',
      label: 'Film Roulette',
      icon: Dices,
      badge: 'Dice',
      gradient: 'bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9]',
      action: () => {
        haptics.playClick();
        setShowRoulette(true);
      },
    },
    {
      id: 'Search',
      label: 'Spotlight Search',
      icon: Search,
      badge: '/',
      gradient: 'bg-gradient-to-br from-[#06B6D4] via-[#0284C7] to-[#0369A1]',
      action: () => {
        haptics.playClick();
        if (location.pathname !== '/') {
          navigate('/?search=true');
        } else if (onSearch) {
          onSearch('');
        }
      },
    },
    {
      id: 'Settings',
      label: 'Optics & Lab',
      icon: Settings,
      gradient: 'bg-gradient-to-br from-[#64748B] via-[#475569] to-[#334155]',
      action: () => {
        haptics.playClick();
        setShowSettings(true);
      },
    },
  ];

  const currentTab =
    activeTab === 'TV Shows' || activeTab === 'Shows' || activeTab === 'TV'
      ? 'TV Shows'
      : activeTab;

  return (
    <>
      <aside
        aria-label="Liquid Glass Quick Dock"
        className="hidden xl:flex fixed left-5 top-1/2 -translate-y-1/2 z-40 select-none flex-col items-center pointer-events-auto"
      >
        <div className="relative group">
          {/* Main Vertical Frosted Glass Rail */}
          <motion.div
            ref={dockRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ width: isCollapsed ? 28 : 62 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className={`relative rounded-[26px] p-2 flex flex-col items-center space-y-3 apple-glass border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-3xl transition-colors ${
              isCollapsed ? 'opacity-60 hover:opacity-100 overflow-hidden' : 'overflow-visible'
            }`}
          >
            {/* Specular Liquid Glass Lens Puck (Vertical Gliding Highlight) */}
            {!isCollapsed && (
              <motion.div
                style={{
                  y: smoothLensY,
                  opacity: smoothLensOpacity,
                  translateY: '-50%',
                }}
                className="pointer-events-none absolute left-1 right-1 h-14 rounded-2xl -z-0 bg-gradient-to-r from-white/25 via-white/10 to-white/15 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.4),inset_0_1.5px_1px_rgba(255,255,255,0.8)] backdrop-blur-sm"
              />
            )}

            {!isCollapsed ? (
              items.map((item) => {
                const isActive =
                  currentTab === item.id ||
                  (item.id === 'Home' && !currentTab && location.pathname === '/');

                return (
                  <SideDockItem
                    key={item.id}
                    mouseY={mouseY}
                    item={item}
                    isActive={isActive}
                    onClick={item.action}
                  />
                );
              })
            ) : (
              <div className="py-4 flex flex-col items-center space-y-2">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <div className="w-2 h-2 rounded-full bg-white/40" />
              </div>
            )}

            {/* Collapse/Expand Toggle Pill */}
            <motion.button
              whileTap={squishTap}
              onClick={() => {
                haptics.playClick();
                setIsCollapsed(!isCollapsed);
              }}
              title={isCollapsed ? 'Expand Dock' : 'Collapse Dock'}
              aria-label={isCollapsed ? 'Expand Dock' : 'Collapse Dock'}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15 mt-1"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </motion.button>
          </motion.div>
        </div>
      </aside>

      {/* Settings Modal */}
      <SettingsCommandModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Movie Roulette Modal */}
      {showRoulette && <MovieRoulette onClose={() => setShowRoulette(false)} />}
    </>
  );
}
