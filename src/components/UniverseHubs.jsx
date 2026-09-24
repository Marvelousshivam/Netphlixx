import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Star, Calendar, Clock, Film, Sparkles, ChevronRight, Check } from 'lucide-react';
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
      return new Set(history.map(m => m.id));
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
              const meta = {
                poster_path: data.poster_path,
                backdrop_path: data.backdrop_path,
                overview: data.overview,
                vote_average: data.vote_average,
                release_date: data.release_date || item.releaseDate,
                runtime: data.runtime
              };
              detailsCache.set(item.id, meta);
              return { ...item, ...meta };
            }
          } catch (e) {}
          return item;
        })
      );

      if (!isCancelled) {
        setEnrichedMovies(enriched);
        setLoadingMovies(false);
      }
    }

    loadUniverseMovies();
    return () => { isCancelled = true; };
  }, [selectedUniverse]);

  const sortedMovies = [...enrichedMovies].sort((a, b) => {
    if (orderMode === 'chrono') {
      return (a.chronoOrder || 999) - (b.chronoOrder || 999);
    }
    const dateA = a.release_date || `${a.year}-01-01`;
    const dateB = b.release_date || `${b.year}-01-01`;
    return new Date(dateA) - new Date(dateB);
  });

  const filteredMovies = activePhase === 'all'
    ? sortedMovies
    : sortedMovies.filter(m => m.phase === activePhase);

  // First movie for Marathon button
  const firstMovie = sortedMovies.length > 0 ? sortedMovies[0] : null;

  return (
    <div className="pl-4 md:pl-12 pr-4 md:pr-12 my-6 md:my-8 group relative z-20">
      {/* Section Header aligned with site design system */}
      <div className="flex items-center justify-between mb-4 md:mb-6 pr-4 md:pr-12 group/title">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-3 text-white" />
          <h2 className="text-gray-100 text-xl md:text-3xl font-display font-bold tracking-tight">
            Cinematic Universes
          </h2>
          <span className="hidden sm:inline-block ml-3 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
            Watch in Order
          </span>
        </div>
        <span className="text-xs text-gray-400 font-medium">Click to explore timelines</span>
      </div>

      {/* Universe Hub Brand Tiles - Disney+ / Netflix Studio style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {UNIVERSES.map((universe) => (
          <motion.div
            key={universe.id}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedUniverse(universe)}
            className="group relative aspect-[16/9] md:aspect-[2/1] rounded-xl overflow-hidden cursor-pointer border border-white/10 bg-[#16171d] shadow-lg hover:border-white/40 transition-all duration-300"
          >
            {/* Background image & gradient overlay */}
            <img
              src={universe.banner}
              alt={universe.name}
              className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-65 group-hover:scale-110 transition-all duration-500 filter brightness-90 group-hover:brightness-100"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${universe.gradient} opacity-50 group-hover:opacity-30 transition-opacity`} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/85" />

            {/* Glowing Accent Border on hover */}
            <div
              className="absolute inset-0 border-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ borderColor: universe.color }}
            />

            {/* Brand content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-3">
              <span
                className="self-start text-[9px] uppercase font-black px-2 py-0.5 rounded-full text-white shadow-sm"
                style={{ backgroundColor: universe.color }}
              >
                {universe.badge}
              </span>
              <div>
                <h3 className="text-white font-bold text-sm md:text-base leading-tight font-display drop-shadow-md group-hover:translate-x-0.5 transition-transform">
                  {universe.shortName}
                </h3>
                <span className="text-[10px] text-gray-300 font-medium">
                  {universe.movies.length} Films
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Universe Explorer Modal using createPortal to escape any stacking context */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedUniverse && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative w-full h-full max-w-6xl max-h-[92vh] mx-3 sm:mx-6 bg-[#0f1014] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedUniverse(null)}
                  className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full bg-black/70 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-all hover:scale-105"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Hero Banner */}
                <div className="relative h-60 sm:h-72 w-full flex-none overflow-hidden">
                  <img
                    src={selectedUniverse.banner}
                    alt={selectedUniverse.name}
                    className="w-full h-full object-cover filter brightness-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/50 to-transparent" />
                  <div
                    className="absolute inset-0 opacity-35 mix-blend-overlay pointer-events-none"
                    style={{ backgroundColor: selectedUniverse.color }}
                  />

                  <div className="absolute bottom-6 left-6 sm:left-8 right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="max-w-2xl">
                      <span
                        className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full text-white shadow-sm inline-block mb-2"
                        style={{ backgroundColor: selectedUniverse.color }}
                      >
                        {selectedUniverse.badge}
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight drop-shadow-lg">
                        {selectedUniverse.name}
                      </h2>
                      <p className="text-gray-300 text-xs sm:text-sm mt-1 line-clamp-2 max-w-xl">
                        {selectedUniverse.description}
                      </p>
                    </div>

                    {firstMovie && (
                      <button
                        onClick={() => {
                          setSelectedUniverse(null);
                          navigate(`/watch/movie/${firstMovie.id}`);
                        }}
                        className="flex-none flex items-center px-6 py-2.5 rounded-full bg-white text-black hover:bg-white/90 font-bold text-sm shadow-xl transition hover:scale-105 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-black mr-2" />
                        Start Marathon (#1)
                      </button>
                    )}
                  </div>
                </div>

                {/* Controls & Phase Filter Bar matching site button design */}
                <div className="bg-[#14151a] border-y border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-3 flex-none">
                  {/* Phase Filter Pills */}
                  <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-1">
                    {selectedUniverse.phases.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setActivePhase(p.id)}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all border flex-none ${
                          activePhase === p.id
                            ? 'bg-white text-black border-white shadow-md font-bold'
                            : 'border-white/20 text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  {/* Chronological vs Release Toggle */}
                  <div className="bg-black/60 p-1 rounded-full border border-white/15 flex items-center">
                    <button
                      onClick={() => setOrderMode('chrono')}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center ${
                        orderMode === 'chrono'
                          ? 'bg-[var(--accent-color,#2b82f6)] text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Story Chronology
                    </button>
                    <button
                      onClick={() => setOrderMode('release')}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center ${
                        orderMode === 'release'
                          ? 'bg-[var(--accent-color,#2b82f6)] text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Release Order
                    </button>
                  </div>
                </div>

                {/* Movies Grid using standard RowCard style */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                  {loadingMovies ? (
                    <div className="flex items-center justify-center py-24 text-gray-400">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                      Loading franchise timeline...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredMovies.map((movie, index) => {
                        const isWatched = watchedIds.has(movie.id);
                        const isUpcoming = movie.upcoming || new Date(movie.release_date || `${movie.year}-12-31`) > new Date();
                        const orderNum = orderMode === 'chrono' ? (movie.chronoOrder || index + 1) : (movie.releaseOrder || index + 1);

                        return (
                          <div
                            key={movie.id}
                            onClick={() => {
                              setSelectedUniverse(null);
                              navigate(isUpcoming ? `/title/movie/${movie.id}` : `/watch/movie/${movie.id}`);
                            }}
                            className="group relative cursor-pointer flex flex-col rounded-lg overflow-hidden bg-[#181920] border border-white/10 hover:border-[var(--accent-color,#2b82f6)] transition-all duration-300 hover:scale-105 shadow-lg"
                          >
                            {/* Sequence number badge */}
                            <div className="absolute top-2 left-2 z-20 bg-black/80 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                              #{orderNum}
                            </div>

                            {isWatched && (
                              <div className="absolute top-2 right-2 z-20 bg-emerald-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center">
                                <Check className="w-2.5 h-2.5 mr-0.5" /> Done
                              </div>
                            )}

                            <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#202128]">
                              {movie.poster_path ? (
                                <img
                                  src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`}
                                  alt={movie.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                                  <Film className="w-8 h-8 text-gray-500 mb-2" />
                                  <span className="text-xs text-gray-300 font-bold">{movie.title}</span>
                                </div>
                              )}

                              {/* Play overlay on hover */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-[var(--accent-color,#2b82f6)] text-white flex items-center justify-center shadow-xl">
                                  <Play className="w-4 h-4 fill-white ml-0.5" />
                                </div>
                              </div>

                              {isUpcoming && (
                                <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider py-0.5 text-center">
                                  {movie.releaseDate ? movie.releaseDate.substring(0, 4) : 'Upcoming'}
                                </div>
                              )}
                            </div>

                            {/* Card text */}
                            <div className="p-2.5 flex flex-col justify-between flex-1">
                              <h4 className="text-xs font-semibold text-gray-200 line-clamp-1 group-hover:text-white transition-colors">
                                {movie.title}
                              </h4>
                              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                                <span>{movie.year || (movie.release_date && movie.release_date.substring(0, 4)) || 'TBA'}</span>
                                {movie.vote_average > 0 && (
                                  <span className="text-yellow-400 font-medium flex items-center">
                                    <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                                    {movie.vote_average.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
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
