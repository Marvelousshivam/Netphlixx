import { memo } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Check, Info, X, Star } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../context/ToastContext';
import { getContrastColor } from '../utils/contrast';
import { haptics } from '../utils/audioHaptics';
import { squishTap, squishHover } from '../utils/motionSprings';

const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type === 'tv') return 'tv';
  if (item.media_type === 'movie') return 'movie';
  if (item.first_air_date && !item.release_date) return 'tv';
  if (item.number_of_seasons || item.seasons) return 'tv';
  return 'movie';
}

const RowCard = memo(function RowCard({
  movie,
  isLargeRow,
  isTop10,
  onNavigate,
  onRemove,
  isLandscape = false,
}) {
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const [accentColor] = useLocalStorage('netphlix_accent', '#E50914');
  const { showToast } = useToast();
  const inMyList = myList.some((m) => m.id === movie.id);

  const toggleList = (e) => {
    e.stopPropagation();
    const movieTitle = movie.title || movie.name;
    if (inMyList) {
      setMyList((prev) => prev.filter((m) => m.id !== movie.id));
      showToast({
        title: 'Removed from Watchlist',
        message: movieTitle,
        type: 'info',
      });
    } else {
      setMyList((prev) => [
        {
          id: movie.id,
          title: movie.title || movie.name,
          name: movie.title || movie.name,
          media_type: getMediaType(movie),
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date || movie.first_air_date,
        },
        ...prev,
      ]);
      showToast({
        title: 'Added to Watchlist',
        message: movieTitle,
        poster: movie.poster_path,
        type: 'success',
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onNavigate(movie, isLandscape ? 'play' : 'info');
    }
  };

  const title = movie.title || movie.name || movie.original_title || movie.original_name;
  const year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
  const mediaType = getMediaType(movie);
  const isTV = mediaType === 'tv' && movie.media_type !== 'movie';
  const progressPercent = movie.progressPercent || movie.progress || 0;

  const imageSrc = isLandscape
    ? movie.backdrop_path
      ? `${IMAGE_BASE_URL_W500}${movie.backdrop_path}`
      : movie.poster_path
      ? `${IMAGE_BASE_URL_W500}${movie.poster_path}`
      : null
    : movie.poster_path
    ? `${IMAGE_BASE_URL_W500}${movie.poster_path}`
    : movie.backdrop_path
    ? `${IMAGE_BASE_URL_W500}${movie.backdrop_path}`
    : null;

  const playTextColor = getContrastColor(accentColor);

  // Rectangular Continue Watching Card (16:9 Landscape with Progress & Resume Overlay)
  if (isLandscape) {
    return (
      <motion.div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        whileHover={squishHover}
        whileTap={squishTap}
        className="group/card poster-card relative flex-none cursor-pointer rounded-xl overflow-hidden bg-[#14151b] border border-white/[0.08] hover:border-white/30 transition-colors select-none w-56 sm:w-64 md:w-72 aspect-video focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1014] shadow-md squish-btn"
        onClick={() => {
          haptics.playClick();
          onNavigate(movie, 'play');
        }}
      >
        {/* Backdrop Artwork */}
        {imageSrc ? (
          <LazyLoadImage
            effect="blur"
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#181a22] p-3 text-center text-xs text-white/50">
            {title}
          </div>
        )}

        {/* Gradient Scrim for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/40 to-transparent pointer-events-none" />

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-white/95 text-[#0f1014] flex items-center justify-center shadow-xl group-hover/card:scale-110 group-hover/card:bg-white transition-all">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        </div>

        {/* Top-Right Remove Button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2.5 right-2.5 z-40 w-7 h-7 rounded-full frost-pill text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-white/20 shadow-md"
            title="Remove from Continue Watching"
            aria-label="Remove item"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom Info Stack */}
        <div className="absolute bottom-2.5 left-3 right-3 z-20 pointer-events-none">
          <h4 className="text-xs sm:text-sm font-semibold text-white truncate font-display drop-shadow">
            {title}
          </h4>
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-[#8a8a93] font-medium mt-0.5">
            {isTV && (movie.season !== undefined || movie.episode !== undefined) ? (
              <span className="text-white/80 font-semibold">
                S{movie.season || 1} • E{movie.episode || 1}
              </span>
            ) : (
              <span>{year || 'Movie'}</span>
            )}
            {isTV && year && (
              <>
                <span>•</span>
                <span>{year}</span>
              </>
            )}
          </div>
        </div>

        {/* Bottom Progress Bar (only rendered if user has watched part of the title) */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, Math.max(3, progressPercent))}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      whileHover={squishHover}
      whileTap={squishTap}
      onClick={() => {
        haptics.playClick();
        onNavigate(movie, 'info');
      }}
      className={`group/card poster-card relative flex-none cursor-pointer rounded-xl md:rounded-2xl overflow-hidden bg-[#14151b] border border-white/[0.08] hover:border-white/30 hover:ring-1 hover:ring-white/20 hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)] transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1014] squish-btn ${
        isLargeRow ? 'w-36 sm:w-44 md:w-52 aspect-[2/3]' : 'w-36 sm:w-44 md:w-52 aspect-[2/3]'
      }`}
    >
      {/* Poster Image with Luxury Dark Shimmer placeholder */}
      {imageSrc ? (
        <LazyLoadImage
          effect="blur"
          src={imageSrc}
          alt={title}
          placeholder={<div className="w-full h-full shimmer" />}
          className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#181a22] p-3 text-center text-xs text-white/50">
          {title}
        </div>
      )}

      {/* Remove Button for Watch History / My List */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 z-40 w-7 h-7 rounded-full frost-pill text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-white/20 shadow-md cursor-pointer"
          title="Remove from row"
          aria-label="Remove item"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Rating Pill Badge (Top Left) - quiet and subtle */}
      {movie.vote_average > 0 && !isTop10 && (
        <div className="absolute top-2 left-2 z-20 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white shadow-sm">
          <Star className="w-3 h-3 text-[#ffb800] fill-[#ffb800]" />
          <span>{movie.vote_average.toFixed(1)}</span>
        </div>
      )}

      {/* Continue Watching Progress Bar */}
      {progressPercent > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${Math.min(100, Math.max(5, progressPercent))}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      )}

      {/* Cinejoy-Style Frost Context Overlay on Desktop Hover */}
      <div className="hidden md:flex absolute inset-0 z-20 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/65 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex-col justify-end p-3">
        <h4 className="text-white font-bold text-xs md:text-sm line-clamp-1 mb-1 font-display">
          {title}
        </h4>

        <div className="flex items-center space-x-1.5 text-[11px] text-[#8a8a93] mb-3">
          {year && <span>{year}</span>}
          {movie.vote_average > 0 && (
            <>
              <span>•</span>
              <span className="text-white/80">★ {movie.vote_average.toFixed(1)}</span>
            </>
          )}
        </div>

        {/* Quick Action Buttons with Staggered Spring Physics */}
        <div className="flex items-center space-x-2">
          {/* Play */}
          <motion.button
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(movie, 'play');
            }}
            style={{ backgroundColor: accentColor, color: playTextColor }}
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md cursor-pointer"
            title="Play Now"
            aria-label="Play Now"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </motion.button>

          {/* Add / Remove List */}
          <motion.button
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={toggleList}
            className={`w-8 h-8 rounded-full frost-pill flex items-center justify-center transition-all cursor-pointer shadow-md ${
              inMyList ? 'text-white border-white/40 bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/20'
            }`}
            title={inMyList ? 'Remove from My List' : 'Add to My List'}
            aria-label="Watchlist toggle"
          >
            <motion.div
              key={inMyList ? 'checked' : 'plus'}
              initial={{ scale: 0.6, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            >
              {inMyList ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
            </motion.div>
          </motion.button>

          {/* Info */}
          <motion.button
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(movie, 'info');
            }}
            className="w-8 h-8 rounded-full frost-pill text-white/80 hover:text-white flex items-center justify-center transition-all hover:bg-white/20 cursor-pointer shadow-md ml-auto"
            title="More Info"
            aria-label="More Info"
          >
            <Info className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

export default RowCard;
