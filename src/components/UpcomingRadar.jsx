import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Bell, Check } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../context/ToastContext';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

export default function UpcomingRadar() {
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchUpcomingRadar() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&include_adult=false&primary_release_date.gte=${today}&sort_by=popularity.desc&page=1`
        ).then((r) => r.json());

        if (res.results) {
          const valid = res.results.filter((m) => !m.adult && m.poster_path && m.release_date);
          setUpcomingMovies(valid.slice(0, 16));
        }
      } catch (err) {
        console.error('Failed to fetch upcoming radar', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingRadar();
  }, []);

  const calculateDaysLeft = (releaseDate) => {
    if (!releaseDate) return null;
    const release = new Date(releaseDate);
    const now = new Date();
    const diffTime = release - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const toggleRemind = (movie, e) => {
    e.stopPropagation();
    const exists = myList.some((m) => m.id === movie.id);
    if (exists) {
      setMyList((prev) => prev.filter((m) => m.id !== movie.id));
      showToast({
        title: 'Reminder Removed',
        message: movie.title,
        type: 'info',
      });
    } else {
      setMyList((prev) => [
        ...prev,
        {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          media_type: 'movie',
          isUpcoming: true,
        },
      ]);
      showToast({
        title: 'Premiere Reminder Set',
        message: `Tracking ${movie.title}`,
        poster: movie.poster_path,
        type: 'magic',
      });
    }
  };

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      const target = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      rowRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  if (loading || upcomingMovies.length === 0) return null;

  return (
    <div className="pl-4 md:pl-12 my-6 md:my-8 group/row relative select-none">
      {/* Rail Heading (Outfit 600) with Live Pulsing Radar Beacon */}
      <div className="flex items-center justify-between mb-3 pr-4 md:pr-12">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center w-4 h-4">
            <span className="absolute w-2.5 h-2.5 rounded-full bg-[#ffb800] radar-ping" />
            <span className="relative w-2 h-2 rounded-full bg-[#ffb800] shadow-[0_0_8px_#ffb800]" />
          </div>
          <h2 className="text-base md:text-lg font-semibold font-display tracking-tight text-white">
            Upcoming Premieres
          </h2>
        </div>
        <span className="text-xs text-[#8a8a93] font-medium hidden sm:inline">Theatrical Radar</span>
      </div>

      {/* Row Container with Navigation Chevrons */}
      <div className="relative">
        {/* Left Scroll Chevron */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-0 bottom-0 z-30 w-10 md:w-12 bg-gradient-to-r from-[#0f1014]/90 via-[#0f1014]/40 to-transparent flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 cursor-pointer"
          aria-label="Scroll left"
        >
          <div className="w-8 h-8 rounded-full frost-pill flex items-center justify-center hover:bg-white/20">
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>

        {/* Horizontal Cards Track: 2:3, Radius 12, Gap 12 */}
        <div
          ref={rowRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide py-2 pr-8 md:pr-14 scroll-smooth snap-x"
        >
          {upcomingMovies.map((movie) => {
            const daysLeft = calculateDaysLeft(movie.release_date);
            const isBookmarked = myList.some((m) => m.id === movie.id);

            return (
              <motion.div
                key={movie.id}
                whileHover={{ y: -6, scale: 1.035 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                onClick={() => navigate(`/title/movie/${movie.id}`)}
                className="group/card relative flex-none cursor-pointer rounded-xl overflow-hidden bg-[#14151b] border border-white/[0.08] hover:border-white/30 hover:ring-1 hover:ring-white/20 hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)] transition-all w-36 sm:w-44 md:w-52 aspect-[2/3] snap-start"
              >
                {/* Poster Image */}
                <img
                  src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                />

                {/* Bookmark Reminder Button (44px target frosted circle with ringing bell) */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={(e) => toggleRemind(movie, e)}
                  title={isBookmarked ? 'Saved in Watchlist' : 'Remind Me'}
                  aria-label="Bookmark reminder"
                  className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isBookmarked
                      ? 'bg-white text-[#0f1014] opacity-100'
                      : 'frost-pill text-white/80 hover:text-white opacity-0 group-hover/card:opacity-100 hover:bg-white/20'
                  }`}
                >
                  <motion.div
                    key={isBookmarked ? 'saved' : 'bell'}
                    initial={{ scale: 0.7, rotate: -20 }}
                    animate={{ scale: 1, rotate: [0, -16, 16, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {isBookmarked ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                  </motion.div>
                </motion.button>

                {/* Frosted Hover Overlay with Title and Days Left */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                  <h4 className="text-white font-bold text-xs md:text-sm line-clamp-1 mb-1 font-display">
                    {movie.title}
                  </h4>
                  <div className="flex items-center space-x-1.5 text-[11px] text-[#8a8a93]">
                    <span className="text-white/90 font-medium">
                      {daysLeft !== null
                        ? daysLeft === 0
                          ? 'Premieres Today'
                          : `${daysLeft} days left`
                        : 'Coming Soon'}
                    </span>
                    <span>•</span>
                    <span>{movie.release_date}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Scroll Chevron */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-0 bottom-0 z-30 w-10 md:w-12 bg-gradient-to-l from-[#0f1014]/90 via-[#0f1014]/40 to-transparent flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          aria-label="Scroll right"
        >
          <div className="w-8 h-8 rounded-full frost-pill flex items-center justify-center hover:bg-white/20">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
}
