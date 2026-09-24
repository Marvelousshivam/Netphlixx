import React, { useState, useEffect } from 'react';
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
    <div className="relative z-20 px-4 md:px-12 my-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-5 bg-[var(--accent-color,#E50914)] rounded-full inline-block" />
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight font-display">
            Cinematic Universes
          </h2>
          <span className="text-[11px] font-semibold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full hidden sm:inline-block">
            Watch in Order
          </span>
        </div>
        <span className="text-xs text-gray-400">Explore complete franchises & timelines</span>
      </div>

      {/* Universe Hub Brand Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {UNIVERSES.map((universe) => (
          <motion.div
            key={universe.id}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedUniverse(universe)}
            className="group relative h-28 md:h-32 rounded-xl overflow-hidden cursor-pointer border border-white/10 bg-[#161616] shadow-lg hover:border-white/40 transition-all duration-300"
          >
            {/* Background image & gradient overlay */}
            <img
              src={universe.banner}
              alt={universe.name}
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500 filter brightness-90 group-hover:brightness-100"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${universe.gradient} opacity-60 group-hover:opacity-40 transition-opacity`} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />

            {/* Glowing Accent Border On Hover */}
            <div
              className="absolute inset-0 border-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ borderColor: universe.color }}
            />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-3">
              <span
                className="self-start text-[9px] uppercase font-black px-2 py-0.5 rounded-full text-white shadow-sm"
                style={{ backgroundColor: universe.color }}
              >
                {universe.badge}
              </span>
              <div>
                <h3 className="text-white font-black text-sm md:text-base leading-tight font-display drop-shadow-md group-hover:translate-x-0.5 transition-transform">
                  {universe.shortName}
                </h3>
                <span className="text-[10px] text-gray-300 font-medium">
                  {universe.movies.length} Films Timeline
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Universe Explorer Modal */}
      <AnimatePresence>
        {selectedUniverse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-[#121212] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedUniverse(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Hero Banner */}
              <div className="relative h-56 sm:h-72 w-full flex-none overflow-hidden">
                <img
                  src={selectedUniverse.banner}
                  alt={selectedUniverse.name}
                  className="w-full h-full object-cover filter brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
                <div
                  className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{ backgroundColor: selectedUniverse.color }}
                />

                <div className="absolute bottom-6 left-6 sm:left-10 right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-2xl">
                    <span
                      className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full text-white shadow-sm inline-block mb-2"
                      style={{ backgroundColor: selectedUniverse.color }}
                    >
                      {selectedUniverse.badge}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight drop-shadow-lg">
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
                      className="flex-none flex items-center px-5 py-2.5 rounded-full text-white font-bold text-sm shadow-xl transition hover:brightness-110 active:scale-95"
                      style={{ backgroundColor: selectedUniverse.color }}
                    >
                      <Play className="w-4 h-4 fill-white mr-2" />
                      Start Marathon (#1)
                    </button>
                  )}
                </div>
              </div>

              {/* Controls & Filter Bar */}
              <div className="bg-[#181818] border-y border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                {/* Phases Filter */}
                <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-1">
                  {selectedUniverse.phases.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActivePhase(p.id)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full transition border flex-none ${
                        activePhase === p.id
                          ? 'bg-white text-black border-white shadow-sm'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Chronological vs Release Toggle */}
                <div className="bg-black/60 p-1 rounded-full border border-white/10 flex items-center">
                  <button
                    onClick={() => setOrderMode('chrono')}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center ${
                      orderMode === 'chrono'
                        ? 'bg-[var(--accent-color,#E50914)] text-white shadow'
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
                        ? 'bg-[var(--accent-color,#E50914)] text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Release Date
                  </button>
                </div>
              </div>

              {/* Movies Grid */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                {loadingMovies ? (
                  <div className="flex items-center justify-center py-20 text-gray-400">
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
                          className="group relative cursor-pointer flex flex-col rounded-xl overflow-hidden bg-[#1c1c1c] border border-white/10 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                          {/* Chronological sequence badge */}
                          <div className="absolute top-2 left-2 z-20 bg-black/80 backdrop-blur-sm border border-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                            #{orderNum}
                          </div>

                          {isWatched && (
                            <div className="absolute top-2 right-2 z-20 bg-emerald-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center">
                              <Check className="w-2.5 h-2.5 mr-0.5" /> Done
                            </div>
                          )}

                          <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#242424]">
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
                              <div className="w-10 h-10 rounded-full bg-[var(--accent-color,#E50914)] text-white flex items-center justify-center shadow-xl">
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              </div>
                            </div>

                            {isUpcoming && (
                              <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-black text-[9px] font-black uppercase tracking-wider py-0.5 text-center">
                                {movie.releaseDate ? movie.releaseDate.substring(0, 4) : 'Upcoming'}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-2.5 flex flex-col justify-between flex-1">
                            <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[var(--accent-color,#E50914)] transition-colors">
                              {movie.title}
                            </h4>
                            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                              <span>{movie.year || (movie.release_date && movie.release_date.substring(0, 4)) || 'TBA'}</span>
                              {movie.vote_average > 0 && (
                                <span className="text-yellow-400 font-semibold flex items-center">
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
      </AnimatePresence>
    </div>
  );
}
