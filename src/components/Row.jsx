import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RowCard from './RowCard';

function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type) return item.media_type;
  if (item.first_air_date || item.name) return 'tv';
  return 'movie';
}

export default function Row({
  title,
  icon: Icon,
  fetchUrl,
  isLargeRow = false,
  isTop10 = false,
  isLandscape = false,
  moviesArray,
  onRemove,
  filterUpcoming,
  filterReleased,
}) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const rowRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (moviesArray) {
      setMovies(moviesArray);
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    async function fetchData() {
      if (!fetchUrl) return;
      try {
        const response = await fetch(fetchUrl, { signal: abortController.signal }).then((res) =>
          res.json()
        );
        let results = response.results || [];
        const now = new Date();
        if (filterUpcoming) {
          results = results.filter((m) => new Date(m.release_date || m.first_air_date) > now);
        }
        if (filterReleased) {
          results = results.filter((m) => new Date(m.release_date || m.first_air_date) <= now);
        }
        setMovies(results);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Fetch error in Row:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    return () => abortController.abort();
  }, [fetchUrl, moviesArray, filterUpcoming, filterReleased]);

  // Horizontal mouse wheel scroll support
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const canScrollLeft = el.scrollLeft > 0;
        const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
        if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 1.5;
        }
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [movies]);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      const target = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      rowRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  const onNavigate = (movie, action) => {
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

  if (isLoading) {
    return (
      <div className="pl-4 md:pl-12 my-6 select-none">
        <div className="w-40 h-5 rounded-md shimmer mb-4" />
        <div className="flex space-x-3 overflow-hidden py-1">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`flex-none rounded-xl shimmer ${
                isLandscape ? 'w-56 sm:w-64 md:w-72 aspect-video' : 'w-36 sm:w-44 md:w-52 aspect-[2/3]'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!movies.length) return null;

  return (
    <div className="pl-4 md:pl-12 my-6 md:my-8 group/row relative select-none">
      {/* Rail Heading (Outfit 600, 1.125rem) */}
      <div className="flex items-center justify-between pr-4 md:pr-12 mb-3">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-[#8a8a93]" />}
          <h2 className="rail-title-prefix text-base md:text-lg font-semibold font-display tracking-tight text-white">
            {title}
          </h2>
          <span className="m3-shelf-badge">
            Curated
          </span>
        </div>
      </div>

      {/* Row Container with Navigation Chevrons */}
      <div className="relative">
        {/* Left Scroll Chevron */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-0 bottom-0 z-30 w-10 md:w-12 bg-gradient-to-r from-[#0f1014]/90 via-[#0f1014]/40 to-transparent flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          aria-label="Scroll left"
        >
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-8 h-8 rounded-full frost-pill m3-shelf-arrow flex items-center justify-center hover:bg-white/20 shadow-md cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </button>

        {/* Scrollable Track: Gap 12px, Snap-X */}
        <div
          ref={rowRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide py-2 pr-8 md:pr-14 scroll-smooth snap-x"
        >
          {movies.map((movie, index) => {
            if (isTop10) {
              return (
                <div key={movie.id} className="relative flex-none flex items-center snap-start">
                  {/* Top 10 Typography */}
                  <span
                    className="text-[110px] md:text-[150px] font-black leading-none select-none tracking-tighter -mr-5 md:-mr-7 z-0 opacity-80"
                    style={{
                      WebkitTextStroke: '2px rgba(255, 255, 255, 0.2)',
                      color: '#12141a',
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {index + 1}
                  </span>
                  <div className="relative z-10">
                    <RowCard
                      movie={movie}
                      isLargeRow={isLargeRow}
                      isTop10={true}
                      onNavigate={onNavigate}
                      onRemove={onRemove ? () => onRemove(movie.id) : undefined}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div key={movie.id} className="snap-start flex-none">
                <RowCard
                  movie={movie}
                  isLargeRow={isLargeRow}
                  isTop10={false}
                  isLandscape={isLandscape}
                  onNavigate={onNavigate}
                  onRemove={onRemove ? () => onRemove(movie.id) : undefined}
                />
              </div>
            );
          })}
        </div>

        {/* Right Scroll Chevron */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-0 bottom-0 z-30 w-10 md:w-12 bg-gradient-to-l from-[#0f1014]/90 via-[#0f1014]/40 to-transparent flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          aria-label="Scroll right"
        >
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-8 h-8 rounded-full frost-pill m3-shelf-arrow flex items-center justify-center hover:bg-white/20 shadow-md cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </button>
      </div>
    </div>
  );
}
