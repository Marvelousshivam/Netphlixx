import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles, Play, Info, RefreshCw, X, Star, Flame, Trophy, Film } from 'lucide-react';
import { UNIVERSES } from '../data/universesData';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const MOODS = [
  { id: 'surprise', name: '🎲 Surprise Me (Any)', icon: Dices, filter: '' },
  { id: 'action', name: '⚡ High Octane Action', icon: Flame, genre: '28' },
  { id: 'scifi', name: '🌌 Mind-Bending Sci-Fi', icon: Sparkles, genre: '878' },
  { id: 'comedy', name: '😂 Laugh Out Loud', icon: Film, genre: '35' },
  { id: 'thriller', name: '🔪 Edge of Your Seat', icon: Film, genre: '53' },
  { id: 'acclaimed', name: '🏆 Award Winners (8.0+)', icon: Trophy, minVote: 8 }
];

export default function MovieRoulette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(MOODS[0].id);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reelCandidates, setReelCandidates] = useState([]);
  const [previewPoster, setPreviewPoster] = useState(null);

  // Spin function: fetches candidate movies and animates
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
      url += `&vote_average.gte=${moodObj.minVote}&vote_count.gte=1000`;
    }

    try {
      const res = await fetch(url).then(r => r.json());
      const candidates = (res.results || []).filter(m => m.poster_path && m.backdrop_path && m.overview);

      if (candidates.length > 0) {
        setReelCandidates(candidates);

        // Reel tick animation cycling posters
        let ticks = 0;
        const interval = setInterval(() => {
          const rand = candidates[Math.floor(Math.random() * candidates.length)];
          setPreviewPoster(rand.poster_path);
          ticks++;
          if (ticks >= 14) {
            clearInterval(interval);
            const winner = candidates[Math.floor(Math.random() * candidates.length)];
            setSelectedMovie(winner);
            setPreviewPoster(winner.poster_path);
            setIsSpinning(false);
          }
        }, 100);
      } else {
        setIsSpinning(false);
      }
    } catch (err) {
      console.error("Spin error", err);
      setIsSpinning(false);
    }
  };

  // Automatically spin once on open if no winner chosen
  useEffect(() => {
    if (isOpen && !selectedMovie && !isSpinning) {
      spinRoulette();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl bg-[#141414] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/30 via-red-900/30 to-black">
          <div className="flex items-center space-x-2 text-[var(--accent-color,#E50914)] font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Netphlix Movie Roulette</span>
          </div>
          <h2 className="text-2xl font-black text-white font-display">
            Can't Decide What to Watch?
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Pick a vibe, spin the reel, and let serendipity pick your next favorite film.
          </p>

          {/* Mood Selector Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide mt-4">
            {MOODS.map(mood => (
              <button
                key={mood.id}
                onClick={() => {
                  setSelectedMood(mood.id);
                  setSelectedMovie(null);
                }}
                disabled={isSpinning}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition border flex-none ${
                  selectedMood === mood.id
                    ? 'bg-white text-black border-white shadow-md font-bold'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {mood.name}
              </button>
            ))}
          </div>
        </div>

        {/* Roulette Display Area */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[340px]">
          {isSpinning ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-40 aspect-[2/3] rounded-xl overflow-hidden border-2 border-[var(--accent-color,#E50914)] shadow-[0_0_25px_rgba(229,9,20,0.7)] animate-pulse bg-[#1a1a1a]">
                {previewPoster && (
                  <img
                    src={`${IMAGE_BASE_URL_W500}${previewPoster}`}
                    alt="Spinning..."
                    className="w-full h-full object-cover blur-sm scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-white animate-spin" />
                </div>
              </div>
              <span className="text-sm font-bold text-white mt-4 flex items-center animate-bounce">
                <Dices className="w-4 h-4 mr-2 text-[var(--accent-color,#E50914)]" />
                Spinning the Reel...
              </span>
            </div>
          ) : selectedMovie ? (
            <div className="w-full flex flex-col sm:flex-row gap-6 items-center">
              {/* Winner Poster */}
              <div className="relative w-36 sm:w-44 flex-none aspect-[2/3] rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <img
                  src={`${IMAGE_BASE_URL_W500}${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                  Winner Pick
                </div>
              </div>

              {/* Winner Info */}
              <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-gray-400 mb-1">
                  <span>{selectedMovie.release_date?.substring(0, 4)}</span>
                  <span>•</span>
                  <span className="text-yellow-400 font-bold flex items-center">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    {selectedMovie.vote_average?.toFixed(1)} / 10
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display line-clamp-2">
                  {selectedMovie.title}
                </h3>
                <p className="text-xs text-gray-300 mt-2 line-clamp-3 leading-relaxed">
                  {selectedMovie.overview}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center justify-center sm:justify-start space-x-3 mt-5">
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/watch/movie/${selectedMovie.id}`);
                    }}
                    className="flex items-center px-5 py-2.5 rounded-full bg-[var(--accent-color,#E50914)] hover:brightness-110 text-white font-bold text-xs shadow-xl transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white mr-2" />
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
              className="flex items-center px-6 py-3 rounded-full bg-[var(--accent-color,#E50914)] text-white font-black text-sm shadow-xl hover:scale-105 transition"
            >
              <Dices className="w-5 h-5 mr-2" />
              Spin the Reel!
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
