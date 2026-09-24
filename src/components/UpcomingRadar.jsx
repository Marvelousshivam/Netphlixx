import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Bell, Clock, Star, Play, Check, ChevronRight, ChevronLeft, Sparkles, Flame } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';
const IMAGE_BASE_URL_ORIGINAL = 'https://image.tmdb.org/t/p/original';

export default function UpcomingRadar() {
  const navigate = useNavigate();
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);

  useEffect(() => {
    async function fetchUpcomingRadar() {
      try {
        const today = new Date().toISOString().split('T')[0];
        // Fetch popular movies releasing from today onward
        const res = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${today}&sort_by=popularity.desc&page=1`
        ).then(r => r.json());

        if (res.results) {
          // Filter out titles with missing posters or release dates
          const valid = res.results.filter(m => m.poster_path && m.release_date);
          setUpcomingMovies(valid.slice(0, 10));
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

  if (loading || upcomingMovies.length === 0) return null;

  return (
    <div className="relative z-20 px-4 md:px-12 my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-amber-500 relative" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight font-display flex items-center">
            Upcoming Blockbuster Radar
          </h2>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
            Countdown Tracker
          </span>
        </div>
        <span className="text-xs text-gray-400 hidden sm:inline-block">
          Most anticipated upcoming theatrical releases
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-2 px-1">
        {upcomingMovies.map((movie) => {
          const daysLeft = calculateDaysLeft(movie.release_date);
          const isBookmarked = myList.some(m => m.id === movie.id);

          return (
            <div
              key={movie.id}
              onClick={() => navigate(`/title/movie/${movie.id}`)}
              className="flex-none w-44 sm:w-52 md:w-60 group cursor-pointer flex flex-col rounded-xl overflow-hidden bg-[#181818] border border-white/10 hover:border-amber-400/60 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              {/* Poster Image with countdown tag */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#202020]">
                <img
                  src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Days remaining badge */}
                <div className="absolute top-2 left-2 z-10 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {daysLeft !== null ? (daysLeft === 0 ? 'Releasing Today' : `${daysLeft} Days Left`) : 'Coming Soon'}
                </div>

                {/* Remind Me Button */}
                <button
                  onClick={(e) => toggleRemind(movie, e)}
                  title={isBookmarked ? "Reminder Saved" : "Set Reminder (Add to List)"}
                  className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition shadow-md border ${
                    isBookmarked 
                      ? 'bg-amber-400 text-black border-amber-400' 
                      : 'bg-black/60 hover:bg-black/90 text-white border-white/20'
                  }`}
                >
                  {isBookmarked ? <Check className="w-4 h-4 stroke-[3]" /> : <Bell className="w-3.5 h-3.5" />}
                </button>

                {/* Details Peek On Hover */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-[11px] text-gray-200 line-clamp-3 leading-snug mb-2">
                    {movie.overview || 'Premiere details coming soon.'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                    <span>View Trailer & Cast</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Movie Meta */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                  {movie.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-1.5">
                  <span className="flex items-center text-gray-300 font-medium">
                    <Calendar className="w-3 h-3 mr-1 text-amber-400" />
                    {movie.release_date}
                  </span>
                  <span className="text-[11px] text-gray-500 font-bold uppercase">Hype Radar</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
