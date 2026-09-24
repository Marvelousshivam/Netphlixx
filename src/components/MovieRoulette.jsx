import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles, Play, Info, RefreshCw, X, Star, Flame, Trophy, Film } from 'lucide-react';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const MOODS = [
  { id: 'surprise', name: 'Surprise Me', icon: Dices, filter: '' },
  { id: 'action', name: 'Action', icon: Flame, genre: '28' },
  { id: 'scifi', name: 'Sci-Fi', icon: Sparkles, genre: '878' },
  { id: 'comedy', name: 'Comedy', icon: Film, genre: '35' },
  { id: 'thriller', name: 'Thriller', icon: Film, genre: '53' },
  { id: 'acclaimed', name: 'Top Rated (8+ ★)', icon: Trophy, minVote: 8 }
];

export default function MovieRoulette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(MOODS[0].id);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [previewPoster, setPreviewPoster] = useState(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const spinRoulette = async () => {
    setIsSpinning(true);
    setSelectedMovie(null);

    const moodObj = MOODS.find(m => m.id === selectedMood) || MOODS[0];
    const randomPage = Math.floor(Math.random() * 5) + 1;

    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${randomPage}&sort_by=popularity.desc`;
    if (moodObj.genre) {
      url += `&with_genres=${moodObj.genre}`;
    }
    if (moodObj.minVote) {
      url += `&vote_average.gte=${moodObj.minVote}&vote_count.gte=800`;
    }

    try {
      const res = await fetch(url).then(r => r.json());
      const candidates = (res.results || []).filter(m => m.poster_path && m.backdrop_path && m.overview);

      if (candidates.length > 0) {
        let ticks = 0;
        const interval = setInterval(() => {
          const rand = candidates[Math.floor(Math.random() * candidates.length)];
          setPreviewPoster(rand.poster_path);
          ticks++;
          if (ticks >= 12) {
            clearInterval(interval);
            const winner = candidates[Math.floor(Math.random() * candidates.length)];
            setSelectedMovie(winner);
            setPreviewPoster(winner.poster_path);
            setIsSpinning(false);
          }
        }, 90);
      } else {
        setIsSpinning(false);
      }
    } catch (err) {
      console.error("Spin error", err);
      setIsSpinning(false);
    }
  };

  useEffect(() => {
    if (isOpen && !selectedMovie && !isSpinning) {
      spinRoulette();
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl bg-[#0f1014] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 bg-[#14151a]">
          <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Netphlix Reel</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Movie Roulette
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Pick a genre and spin the reel to discover your next watch.
          </p>

          {/* Mood Pills matching site buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide mt-4">
            {MOODS.map(mood => (
              <button
                key={mood.id}
                onClick={() => {
                  setSelectedMood(mood.id);
                  setSelectedMovie(null);
                }}
                disabled={isSpinning}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all border flex-none ${
                  selectedMood === mood.id
                    ? 'bg-white text-black border-white shadow-md font-bold'
                    : 'border-white/20 text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {mood.name}
              </button>
            ))}
          </div>
        </div>

        {/* Roulette Display */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[320px]">
          {isSpinning ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-36 aspect-[2/3] rounded-xl overflow-hidden border-2 border-blue-500 shadow-[0_0_20px_rgba(43,130,246,0.5)] animate-pulse bg-[#1a1a1a]">
                {previewPoster && (
                  <img
                    src={`${IMAGE_BASE_URL_W500}${previewPoster}`}
                    alt="Spinning..."
                    className="w-full h-full object-cover blur-xs scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              <span className="text-sm font-semibold text-white mt-4 flex items-center animate-pulse">
                <Dices className="w-4 h-4 mr-2 text-blue-400" />
                Spinning the Reel...
              </span>
            </div>
          ) : selectedMovie ? (
            <div className="w-full flex flex-col sm:flex-row gap-6 items-center">
              {/* Poster */}
              <div className="relative w-32 sm:w-40 flex-none aspect-[2/3] rounded-lg overflow-hidden border border-white/20 shadow-xl">
                <img
                  src={`${IMAGE_BASE_URL_W500}${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-gray-400 mb-1">
                  <span>{selectedMovie.release_date?.substring(0, 4)}</span>
                  <span>•</span>
                  <span className="text-yellow-400 font-bold flex items-center">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    {selectedMovie.vote_average?.toFixed(1)}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display line-clamp-2">
                  {selectedMovie.title}
                </h3>
                <p className="text-xs text-gray-300 mt-2 line-clamp-3 leading-relaxed">
                  {selectedMovie.overview}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-center sm:justify-start space-x-3 mt-5">
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/watch/movie/${selectedMovie.id}`);
                    }}
                    className="flex items-center px-6 py-2.5 rounded-full bg-white text-black hover:bg-white/90 font-bold text-xs shadow-xl transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-black mr-2" />
                    Watch Now
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/title/movie/${selectedMovie.id}`);
                    }}
                    className="flex items-center px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition active:scale-95"
                  >
                    <Info className="w-3.5 h-3.5 mr-2" />
                    Details
                  </button>
                  <button
                    onClick={spinRoulette}
                    title="Spin Again"
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={spinRoulette}
              className="flex items-center px-6 py-3 rounded-full bg-white text-black font-bold text-sm shadow-xl hover:scale-105 transition"
            >
              <Dices className="w-5 h-5 mr-2" />
              Spin the Reel
            </button>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
