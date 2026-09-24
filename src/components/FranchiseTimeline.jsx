import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Check, ChevronRight, ChevronLeft, Calendar, Star, Compass, Clock, Sparkles } from 'lucide-react';
import { findUniverseByMovieId, findUniverseByName } from '../data/universesData';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

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

  const [watchedIds] = useState(() => {
    try {
      const history = JSON.parse(localStorage.getItem('netphlix_watchHistory') || '[]');
      return new Set(history.map(m => m.id));
    } catch {
      return new Set();
    }
  });

  const numericCurrentId = parseInt(currentMovieId, 10);

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

  useEffect(() => {
    let isCancelled = false;

    async function loadMovies() {
      setLoading(true);

      if (universe) {
        const rawList = [...universe.movies];
        const enriched = await Promise.all(
          rawList.map(async (item) => {
            if (detailsCache.has(item.id)) {
              return { ...item, ...detailsCache.get(item.id) };
            }
            try {
              const res = await fetch(`${BASE_URL}/movie/${item.id}?api_key=${API_KEY}`);
              if (res.ok) {
                const data = await res.json();
                if (data.adult) return null;
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
            } catch (err) {}
            return item;
          })
        );

        if (!isCancelled) {
          setMovieDetailsList(enriched.filter(Boolean));
          setLoading(false);
        }
      } else if (collectionData?.parts && collectionData.parts.length > 0) {
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

  const currentIndex = sortedMovies.findIndex(m => m.id === numericCurrentId);
  const nextMovie = currentIndex >= 0 && currentIndex < sortedMovies.length - 1 
    ? sortedMovies[currentIndex + 1] 
    : null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && filteredMovies.length <= 1) {
    return null;
  }

  const titlePrefix = universe?.name || collectionData?.name || 'Franchise';

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-white/10 bg-[#14151b]/80 backdrop-blur-md shadow-xl ${mode === 'watch' ? 'my-6 p-4 md:p-6' : 'mb-10 p-5 md:p-6'}`}>
      {/* Header Bar matching site style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
              {universe?.badge || 'Franchise Roadmap'}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {sortedMovies.length} Chapters
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-100 font-display mt-1">
            {titlePrefix} — Watch in Order
          </h3>
          {universe?.tagline && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{universe.tagline}</p>
          )}
        </div>

        {/* Order Mode Toggle Pills */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="bg-black/60 p-1 rounded-full border border-white/15 flex items-center">
            <button
              onClick={() => setOrderMode('chrono')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center ${
                orderMode === 'chrono' 
                  ? 'bg-white text-black shadow-md font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3 mr-1" />
              Story Order
            </button>
            <button
              onClick={() => setOrderMode('release')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center ${
                orderMode === 'release' 
                  ? 'bg-white text-black shadow-md font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Release Order
            </button>
          </div>

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

      {/* Universe Phase Filters */}
      {universe?.phases && universe.phases.length > 2 && (
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-3 border-b border-white/5">
          {universe.phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className={`flex-none text-xs font-semibold px-3 py-1 rounded-full transition-all border ${
                activePhase === p.id
                  ? 'bg-white text-black border-white shadow-sm font-bold'
                  : 'border-white/15 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Play Next In Timeline Banner */}
      {nextMovie && (
        <div className="my-3 p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-[var(--accent-color,#2b82f6)] flex items-center justify-center text-white shadow-md">
              <Play className="w-3 h-3 fill-white ml-0.5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                Next in {orderMode === 'chrono' ? 'Timeline' : 'Release Order'}
              </span>
              <span className="text-xs md:text-sm font-bold text-white line-clamp-1">
                {nextMovie.title} ({nextMovie.year})
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(mode === 'watch' ? `/watch/movie/${nextMovie.id}` : `/title/movie/${nextMovie.id}`)}
            className="flex items-center px-4 py-1.5 rounded-full bg-white text-black hover:bg-white/90 font-bold text-xs shadow transition active:scale-95 flex-none"
          >
            <Play className="w-3 h-3 mr-1 fill-black" />
            {mode === 'watch' ? 'Play Next' : 'View Title'}
          </button>
        </div>
      )}

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex space-x-3 md:space-x-4 overflow-x-auto scrollbar-hide py-3 px-1 snap-x scroll-smooth"
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
              {/* Step indicator */}
              <div className="mb-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                  isCurrent 
                    ? 'bg-blue-600 text-white shadow-md'
                    : isWatched
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : isUpcoming
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-white/10 text-gray-400 border border-white/10'
                }`}>
                  {isCurrent ? 'Playing' : isWatched ? '✓ Done' : isUpcoming ? 'Soon' : `#${orderNum}`}
                </span>
              </div>

              {/* Card Poster */}
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
                className={`group relative w-28 sm:w-32 md:w-40 aspect-[2/3] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                  isCurrent
                    ? 'border-blue-500 shadow-[0_0_15px_rgba(43,130,246,0.6)] scale-105 z-20'
                    : 'border-white/10 hover:border-white/40 hover:scale-105 z-10'
                } bg-[#181920]`}
              >
                {movie.poster_path ? (
                  <img
                    src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#202128]">
                    <span className="text-[11px] text-gray-300 font-bold">{movie.title}</span>
                  </div>
                )}

                {/* Hover Play Button */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-[var(--accent-color,#2b82f6)] flex items-center justify-center text-white shadow-xl">
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>
                </div>

                {isCurrent && (
                  <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                    Active
                  </div>
                )}
              </div>

              {/* Card Meta */}
              <div className="w-28 sm:w-32 md:w-40 mt-1.5 text-center">
                <h4 className={`text-xs font-semibold truncate ${isCurrent ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'}`}>
                  {movie.title}
                </h4>
                <span className="text-[10px] text-gray-500">
                  {movie.year || (movie.release_date && movie.release_date.substring(0, 4)) || 'TBA'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
