import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Plus, Check, Info, Star, Calendar, Film, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FastAverageColor } from 'fast-average-color';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../context/ToastContext';
import { getContrastColor } from '../utils/contrast';
import { haptics } from '../utils/audioHaptics';
import { squishTap, squishHover } from '../utils/motionSprings';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const fac = new FastAverageColor();

function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type) return item.media_type;
  if (item.first_air_date || item.name) return 'tv';
  return 'movie';
}

export default function Hero({ movie, trending = [], onSelect }) {
  const [ambientColor, setAmbientColor] = useState('rgba(15,16,20,0.2)');
  const [details, setDetails] = useState(null);
  const [titleLogo, setTitleLogo] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const [accentColor] = useLocalStorage('netphlix_accent', '#E50914');
  const [ambilightLevel] = useLocalStorage('netphlix_ambilight_level', 'subtle');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const inMyList = movie ? myList.some((m) => m.id === movie.id) : false;

  const toggleList = (e) => {
    e?.stopPropagation();
    if (!movie) return;
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

  useEffect(() => {
    if (!movie) return;
    setTitleLogo(null);

    // 1. Subtle Dynamic Ambient Color Extraction
    const backdropUrl = movie.backdrop_path
      ? `${IMAGE_BASE_URL_W500}${movie.backdrop_path}`
      : movie.poster_path
      ? `${IMAGE_BASE_URL_W500}${movie.poster_path}`
      : null;

    if (backdropUrl) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = backdropUrl;
      img.onload = () => {
        fac.getColorAsync(img)
          .then((color) => {
            setAmbientColor(`rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 0.2)`);
          })
          .catch(() => {
            setAmbientColor('rgba(15,16,20,0.2)');
          });
      };
    }

    // 2. Fetch Details & Images (Transparent Logo)
    async function fetchHeroMedia() {
      const mediaType = getMediaType(movie);
      try {
        const detailsRes = await fetch(
          `${BASE_URL}/${mediaType}/${movie.id}?api_key=${API_KEY}&append_to_response=images`
        ).then((r) => r.json());
        setDetails(detailsRes);

        const logo =
          detailsRes.images?.logos?.find(
            (l) => l.iso_639_1 === 'en' && (l.file_path?.endsWith('.png') || l.file_path?.endsWith('.svg'))
          ) || detailsRes.images?.logos?.[0];
        if (logo?.file_path) {
          setTitleLogo(`${IMAGE_BASE_URL}${logo.file_path}`);
        }
      } catch (err) {
        console.error('Failed to fetch hero media', err);
      }
    }

    fetchHeroMedia();
  }, [movie]);

  // Carousel slide items (top 6 trending items)
  const pagerItems = trending.slice(0, 6);
  const activeIndex = Math.max(
    0,
    pagerItems.findIndex((m) => m.id === movie?.id)
  );

  // Auto-advance Carousel every 6 seconds (pauses on hover)
  useEffect(() => {
    if (!pagerItems || pagerItems.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % pagerItems.length;
      if (onSelect && pagerItems[nextIndex]) {
        onSelect(pagerItems[nextIndex]);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [activeIndex, pagerItems, onSelect, isPaused]);

  if (!movie) {
    return <div className="h-[100dvh] min-h-[600px] bg-[#0f1014]" />;
  }

  const isTV = getMediaType(movie) === 'tv';
  const displayTitle = movie.title || movie.name || movie.original_title || movie.original_name;
  const releaseYear = (movie.release_date || movie.first_air_date || '').substring(0, 4);

  const onPlay = () => {
    navigate(`/watch/${isTV ? 'tv' : 'movie'}/${movie.id}`, {
      state: { from: location.pathname + location.search },
    });
  };

  const onInfo = () => {
    navigate(`/title/${isTV ? 'tv' : 'movie'}/${movie.id}`, {
      state: { movie, from: location.pathname + location.search },
    });
  };

  const playTextColor = getContrastColor(accentColor);

  return (
    <header
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-screen min-h-[640px] max-h-screen text-white bg-[#0f1014] overflow-hidden select-none"
    >
      {/* 1. Dynamic Ambient Projection (Responsive to user Ambilight setting) */}
      {ambilightLevel !== 'off' && (
        <div
          className={`absolute inset-0 z-0 pointer-events-none transition-all duration-1000 mix-blend-screen ${
            ambilightLevel === 'vivid' ? 'opacity-90' : 'opacity-55'
          }`}
          style={{
            background: `radial-gradient(circle at 65% 30%, ${ambientColor} 0%, transparent ${
              ambilightLevel === 'vivid' ? '75%' : '60%'
            })`,
          }}
        />
      )}

      {/* 2. Full-Bleed TMDB Backdrop Artwork with 0.6s Crossfade + Living Theatrical Zoom */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full z-0 overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.03] }}
            transition={{ duration: 6, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <picture>
              <source
                media="(min-width: 768px)"
                srcSet={`${IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`}
              />
              <img
                src={`${IMAGE_BASE_URL_W500}${movie.poster_path || movie.backdrop_path}`}
                alt={displayTitle}
                className="w-full h-full object-cover object-[center_20%] md:object-[center_15%] filter brightness-[0.92]"
              />
            </picture>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* 3. Multi-Layered Cinematic Gradient Scrims */}
      {/* Left-side scrim on desktop for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014] via-[#0f1014]/70 md:via-[#0f1014]/40 to-transparent z-10 pointer-events-none" />
      {/* Bottom fade: transparent at top -> bg #0f1014 at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/30 to-transparent z-10 pointer-events-none" />
      {/* Top subtle fade under navbar */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0f1014]/60 to-transparent z-10 pointer-events-none" />

      {/* 4. Content Presentation Stack (Bottom Left) */}
      <div className="relative z-20 h-full max-w-[1920px] mx-auto px-4 md:px-12 flex flex-col justify-end pb-20 md:pb-24">
        <div className="max-w-2xl md:max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col items-start"
            >
              {/* Title: Transparent Logo Art or Outfit 700 Heading */}
              {titleLogo ? (
                <div className="mb-3.5 max-w-sm md:max-w-md max-h-24 md:max-h-28 flex items-center">
                  <img
                    src={titleLogo}
                    alt={displayTitle}
                    className="max-h-20 md:max-h-24 w-auto object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  />
                </div>
              ) : (
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-display tracking-tight text-white mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] leading-[1.08]">
                  {displayTitle}
                </h1>
              )}

              {/* Quiet, Refined Metadata Row (Cinejoy style) */}
              <div className="flex flex-wrap items-center gap-2.5 mb-3 text-xs md:text-[13px] text-[#8a8a93] font-medium">
                {movie.vote_average > 0 && (
                  <div className="m3-hero-chip flex items-center space-x-1 text-white">
                    <Star className="w-3.5 h-3.5 text-[#ffb800] fill-[#ffb800]" />
                    <span className="font-semibold">{movie.vote_average.toFixed(1)}/10</span>
                  </div>
                )}

                {releaseYear && (
                  <div className="m3-hero-chip flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8a8a93]" />
                    <span>{releaseYear}</span>
                  </div>
                )}

                {details?.genres?.[0] && (
                  <div className="m3-hero-chip flex items-center space-x-1">
                    <Film className="w-3.5 h-3.5 text-[#8a8a93]" />
                    <span>{details.genres[0].name}</span>
                  </div>
                )}

                {details?.runtime ? (
                  <div className="m3-hero-chip flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[#8a8a93]" />
                    <span>
                      {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                    </span>
                  </div>
                ) : details?.number_of_seasons ? (
                  <div className="m3-hero-chip flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[#8a8a93]" />
                    <span>
                      {details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Synopsis: 3-line clamped */}
              {movie.overview && (
                <p className="text-xs md:text-sm text-white/75 font-normal line-clamp-3 mb-6 max-w-xl leading-relaxed">
                  {movie.overview}
                </p>
              )}

              {/* Actions Cluster: Play, Add to List, More Info with Genjutsu Squishy Spring Physics */}
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={squishHover}
                  whileTap={squishTap}
                  onClick={() => {
                    haptics.playClick();
                    onPlay();
                  }}
                  style={{ backgroundColor: accentColor, color: playTextColor }}
                  className="cta-shine m3-btn-fab px-6 md:px-7 py-2.5 md:py-3 rounded-full font-bold text-xs md:text-sm flex items-center space-x-2 shadow-xl cursor-pointer squish-btn"
                  aria-label="Play"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play</span>
                </motion.button>

                <motion.button
                  whileHover={squishHover}
                  whileTap={squishTap}
                  onClick={() => {
                    haptics.playClick();
                    toggleList();
                  }}
                  className={`w-10 h-10 md:w-11 md:h-11 rounded-full m3-icon-badge-a apple-glass-pill flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    inMyList
                      ? 'text-white border-white/40 bg-white/15'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
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
                    {inMyList ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </motion.div>
                </motion.button>

                <motion.button
                  whileHover={squishHover}
                  whileTap={squishTap}
                  onClick={() => {
                    haptics.playClick();
                    onInfo();
                  }}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full m3-icon-badge-b apple-glass-pill text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title="More Information"
                  aria-label="More Information"
                >
                  <Info className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 5. Cinejoy Dot Pager (Bottom Right) with Active Lozenge Pill & Genjutsu Glide */}
      {pagerItems.length > 1 && (
        <div className="absolute bottom-20 md:bottom-24 right-4 md:right-12 z-30 flex items-center space-x-2">
          {pagerItems.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                onClick={() => onSelect && onSelect(item)}
                className="relative h-1.5 py-2 flex items-center cursor-pointer"
                aria-label={`Slide ${idx + 1}`}
              >
                {isActive ? (
                  <motion.div
                    layoutId="heroPagerLozenge"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="w-5 h-1.5 bg-white rounded-full shadow-sm"
                  />
                ) : (
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full hover:bg-white/80 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
