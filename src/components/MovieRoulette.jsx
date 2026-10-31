import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dices, Play, RefreshCw, X, Star, Flame, Trophy, Film, Sparkles, Info } from 'lucide-react';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const MOODS = [
  { id: 'surprise', name: 'Surprise Me', icon: Dices, filter: '' },
  { id: 'action', name: 'Action', icon: Flame, genre: '28' },
  { id: 'scifi', name: 'Sci-Fi', icon: Sparkles, genre: '878' },
  { id: 'comedy', name: 'Comedy', icon: Film, genre: '35' },
  { id: 'thriller', name: 'Thriller', icon: Film, genre: '53' },
  { id: 'acclaimed', name: 'Top Rated', icon: Trophy, minVote: 8 },
];

export default function MovieRoulette({ isOpen = true, onClose }) {
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

    const moodObj = MOODS.find((m) => m.id === selectedMood) || MOODS[0];
    const randomPage = Math.floor(Math.random() * 5) + 1;

    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&include_adult=false&page=${randomPage}&sort_by=popularity.desc`;
    if (moodObj.genre) {
      url += `&with_genres=${moodObj.genre}`;
    }
    if (moodObj.minVote) {
      url += `&vote_average.gte=${moodObj.minVote}&vote_count.gte=800`;
    }

    try {
      const res = await fetch(url).then((r) => r.json());
      const candidates = (res.results || []).filter(
        (m) => !m.adult && m.poster_path && m.backdrop_path && m.overview
      );

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
      console.error('Spin error', err);
      setIsSpinning(false);
    }
  };

  useEffect(() => {
    if (isOpen && !selectedMovie && !isSpinning) {
      spinRoulette();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl frost-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full frost-pill text-white/80 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] bg-[#12141a]/90">
          <div className="flex items-center space-x-2 text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Roulette</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white font-display">
            Movie Roulette
          </h2>
          <p className="text-[#8a8a93] text-xs mt-1">
            Pick a mood and spin to discover your next watch.
          </p>

          {/* Mood Pills (White Lozenge Active Style) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-hide mt-4">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => {
                  setSelectedMood(mood.id);
                  setSelectedMovie(null);
                }}
                disabled={isSpinning}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all flex-none ${
                  selectedMood === mood.id
                    ? 'bg-white text-[#0f1014] shadow-sm font-bold'
                    : 'frost-pill text-white/60 hover:text-white'
                }`}
              >
                {mood.name}
              </button>
            ))}
          </div>
        </div>

        {/* Roulette Display */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          {isSpinning ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-32 aspect-[2/3] rounded-xl overflow-hidden border border-white/20 shadow-xl bg-[#14151b]">
                {previewPoster && (
                  <img
                    src={`${IMAGE_BASE_URL_W500}${previewPoster}`}
                    alt="Spinning..."
                    className="w-full h-full object-cover filter brightness-90 scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-[#0f1014]/50 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-white animate-spin" />
                </div>
              </div>
              <span className="text-xs font-medium text-white/80 mt-4 flex items-center">
                <Dices className="w-3.5 h-3.5 mr-2 text-white/80" />
                Spinning the Reel...
              </span>
            </div>
          ) : selectedMovie ? (
            <div className="w-full flex flex-col sm:flex-row gap-5 items-center">
              {/* Poster */}
              <div className="relative w-28 sm:w-36 flex-none aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-lg bg-[#14151b]">
                <img
                  src={`${IMAGE_BASE_URL_W500}${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-[#8a8a93] mb-1">
                  <span>{selectedMovie.release_date?.substring(0, 4)}</span>
                  {selectedMovie.vote_average > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-white font-medium flex items-center">
                        <Star className="w-3 h-3 fill-[#ffb800] text-[#ffb800] mr-1" />
                        {selectedMovie.vote_average?.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-display line-clamp-2">
                  {selectedMovie.title}
                </h3>
                <p className="text-xs text-white/70 mt-2 line-clamp-3 leading-relaxed">
                  {selectedMovie.overview}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-center sm:justify-start space-x-2.5 mt-5">
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/watch/movie/${selectedMovie.id}`);
                    }}
                    className="flex items-center px-5 py-2 rounded-full bg-white text-[#0f1014] font-bold text-xs shadow-md transition-all hover:opacity-90 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#0f1014] mr-1.5" />
                    Watch Now
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/title/movie/${selectedMovie.id}`);
                    }}
                    className="flex items-center px-4 py-2 rounded-full frost-pill text-white/80 hover:text-white font-medium text-xs transition active:scale-95"
                  >
                    <Info className="w-3.5 h-3.5 mr-1.5" />
                    Details
                  </button>
                  <button
                    onClick={spinRoulette}
                    title="Spin Again"
                    className="p-2 rounded-full frost-pill text-white/80 hover:text-white transition active:scale-95"
                    aria-label="Spin Again"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={spinRoulette}
              className="flex items-center px-6 py-2.5 rounded-full bg-white text-[#0f1014] font-bold text-xs shadow-md hover:opacity-90 transition"
            >
              <Dices className="w-4 h-4 mr-2" />
              Spin the Reel
            </button>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
