import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Star, Calendar, Clock, Film, Check } from 'lucide-react';
import { UNIVERSES } from '../data/universesData';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const detailsCache = new Map();

export default function UniverseHubs() {
  const navigate = useNavigate();
  const [selectedUniverse, setSelectedUniverse] = useState(null);
  const [activePhase, setActivePhase] = useState('all');
  const [orderMode, setOrderMode] = useState('chrono'); // 'chrono' or 'release'
  const [enrichedMovies, setEnrichedMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  // Watch history for checking completed movies
  const [watchedIds] = useState(() => {
    try {
      const history = JSON.parse(localStorage.getItem('netphlix_watchHistory') || '[]');
      return new Set(history.map((m) => m.id));
    } catch {
      return new Set();
    }
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedUniverse) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedUniverse]);

  // When a universe is selected, load its posters & metadata
  useEffect(() => {
    if (!selectedUniverse) {
      setEnrichedMovies([]);
      return;
    }

    let isCancelled = false;
    async function loadUniverseMovies() {
      setLoadingMovies(true);
      setActivePhase('all');

      const moviesToFetch = selectedUniverse.movies;
      const enriched = await Promise.all(
        moviesToFetch.map(async (item) => {
          if (detailsCache.has(item.id)) {
            return { ...item, ...detailsCache.get(item.id) };
          }
          try {
            const res = await fetch(`${BASE_URL}/movie/${item.id}?api_key=${API_KEY}`);
            if (res.ok) {
              const data = await res.json();
              if (data.adult) return null;
              let cleanPoster = item.poster_path || data.poster_path;
              if (data.poster_path === '/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg') {
                cleanPoster = '/mFzFJc1XnGqaEbyac2KcCFJx8Uo.jpg';
              } else if (data.poster_path === '/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg') {
                cleanPoster = '/1brq8q3u1GmS5Sef2FkNwImrHWT.jpg';
              }
              const meta = {
                poster_path: cleanPoster,
                backdrop_path: item.backdrop_path || data.backdrop_path,
                overview: data.overview,
                vote_average: data.vote_average,
                release_date: data.release_date || item.releaseDate,
                runtime: data.runtime,
              };
              detailsCache.set(item.id, meta);
              return { ...item, ...meta };
            }
          } catch {
            // ignore
          }
          return item;
        })
      );

      if (!isCancelled) {
        setEnrichedMovies(enriched.filter(Boolean));
        setLoadingMovies(false);
      }
    }

    loadUniverseMovies();
    return () => {
      isCancelled = true;
    };
  }, [selectedUniverse]);

  const sortedMovies = [...enrichedMovies].sort((a, b) => {
    if (orderMode === 'chrono') {
      return (a.chronoOrder || 999) - (b.chronoOrder || 999);
    }
    const dateA = a.release_date || `${a.year}-01-01`;
    const dateB = b.release_date || `${b.year}-01-01`;
    return new Date(dateA) - new Date(dateB);
  });

  const filteredMovies =
    activePhase === 'all' ? sortedMovies : sortedMovies.filter((m) => m.phase === activePhase);

  const firstMovie = sortedMovies.length > 0 ? sortedMovies[0] : null;

  return (
    <div className="pl-4 md:pl-12 pr-4 md:pr-12 my-6 md:my-8 group relative z-20 select-none">
      {/* Rail Heading (Outfit 600) */}
      <div className="flex items-center justify-between mb-3.5 pr-4 md:pr-12">
        <h2 className="text-base md:text-lg font-semibold font-display tracking-tight text-white">
          Cinematic Universes
        </h2>
        <span className="text-xs text-[#8a8a93] font-medium hidden sm:inline">Explore timelines & watch orders</span>
      </div>

      {/* Universe Hub Brand Tiles - Disney+ / Apple TV+ Studio Tile Architecture */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {UNIVERSES.map((universe) => (
          <motion.div
            key={universe.id}
            whileHover={{ y: -5, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            onClick={() => setSelectedUniverse(universe)}
            className="group relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer frost-panel hover:border-white/40 hover:ring-1 hover:ring-white/20 hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)] transition-all shadow-md"
          >
            {/* Background banner */}
            <img
              src={universe.banner}
              alt={universe.name}
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500 filter brightness-90"
            />
            {/* Vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-transparent" />

            {/* Content stack */}
            <div className="relative z-10 h-full flex flex-col justify-between p-3.5">
              <span className="self-start text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full frost-pill text-white/80">
                {universe.badge}
              </span>
              <div>
                <h3 className="text-white font-bold text-sm leading-tight font-display drop-shadow">
                  {universe.shortName}
                </h3>
                <span className="text-[11px] text-[#8a8a93] font-medium">
                  {universe.movies.length} Films
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Universe Explorer Modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedUniverse && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.96, y: 8, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="relative w-full h-full max-w-6xl max-h-[90vh] frost-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
                >
                  {/* Close Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.08 }}
                    onClick={() => setSelectedUniverse(null)}
                    className="absolute top-4 right-4 z-40 w-9 h-9 rounded-full frost-pill text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>

                  {/* Modal Hero Banner - Compact & Cinematic */}
                  <div className="relative h-36 sm:h-44 w-full flex-none overflow-hidden">
                    <img
                      src={selectedUniverse.banner}
                      alt={selectedUniverse.name}
                      className="w-full h-full object-cover filter brightness-[0.75]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014]/80 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-6 sm:left-8 right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      <div className="max-w-xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full frost-pill text-white/90 inline-block mb-1.5">
                          {selectedUniverse.badge}
                        </span>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-display tracking-tight drop-shadow leading-tight">
                          {selectedUniverse.name}
                        </h2>
                        <p className="text-white/70 text-xs mt-0.5 line-clamp-1 max-w-lg hidden sm:block">
                          {selectedUniverse.description}
                        </p>
                      </div>

                      {firstMovie && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.03 }}
                          onClick={() => {
                            setSelectedUniverse(null);
                            navigate(`/watch/movie/${firstMovie.id}`);
                          }}
                          className="flex-none flex items-center px-4 py-2 rounded-full bg-white text-[#0f1014] font-bold text-xs sm:text-sm shadow-md transition-all hover:opacity-90 active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-[#0f1014] mr-1.5" />
                          <span>Start Marathon (#1)</span>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Controls & Phase Filter Bar */}
                  <div className="bg-[#12141a]/95 border-y border-white/[0.08] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-none">
                    {/* Phase Filter Pills with Genjutsu Glide */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-hide py-1">
                      {selectedUniverse.phases.map((p) => {
                        const isActive = activePhase === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setActivePhase(p.id)}
                            className={`relative text-xs font-semibold px-3 py-1 rounded-full transition-colors flex-none z-10 ${
                              isActive
                                ? 'text-[#0f1014] font-bold'
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="hubPhaseLozenge"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                              />
                            )}
                            <span>{p.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Story Chronology vs Release Order Toggle (White Lozenge Active Style with Genjutsu Glide) */}
                    <div className="frost-pill p-1 rounded-full flex items-center space-x-1 relative">
                      <button
                        onClick={() => setOrderMode('chrono')}
                        className={`relative px-3 py-1 text-xs font-semibold rounded-full transition-colors flex items-center z-10 ${
                          orderMode === 'chrono'
                            ? 'text-[#0f1014] font-bold'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {orderMode === 'chrono' && (
                          <motion.div
                            layoutId="hubOrderLozenge"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                          />
                        )}
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Story Order</span>
                      </button>
                      <button
                        onClick={() => setOrderMode('release')}
                        className={`relative px-3 py-1 text-xs font-semibold rounded-full transition-colors flex items-center z-10 ${
                          orderMode === 'release'
                            ? 'text-[#0f1014] font-bold'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {orderMode === 'release' && (
                          <motion.div
                            layoutId="hubOrderLozenge"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                          />
                        )}
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Release Order</span>
                      </button>
                    </div>
                  </div>

                  {/* Movies Grid */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 scrollbar-hide">
                    {loadingMovies ? (
                      <div className="flex items-center justify-center py-20 text-[#8a8a93] text-sm">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                        Loading universe timeline...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {filteredMovies.map((movie, index) => {
                          const isWatched = watchedIds.has(movie.id);
                          const isUpcoming =
                            movie.upcoming ||
                            new Date(movie.release_date || `${movie.year}-12-31`) > new Date();
                          const orderNum =
                            orderMode === 'chrono'
                              ? movie.chronoOrder || index + 1
                              : movie.releaseOrder || index + 1;

                          return (
                            <motion.div
                              key={movie.id}
                              whileHover={{ y: -6, scale: 1.035 }}
                              whileTap={{ scale: 0.97 }}
                              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                              onClick={() => {
                                setSelectedUniverse(null);
                                navigate(
                                  isUpcoming
                                    ? `/title/movie/${movie.id}`
                                    : `/watch/movie/${movie.id}`
                                );
                              }}
                              className="group relative cursor-pointer flex flex-col rounded-xl overflow-hidden bg-[#14151b] border border-white/[0.08] hover:border-white/30 hover:ring-1 hover:ring-white/20 hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)] transition-all shadow-md"
                            >
                              {/* Sequence number / status badge */}
                              <div className="absolute top-2 left-2 z-20">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                                    isUpcoming
                                      ? 'frost-pill text-[#ffb800] border-white/20'
                                      : 'frost-pill text-white'
                                  }`}
                                >
                                  {isUpcoming ? 'Soon' : `#${orderNum}`}
                                </span>
                              </div>

                              {isWatched && (
                                <div className="absolute top-2 right-2 z-20 bg-white text-[#0f1014] text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center">
                                  <Check className="w-2.5 h-2.5 mr-0.5" /> Done
                                </div>
                              )}

                              <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181a22]">
                                {movie.poster_path ? (
                                  <img
                                    src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`}
                                    alt={movie.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#14151b]">
                                    <Film className="w-6 h-6 text-white/40 mb-2" />
                                    <span className="text-xs text-white/80 font-bold leading-tight line-clamp-3">
                                      {movie.title}
                                    </span>
                                    {movie.year && (
                                      <span className="text-[10px] text-[#8a8a93] mt-1 font-semibold">
                                        {movie.year}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Hover Play Overlay */}
                                <div className="absolute inset-0 bg-[#0f1014]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="w-9 h-9 rounded-full bg-white text-[#0f1014] flex items-center justify-center shadow-lg">
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  </div>
                                </div>
                              </div>

                              {/* Card Text */}
                              <div className="p-2.5 flex flex-col justify-between flex-1 bg-[#14151b]">
                                <h4 className="text-xs font-semibold text-white/90 line-clamp-1 group-hover:text-white transition-colors">
                                  {movie.title}
                                </h4>
                                <div className="flex items-center justify-between text-[11px] text-[#8a8a93] mt-1 font-medium">
                                  <span>
                                    {movie.year ||
                                      (movie.release_date &&
                                        movie.release_date.substring(0, 4)) ||
                                      'TBA'}
                                  </span>
                                  {movie.vote_average > 0 && (
                                    <span className="text-white/80 font-medium flex items-center">
                                      <Star className="w-2.5 h-2.5 fill-[#ffb800] text-[#ffb800] mr-1" />
                                      {movie.vote_average.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
