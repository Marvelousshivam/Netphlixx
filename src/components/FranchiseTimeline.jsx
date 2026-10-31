import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ChevronRight, ChevronLeft, Calendar, Clock } from 'lucide-react';
import { findUniverseByMovieId, findUniverseByName } from '../data/universesData';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const detailsCache = new Map();

export default function FranchiseTimeline({
  currentMovieId,
  collectionData = null,
  movieTitle = '',
  mode = 'title', // 'title' or 'watch'
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
      return new Set(history.map((m) => m.id));
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
                let cleanPoster = item.poster_path || data.poster_path;
                if (data.poster_path === '/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg') {
                  cleanPoster = '/mFzFJc1XnGqaEbyac2KcCFJx8Uo.jpg';
                } else if (data.poster_path === '/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg') {
                  cleanPoster = '/1brq8q3u1GmS5Sef2FkNwImrHWT.jpg';
                }
                const movieMeta = {
                  poster_path: cleanPoster,
                  backdrop_path: item.backdrop_path || data.backdrop_path,
                  overview: data.overview,
                  vote_average: data.vote_average,
                  release_date: data.release_date || item.releaseDate,
                  runtime: data.runtime,
                };
                detailsCache.set(item.id, movieMeta);
                return { ...item, ...movieMeta };
              }
            } catch {
              // ignore
            }
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
          overview: part.overview,
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
    return () => {
      isCancelled = true;
    };
  }, [universe, collectionData]);

  // Center active card horizontally inside timeline track without scrolling the window
  useEffect(() => {
    if (!loading && currentCardRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const card = currentCardRef.current;
      const targetScroll = card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [loading, orderMode, activePhase]);

  // Horizontal mouse wheel scroll support
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.5;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [loading]);

  const sortedMovies = [...movieDetailsList].sort((a, b) => {
    if (orderMode === 'chrono') {
      return (a.chronoOrder || 999) - (b.chronoOrder || 999);
    }
    const dateA = a.release_date || `${a.year}-01-01`;
    const dateB = b.release_date || `${b.year}-01-01`;
    return new Date(dateA) - new Date(dateB);
  });

  const filteredMovies =
    activePhase === 'all' ? sortedMovies : sortedMovies.filter((m) => m.phase === activePhase);

  const currentIndex = sortedMovies.findIndex((m) => m.id === numericCurrentId);
  const nextMovie =
    currentIndex >= 0 && currentIndex < sortedMovies.length - 1
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
    <div
      className={`relative w-full rounded-2xl md:rounded-3xl overflow-hidden apple-glass select-none ${
        mode === 'watch' ? 'my-6 p-4 md:p-6' : 'mb-10 p-5 md:p-6'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full frost-pill text-white/80">
              {universe?.badge || 'Franchise Roadmap'}
            </span>
            <span className="text-xs text-[#8a8a93] font-medium">
              {sortedMovies.length} Chapters
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white font-display">
            {titlePrefix} — Watch Order
          </h3>
          {universe?.tagline && (
            <p className="text-xs text-[#8a8a93] mt-0.5 line-clamp-1">{universe.tagline}</p>
          )}
        </div>

        {/* Order Mode Toggle (White Lozenge Active Style with Genjutsu Glide) */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="frost-pill p-1 rounded-full flex items-center space-x-1 relative">
            <button
              onClick={() => setOrderMode('chrono')}
              className={`relative px-3 py-1 text-xs font-semibold rounded-full transition-colors flex items-center z-10 ${
                orderMode === 'chrono' ? 'text-[#0f1014] font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              {orderMode === 'chrono' && (
                <motion.div
                  layoutId="timelineOrderLozenge"
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
                orderMode === 'release' ? 'text-[#0f1014] font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              {orderMode === 'release' && (
                <motion.div
                  layoutId="timelineOrderLozenge"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                />
              )}
              <Calendar className="w-3 h-3 mr-1" />
              <span>Release Order</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full frost-pill flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full frost-pill flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Universe Phase Filters with Smooth Lozenge Glide */}
      {universe?.phases && universe.phases.length > 2 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-hide py-2.5 border-b border-white/[0.06]">
          {universe.phases.map((p) => {
            const isActive = activePhase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePhase(p.id)}
                className={`relative flex-none text-xs font-semibold px-3 py-1 rounded-full transition-colors z-10 ${
                  isActive ? 'text-[#0f1014] font-bold' : 'frost-pill text-white/60 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="timelinePhaseLozenge"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                  />
                )}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Play Next In Timeline Banner */}
      {nextMovie && (
        <div className="my-3.5 p-3 rounded-xl frost-panel flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-white text-[#0f1014] flex items-center justify-center shadow-sm">
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </div>
            <div>
              <span className="text-[10px] text-[#8a8a93] font-semibold uppercase tracking-wider block">
                Next in {orderMode === 'chrono' ? 'Timeline' : 'Release Order'}
              </span>
              <span className="text-xs md:text-sm font-bold text-white line-clamp-1">
                {nextMovie.title} ({nextMovie.year})
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              navigate(
                mode === 'watch'
                  ? `/watch/movie/${nextMovie.id}`
                  : `/title/movie/${nextMovie.id}`
              );
            }}
            className="flex items-center px-4 py-1.5 rounded-full bg-white text-[#0f1014] hover:opacity-90 font-bold text-xs shadow-sm transition active:scale-95 flex-none"
          >
            <Play className="w-3 h-3 mr-1 fill-current" />
            {mode === 'watch' ? 'Play Next' : 'View Title'}
          </button>
        </div>
      )}

      {/* Horizontal Carousel Track with Chevrons */}
      <div className="relative group/timeline mt-2">
        {/* Left Scroll Chevron */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full apple-glass-pill text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover/timeline:opacity-100 transition-opacity hover:bg-white/20 shadow-md"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide py-3 px-1 snap-x scroll-smooth"
        >
          {filteredMovies.map((movie, index) => {
            const isCurrent = movie.id === numericCurrentId;
            const isWatched = watchedIds.has(movie.id);
            const isUpcoming =
              movie.upcoming ||
              new Date(movie.release_date || `${movie.year}-12-31`) > new Date();
            const orderNum =
              orderMode === 'chrono'
                ? movie.chronoOrder || index + 1
                : movie.releaseOrder || index + 1;

            return (
              <div
                key={movie.id}
                ref={isCurrent ? currentCardRef : null}
                className="flex-none flex flex-col items-center snap-center"
              >
                {/* Node Pill */}
                <div className="mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                      isCurrent
                        ? 'bg-white text-[#0f1014] shadow-sm font-bold'
                        : isWatched
                        ? 'apple-glass-pill text-white/90'
                        : isUpcoming
                        ? 'apple-glass-pill text-[#ffb800]'
                        : 'apple-glass-pill text-[#8a8a93]'
                    }`}
                  >
                    {isCurrent ? 'Now Playing' : isWatched ? '✓ Done' : isUpcoming ? 'Soon' : `#${orderNum}`}
                  </span>
                </div>

                {/* Card Poster with 1px Hairline for Active Node */}
                <div
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    if (isUpcoming) {
                      navigate(`/title/movie/${movie.id}`);
                    } else if (mode === 'watch') {
                      navigate(`/watch/movie/${movie.id}`);
                    } else {
                      navigate(`/title/movie/${movie.id}`);
                    }
                  }}
                  className={`group relative w-28 sm:w-32 md:w-36 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                    isCurrent
                      ? 'ring-2 ring-white shadow-xl scale-105 z-20'
                      : 'border border-white/[0.08] hover:border-white/30 z-10'
                  } bg-[#14151b]`}
                >
                  {movie.poster_path ? (
                    <img
                      src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#181a22]">
                      <span className="text-[11px] text-white/70 font-bold">{movie.title}</span>
                    </div>
                  )}

                  {/* Hover Play Button */}
                  <div className="absolute inset-0 bg-[#0f1014]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white text-[#0f1014] flex items-center justify-center shadow-lg">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="w-28 sm:w-32 md:w-36 mt-1.5 text-center">
                  <h4
                    className={`text-xs font-semibold truncate ${
                      isCurrent ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`}
                  >
                    {movie.title}
                  </h4>
                  <span className="text-[10px] text-[#8a8a93]">
                    {movie.year ||
                      (movie.release_date && movie.release_date.substring(0, 4)) ||
                      'TBA'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Chevron */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full frost-pill text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover/timeline:opacity-100 transition-opacity hover:bg-white/20 shadow-md"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
