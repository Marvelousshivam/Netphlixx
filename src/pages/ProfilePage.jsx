import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bookmark,
  ThumbsUp,
  History,
  Clock,
  Flame,
  Sparkles,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { haptics } from '../utils/audioHaptics';
import { squishTap, squishHover } from '../utils/motionSprings';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RowCard from '../components/RowCard';

function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type) return item.media_type;
  if (item.first_air_date || item.name) return 'tv';
  return 'movie';
}

export default function ProfilePage() {
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const [likedMovies, setLikedMovies] = useLocalStorage('netphlix_liked', []);
  const [watchHistory, setWatchHistory] = useLocalStorage('netphlix_watchHistory', []);
  const [activeTab, setActiveTab] = useState('watchlist'); // 'watchlist', 'history', 'liked'
  const navigate = useNavigate();
  const location = useLocation();

  const removeFromList = (id) => {
    haptics.playClick();
    setMyList((prev) => prev.filter((m) => m.id !== id));
  };

  const removeFromLiked = (id) => {
    haptics.playClick();
    setLikedMovies((prev) => prev.filter((m) => m.id !== id));
  };

  const clearHistory = () => {
    haptics.playClick();
    setWatchHistory([]);
  };

  const onNavigate = (movie, action) => {
    haptics.playClick();
    const mediaType = getMediaType(movie);
    if (action === 'play') {
      navigate(`/watch/${mediaType}/${movie.id}`, {
        state: { from: location.pathname + location.search },
      });
    } else {
      navigate(`/title/${mediaType}/${movie.id}`, {
        state: { movie, from: location.pathname + location.search },
      });
    }
  };

  // Estimated total hours streamed
  const totalHoursStreamed = Math.round(
    watchHistory.reduce((acc, m) => {
      const durHours = m.duration ? m.duration / 3600 : 1.75;
      return acc + durHours;
    }, 0)
  );

  const tabs = [
    { id: 'watchlist', label: 'My Watchlist', count: myList.length, icon: Bookmark },
    { id: 'history', label: 'Viewing History', count: watchHistory.length, icon: History },
    { id: 'liked', label: 'Favorites', count: likedMovies.length, icon: ThumbsUp },
  ];

  const currentItems =
    activeTab === 'watchlist' ? myList : activeTab === 'history' ? watchHistory : likedMovies;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-[#07080B] text-white pt-24 md:pt-28 px-4 md:px-12 pb-20 select-none font-sans overflow-x-hidden"
    >
      <Navbar />

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* 1. VISIONOS CINEMA LIBRARY HERO HEADER */}
        <div className="relative rounded-3xl apple-glass p-6 md:p-8 shadow-2xl overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Avatar Lens + Identity */}
            <div className="flex items-center space-x-5">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full apple-glass flex items-center justify-center border border-t-white/40 border-white/10 shadow-xl flex-none">
                <User className="w-8 h-8 md:w-10 md:h-10 text-white/90" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#07080B] flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider apple-glass-pill uppercase text-white/90">
                    Cinema Patron
                  </span>
                  <span className="text-xs text-[#8a8a93] font-medium">Pro Subscriber</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold font-display tracking-tight text-white mt-1">
                  Personal Cinema Library
                </h1>
                <p className="text-xs text-[#8a8a93] mt-0.5 font-medium">
                  Curated collection, personal history, and sync across your devices
                </p>
              </div>
            </div>

            {/* Right: 3 VisionOS Optical Stat Rings */}
            <div className="flex items-center space-x-3 sm:space-x-4 flex-wrap">
              {/* Metric 1: Streamed Titles */}
              <div className="flex-1 sm:flex-none apple-glass-pill px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-md min-w-[120px]">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-none">
                  <History className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8a8a93] block">
                    Watched
                  </span>
                  <span className="text-base md:text-lg font-black text-white">
                    {watchHistory.length}
                  </span>
                </div>
              </div>

              {/* Metric 2: Watchlist */}
              <div className="flex-1 sm:flex-none apple-glass-pill px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-md min-w-[120px]">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-none">
                  <Bookmark className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8a8a93] block">
                    Watchlist
                  </span>
                  <span className="text-base md:text-lg font-black text-white">{myList.length}</span>
                </div>
              </div>

              {/* Metric 3: Hours Logged */}
              <div className="flex-1 sm:flex-none apple-glass-pill px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-md min-w-[120px]">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-none">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8a8a93] block">
                    Hours
                  </span>
                  <span className="text-base md:text-lg font-black text-white">
                    {totalHoursStreamed}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SEGMENTED LIQUID GLASS TAB BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div className="inline-flex p-1 rounded-full apple-glass border border-t-white/30 border-white/[0.08] shadow-md">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileTap={squishTap}
                  whileHover={squishHover}
                  onClick={() => {
                    haptics.playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-semibold transition-colors flex items-center space-x-2 cursor-pointer z-10 squish-btn ${
                    isActive ? 'text-[#07080B] font-bold' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="profileActiveTab"
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className="absolute inset-0 bg-white rounded-full -z-10 shadow-md"
                    />
                  )}
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-black/15 text-[#07080B]' : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {tab.count}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {activeTab === 'history' && watchHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full apple-glass-pill text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* 3. MEDIA CARDS GRID OR BESPOKE EMPTY STATE */}
        <AnimatePresence mode="wait">
          {currentItems.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
            >
              {currentItems.map((movie) => (
                <div key={movie.id} className="w-full">
                  <RowCard
                    movie={movie}
                    isLargeRow={true}
                    isTop10={false}
                    onNavigate={onNavigate}
                    onRemove={
                      activeTab === 'watchlist'
                        ? () => removeFromList(movie.id)
                        : activeTab === 'liked'
                        ? () => removeFromLiked(movie.id)
                        : undefined
                    }
                  />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="apple-glass rounded-3xl p-10 md:p-14 text-center max-w-xl mx-auto shadow-2xl space-y-4 my-8"
            >
              <div className="w-14 h-14 rounded-2xl apple-glass-pill flex items-center justify-center mx-auto shadow-inner">
                {activeTab === 'watchlist' ? (
                  <Bookmark className="w-6 h-6 text-white/50" />
                ) : activeTab === 'history' ? (
                  <History className="w-6 h-6 text-white/50" />
                ) : (
                  <Flame className="w-6 h-6 text-white/50" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  {activeTab === 'watchlist'
                    ? 'Your Watchlist is pristine'
                    : activeTab === 'history'
                    ? 'No titles streamed yet'
                    : 'No favorite titles recorded'}
                </h3>
                <p className="text-xs text-[#8a8a93] mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                  {activeTab === 'watchlist'
                    ? 'Save movies and series you want to watch later by tapping the Plus button on any title.'
                    : activeTab === 'history'
                    ? 'Titles you start watching will automatically appear here with resumed playback timestamps.'
                    : 'Like films and shows while browsing to craft your personal cinema recommendations.'}
                </p>
              </div>

              <div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    haptics.playClick();
                    navigate('/');
                  }}
                  className="cta-shine inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold bg-white text-[#07080B] hover:opacity-90 shadow-xl cursor-pointer"
                >
                  <span>Explore Cinema Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </motion.div>
  );
}
