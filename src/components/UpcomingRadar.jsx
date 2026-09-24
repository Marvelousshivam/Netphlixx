import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Bell, Clock, ChevronRight, ChevronLeft, Check, Star } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

export default function UpcomingRadar() {
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);

  useEffect(() => {
    async function fetchUpcomingRadar() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&include_adult=false&primary_release_date.gte=${today}&sort_by=popularity.desc&page=1`
        ).then(r => r.json());

        if (res.results) {
          const valid = res.results.filter(m => !m.adult && m.poster_path && m.release_date);
          setUpcomingMovies(valid.slice(0, 16));
        }
      } catch (err) {
        console.error("Failed to fetch upcoming radar", err);
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
    const exists = myList.some(m => m.id === movie.id);
    if (exists) {
      setMyList(prev => prev.filter(m => m.id !== movie.id));
    } else {
      setMyList(prev => [...prev, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        media_type: 'movie',
        isUpcoming: true
      }]);
    }
  };

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading || upcomingMovies.length === 0) return null;

  return (
    <motion.div 
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-50px" }} 
      variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
      className="pl-4 md:pl-12 my-4 md:my-6 group relative z-20"
    >
      {/* Row Header matching Netphlix design system */}
      <div className="flex items-center justify-between mb-4 md:mb-6 pr-4 md:pr-12 group/title">
        <div className="flex items-center cursor-pointer">
          <Calendar className="w-6 h-6 md:w-8 md:h-8 mr-3 text-white" />
          <h2 className="text-gray-100 text-xl md:text-3xl font-display font-bold tracking-tight">
            Upcoming Blockbusters
          </h2>
          <span className="hidden sm:inline-block ml-3 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
            Countdown Radar
          </span>
        </div>
        <span className="text-xs text-gray-500 group-hover/title:text-gray-300 transition-colors">
          Most anticipated theatrical premieres
        </span>
      </div>

      {/* Row Container with horizontal chevrons matching Row.jsx */}
      <div className="relative group/row">
        {/* Left Scroll Chevron */}
        <button 
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/60 hover:bg-black/90 text-white w-10 md:w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 backdrop-blur-xs rounded-r"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Horizontal Cards Scroll */}
        <div 
          ref={rowRef}
          className="flex space-x-2 md:space-x-4 overflow-x-auto scrollbar-hide py-4 pr-12 scroll-smooth"
        >
          {upcomingMovies.map((movie) => {
            const daysLeft = calculateDaysLeft(movie.release_date);
            const isBookmarked = myList.some(m => m.id === movie.id);

            return (
              <motion.div
                key={movie.id}
                whileHover={{ scale: 1.05, zIndex: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => navigate(`/title/movie/${movie.id}`)}
                className="group/card relative flex-none cursor-pointer rounded-md overflow-visible bg-transparent focus:ring-4 focus:ring-white outline-none w-32 md:w-48 z-10 origin-center snap-center flex flex-col gap-2"
              >
                {/* Poster Box */}
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg group-hover/card:shadow-[0_10px_20px_rgba(43,130,246,0.3)] transition-all bg-[#1a1a1a]">
                  <img
                    src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />

                  {/* Sleek Countdown Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] flex items-center shadow-md">
                    <Clock className="w-2.5 h-2.5 mr-1 text-blue-400" />
                    <span>{daysLeft !== null ? (daysLeft === 0 ? 'Today' : `${daysLeft}d left`) : 'Soon'}</span>
                  </div>

                  {/* Bookmark Reminder Button */}
                  <button
                    onClick={(e) => toggleRemind(movie, e)}
                    title={isBookmarked ? "Saved in My List" : "Add to My List / Remind Me"}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition border ${
                      isBookmarked
                        ? 'bg-blue-600 text-white border-blue-500 opacity-100 shadow-md'
                        : 'bg-black/60 hover:bg-white text-white hover:text-black border-white/20 opacity-0 group-hover/card:opacity-100'
                    }`}
                  >
                    {isBookmarked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bell className="w-3 h-3" />}
                  </button>

                  {/* Bottom Release Date Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent py-2 px-2 text-center">
                    <span className="text-[10px] text-gray-300 font-medium tracking-wide">
                      {movie.release_date}
                    </span>
                  </div>
                </div>

                {/* Subtitle / Details */}
                <div className="flex flex-col px-1">
                  <h3 className="text-gray-200 font-semibold text-sm line-clamp-1 group-hover/card:text-[var(--accent-color,#2b82f6)] transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span className="text-blue-400 font-semibold">{daysLeft ? `${daysLeft} days to premiere` : 'Premiere'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Scroll Chevron */}
        <button 
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/60 hover:bg-black/90 text-white w-10 md:w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 backdrop-blur-xs rounded-l"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
}
