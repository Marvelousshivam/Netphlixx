import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, ChevronRight, ChevronLeft, Calendar, Star, Compass, Clock, Sparkles } from 'lucide-react';
import { findUniverseByMovieId, findUniverseByName } from '../data/universesData';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

// In-memory cache for movie poster/details to minimize network requests
const detailsCache = new Map();

export default function FranchiseTimeline({
  currentMovieId,
  collectionData = null,
  movieTitle = '',
  mode = 'title' // 'title' or 'watch'
}) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const currentCardRef = useRef(null);

  const [orderMode, setOrderMode] = useState('chrono'); // 'chrono' or 'release'
  const [activePhase, setActivePhase] = useState('all');
  const [universe, setUniverse] = useState(null);
  const [movieDetailsList, setMovieDetailsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read watch history from localStorage for watched indicators
  const [watchedIds, setWatchedIds] = useState(() => {
    try {
      const history = JSON.parse(localStorage.getItem('netphlix_watchHistory') || '[]');
      return new Set(history.map(m => m.id));
    } catch {
      return new Set();
    }
  });

  const numericCurrentId = parseInt(currentMovieId, 10);

  // 1. Identify if movie belongs to curated universe or TMDB collection
  useEffect(() => {
    let matched = findUniverseByMovieId(numericCurrentId);
    if (!matched && collectionData?.name) {
      matched = findUniverseByName(collectionData.name);
    }
    if (!matched && movieTitle) {
      matched = findUniverseByName(movieTitle);
    }
    setUniverse(matched);
  }, [numericCurrentId, collectionData, movieTitle]);

  // 2. Fetch and enrich movies
  useEffect(() => {
    let isCancelled = false;

    async function loadMovies() {
      setLoading(true);

      if (universe) {
        // Use curated universe movies
        const rawList = [...universe.movies];
        
        // Fetch missing posters/metadata in parallel with cache
        const enriched = await Promise.all(
          rawList.map(async (item) => {
            if (detailsCache.has(item.id)) {
              return { ...item, ...detailsCache.get(item.id) };
            }
            try {
              const res = await fetch(`${BASE_URL}/movie/${item.id}?api_key=${API_KEY}`);
              if (res.ok) {
                const data = await res.json();
                const movieMeta = {
                  poster_path: data.poster_path,
                  backdrop_path: data.backdrop_path,
                  overview: data.overview,
                  vote_average: data.vote_average,
                  release_date: data.release_date || item.releaseDate,
                  runtime: data.runtime
                };
                detailsCache.set(item.id, movieMeta);
                return { ...item, ...movieMeta };
              }
            } catch (err) {
              // fallback gracefully
            }
            return item;
          })
        );

        if (!isCancelled) {
          setMovieDetailsList(enriched);
          setLoading(false);
        }
      } else if (collectionData?.parts && collectionData.parts.length > 0) {
        // Use TMDB collection parts
        const mapped = collectionData.parts.map((part, idx) => ({
          id: part.id,
          title: part.title,
          year: part.release_date ? parseInt(part.release_date.substring(0, 4), 10) : 2099,
          chronoOrder: idx + 1,
          releaseOrder: idx + 1,
          release_date: part.release_date,
          poster_path: part.poster_path,
          backdrop_path: part.backdrop_path,
          vote_average: part.vote_average,
          overview: part.overview
        }));

        if (!isCancelled) {
          setMovieDetailsList(mapped);
          setLoading(false);
        }
      } else {
        if (!isCancelled) {
          setMovieDetailsList([]);
          setLoading(false);
        }
      }
    }

    loadMovies();
    return () => { isCancelled = true; };
  }, [universe, collectionData]);

  // Center the current card into view once loaded
  useEffect(() => {
    if (!loading && currentCardRef.current && scrollRef.current) {
      setTimeout(() => {
        currentCardRef.current?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }, 250);
    }
  }, [loading, orderMode, activePhase]);

  // Sort and filter movies
  const sortedMovies = [...movieDetailsList].sort((a, b) => {
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

  // Find current index and next movie
  const currentIndex = sortedMovies.findIndex(m => m.id === numericCurrentId);
  const nextMovie = currentIndex >= 0 && currentIndex < sortedMovies.length - 1 
    ? sortedMovies[currentIndex + 1] 
    : null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && filteredMovies.length <= 1) {
    return null;
  }

  const titlePrefix = universe?.name || collectionData?.name || 'Franchise';

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#181818]/90 via-[#121212]/95 to-[#0a0a0a] shadow-2xl backdrop-blur-md ${mode === 'watch' ? 'my-8 p-4 md:p-6' : 'mb-12 p-5 md:p-8'}`}>
      {/* Decorative ambient glow */}
      <div 
        className="absolute -top-24 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ backgroundColor: universe?.color || 'var(--accent-color, #E50914)' }}
      />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span 
              className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-sm"
              style={{ backgroundColor: universe?.color || 'var(--accent-color, #E50914)' }}
            >
              {universe?.badge || 'Franchise Roadmap'}
            </span>
            <span className="text-xs text-gray-400 font-medium flex items-center">
              <Compass className="w-3.5 h-3.5 mr-1 text-[var(--accent-color)]" />
              {sortedMovies.length} Chapter Journey
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white font-display mt-1">
            {titlePrefix}
          </h3>
          {universe?.tagline && (
            <p className="text-xs text-gray-400 italic mt-0.5 line-clamp-1">{universe.tagline}</p>
          )}
        </div>

        {/* Order Mode & Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Chronological vs Release toggle */}
          <div className="bg-black/60 p-1 rounded-full border border-white/10 flex items-center shadow-inner">
            <button
              onClick={() => setOrderMode('chrono')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 flex items-center ${
                orderMode === 'chrono' 
                  ? 'bg-[var(--accent-color,#E50914)] text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3 mr-1" />
              Story Chronology
            </button>
            <button
              onClick={() => setOrderMode('release')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 flex items-center ${
                orderMode === 'release' 
                  ? 'bg-[var(--accent-color,#E50914)] text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Release Order
            </button>
          </div>

          {/* Quick Scroll arrows */}
          <div className="hidden sm:flex items-center space-x-1">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition hover:scale-105 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition hover:scale-105 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Universe Phase Filter Pills (if multi-phase like MCU/Spider-Verse) */}
      {universe?.phases && universe.phases.length > 2 && (
        <div className="relative z-10 flex items-center space-x-2 overflow-x-auto scrollbar-hide py-3">
          {universe.phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className={`flex-none text-xs font-medium px-3 py-1 rounded-full transition-all duration-200 border ${
                activePhase === p.id
                  ? 'bg-white text-black border-white font-bold shadow-md'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Quick "Play Next in Universe" Banner when available */}
      {nextMovie && (
        <div className="relative z-10 my-3 p-3 rounded-xl bg-gradient-to-r from-[var(--accent-color,#E50914)]/20 via-black/40 to-transparent border border-[var(--accent-color,#E50914)]/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-color,#E50914)] flex items-center justify-center text-white shadow-lg animate-pulse">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block">
                Next In {orderMode === 'chrono' ? 'Timeline' : 'Release Order'}
              </span>
              <span className="text-sm font-bold text-white line-clamp-1">
                {nextMovie.title} ({nextMovie.year})
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(mode === 'watch' ? `/watch/movie/${nextMovie.id}` : `/title/movie/${nextMovie.id}`)}
            className="flex items-center px-4 py-1.5 rounded-full bg-[var(--accent-color,#E50914)] hover:brightness-110 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 flex-none"
          >
            <Play className="w-3 h-3 mr-1.5 fill-white" />
            {mode === 'watch' ? 'Play Next' : 'View Title'}
          </button>
        </div>
      )}

      {/* Connected Horizontal Timeline Track */}
      <div className="relative z-10 mt-4">
        {/* Continuous Connecting Line */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-white/10 via-[var(--accent-color,#E50914)]/30 to-white/10 -translate-y-12 pointer-events-none hidden md:block" />

        <div
          ref={scrollRef}
          className="flex space-x-4 md:space-x-6 overflow-x-auto scrollbar-hide py-4 px-2 snap-x"
        >
          {filteredMovies.map((movie, index) => {
            const isCurrent = movie.id === numericCurrentId;
            const isWatched = watchedIds.has(movie.id);
            const isUpcoming = movie.upcoming || new Date(movie.release_date || `${movie.year}-12-31`) > new Date();
            const orderNum = orderMode === 'chrono' ? (movie.chronoOrder || index + 1) : (movie.releaseOrder || index + 1);

            return (
              <div
                key={movie.id}
                ref={isCurrent ? currentCardRef : null}
                className="flex-none flex flex-col items-center snap-center"
              >
                {/* Node Step Pin */}
                <div className="mb-2 flex items-center justify-center">
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-[var(--accent-color,#E50914)] text-white shadow-[0_0_12px_rgba(229,9,20,0.8)] scale-110'
                      : isWatched
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isUpcoming
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-white/10 text-gray-300 border border-white/10'
                  }`}>
                    {isCurrent ? '● CURRENT' : isWatched ? '✓ WATCHED' : isUpcoming ? 'SOON' : `#${orderNum}`}
                  </div>
                </div>

                {/* Poster Card */}
                <div
                  onClick={() => {
                    if (isUpcoming) {
                      navigate(`/title/movie/${movie.id}`);
                    } else if (mode === 'watch') {
                      navigate(`/watch/movie/${movie.id}`);
                    } else {
                      navigate(`/title/movie/${movie.id}`);
                    }
                  }}
                  className={`group relative w-32 sm:w-36 md:w-44 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                    isCurrent
                      ? 'border-[var(--accent-color,#E50914)] shadow-[0_0_20px_rgba(229,9,20,0.6)] scale-105 z-20'
                      : 'border-white/10 hover:border-white/50 hover:scale-105 z-10'
                  } bg-[#1a1a1a]`}
                >
                  {movie.poster_path ? (
                    <img
                      src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#222]">
                      <Compass className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-xs text-gray-300 font-bold line-clamp-3">{movie.title}</span>
                    </div>
                  )}

                  {/* Gradient Overlay & Play Action on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2.5">
                    <div className="flex justify-end">
                      {movie.vote_average > 0 && (
                        <span className="text-[10px] font-bold bg-black/70 px-1.5 py-0.5 rounded text-yellow-400 flex items-center">
                          <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                          {movie.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center my-auto">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent-color,#E50914)] flex items-center justify-center text-white shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                      <span className="text-[10px] text-white font-bold mt-1 shadow-sm">
                        {mode === 'watch' ? 'Switch Now' : 'Watch Title'}
                      </span>
                    </div>

                    <p className="text-[11px] text-white font-semibold line-clamp-1 text-center">
                      {movie.title}
                    </p>
                  </div>

                  {/* Badges on card */}
                  {isCurrent && (
                    <div className="absolute top-2 left-2 bg-[var(--accent-color,#E50914)] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-lg animate-pulse">
                      Playing
                    </div>
                  )}
                  {isWatched && !isCurrent && (
                    <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center">
                      <Check className="w-2.5 h-2.5 mr-0.5" /> Done
                    </div>
                  )}
                  {isUpcoming && (
                    <div className="absolute bottom-2 left-2 right-2 bg-amber-500/90 text-black text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow text-center">
                      {movie.releaseDate ? movie.releaseDate.substring(0, 4) : 'Upcoming'}
                    </div>
                  )}
                </div>

                {/* Subtitle / Year info below poster */}
                <div className="w-32 sm:w-36 md:w-44 mt-2 text-center">
                  <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-[var(--accent-color,#E50914)]' : 'text-gray-200 group-hover:text-white'}`}>
                    {movie.title}
                  </h4>
                  <div className="flex items-center justify-center space-x-1 text-[11px] text-gray-400 mt-0.5">
                    <span>{movie.year || (movie.release_date && movie.release_date.substring(0, 4)) || 'TBA'}</span>
                    {movie.phase && (
                      <>
                        <span>•</span>
                        <span className="text-[10px] uppercase text-gray-500">{movie.phase.replace('phase', 'P')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
