import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldAlert,
  Film,
  ListVideo,
  Keyboard,
  Moon,
  Sun,
  Server,
  X,
  Maximize,
} from 'lucide-react';
import { FastAverageColor } from 'fast-average-color';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../context/ToastContext';
import { haptics } from '../utils/audioHaptics';
import { squishTap, squishHover } from '../utils/motionSprings';
import Footer from '../components/Footer';
import FranchiseTimeline from '../components/FranchiseTimeline';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const fac = new FastAverageColor();

// Verified, high-speed multi-source movie & TV streaming embed scrapers
const SERVERS = [
  {
    id: 'EmbedSU',
    name: 'EmbedSU Pro',
    shortName: 'EmbedSU',
    badge: '4K Ultra',
    accent: '#3B82F6',
    getUrl: (t, id, s, e) =>
      t === 'tv'
        ? `https://embed.su/embed/tv/${id}/${s}/${e}`
        : `https://embed.su/embed/movie/${id}`,
  },
  {
    id: 'VidLink',
    name: 'VidLink Pro',
    shortName: 'VidLink',
    badge: '4K UHD',
    accent: '#6366F1',
    getUrl: (t, id, s, e) =>
      t === 'tv'
        ? `https://vidlink.pro/tv/${id}/${s}/${e}`
        : `https://vidlink.pro/movie/${id}`,
  },
  {
    id: 'VidSrcXYZ',
    name: 'VidSrc XYZ',
    shortName: 'VidSrc',
    badge: 'Ultra HD',
    accent: '#8B5CF6',
    getUrl: (t, id, s, e) =>
      t === 'tv'
        ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
        : `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
  },
  {
    id: 'MultiEmbed',
    name: 'MultiEmbed VIP',
    shortName: 'MultiEmbed',
    badge: 'Multi-Mirror',
    accent: '#EC4899',
    getUrl: (t, id, s, e) =>
      t === 'tv'
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    id: 'VidEasy',
    name: 'VidEasy Stream',
    shortName: 'VidEasy',
    badge: 'Clean HD',
    accent: '#06B6D4',
    getUrl: (t, id, s, e) =>
      t === 'tv'
        ? `https://player.videasy.to/tv/${id}/${s}/${e}`
        : `https://player.videasy.to/movie/${id}`,
  },
  {
    id: '2EmbedCC',
    name: '2Embed Cloud',
    shortName: '2Embed CC',
    badge: 'Fast HLS',
    accent: '#10B981',
    getUrl: (t, id, s, e) =>
      t === 'tv'
        ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
        : `https://www.2embed.cc/embed/${id}`,
  },
  {
    id: 'VidSrcSH',
    name: 'VidSrc SH',
    shortName: 'VidSrc SH',
    badge: 'Mirror CDN',
    accent: '#F59E0B',
    getUrl: (t, id, s, e) =>
      t === 'tv'
        ? `https://vidsrc.sh/embed/tv/${id}/${s}/${e}`
        : `https://vidsrc.sh/embed/movie/${id}`,
  },
  {
    id: 'VidCore',
    name: 'VidCore Edge',
    shortName: 'VidCore',
    badge: 'Global Node',
    accent: '#14B8A6',
    getUrl: (t, id, s, e) =>
      t === 'tv'
        ? `https://www.vidcore.org/embed/tv/${id}/${s}/${e}`
        : `https://www.vidcore.org/embed/movie/${id}`,
  },
];

export default function WatchPage() {
  const { type = 'movie', id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const season = parseInt(queryParams.get('s') || '1');
  const episode = parseInt(queryParams.get('e') || '1');

  const [selectedServerId, setSelectedServerId] = useLocalStorage(
    'netphlix_selectedServer',
    SERVERS[0].id
  );
  const [useSandbox, setUseSandbox] = useLocalStorage('netphlix_useSandbox', false);
  const [, setWatchHistory] = useLocalStorage('netphlix_watchHistory', []);
  const [accentColor] = useLocalStorage('netphlix_accent', '#E50914');
  const [ambilightLevel] = useLocalStorage('netphlix_ambilight_level', 'subtle');
  const { showToast } = useToast();

  const [details, setDetails] = useState(null);
  const [episodesList, setEpisodesList] = useState([]);
  const [ambientColor, setAmbientColor] = useState('rgba(15,16,20,0.25)');
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [collectionMovies, setCollectionMovies] = useState([]);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Auto-migrate if stored server is obsolete/dead (Peachify, AutoEmbed, etc.)
  useEffect(() => {
    if (!SERVERS.some((s) => s.id === selectedServerId)) {
      setSelectedServerId(SERVERS[0].id);
    }
  }, [selectedServerId, setSelectedServerId]);

  const activeServer = SERVERS.find((s) => s.id === selectedServerId) || SERVERS[0];

  // Reset loading state on stream change
  useEffect(() => {
    setIframeLoading(true);
  }, [activeServer.id, type, id, season, episode]);

  // Keep page firmly anchored at top on route changes (no auto-scroll down to timeline)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id, season, episode]);

  // Fetch TMDB metadata & save to watch history
  useEffect(() => {
    let isCancelled = false;
    const fetchTitleAndSave = async () => {
      try {
        const tmdbUrl = `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=images,belongs_to_collection`;
        const res = await fetch(tmdbUrl).then((r) => r.json());
        if (isCancelled) return;
        setDetails(res);
        const title = res.name || res.title;

        if (title) {
          setWatchHistory((prev) => {
            const filtered = prev.filter((m) => m.id !== parseInt(id));
            return [
              {
                id: parseInt(id),
                title,
                name: title,
                media_type: type,
                poster_path: res.poster_path,
                backdrop_path: res.backdrop_path,
                last_watched: new Date().toISOString(),
                ...(type === 'tv' ? { season, episode } : {}),
              },
              ...filtered,
            ];
          });
        }

        if (res.belongs_to_collection) {
          try {
            const colRes = await fetch(
              `${BASE_URL}/collection/${res.belongs_to_collection.id}?api_key=${API_KEY}`
            ).then((r) => r.json());
            if (colRes.parts && !isCancelled) {
              setCollectionMovies(colRes.parts);
            }
          } catch {
            // ignore
          }
        }

        // Ambient ambilight color extraction
        if (res.backdrop_path || res.poster_path) {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = `${IMAGE_BASE_URL_W500}${res.backdrop_path || res.poster_path}`;
          img.onload = () => {
            fac.getColorAsync(img)
              .then((c) => {
                if (!isCancelled) {
                  setAmbientColor(`rgba(${c.value[0]}, ${c.value[1]}, ${c.value[2]}, 0.35)`);
                }
              })
              .catch(() => {});
          };
        }
      } catch (err) {
        console.error('Failed to fetch details', err);
      }
    };

    fetchTitleAndSave();
    return () => {
      isCancelled = true;
    };
  }, [id, type, season, episode, setWatchHistory]);

  // Fetch episodes if TV
  useEffect(() => {
    let isCancelled = false;
    if (type === 'tv') {
      const fetchEpisodes = async () => {
        try {
          const res = await fetch(
            `${BASE_URL}/tv/${id}/season/${season}?api_key=${API_KEY}`
          ).then((r) => r.json());
          if (!isCancelled) {
            setEpisodesList(res.episodes || []);
          }
        } catch {
          if (!isCancelled) setEpisodesList([]);
        }
      };
      fetchEpisodes();
    }
    return () => {
      isCancelled = true;
    };
  }, [id, type, season]);

  // Track progress from player postMessage
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data) {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          const currentTime =
            data.currentTime || data.progress || data.peachifyProgress?.currentTime;
          const duration = data.duration || data.peachifyProgress?.duration;
          if (currentTime && duration) {
            setWatchHistory((prev) =>
              prev.map((item) => {
                if (item.id === parseInt(id)) {
                  return {
                    ...item,
                    currentTime: Math.round(currentTime),
                    duration: Math.round(duration),
                    progressPercent: Math.min(100, Math.round((currentTime / duration) * 100)),
                  };
                }
                return item;
              })
            );
          }
        } catch {
          // ignore parsing error
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, setWatchHistory]);

  const handleNextEpisode = () => {
    const nextEp = episodesList.find((ep) => ep.episode_number === episode + 1);
    if (nextEp) {
      navigate(`/watch/tv/${id}?s=${season}&e=${episode + 1}`, { state: location.state });
    } else if (details?.seasons) {
      const nextSeason = details.seasons.find((s) => s.season_number === season + 1);
      if (nextSeason) {
        navigate(`/watch/tv/${id}?s=${season + 1}&e=1`, { state: location.state });
      }
    }
  };

  const handlePrevEpisode = () => {
    if (episode > 1) {
      navigate(`/watch/tv/${id}?s=${season}&e=${episode - 1}`, { state: location.state });
    } else if (season > 1 && details?.seasons) {
      navigate(`/watch/tv/${id}?s=${season - 1}&e=1`, { state: location.state });
    }
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(`/title/${type}/${id}`);
    }
  };

  const toggleFullscreen = () => {
    const player = document.getElementById('video-player-container');
    if (player) {
      if (!document.fullscreenElement) {
        player.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();

      if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (key === 's') {
        e.preventDefault();
        const currentIndex = SERVERS.findIndex((s) => s.id === activeServer.id);
        const nextServer = SERVERS[(currentIndex + 1) % SERVERS.length];
        setSelectedServerId(nextServer.id);
        showToast({
          title: `Stream: ${nextServer.name}`,
          message: `Quality: ${nextServer.badge}`,
          type: 'info',
        });
      }
      if (key === 'l') {
        e.preventDefault();
        setIsFocusMode((prev) => {
          const next = !prev;
          showToast({
            title: next ? 'Focus Mode ON' : 'Focus Mode OFF',
            message: next ? 'Ambient UI dimmed (Press L to exit)' : 'Chrome restored',
            type: 'magic',
          });
          return next;
        });
      }
      if (key === 'n' && type === 'tv') {
        e.preventDefault();
        handleNextEpisode();
      }
      if (key === 'p' && type === 'tv') {
        e.preventDefault();
        handlePrevEpisode();
      }
      if (key === 'b') {
        e.preventDefault();
        handleBack();
      }
      if (key === '?') {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, activeServer.id, setSelectedServerId, showToast]);

  if (!details) {
    return (
      <div className="w-screen h-screen bg-[#07080b] flex items-center justify-center select-none font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-white/20 border-t-[#E50914] rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-[#8a8a93] font-semibold">
            Connecting Theater Stream...
          </span>
        </div>
      </div>
    );
  }

  const currentEpData =
    type === 'tv' ? episodesList.find((e) => e.episode_number === episode) : null;
  const title = details.name || details.title;
  const releaseYear = (details.release_date || details.first_air_date || '').substring(0, 4);

  const logo =
    details.images?.logos?.find(
      (l) => l.iso_639_1 === 'en' && (l.file_path?.endsWith('.png') || l.file_path?.endsWith('.svg'))
    ) || details.images?.logos?.[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-[#07080B] text-white select-none relative font-sans overflow-x-hidden"
    >
      {/* 1. DEDICATED CINEMA THEATER HEADER (Floating visionOS Liquid Glass) */}
      <header className="sticky top-0 z-50 w-full apple-glass border-b border-white/[0.08] transition-all">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          {/* Left: Back Pill + Brand & Title */}
          <div className="flex items-center space-x-3 min-w-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                haptics.playClick();
                handleBack();
              }}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer flex-none shadow-sm"
              title="Return to Details"
              aria-label="Return to Details"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </motion.button>

            <div
              onClick={() => {
                haptics.playClick();
                navigate('/');
              }}
              className="cursor-pointer font-black text-lg md:text-xl tracking-tight text-[#E50914] font-display hover:opacity-90 flex-none flex items-center space-x-1.5"
            >
              <span>NETPHLIX</span>
              <span className="nothing-rec-dot nothing-logo-dot" />
            </div>

            <div className="hidden md:block w-px h-4 bg-white/10 flex-none" />

            {/* Title / Logo in Header */}
            <div className="hidden sm:flex items-center space-x-2 truncate">
              {logo?.file_path ? (
                <img
                  src={`${IMAGE_BASE_URL_W500}${logo.file_path}`}
                  alt={title}
                  className="max-h-6 w-auto object-contain flex-none"
                />
              ) : (
                <span className="text-xs md:text-sm font-bold text-white truncate font-display">
                  {title}
                </span>
              )}

              {type === 'tv' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80 flex-none">
                  S{season} : E{episode}
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Theater Controls */}
          <div className="flex items-center space-x-2 flex-none">
            {/* Active Server Pill Status */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full apple-glass-pill text-xs font-medium text-white/80">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: activeServer.accent || '#10B981' }}
              />
              <span className="font-semibold text-white">{activeServer.shortName}</span>
              <span className="text-[10px] text-[#8a8a93] uppercase">({activeServer.badge})</span>
            </div>

            {/* Anti-Ad Sandbox Shield Toggle */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                haptics.playClick();
                const nextVal = !useSandbox;
                setUseSandbox(nextVal);
                showToast({
                  title: nextVal ? 'Ad Shield Enabled' : 'Ad Shield Disabled',
                  message: nextVal ? 'Blocking popups & redirects' : 'Restored full decoder access',
                  type: 'info',
                });
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                useSandbox
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-sm'
                  : 'apple-glass-pill text-white/70 hover:text-white'
              }`}
              title="Toggle Ad-Shield Sandbox (Blocks popups; disable if stream fails)"
            >
              {useSandbox ? (
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-white/50" />
              )}
              <span className="hidden md:inline">{useSandbox ? 'Shield ON' : 'Shield OFF'}</span>
            </motion.button>

            {/* Theater Lights Out / Focus Mode Toggle */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                haptics.playClick();
                const nextVal = !isFocusMode;
                setIsFocusMode(nextVal);
                showToast({
                  title: nextVal ? 'Focus Mode ON' : 'Focus Mode OFF',
                  message: nextVal ? 'Ambient chrome dimmed (Press L to exit)' : 'Controls restored',
                  type: 'magic',
                });
              }}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isFocusMode
                  ? 'bg-white text-[#07080B] shadow-md font-bold'
                  : 'apple-glass-pill text-white/70 hover:text-white'
              }`}
              title={isFocusMode ? 'Exit Lights Out (L)' : 'Lights Out Focus Mode (L)'}
              aria-label="Theater Mode"
            >
              {isFocusMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* Fullscreen Player Trigger */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                haptics.playClick();
                toggleFullscreen();
              }}
              className="p-2 rounded-full apple-glass-pill text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Fullscreen (F)"
              aria-label="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </motion.button>

            {/* Keyboard Shortcuts Trigger */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                haptics.playClick();
                setShowShortcutsModal(true);
              }}
              className="p-2 rounded-full apple-glass-pill text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Keyboard Shortcuts (?)"
              aria-label="Shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* 2. THEATER STAGE (Obsidian Void with Ambient Projection) */}
      <main className="max-w-[1800px] mx-auto px-3 sm:px-6 md:px-8 pt-4 md:pt-6">
        {/* The 16:9 Video Player Screen */}
        <div className="relative group max-w-[1560px] mx-auto">
          {/* Dynamic Ambient Ambilight Glow (Responsive to user setting) */}
          {ambilightLevel !== 'off' && (
            <div
              className={`absolute -inset-4 sm:-inset-8 md:-inset-12 z-0 rounded-[36px] filter blur-3xl transition-all duration-1000 pointer-events-none mix-blend-screen ${
                ambilightLevel === 'vivid' ? 'opacity-80 scale-110' : 'opacity-40'
              }`}
              style={{
                background: `radial-gradient(ellipse at center, ${ambientColor} 0%, transparent ${
                  ambilightLevel === 'vivid' ? '75%' : '65%'
                })`,
              }}
            />
          )}

          {/* Player Container */}
          <div
            id="video-player-container"
            className="relative z-10 w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-t-white/30 border-white/10 ring-1 ring-white/5 shadow-[0_25px_80px_rgba(0,0,0,0.95)]"
          >
            {/* Smooth obsidian stream connecting overlay */}
            <AnimatePresence>
              {iframeLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 z-20 bg-[#07080B] flex flex-col items-center justify-center pointer-events-none select-none"
                >
                  <div className="relative flex items-center justify-center mb-3">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-white/10 border-t-transparent animate-spin"
                      style={{ borderTopColor: activeServer.accent || '#E50914' }}
                    />
                    <div
                      className="absolute w-3 h-3 rounded-full animate-ping"
                      style={{ backgroundColor: activeServer.accent || '#E50914' }}
                    />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-white/90 font-bold font-display">
                    Connecting to {activeServer.name}
                  </span>
                  <span className="text-[11px] text-[#8a8a93] mt-1 font-medium">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">S</kbd> to cycle servers if buffering
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <iframe
              key={`${activeServer.id}-${type}-${id}-${season}-${episode}-${useSandbox}`}
              src={activeServer.getUrl(type, id, season, episode)}
              className="w-full h-full border-none bg-black"
              allowFullScreen
              onLoad={() => setIframeLoading(false)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              {...(useSandbox
                ? {
                    sandbox:
                      'allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox',
                  }
                : {})}
            />
          </div>
        </div>

        {/* 3. CINEMA CONTROL DECK & STREAM CONSOLE (Dimmable in Focus Mode) */}
        <AnimatePresence>
          {!isFocusMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-[1560px] mx-auto mt-6 space-y-6"
            >
              {/* Media Title & Quick Actions Row */}
              <div className="apple-glass rounded-2xl md:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider apple-glass-pill uppercase text-white/90">
                      {type === 'tv' ? 'Series' : 'Feature Film'}
                    </span>
                    {releaseYear && (
                      <span className="text-xs text-[#8a8a93] font-medium">{releaseYear}</span>
                    )}
                    {details.runtime ? (
                      <span className="text-xs text-[#8a8a93] font-medium">
                        • {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                      </span>
                    ) : null}
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-white tracking-tight truncate">
                    {title}
                  </h1>

                  {type === 'tv' && (
                    <p className="text-xs md:text-sm text-[#8a8a93] mt-1 font-medium">
                      <span className="text-white font-semibold">
                        Season {season} • Episode {episode}
                      </span>
                      {currentEpData?.name && (
                        <span className="text-white/70 ml-2">— {currentEpData.name}</span>
                      )}
                    </p>
                  )}
                </div>

                {/* TV Episode Controls (Prev, Next, Drawer Toggle) */}
                {type === 'tv' && (
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    {episode > 1 && (
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={() => {
                          haptics.playClick();
                          handlePrevEpisode();
                        }}
                        className="px-3.5 py-2 rounded-full apple-glass-pill text-xs font-semibold text-white/90 hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
                        title="Previous Episode (P)"
                        aria-label="Previous Episode"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        haptics.playClick();
                        handleNextEpisode();
                      }}
                      style={{ backgroundColor: accentColor }}
                      className="px-5 py-2 rounded-full text-white text-xs font-bold flex items-center space-x-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer"
                      title="Next Episode (N)"
                      aria-label="Next Episode"
                    >
                      <span>Next Episode</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        haptics.playClick();
                        setShowEpisodeDrawer(!showEpisodeDrawer);
                      }}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        showEpisodeDrawer
                          ? 'bg-white text-[#07080B] font-bold shadow-md'
                          : 'apple-glass-pill text-white/80 hover:text-white'
                      }`}
                      title="All Episodes Grid"
                    >
                      <ListVideo className="w-4 h-4" />
                      <span className="hidden sm:inline">Episodes</span>
                    </motion.button>
                  </div>
                )}
              </div>

              {/* STREAMING SERVERS SELECTION RACK (VisionOS Liquid Segmented Track) */}
              <div className="apple-glass rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/[0.08]">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-white/70" />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/80">
                      Streaming Sources ({SERVERS.length})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-[#8a8a93] font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Auto-Failover Active</span>
                    <span className="hidden sm:inline">• Shortcut: [S] Cycle</span>
                  </div>
                </div>

                {/* Server Selector Pills Track with Smooth LayoutId Lozenge */}
                <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-1">
                  {SERVERS.map((s) => {
                    const isActive = activeServer.id === s.id;
                    return (
                      <motion.button
                        key={s.id}
                        whileHover={squishHover}
                        whileTap={squishTap}
                        onClick={() => {
                          haptics.playClick();
                          setSelectedServerId(s.id);
                          showToast({
                            title: `Connecting ${s.name}`,
                            message: `Stream quality: ${s.badge}`,
                            type: 'info',
                          });
                        }}
                        className={`relative flex-none px-4 py-2 rounded-full text-xs font-semibold transition-colors z-10 flex items-center space-x-2 cursor-pointer squish-btn ${
                          isActive
                            ? 'text-[#07080B] font-bold'
                            : 'apple-glass-pill text-white/70 hover:text-white hover:bg-white/[0.08]'
                        }`}
                        aria-label={`Switch to server ${s.name}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeWatchServerLozenge"
                            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                            className="absolute inset-0 bg-white rounded-full -z-10 shadow-md"
                          />
                        )}
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-[#07080B]' : 'bg-emerald-400'
                          }`}
                        />
                        <span>{s.shortName}</span>
                        <span
                          className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-white/70'
                          }`}
                        >
                          {s.badge}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* EPISODE DRAWER (For TV Shows when toggled) */}
              {type === 'tv' && showEpisodeDrawer && episodesList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="apple-glass rounded-2xl md:rounded-3xl p-5 shadow-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Season {season} Episodes ({episodesList.length})
                    </h3>
                    <button
                      onClick={() => setShowEpisodeDrawer(false)}
                      className="text-xs text-[#8a8a93] hover:text-white transition-colors"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto scrollbar-hide pr-1">
                    {episodesList.map((ep) => {
                      const isCurrent = ep.episode_number === episode;
                      return (
                        <div
                          key={ep.id}
                          onClick={() => {
                            haptics.playClick();
                            navigate(`/watch/tv/${id}?s=${season}&e=${ep.episode_number}`, {
                              state: location.state,
                            });
                          }}
                          className={`flex items-center space-x-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isCurrent
                              ? 'bg-white/15 border-white text-white font-semibold shadow-md'
                              : 'apple-glass border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-none bg-[#12141a]">
                            {ep.still_path ? (
                              <img
                                src={`${IMAGE_BASE_URL_W500}${ep.still_path}`}
                                alt={ep.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Film className="w-4 h-4 text-white/40 m-auto mt-3" />
                            )}
                            {isCurrent && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-white/60 block">
                              EP {ep.episode_number}
                            </span>
                            <span className="text-xs font-semibold text-white truncate block">
                              {ep.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* FRANCHISE ROADMAP / TIMELINE (Cleanly separated below the control deck) */}
              <div className="mt-8">
                <FranchiseTimeline
                  currentMovieId={id}
                  collectionData={
                    details.belongs_to_collection
                      ? { ...details.belongs_to_collection, parts: collectionMovies }
                      : null
                  }
                  movieTitle={details.title || details.name}
                  mode="watch"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. KEYBOARD SHORTCUTS MODAL */}
      <AnimatePresence>
        {showShortcutsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="apple-glass rounded-2xl md:rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 mb-4">
                <Keyboard className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold font-display text-white">Keyboard Hotkeys</h3>
              </div>

              <div className="space-y-2.5 text-xs text-white/80">
                <div className="flex items-center justify-between p-2 rounded-lg apple-glass-pill">
                  <span>Toggle Fullscreen</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/15 font-mono text-[11px] text-white">
                    F
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg apple-glass-pill">
                  <span>Cycle Next Server</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/15 font-mono text-[11px] text-white">
                    S
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg apple-glass-pill">
                  <span>Lights Out (Focus Mode)</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/15 font-mono text-[11px] text-white">
                    L
                  </kbd>
                </div>
                {type === 'tv' && (
                  <>
                    <div className="flex items-center justify-between p-2 rounded-lg apple-glass-pill">
                      <span>Next Episode</span>
                      <kbd className="px-2 py-0.5 rounded bg-white/15 font-mono text-[11px] text-white">
                        N
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg apple-glass-pill">
                      <span>Previous Episode</span>
                      <kbd className="px-2 py-0.5 rounded bg-white/15 font-mono text-[11px] text-white">
                        P
                      </kbd>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between p-2 rounded-lg apple-glass-pill">
                  <span>Return Back</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/15 font-mono text-[11px] text-white">
                    B
                  </kbd>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-16">
        <Footer />
      </div>
    </motion.div>
  );
}
