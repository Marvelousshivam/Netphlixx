import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  ArrowLeft,
  Star,
  Plus,
  Check,
  Share2,
  Film,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FastAverageColor } from 'fast-average-color';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../context/ToastContext';
import { haptics } from '../utils/audioHaptics';
import { squishTap, squishHover } from '../utils/motionSprings';
import { getContrastColor } from '../utils/contrast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FranchiseTimeline from '../components/FranchiseTimeline';
import RowCard from '../components/RowCard';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const fac = new FastAverageColor();

function formatCurrency(amount) {
  if (!amount || amount === 0) return null;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(0)}M`;
  return `$${amount.toLocaleString()}`;
}

function getEndTime(runtimeMinutes) {
  if (!runtimeMinutes) return null;
  const end = new Date(Date.now() + runtimeMinutes * 60 * 1000);
  return end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function TitlePage() {
  const { type = 'movie', id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const castScrollRef = useRef(null);

  const [details, setDetails] = useState(location.state?.movie || null);
  const [loading, setLoading] = useState(!details);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [ambientColor, setAmbientColor] = useState('rgba(15,16,20,0.2)');
  const [collectionMovies, setCollectionMovies] = useState([]);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const [accentColor] = useLocalStorage('netphlix_accent', '#E50914');
  const { showToast } = useToast();
  const inList = myList.some((m) => m.id === parseInt(id));

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const fetchSeasonEpisodes = useCallback(
    async (seasonNum) => {
      setSelectedSeason(seasonNum);
      try {
        const res = await fetch(
          `${BASE_URL}/tv/${id}/season/${seasonNum}?api_key=${API_KEY}`
        ).then((r) => r.json());
        setEpisodes(res.episodes || []);
      } catch {
        setEpisodes([]);
      }
    },
    [id]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    let isCancelled = false;

    async function fetchDetails() {
      setLoading(true);
      const appendStr =
        type === 'movie'
          ? 'credits,videos,images,release_dates,watch/providers'
          : 'credits,videos,images,content_ratings,watch/providers';
      const url = `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=${appendStr}`;

      try {
        const res = await fetch(url).then((r) => r.json());
        if (!isCancelled) {
          setDetails(res);
          setLoading(false);

          // Subtle dynamic ambient wash
          if (res.poster_path || res.backdrop_path) {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = `${IMAGE_BASE_URL_W500}${res.backdrop_path || res.poster_path}`;
            img.onload = () => {
              fac.getColorAsync(img)
                .then((c) =>
                  setAmbientColor(`rgba(${c.value[0]}, ${c.value[1]}, ${c.value[2]}, 0.2)`)
                )
                .catch(() => {});
            };
          }

          if (res.belongs_to_collection) {
            try {
              const colRes = await fetch(
                `${BASE_URL}/collection/${res.belongs_to_collection.id}?api_key=${API_KEY}`
              ).then((r) => r.json());
              if (colRes.parts && !isCancelled) {
                setCollectionMovies(
                  colRes.parts.sort(
                    (a, b) =>
                      new Date(a.release_date || '2099-01-01') -
                      new Date(b.release_date || '2099-01-01')
                  )
                );
              }
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error('Error fetching details', err);
        if (!isCancelled) setLoading(false);
      }

      // Fetch curated recommendations (with fallback to filtered similar)
      try {
        const recUrl = `${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}`;
        const recRes = await fetch(recUrl).then((r) => r.json());
        let validRecs = (recRes.results || []).filter(
          (m) => m.poster_path && (m.vote_count || 0) >= 30
        );

        if (validRecs.length < 4) {
          const simUrl = `${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}`;
          const simRes = await fetch(simUrl).then((r) => r.json());
          const validSimilar = (simRes.results || []).filter(
            (m) => m.poster_path && (m.vote_count || 0) >= 60 && (m.vote_average || 0) >= 5.5
          );
          validRecs = [...validRecs, ...validSimilar];
        }

        if (!isCancelled) {
          // De-duplicate
          const seen = new Set();
          const unique = validRecs.filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          });
          setRecommendations(unique.slice(0, 12));
        }
      } catch {
        // ignore
      }

      if (type === 'tv') {
        fetchSeasonEpisodes(1);
      }
    }

    fetchDetails();
    return () => {
      isCancelled = true;
    };
  }, [type, id, fetchSeasonEpisodes]);

  // Cast mouse wheel horizontal scroll listener
  useEffect(() => {
    const el = castScrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.5;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [details]);

  const scrollCast = (direction) => {
    if (castScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      castScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const toggleMyList = () => {
    if (!details) return;
    const mediaTitle = details.title || details.name;
    if (inList) {
      setMyList((prev) => prev.filter((m) => m.id !== parseInt(id)));
      showToast({
        title: 'Removed from Watchlist',
        message: mediaTitle,
        type: 'info',
      });
    } else {
      setMyList((prev) => [
        {
          id: parseInt(id),
          title: details.title || details.name,
          name: details.title || details.name,
          media_type: type,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          vote_average: details.vote_average,
          release_date: details.release_date || details.first_air_date,
        },
        ...prev,
      ]);
      showToast({
        title: 'Added to Watchlist',
        message: mediaTitle,
        poster: details.poster_path,
        type: 'success',
      });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      showToast({
        title: 'Link Copied',
        message: 'Share URL copied to clipboard',
        type: 'magic',
      });
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (loading || !details) {
    return (
      <div className="min-h-screen bg-[#0f1014] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const endTime = getEndTime(details.runtime);
  const castList = details.credits?.cast?.slice(0, 18) || [];
  const releaseDate = details.release_date || details.first_air_date;
  const releaseYear = (releaseDate || '').substring(0, 4);

  // Certification extraction
  const certification =
    type === 'movie'
      ? details.release_dates?.results?.find(
          (r) => r.iso_3166_1 === 'US' || r.iso_3166_1 === 'IN' || r.iso_3166_1 === 'GB'
        )?.release_dates?.find((d) => d.certification)?.certification || null
      : details.content_ratings?.results?.find(
          (r) => r.iso_3166_1 === 'US' || r.iso_3166_1 === 'IN' || r.iso_3166_1 === 'GB'
        )?.rating || null;

  // Watch providers check (Section 5.3: only show real flatrate providers)
  const providersData =
    details['watch/providers']?.results?.IN ||
    details['watch/providers']?.results?.US;
  const realProviders = providersData?.flatrate?.filter((p) => p.provider_name) || [];

  const logo =
    details.images?.logos?.find(
      (l) => l.iso_639_1 === 'en' && (l.file_path?.endsWith('.png') || l.file_path?.endsWith('.svg'))
    ) || details.images?.logos?.[0];

  const playTextColor = getContrastColor(accentColor);
  const displayTitle = details.title || details.name;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-[#0f1014] text-white select-none pb-20 relative overflow-x-hidden font-sans"
    >
      <Navbar />

      {/* Subtle Top Glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[65vh] pointer-events-none transition-all duration-1000 opacity-20 mix-blend-screen"
        style={{
          background: `radial-gradient(circle at 50% 15%, ${ambientColor} 0%, transparent 65%)`,
        }}
      />

      {/* Full Bleed Backdrop Scrim */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
        <img
          src={`${IMAGE_BASE_URL}${details.backdrop_path || details.poster_path}`}
          alt={displayTitle}
          className="w-full h-full object-cover object-top md:object-[center_top] filter brightness-[0.82]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014]/80 via-transparent to-transparent" />
      </div>

      {/* Inline Top Back Button (Natural scroll flow, not fixed in void) */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-12 -mt-44 md:-mt-52 relative z-30 mb-6">
        <button
          onClick={() => {
            haptics.playClick();
            handleBack();
          }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-xs md:text-sm font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* SECTION 1: 2-Column Hero Cluster (Poster + Metadata/Actions/Overview/InfoCard) */}
      <div className="relative z-20 max-w-[1500px] mx-auto px-4 md:px-12 flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Left Column: High-Res Poster */}
        <div className="w-44 sm:w-56 md:w-64 flex-none mx-auto md:mx-0">
          <div className="relative aspect-[2/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-t-white/35 border-white/[0.08] bg-[#14151b]">
            <img
              src={`${IMAGE_BASE_URL_W500}${details.poster_path || details.backdrop_path}`}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
            {details.vote_average > 0 && (
              <div className="absolute top-2.5 left-2.5 flex items-center space-x-1 px-2.5 py-0.5 rounded-full apple-glass-pill border border-white/20 text-[11px] font-bold text-white shadow-md">
                <Star className="w-3 h-3 text-[#ffb800] fill-[#ffb800]" />
                <span>{details.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Title, Metadata, Actions, Synopsis, Info Card */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Logo or Title Heading */}
          {logo?.file_path ? (
            <div className="mb-3 max-w-sm md:max-w-md max-h-24 md:max-h-28 flex items-center">
              <img
                src={`${IMAGE_BASE_URL_W500}${logo.file_path}`}
                alt={displayTitle}
                className="max-h-20 md:max-h-24 w-auto object-contain filter drop-shadow-md"
              />
            </div>
          ) : (
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display tracking-tight text-white mb-2">
              {displayTitle}
            </h1>
          )}

          {/* Quiet Meta Row */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-[#8a8a93] font-medium">
            {details.vote_average > 0 && (
              <div className="flex items-center space-x-1 text-white">
                <Star className="w-3.5 h-3.5 text-[#ffb800] fill-[#ffb800]" />
                <span className="font-semibold">{details.vote_average.toFixed(1)}/10</span>
              </div>
            )}

            {releaseYear && (
              <>
                <span>•</span>
                <span>{releaseYear}</span>
              </>
            )}

            {certification && (
              <>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold apple-glass-pill text-white/80">
                  {certification}
                </span>
              </>
            )}

            {details.runtime ? (
              <>
                <span>•</span>
                <span>
                  {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                </span>
              </>
            ) : details.number_of_seasons ? (
              <>
                <span>•</span>
                <span>
                  {details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}
                </span>
              </>
            ) : null}

            {details.genres?.[0] && (
              <>
                <span>•</span>
                <span className="text-white/80">
                  {details.genres.map((g) => g.name).slice(0, 3).join(', ')}
                </span>
              </>
            )}
          </div>

          {/* Apple TV+ Style Floating Action Dock with Genjutsu Squish Physics */}
          <div className="inline-flex items-center space-x-2.5 p-1.5 rounded-full apple-glass border border-t-white/35 border-white/[0.08] shadow-xl mb-5 w-fit">
            <motion.button
              whileHover={squishHover}
              whileTap={squishTap}
              onClick={() => {
                haptics.playClick();
                navigate(`/watch/${type}/${id}`, {
                  state: { from: location.pathname + location.search },
                });
              }}
              style={{ backgroundColor: accentColor, color: playTextColor }}
              className="cta-shine px-6 py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center space-x-2 shadow-lg cursor-pointer squish-btn"
              aria-label="Play Now"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Watch Now</span>
            </motion.button>

            {/* Watchlist Frosted Circle */}
            <motion.button
              whileHover={squishHover}
              whileTap={squishTap}
              onClick={() => {
                haptics.playClick();
                toggleMyList();
              }}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full apple-glass-pill flex items-center justify-center transition-all cursor-pointer shadow-sm squish-btn ${
                inList
                  ? 'text-white border-white/40 bg-white/20'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label="Watchlist toggle"
            >
              <motion.div
                key={inList ? 'checked' : 'plus'}
                initial={{ scale: 0.6, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              >
                {inList ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                )}
              </motion.div>
            </motion.button>

            {/* Share Frosted Circle */}
            <motion.button
              whileHover={squishHover}
              whileTap={squishTap}
              onClick={() => {
                haptics.playClick();
                handleShare();
              }}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full apple-glass-pill flex items-center justify-center transition-all cursor-pointer shadow-sm squish-btn ${
                copiedShare
                  ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={copiedShare ? 'Copied link!' : 'Share Title'}
              aria-label="Share"
            >
              <motion.div
                key={copiedShare ? 'copied' : 'share'}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              >
                {copiedShare ? (
                  <Check className="w-4 h-4 stroke-[2.5] text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </motion.div>
            </motion.button>
          </div>

          {/* Synopsis with Read-more Expansion */}
          <div className="mb-5">
            <p
              className={`text-xs md:text-sm text-white/75 leading-relaxed max-w-2xl ${
                synopsisExpanded ? '' : 'line-clamp-3'
              }`}
            >
              {details.overview || 'No synopsis available.'}
            </p>
            {details.overview && details.overview.length > 200 && (
              <button
                onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                className="mt-1 text-xs text-white/60 hover:text-white font-medium flex items-center"
              >
                <span>{synopsisExpanded ? 'Show less' : 'Read more'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 ml-1 transition-transform ${
                    synopsisExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          </div>

          {/* Info Card Spec Sheet (Apple Liquid Glass) */}
          <div className="apple-glass rounded-2xl md:rounded-3xl p-4 md:p-5 max-w-2xl shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {details.runtime ? (
                <div>
                  <span className="text-[#8a8a93] uppercase text-[10px] font-semibold block mb-0.5">
                    Runtime
                  </span>
                  <span className="text-white font-medium">
                    {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                  </span>
                  {endTime && (
                    <span className="text-[#8a8a93] text-[11px] block mt-0.5">
                      Ends {endTime}
                    </span>
                  )}
                </div>
              ) : null}

              {details.original_language && (
                <div>
                  <span className="text-[#8a8a93] uppercase text-[10px] font-semibold block mb-0.5">
                    Language
                  </span>
                  <span className="text-white font-medium uppercase">
                    {details.original_language}
                  </span>
                </div>
              )}

              {releaseDate && (
                <div>
                  <span className="text-[#8a8a93] uppercase text-[10px] font-semibold block mb-0.5">
                    Release Date
                  </span>
                  <span className="text-white font-medium">{releaseDate}</span>
                </div>
              )}

              {details.budget && details.budget > 0 ? (
                <div>
                  <span className="text-[#8a8a93] uppercase text-[10px] font-semibold block mb-0.5">
                    Budget
                  </span>
                  <span className="text-white font-medium">
                    {formatCurrency(details.budget)}
                  </span>
                </div>
              ) : null}

              {details.revenue && details.revenue > 0 ? (
                <div>
                  <span className="text-[#8a8a93] uppercase text-[10px] font-semibold block mb-0.5">
                    Revenue
                  </span>
                  <span className="text-white font-medium">
                    {formatCurrency(details.revenue)}
                  </span>
                </div>
              ) : null}

              {realProviders.length > 0 && (
                <div className="col-span-2">
                  <span className="text-[#8a8a93] uppercase text-[10px] font-semibold block mb-1">
                    Streaming On
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5 flex-wrap gap-y-1.5">
                    {realProviders.slice(0, 5).map((p) => {
                      const nameLower = (p.provider_name || '').toLowerCase();
                      const isHotstar = nameLower.includes('hotstar');
                      const isNetflix = nameLower.includes('netflix');
                      const isPrime = nameLower.includes('prime') || nameLower.includes('amazon');
                      const isApple = nameLower.includes('apple');

                      return (
                        <div
                          key={p.provider_id}
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl apple-glass-pill shadow-sm transition-transform hover:scale-105"
                          title={p.provider_name}
                        >
                          {p.logo_path ? (
                            <img
                              src={`${IMAGE_BASE_URL_W500}${p.logo_path}`}
                              alt={p.provider_name}
                              className="w-5 h-5 rounded-md object-cover flex-none shadow"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : isHotstar ? (
                            <div className="w-5 h-5 rounded-md bg-[#001338] text-[#1480f0] font-black text-[9px] flex items-center justify-center flex-none shadow border border-blue-500/30">
                              ★
                            </div>
                          ) : isNetflix ? (
                            <div className="w-5 h-5 rounded-md bg-[#E50914] text-white font-black text-[10px] flex items-center justify-center flex-none shadow">
                              N
                            </div>
                          ) : isPrime ? (
                            <div className="w-5 h-5 rounded-md bg-[#00A8E1] text-white font-black text-[9px] flex items-center justify-center flex-none shadow">
                              P
                            </div>
                          ) : isApple ? (
                            <div className="w-5 h-5 rounded-md bg-black text-white font-black text-[9px] flex items-center justify-center flex-none shadow border border-white/20">
                              
                            </div>
                          ) : null}
                          <span className="text-xs text-white/95 font-semibold">
                            {p.provider_name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FULL-WIDTH CONTENT SECTIONS (Spans full 1500px width, no left-side black gap!) */}
      <div className="relative z-20 max-w-[1500px] mx-auto px-4 md:px-12 mt-8 space-y-8">
        {/* Cast Section: Full width with Left/Right Scroll Chevrons + Mouse Wheel horizontal scroll */}
        {castList.length > 0 && (
          <div className="group/cast relative">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-semibold font-display text-white">Top Cast</h3>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    haptics.playClick();
                    scrollCast('left');
                  }}
                  className="w-7 h-7 rounded-full apple-glass-pill flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    haptics.playClick();
                    scrollCast('right');
                  }}
                  className="w-7 h-7 rounded-full apple-glass-pill flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={castScrollRef}
              className="flex space-x-4 overflow-x-auto scrollbar-hide py-2 scroll-smooth"
            >
              {castList.map((person) => (
                <motion.div
                  key={person.id}
                  whileHover={{ y: -5, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  onClick={() => {
                    haptics.playClick();
                    navigate(`/person/${person.id}`);
                  }}
                  className="flex-none flex flex-col items-center cursor-pointer group text-center w-20"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden apple-glass p-0.5 mb-2 transition-transform duration-200 group-hover:scale-105 border border-t-white/35 border-white/10 shadow-lg">
                    {person.profile_path ? (
                      <img
                        src={`${IMAGE_BASE_URL_W500}${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#181a22] flex items-center justify-center">
                        <User className="w-6 h-6 text-white/40" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-white/90 truncate w-full group-hover:text-white">
                    {person.name}
                  </p>
                  <p className="text-[10px] text-[#8a8a93] truncate w-full">
                    {person.character}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* TV Shows: Episodes List (Full Width) */}
        {type === 'tv' && details.seasons?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold font-display text-white">Episodes</h3>
              <select
                value={selectedSeason}
                onChange={(e) => {
                  haptics.playClick();
                  fetchSeasonEpisodes(Number(e.target.value));
                }}
                className="apple-glass-pill rounded-full px-3.5 py-1 text-xs text-white font-medium outline-none cursor-pointer"
              >
                {details.seasons
                  .filter((s) => s.season_number > 0)
                  .map((s) => (
                    <option key={s.id} value={s.season_number} className="bg-[#0f1014] text-white">
                      Season {s.season_number} ({s.episode_count} eps)
                    </option>
                  ))}
              </select>
            </div>

            {episodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => {
                      haptics.playClick();
                      navigate(`/watch/tv/${id}?s=${selectedSeason}&e=${ep.episode_number}`, {
                        state: { from: location.pathname + location.search },
                      });
                    }}
                    className="flex flex-col p-3 rounded-2xl apple-glass hover:bg-white/[0.08] cursor-pointer transition-colors group"
                  >
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#12141a] mb-2.5">
                      {ep.still_path ? (
                        <img
                          src={`${IMAGE_BASE_URL_W500}${ep.still_path}`}
                          alt={ep.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Film className="w-5 h-5 text-white/40 m-auto mt-7" />
                      )}
                      <div className="absolute inset-0 bg-[#0f1014]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 fill-white text-white" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white/50 block">
                      Episode {ep.episode_number}
                    </span>
                    <span className="text-xs font-semibold text-white truncate block">
                      {ep.name}
                    </span>
                    <p className="text-[11px] text-[#8a8a93] line-clamp-2 mt-1 leading-relaxed">
                      {ep.overview || 'No synopsis available.'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-[#8a8a93] text-xs apple-glass rounded-2xl">
                Loading season episodes...
              </div>
            )}
          </div>
        )}

        {/* Franchise Timeline: Full Width */}
        <div>
          <FranchiseTimeline
            currentMovieId={id}
            collectionData={
              details.belongs_to_collection
                ? { ...details.belongs_to_collection, parts: collectionMovies }
                : null
            }
            movieTitle={details.title || details.name}
            mode="title"
          />
        </div>

        {/* Recommendations / More Like This: Full Width Clean Grid with Quality Filter */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="text-base font-semibold font-display text-white mb-4">
              More Like This
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {recommendations.slice(0, 12).map((m) => (
                <div key={m.id} className="w-full">
                  <RowCard
                    movie={m}
                    isLargeRow={true}
                    isTop10={false}
                    onNavigate={(item, action) => {
                      if (action === 'play') {
                        navigate(`/watch/${m.media_type || type}/${item.id}`);
                      } else {
                        navigate(`/title/${m.media_type || type}/${item.id}`);
                        window.scrollTo(0, 0);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </motion.div>
  );
}
