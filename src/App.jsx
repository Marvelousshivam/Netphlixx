import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, useNavigate, useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Bell, User, Info, X, ChevronLeft, ChevronRight, ChevronDown, Plus, ThumbsUp, Home as HomeIcon, Star, Film, Tv, Radio, Gamepad2, Calendar, Clock, Download, Heart, Bookmark, Share2 } from 'lucide-react';
import { FaPlay as Play, FaPause as Pause, FaExpand as Maximize, FaVolumeHigh as Volume2, FaVolumeXmark as VolumeX, FaClosedCaptioning as Subtitles, FaGear as Settings, FaRotateRight as RotateCw, FaRotateLeft as RotateCcw, FaArrowLeft as ArrowLeft, FaHeadphones as Headphones, FaCheck as Check } from 'react-icons/fa6';
import { FastAverageColor } from 'fast-average-color';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import Footer from './components/Footer';
import NetflixIntro from './components/NetflixIntro';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const fac = new FastAverageColor();

// Endpoints
const requests = {
  fetchNowPlayingMovies: `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`,
  fetchUpcomingMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${new Date().toISOString().split('T')[0]}&sort_by=popularity.desc`,
  fetchTrendingMovies: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`,
  fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
  fetchSciFiMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=878`,
  fetchComedyMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`,
  
  fetchTrendingTV: `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`,
  fetchActionTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10759`,
  fetchSciFiTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10765`,
  fetchComedyTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=35`,
  
  fetchSearch: `${BASE_URL}/search/multi?api_key=${API_KEY}&query=`,
};


function HoverPortal({ children, coordinates, isHovered, onMouseLeave }) {
  useEffect(() => {
    if (isHovered) {
      const handleScroll = () => onMouseLeave();
      window.addEventListener('wheel', handleScroll, { passive: true });
      window.addEventListener('touchmove', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('wheel', handleScroll);
        window.removeEventListener('touchmove', handleScroll);
      };
    }
  }, [isHovered, onMouseLeave]);

  if (!isHovered || !coordinates) return null;
  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1.15 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed z-[999] rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#141414] overflow-hidden"
      style={{
        top: coordinates.top - 20,
        left: coordinates.left - 20,
        width: coordinates.width + 40,
        height: 'auto',
      }}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>,
    document.body
  );
}

function MagneticButton({ children, className = '', onClick, type = "button" }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });
  
  const [ripples, setRipples] = useState([]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const pullX = ((e.clientX - centerX) / width) * 15; 
    const pullY = ((e.clientY - centerY) / height) * 15;
    x.set(pullX);
    y.set(pullY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rippleX = e.clientX - rect.left;
    const rippleY = e.clientY - rect.top;
    setRipples(prev => [...prev, { x: rippleX, y: rippleY, id: Date.now() }]);
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`relative overflow-hidden outline-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={() => setRipples(prev => prev.filter(r => r.id !== ripple.id))}
          className="absolute rounded-full bg-white pointer-events-none z-0"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: Math.max(100, 100),
            height: Math.max(100, 100),
            marginLeft: -50,
            marginTop: -50,
          }}
        />
      ))}
      <span className="relative z-10 flex items-center justify-center w-full h-full">{children}</span>
    </motion.button>
  );
}

function getMediaType(item) {
  if (item?.media_type) return item.media_type;
  if (item?.title) return 'movie';
  if (item?.name) return 'tv';
  return 'movie';
}

function Navbar({ onSearch, activeTab, setActiveTab, toggleMobileSearch, mobileSearchOpen, searchQuery: propSearchQuery }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const [searchParams] = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState(propSearchQuery !== undefined ? propSearchQuery : (searchParams.get('q') || ''));
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [accentColor, setAccentColor] = useLocalStorage('netphlix_accent', '#E50914');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Sync with prop or URL
  useEffect(() => {
    if (propSearchQuery !== undefined) {
      setSearchQuery(propSearchQuery);
    } else {
      setSearchQuery(searchParams.get('q') || '');
    }
  }, [propSearchQuery, searchParams]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    } else {
      if (val.trim()) {
        navigate(`/?q=${encodeURIComponent(val)}`);
      }
    }
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      if (onSearch) onSearch('');
    }
  };

  const handleTabClick = (item) => {
    setActiveTab(item);
    setSearchQuery('');
    if (onSearch) onSearch('');
    if (mobileSearchOpen) toggleMobileSearch();
    if (item === 'Live TV') {
      navigate('/live');
    } else {
      navigate('/', { state: { activeTab: item } });
    }
  };

  const navItems = [
    { name: 'Movies', icon: Film },
    { name: 'TV', icon: Tv },
    { name: 'Live TV', icon: Radio }
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 py-3 transition-all duration-500 ${
          isScrolled ? 'bg-shows-dark/90 backdrop-blur-md shadow-2xl' : 'bg-gradient-to-b from-shows-dark/80 to-transparent'
        }`}
      >
        <div className="flex items-center">
          <h1 
            className="font-black text-2xl md:text-3xl tracking-tight cursor-pointer hover:scale-105 transition-transform flex items-center font-display"
            onClick={() => handleTabClick('Home')}
          >
            <span className="text-netflix-red">NETPHLIX</span>
          </h1>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex flex-1 justify-center max-w-2xl px-8">
          <div className="flex items-center w-full bg-[#2a2a2a] rounded-full px-4 py-2 border border-transparent focus-within:border-gray-500 focus-within:bg-[#1f1f1f] transition-all duration-300">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Type / to search"
              className="bg-transparent text-white w-full outline-none placeholder-gray-500"
              value={searchQuery}
              onChange={handleSearchChange}
              onClick={() => { if(onSearch && !searchQuery) onSearch(''); }}
            />
            {searchQuery && (
              <X className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => {setSearchQuery(''); if(onSearch) onSearch('');}} />
            )}
          </div>
        </div>
        
        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center space-x-2 text-white">
          <div className="flex space-x-2 mr-4">
            {navItems.map(item => (
              <button 
                key={item.name}
                onClick={() => handleTabClick(item.name === 'TV' ? 'TV Shows' : item.name)}
                className={`flex items-center px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${activeTab === item.name || (activeTab === 'TV Shows' && item.name === 'TV') ? 'bg-white text-black border-white shadow-md' : 'border-white/20 text-gray-300 hover:text-white hover:bg-white/10'}`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 ml-2">
            <MagneticButton className="w-10 h-10 rounded-full border border-gray-600 bg-[#2a2a2a] flex items-center justify-center cursor-pointer hover:border-white transition-colors" onClick={() => navigate('/profile')}>
               <User className="w-5 h-5 text-gray-300 pointer-events-none" />
            </MagneticButton>
            <MagneticButton className="w-10 h-10 rounded-full border border-transparent flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setShowSettings(true)}>
               <Settings className="w-5 h-5 text-gray-300 pointer-events-none" />
            </MagneticButton>
          </div>
        </div>

        {/* Mobile Search Input */}
        {mobileSearchOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#141414]/95 backdrop-blur-xl p-4 flex items-center shadow-2xl border-b border-white/10 animate-in slide-in-from-top-2 duration-300">
             <Search className="w-5 h-5 text-gray-400 mr-3" />
             <input
                type="text"
                autoFocus
                placeholder="Search Netphlix..."
                className="bg-transparent text-white w-full outline-none text-lg"
                value={searchQuery}
                onChange={handleSearchChange}
             />
             <X className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white" onClick={() => {
                setSearchQuery('');
                if (onSearch) onSearch('');
                toggleMobileSearch();
             }} />
          </div>
        )}
      </nav>

      {/* Full Screen Dark Overlay removed for better UX */}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center animate-in fade-in duration-300 p-4">
          <div className="bg-[#141414] border border-gray-800 rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300">
             <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
               <X className="w-6 h-6" />
             </button>
             <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
             
             <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Theme Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                     {[
                       {name: 'Netflix Red', hex: '#E50914'},
                       {name: 'Neon Blue', hex: '#00D8FF'},
                       {name: 'Cyberpunk Purple', hex: '#B829EA'},
                       {name: 'Matrix Green', hex: '#00FF41'},
                       {name: 'Gold', hex: '#FFD700'}
                     ].map(color => (
                        <button 
                          key={color.name}
                          onClick={() => setAccentColor(color.hex)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${accentColor === color.hex ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {accentColor === color.hex && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                        </button>
                     ))}
                  </div>
                </div>
             </div>

             <div className="mt-8 p-6 bg-gradient-to-r from-netflix-red/20 to-purple-900/20 border border-netflix-red/30 rounded-xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-netflix-red/0 via-white/5 to-netflix-red/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
               {deferredPrompt ? (
                 <div className="relative flex flex-col items-center">
                   <div className="w-12 h-12 bg-netflix-red rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(229,9,20,0.5)]">
                     <Download className="w-6 h-6 text-white" />
                   </div>
                   <h3 className="text-white font-bold text-lg mb-1">Get the Netphlix App</h3>
                   <p className="text-gray-400 text-sm text-center mb-4">Install our PWA for the best experience, offline access, and faster loading!</p>
                   <button onClick={handleInstall} className="w-full bg-white text-black font-bold py-3 rounded-full hover:scale-105 transition-transform shadow-lg">
                     Install Now
                   </button>
                 </div>
               ) : (
                 <div className="relative flex flex-col items-center">
                   <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/50">
                     <Check className="w-6 h-6 text-green-500" />
                   </div>
                   <h3 className="text-white font-bold text-lg mb-1">App Installed</h3>
                   <p className="text-gray-400 text-sm text-center">You are currently running the optimized web app experience.</p>
                 </div>
               )}
             </div>
             
             <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                <button onClick={() => setShowSettings(false)} className="bg-netflix-red text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition">Done</button>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#141414]/80 backdrop-blur-xl border-t border-white/5 flex justify-around items-center py-3 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
         <div className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-white transition" onClick={() => handleTabClick('Home')}>
            <HomeIcon className={`w-6 h-6 ${activeTab === 'Home' ? 'text-white' : ''}`} />
            <span className="text-[10px] mt-1">Home</span>
         </div>
         <div className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-white transition" onClick={toggleMobileSearch}>
            <Search className={`w-6 h-6 ${mobileSearchOpen ? 'text-white' : ''}`} />
            <span className="text-[10px] mt-1">Search</span>
         </div>
         <div className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-white transition" onClick={() => navigate('/live')}>
            <Radio className={`w-6 h-6 ${location.pathname === '/live' ? 'text-white' : ''}`} />
            <span className="text-[10px] mt-1">Live TV</span>
         </div>
         <div className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-white transition" onClick={() => navigate('/profile')}>
            <Plus className="w-6 h-6" />
            <span className="text-[10px] mt-1">My List</span>
         </div>
      </div>
    </>
  );
}

function Hero({ movie, trending = [], onSelect }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [bgColor, setBgColor] = useState('rgba(20,20,20,1)');
  const [details, setDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!movie) return;
    setVideoEnded(false);
    
    // Extract dynamic color
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = `${IMAGE_BASE_URL_W500}${movie.backdrop_path}`;
    img.onload = () => {
      fac.getColorAsync(img)
        .then(color => {
          setBgColor(color.rgba);
        })
        .catch(e => console.log(e));
    };

    async function fetchTrailer() {
      const mediaType = getMediaType(movie);
      
      try {
        const detailsRes = await fetch(`${BASE_URL}/${mediaType}/${movie.id}?api_key=${API_KEY}`).then(r => r.json());
        setDetails(detailsRes);
      } catch(e) { console.error(e); }

      const url = `${BASE_URL}/${mediaType}/${movie.id}/videos?api_key=${API_KEY}`;
      try {
        const res = await fetch(url).then(r => r.json());
        const trailer = res.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        setTrailerKey(trailer ? trailer.key : null);
      } catch(e) {
        setTrailerKey(null);
      }
    }
    fetchTrailer();
  }, [movie]);

  if (!movie) return <div className="h-[60vh] md:h-[80vh] bg-[#141414]" />;

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  const isTV = getMediaType(movie) === 'tv';

  const onPlay = () => {
    navigate(`/watch/${isTV ? 'tv' : 'movie'}/${movie.id}`, { state: { from: location.pathname + location.search } });
  };

  const onInfo = () => {
    navigate(`/title/${isTV ? 'tv' : 'movie'}/${movie.id}`, { state: { movie, from: location.pathname + location.search } });
  };

  return (
    <header className="h-[65vh] md:h-[85vh] relative text-white bg-[#141414] overflow-hidden">
      {/* Dynamic Color Gradient Overlay */}
      <div 
        className="absolute inset-0 w-full h-full z-0 transition-colors duration-1000 mix-blend-screen opacity-40" 
        style={{ background: `radial-gradient(circle at 70% 30%, ${bgColor} 0%, transparent 60%)` }}
      ></div>

      <div className="absolute inset-0 w-full h-full z-0">
        <div className={`w-full h-full animate-in fade-in duration-1000 ${trailerKey && !videoEnded ? 'md:hidden' : ''}`}>
           <picture>
             <source media="(min-width: 768px)" srcSet={`${IMAGE_BASE_URL}${movie?.backdrop_path || movie?.poster_path}`} />
             <img src={`${IMAGE_BASE_URL_W500}${movie?.poster_path || movie?.backdrop_path}`} alt="Hero Banner" className="w-full h-full object-cover object-center md:object-top" />
           </picture>
        </div>
        
        {trailerKey && !videoEnded && (
          <div className="relative w-full h-[140%] -top-[20%] pointer-events-none hidden md:block">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
              className="w-full h-full object-cover pointer-events-none"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              onLoad={() => {
                setTimeout(() => setVideoEnded(true), 120000); 
              }}
            ></iframe>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10 hidden md:block"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent z-10 md:via-[#141414]/20"></div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={movie?.id}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 px-4 md:ml-12 w-full md:max-w-2xl z-20 flex flex-col items-center md:items-start justify-center text-center md:text-left pt-20 md:pt-24 pb-12"
        >
          <div className="flex items-center justify-center md:justify-start space-x-2 mb-2 md:mb-4">
            <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-[#E50914] text-white font-black text-[10px] md:text-xs rounded-sm shadow-lg">1S</div>
            <span className="text-gray-300 text-[10px] md:text-xs font-bold tracking-[0.2em]">{isTV ? 'SERIES' : 'FILM'}</span>
          </div>
        
        <h1 className="text-5xl md:text-[75px] font-black font-sans uppercase text-white tracking-tighter mb-4 drop-shadow-2xl leading-[0.9] transition-all duration-700">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>
        
        <div className="hidden md:flex items-center space-x-3 mb-6">
           <div className="flex items-center space-x-1.5 bg-[#222]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-sm font-medium">
             <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
             <span className="text-white">{movie?.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
           </div>
           {details?.runtime && (
             <div className="bg-[#222]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-sm font-medium text-white">
               {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
             </div>
           )}
           {details?.genres?.[0] && (
             <div className="bg-[#222]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-sm font-medium text-white">
               {details.genres[0].name}
             </div>
           )}
        </div>

        <div className="hidden md:block mb-8 max-w-xl">
          <p className="text-sm md:text-base text-gray-200 font-medium drop-shadow-2xl leading-snug line-clamp-3">
            {movie?.overview}
          </p>
        </div>
        
        <div className="flex space-x-4 w-full md:w-auto justify-center md:justify-start">
          <MagneticButton 
            onClick={onPlay}
            className="w-12 h-12 md:w-14 md:h-14 bg-[#0A4191] rounded-full flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl"
          >
            <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white ml-1 pointer-events-none" />
          </MagneticButton>
          <MagneticButton 
            onClick={onInfo}
            className="flex items-center px-6 py-2 md:py-0 md:h-14 bg-[#0A4191]/40 text-white font-medium rounded-full border border-[#0A4191] hover:bg-[#0A4191]/60 transition-all backdrop-blur-md shadow-lg"
          >
             <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center mr-2 pointer-events-none"><span className="text-[10px] font-bold">i</span></div>
             <span className="pointer-events-none">See More</span>
          </MagneticButton>
        </div>
        </motion.div>
      </AnimatePresence>

      {trending?.length > 0 && (
         <div className="absolute bottom-6 md:bottom-8 right-4 md:right-8 z-40 hidden md:flex space-x-3 overflow-x-auto scrollbar-hide max-w-[40vw] p-2">
            {trending.slice(0, 6).map(m => (
               <div 
                 key={m.id} 
                 onClick={() => onSelect && onSelect(m)}
                 className={`flex-none w-32 aspect-video rounded-lg cursor-pointer overflow-hidden transition-all duration-300 shadow-xl border-2 ${movie?.id === m.id ? 'border-blue-500 scale-105 brightness-110' : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'}`}
               >
                  <img src={`${IMAGE_BASE_URL_W500}${m.backdrop_path}`} className="w-full h-full object-cover pointer-events-none" />
               </div>
            ))}
         </div>
      )}

      {trailerKey && !videoEnded && (
        <div className="hidden md:flex absolute bottom-32 right-12 z-30 items-center space-x-4">
           <button 
             onClick={() => setIsMuted(!isMuted)}
             className="w-10 h-10 rounded-full border border-white/50 bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-colors text-white"
           >
             {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
           </button>
           <div className="bg-black/40 backdrop-blur-md border-l-[3px] border-l-white text-white py-1 px-4 text-sm font-semibold tracking-widest shadow-lg">
             18+
           </div>
        </div>
      )}
    </header>
  );
}

const RowCard = React.memo(function RowCard({ movie, isLargeRow, isTop10, onNavigate, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const cardRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onNavigate(movie, 'play');
    }
  };

  useEffect(() => {
    let timeout;
    let abortController;
    if (isHovered) {
      abortController = new AbortController();
      timeout = setTimeout(async () => {
         try {
           const type = getMediaType(movie);
           const res = await fetch(`${BASE_URL}/${type}/${movie.id}/videos?api_key=${API_KEY}`, { signal: abortController.signal }).then(r => r.json());
           const t = res.results?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
           if (t) setTrailer(t.key);
         } catch (e) {
           if (e.name !== 'AbortError') console.log('Error fetching trailer for row card', e);
         }
      }, 700);
    } else {
      setTrailer(null);
    }
    return () => {
      clearTimeout(timeout);
      if (abortController) abortController.abort();
    };
  }, [isHovered, movie.id]);

  const ratingColor = movie.vote_average >= 8 ? 'ring-green-400' : movie.vote_average >= 6 ? 'ring-yellow-400' : 'ring-red-400';

  return (
    <motion.div 
      ref={cardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group/card relative flex-none cursor-pointer rounded-md overflow-visible bg-transparent focus:ring-4 focus:ring-white outline-none ${
        isLargeRow ? 'w-32 md:w-48' : 'w-44 md:w-60'
      } z-10 origin-center snap-center flex flex-col gap-2`}
      onClick={() => onNavigate(movie, 'info')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative w-full ${isLargeRow ? 'aspect-[2/3]' : 'aspect-video'} rounded-lg overflow-hidden shadow-lg group-hover/card:shadow-[0_10px_20px_rgba(43,130,246,0.3)] transition-all`}>
        {isHovered && trailer && !isLargeRow ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailer}`}
            className="w-full h-full object-cover scale-[1.3] pointer-events-none"
            allow="autoplay; encrypted-media"
          />
        ) : (
          <LazyLoadImage effect="blur"
            src={`${isLargeRow ? IMAGE_BASE_URL_W500 : IMAGE_BASE_URL}${isLargeRow ? movie.poster_path : (movie.backdrop_path || movie.poster_path)}`}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Rating Badge */}
        {movie.vote_average > 0 && !isTop10 && (
          <div className={`absolute top-2 left-2 w-8 h-8 rounded-full bg-[#111] flex items-center justify-center ring-2 ${ratingColor} shadow-black/50 shadow-md`}>
            <span className="text-white text-[10px] font-bold">{movie.vote_average.toFixed(1)}</span>
          </div>
        )}

        {isLargeRow && !isTop10 && (
          <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-center py-1 font-semibold text-[9px] uppercase tracking-wider flex items-center justify-center z-20 shadow-lg shadow-black/50">
            Most Viewed on NETPHLIX <Star className="w-2.5 h-2.5 ml-1 fill-white" />
          </div>
        )}

        {onRemove && (
          <MagneticButton 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition border border-white/20 z-50"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </MagneticButton>
        )}

        {/* Continue watching progress bar */}
        {movie.progress && (
           <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 z-50">
              <div className="h-full bg-netflix-red" style={{ width: `${movie.progress}%` }}></div>
           </div>
        )}
      </div>

      {!isTop10 && (
        <div className="flex flex-col px-1">
          <h3 className="text-gray-200 font-semibold text-sm line-clamp-1 group-hover/card:text-netflix-red transition-colors">
            {movie.title || movie.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-gray-300 font-bold">{movie.vote_average?.toFixed(1)}</span>
              <span>{movie.release_date?.substring(0,4) || movie.first_air_date?.substring(0,4)}</span>
            </div>
          </div>
          
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={isHovered ? { height: 'auto', opacity: 1, marginTop: 8 } : { height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <MagneticButton className="w-full bg-white/10 hover:bg-netflix-red text-white text-xs font-bold py-1.5 rounded-full transition-colors flex items-center justify-center">
              <span className="pointer-events-none flex items-center">Details <ChevronRight className="w-3 h-3 ml-1" /></span>
            </MagneticButton>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
});

function Row({ title, icon: Icon, fetchUrl, isLargeRow, isTop10, moviesArray, onRemove, filterUpcoming, filterReleased }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const rowRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (moviesArray) {
      setMovies(moviesArray);
      setIsLoading(false);
      return;
    }
    const abortController = new AbortController();
    async function fetchData() {
      if (!fetchUrl) return;
      try {
        const request = await fetch(fetchUrl, { signal: abortController.signal }).then(res => res.json());
        let results = request.results || [];
        const now = new Date();
        if (filterUpcoming) {
          results = results.filter(m => new Date(m.release_date || m.first_air_date) > now);
        }
        if (filterReleased) {
          results = results.filter(m => new Date(m.release_date || m.first_air_date) <= now);
        }
        setMovies(results);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    return () => abortController.abort();
  }, [fetchUrl, moviesArray]);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const onNavigate = (movie, action) => {
    const mediaType = getMediaType(movie);
    if (action === 'play') {
      navigate(`/watch/${mediaType}/${movie.id}`, { state: { from: location.pathname + location.search } });
    } else {
      navigate(`/title/${mediaType}/${movie.id}`, { state: { movie, from: location.pathname + location.search } });
    }
  };

  if (isLoading) {
    return (
      <div className="pl-4 md:pl-12 my-6">
        <div className="w-48 h-6 rounded shimmer mb-3 z-20 relative"></div>
        <div className="flex space-x-2 overflow-hidden py-4">
           {[...Array(6)].map((_, i) => (
             <div key={i} className={`flex-none rounded ${isLargeRow ? 'w-32 md:w-48 aspect-[2/3]' : 'w-44 md:w-60 aspect-video'} flex items-center relative z-10`}>
               {isTop10 && <span className="absolute left-[-20px] bottom-[-30px] text-[150px] md:text-[220px] font-black leading-none select-none tracking-tighter z-0 opacity-50" style={{ WebkitTextStroke: '2px #333', color: 'transparent' }}>{i + 1}</span>}
               <div className="w-full h-full shimmer rounded-lg z-10 opacity-70"></div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  if (!movies.length) return null;

  return (
    <motion.div 
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-50px" }} 
      variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
      className="pl-4 md:pl-12 my-4 md:my-6 group relative z-20"
    >
      {isTop10 ? (
        <div className="flex items-center mb-6 md:mb-10 cursor-pointer w-max pl-4 md:pl-8 group/title">
          <h2 className="text-7xl md:text-[140px] font-bold text-transparent leading-none tracking-tighter" style={{ WebkitTextStroke: '1px #555' }}>
            TOP 10
          </h2>
          <div className="ml-4 md:ml-6 flex flex-col text-sm md:text-2xl tracking-[0.4em] text-gray-300 font-light uppercase mt-2 md:mt-4">
            <span>{title.toLowerCase().includes('shows') ? 'SHOWS' : 'MOVIES'}</span>
            <span>TODAY</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4 md:mb-6 pr-4 md:pr-12 group/title">
          <div className="flex items-center cursor-pointer">
            {Icon && <Icon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-white" />}
            <h2 className="text-gray-100 text-xl md:text-3xl font-display font-bold tracking-tight">{title}</h2>
            {!moviesArray && (
              <span 
                onClick={() => navigate(`/category/${encodeURIComponent(title)}`, { state: { fetchUrl } })}
                className="text-blue-500 font-medium text-sm ml-4 mt-1 hover:text-blue-400 transition hidden md:block"
              >
                View all
              </span>
            )}
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <button onClick={() => handleScroll('left')} className="p-2 bg-transparent hover:bg-white/10 rounded-full transition"><ChevronLeft className="w-6 h-6 text-gray-400 hover:text-white" /></button>
            <button onClick={() => handleScroll('right')} className="p-2 bg-transparent hover:bg-white/10 rounded-full transition"><ChevronRight className="w-6 h-6 text-gray-400 hover:text-white" /></button>
          </div>
        </div>
      )}

      <div className="relative">
        <div 
          ref={rowRef}
          onKeyDown={(e) => {
             if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleScroll('right');
             } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handleScroll('left');
             }
          }}
          className="flex overflow-x-scroll md:overflow-x-hidden md:hover:overflow-x-scroll scrollbar-hide py-6 md:py-8 pr-4 md:pr-12 space-x-4 -ml-1 snap-x snap-mandatory focus:outline-none"
          tabIndex={-1}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {movies.slice(0, isTop10 ? 10 : movies.length).map((movie, index) => (
            ((isLargeRow && movie.poster_path) || (!isLargeRow && movie.backdrop_path)) && (
              <div key={movie.id} className={`relative flex items-center group/card-wrapper ${isTop10 ? 'pl-8 md:pl-20' : ''}`}>
                 {isTop10 && (
                   <span className="absolute left-0 bottom-[-10px] md:bottom-[-20px] text-[120px] md:text-[200px] font-black leading-none select-none tracking-tighter transition-all duration-500 group-hover/card-wrapper:scale-110 group-hover/card-wrapper:-translate-x-2 group-hover/card-wrapper:drop-shadow-[0_0_15px_rgba(229,9,20,0.5)] z-0" style={{ WebkitTextStroke: '2px #E50914', color: 'transparent' }}>
                     {index + 1}
                   </span>
                 )}
                 <div className="z-10 w-full h-full">
                   <RowCard 
                     movie={movie} 
                     isLargeRow={isLargeRow} 
                     isTop10={isTop10}
                     onNavigate={onNavigate} 
                     onRemove={onRemove} 
                   />
                 </div>
              </div>
            )
          ))}
        </div>

      </div>
    </motion.div>
  );
}

function SearchResults({ query }) {
  const [movies, setMovies] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (query.length < 2) return;
    
    setMovies([]);
    setPage(1);
    setHasMore(true);

    async function searchMovies() {
      setIsLoading(true);
      const url = `${requests.fetchSearch}${encodeURIComponent(query)}&page=1`;
      const req = await fetch(url).then(res => res.json());
      setMovies((req.results || []).filter(m => m.media_type !== 'person'));
      if (req.page >= req.total_pages || !req.results || req.results.length === 0) setHasMore(false);
      setIsLoading(false);
    }
    const delayDebounceFn = setTimeout(() => {
      searchMovies();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    if (query.length < 2 || page === 1 || !hasMore) return;
    
    async function fetchMore() {
      setIsLoading(true);
      const url = `${requests.fetchSearch}${encodeURIComponent(query)}&page=${page}`;
      const req = await fetch(url).then(res => res.json());
      setMovies(prev => {
        const newMovies = (req.results || []).filter(m => m.media_type !== 'person');
        const map = new Map(prev.map(m => [m.id, m]));
        newMovies.forEach(m => map.set(m.id, m));
        return Array.from(map.values());
      });
      if (req.page >= req.total_pages || !req.results || req.results.length === 0) setHasMore(false);
      setIsLoading(false);
    }
    fetchMore();
  }, [page, query]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && hasMore && !isLoading) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading]);

  const filteredMovies = movies.filter(m => {
    if (filterYear) {
      const year = m.release_date?.substring(0,4) || m.first_air_date?.substring(0,4);
      if (year !== filterYear) return false;
    }
    if (filterRating) {
      if ((m.vote_average || 0) < parseFloat(filterRating)) return false;
    }
    return m.poster_path || m.backdrop_path;
  });

  return (
    <div className="px-4 md:px-8 pt-24 md:pt-28 pb-24 min-h-screen bg-[#141414] flex flex-col md:flex-row gap-8">
      
      {/* Left Sidebar Filters */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-64 flex-none space-y-8"
      >
        <div>
          <h2 className="text-white text-2xl font-bold mb-6">Search</h2>
          <p className="text-gray-400 text-sm mb-4">Results for <span className="text-white font-semibold">"{query}"</span></p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Release Year</label>
            <select 
              className="w-full bg-[#2a2a2a] text-white border border-transparent focus:border-gray-500 rounded p-3 outline-none cursor-pointer transition-colors"
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
            >
              <option value="">Any Year</option>
              {Array.from({length: 40}, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Minimum Rating</label>
            <select 
              className="w-full bg-[#2a2a2a] text-white border border-transparent focus:border-gray-500 rounded p-3 outline-none cursor-pointer transition-colors"
              value={filterRating}
              onChange={e => setFilterRating(e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="8">8.0+ Stars</option>
              <option value="7">7.0+ Stars</option>
              <option value="6">6.0+ Stars</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Results Grid */}
      <div className="flex-1">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
        >
          {filteredMovies.map((movie, i) => (
            <motion.div 
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.1, zIndex: 50, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              className="relative cursor-pointer rounded-lg overflow-hidden shadow-sm aspect-[2/3] group"
              onClick={() => navigate(`/title/${getMediaType(movie)}/${movie.id}`, { state: { movie, from: location.pathname + location.search } })}
            >
              <img
                src={`${IMAGE_BASE_URL_W500}${movie.poster_path || movie.backdrop_path}`}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <Play className="w-10 h-10 text-white drop-shadow-lg self-center mb-auto mt-auto transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
                <h3 className="text-white font-bold text-sm line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{movie.title || movie.name}</h3>
                <div className="flex items-center text-xs text-gray-300 space-x-2 mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  <span className="text-green-400 font-bold">{movie.vote_average?.toFixed(1)} Stars</span>
                  <span>{movie.release_date?.substring(0,4) || movie.first_air_date?.substring(0,4)}</span>
                </div>
              </div>
              {movie.vote_average > 0 && (
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-green-400 font-bold text-xs px-2 py-1 rounded shadow-lg border border-white/10 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  {movie.vote_average.toFixed(1)}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
        {movies.length === 0 && query.length >= 2 && (
          <div className="text-gray-400 text-lg mt-10">No matching titles found for "{query}".</div>
        )}
      </div>
    </div>
  );
}

function InlineBanner({ movie }) {
  if (!movie) return null;
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="mx-4 md:mx-12 my-12 md:my-16 relative rounded-2xl overflow-hidden bg-shows-dark shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row h-auto md:h-[400px]">
      <div className="w-full md:w-1/2 relative h-64 md:h-full overflow-hidden">
         <img src={`${IMAGE_BASE_URL}${movie.backdrop_path}`} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-shows-dark via-shows-dark/80 to-transparent"></div>
      </div>
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 -mt-20 md:mt-0 bg-gradient-to-t md:bg-none from-shows-dark to-transparent">
         <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-none font-display uppercase tracking-tight drop-shadow-md">{movie.title || movie.name}</h2>
         <div className="flex items-center space-x-3 text-xs md:text-sm text-gray-400 mb-4 font-semibold">
           <span className="px-2 py-0.5 bg-white/10 rounded-full text-netflix-red border border-netflix-red/30">{movie.vote_average?.toFixed(1)} Rating</span>
           <span>{movie.release_date?.substring(0,4) || movie.first_air_date?.substring(0,4)}</span>
         </div>
         <p className="text-gray-400 text-sm md:text-base line-clamp-3 mb-8 max-w-md">{movie.overview}</p>
         <button onClick={() => navigate(`/title/${movie.title ? 'movie' : 'tv'}/${movie.id}`, { state: { movie, from: location.pathname + location.search } })} className="bg-netflix-red text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition self-start shadow-lg shadow-red-500/30 flex items-center">
            <Play className="w-4 h-4 mr-2" /> Play Now
         </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Home');
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(!!searchParams.get('q'));
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');

  // Sync search state bidirectionally with URL for persistence across navigation
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== searchQuery) {
      setSearchQuery(q);
      if (q) setMobileSearchOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (searchQuery && searchQuery !== currentQ) {
      setSearchParams({ q: searchQuery }, { replace: true });
    } else if (!searchQuery && currentQ) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchQuery]);
  
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const [watchHistory, setWatchHistory] = useLocalStorage('netphlix_watchHistory', []);

  useEffect(() => {
    async function fetchGenres() {
      if (activeTab === 'Home' || activeTab === 'My List') return;
      const type = activeTab === 'TV Shows' ? 'tv' : 'movie';
      const res = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`).then(r => r.json());
      setGenres(res.genres || []);
      setSelectedGenre(''); // reset on tab switch
    }
    fetchGenres();
  }, [activeTab]);

  useEffect(() => {
    async function fetchFeatured() {
      const endpoint = activeTab === 'TV Shows' ? requests.fetchTrendingTV : requests.fetchTrendingMovies;
      const request = await fetch(endpoint).then(res => res.json());
      if (request.results?.length > 0) {
        setTrending(request.results);
        setFeatured(request.results[Math.floor(Math.random() * request.results.length)]);
      }
    }
    if (activeTab !== 'My List') fetchFeatured();
  }, [activeTab]);

  const getGenreUrl = (baseId) => {
    const type = activeTab === 'TV Shows' ? 'tv' : 'movie';
    return `${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${selectedGenre || baseId}`;
  };

  const removeFromList = (id) => {
    setMyList(prev => prev.filter(m => m.id !== id));
  };

  const removeFromHistory = (id) => {
    setWatchHistory(prev => prev.filter(m => m.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -15 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-[#141414] pb-20 md:pb-0 flex flex-col"
    >
      <Navbar 
        searchQuery={searchQuery}
        onSearch={setSearchQuery} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileSearchOpen={mobileSearchOpen}
        toggleMobileSearch={() => setMobileSearchOpen(!mobileSearchOpen)}
      />
      
      <div className="flex-1">
        {searchQuery.length > 0 || mobileSearchOpen ? (
          <SearchResults query={searchQuery} />
        ) : activeTab === 'My List' ? (
          <div className="pt-24 px-4 md:px-12 min-h-[60vh]">
            <h1 className="text-3xl md:text-4xl text-white font-bold mb-8">My List</h1>
            {myList.length > 0 ? (
               <div className="-ml-4 md:-ml-12"><Row title="" moviesArray={myList} onRemove={removeFromList} isLargeRow /></div>
            ) : (
               <p className="text-gray-400 text-lg">You haven't added anything to your list yet.</p>
            )}
          </div>
        ) : (
          <>
            <Hero movie={featured} trending={trending} onSelect={setFeatured} />
            
            {/* Genre Filter */}
            {activeTab !== 'Home' && (
              <div className="absolute top-20 md:top-24 left-4 md:left-12 z-40 flex items-center space-x-4">
                <h1 className="text-white text-2xl md:text-4xl font-bold">{activeTab}</h1>
                <div className="relative group/genre">
                  <button className="bg-black/50 border border-white/50 text-white px-3 py-1 text-xs md:text-sm font-semibold flex items-center hover:bg-black/80 transition">
                    {selectedGenre ? genres.find(g => g.id.toString() === selectedGenre)?.name : 'Genres'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-black/90 border border-gray-700 rounded grid grid-cols-2 md:grid-cols-3 gap-2 p-4 min-w-[300px] md:min-w-[400px] opacity-0 invisible group-hover/genre:opacity-100 group-hover/genre:visible transition duration-200">
                    <div className="text-gray-300 hover:text-white cursor-pointer text-sm" onClick={() => setSelectedGenre('')}>All</div>
                    {genres.map(g => (
                      <div key={g.id} className="text-gray-300 hover:text-white cursor-pointer text-sm" onClick={() => setSelectedGenre(g.id.toString())}>
                        {g.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pb-20 md:pb-32 -mt-4 md:-mt-8 relative z-20">
              {watchHistory && watchHistory.length > 0 && (
                <Row title="Continue Watching" moviesArray={watchHistory} onRemove={removeFromHistory} />
              )}
              {activeTab === 'Home' && myList.length > 0 && (
                <Row title="My List" moviesArray={myList} onRemove={removeFromList} />
              )}

              {activeTab === 'TV Shows' ? (
                <>
                  <Row title={selectedGenre ? `Popular ${genres.find(g=>g.id.toString()===selectedGenre)?.name} TV` : "Trending TV Shows"} fetchUrl={selectedGenre ? getGenreUrl() : requests.fetchTrendingTV} isLargeRow />
                  <Row title="Action & Adventure TV" fetchUrl={getGenreUrl(10759)} />
                  <Row title="Sci-Fi & Fantasy TV" fetchUrl={getGenreUrl(10765)} />
                  <Row title="Comedy TV" fetchUrl={getGenreUrl(35)} />
                </>
              ) : activeTab === 'Movies' ? (
                <>
                  <Row title={selectedGenre ? `Popular ${genres.find(g=>g.id.toString()===selectedGenre)?.name} Movies` : "Trending Movies"} fetchUrl={selectedGenre ? getGenreUrl() : requests.fetchTrendingMovies} isLargeRow />
                  <Row title="Action Movies" fetchUrl={getGenreUrl(28)} />
                  <Row title="Sci-Fi Movies" fetchUrl={getGenreUrl(878)} />
                  <Row title="Comedy Movies" fetchUrl={getGenreUrl(35)} />
                </>
              ) : (
                <>
                  <Row title="Now Playing" icon={Radio} fetchUrl={requests.fetchNowPlayingMovies} isLargeRow filterReleased />
                  <Row title="Upcoming" icon={Calendar} fetchUrl={requests.fetchUpcomingMovies} isLargeRow filterUpcoming />
                  <Row title="TOP 10 SHOWS TODAY" fetchUrl={requests.fetchTrendingTV} isLargeRow isTop10 />
                  {featured && <InlineBanner movie={featured} />}
                  <Row title="Trending TV Shows" fetchUrl={requests.fetchTrendingTV} />
                  <Row title="Action Movies" fetchUrl={requests.fetchActionMovies} />
                  <Row title="Comedy TV" fetchUrl={requests.fetchComedyTV} />
                </>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </motion.div>
  );
}

function PersonModal({ personId, onClose }) {
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPerson() {
      const pRes = await fetch(`${BASE_URL}/person/${personId}?api_key=${API_KEY}`).then(r => r.json());
      const cRes = await fetch(`${BASE_URL}/person/${personId}/combined_credits?api_key=${API_KEY}`).then(r => r.json());
      setPerson(pRes);
      setCredits((cRes.cast || []).sort((a,b) => b.popularity - a.popularity).slice(0, 15));
    }
    fetchPerson();
  }, [personId]);

  if (!person) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4 md:p-12 animate-in fade-in">
       <div className="bg-[#141414] border border-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
          <button onClick={onClose} className="absolute top-4 md:top-6 right-4 md:right-6 text-gray-400 hover:text-white z-10 bg-black/50 rounded-full p-2 transition hover:bg-black">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col md:flex-row gap-8 p-6 md:p-10">
             {person.profile_path && <img src={`${IMAGE_BASE_URL_W500}${person.profile_path}`} className="w-48 md:w-64 rounded-lg object-cover shadow-lg mx-auto md:mx-0 flex-none" />}
             <div className="flex-1">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{person.name}</h2>
                <p className="text-gray-400 text-sm md:text-base mb-8 whitespace-pre-wrap">{person.biography || 'No biography available.'}</p>
                
                <h3 className="text-xl text-white font-bold mb-4">Known For</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                   {credits.filter(c => c.poster_path).map(c => (
                     <div key={c.id} className="cursor-pointer group" onClick={() => { onClose(); navigate(`/title/${c.media_type}/${c.id}`, { state: { movie: c } }); }}>
                        <img src={`${IMAGE_BASE_URL_W500}${c.poster_path}`} className="w-full aspect-[2/3] object-cover rounded group-hover:scale-105 transition" />
                        <p className="text-xs text-gray-400 mt-2 truncate group-hover:text-white transition">{c.title || c.name}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function StarRating({ rating, setRating }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex space-x-1 items-center mt-2">
      {[...Array(5)].map((_, i) => {
        const value = i + 1;
        return (
          <button
            key={i}
            className="focus:outline-none transition-transform hover:scale-110 p-1"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            title={`Rate ${value} Stars`}
          >
            <Star 
              className={`w-6 h-6 md:w-8 md:h-8 transition-colors ${value <= (hover || rating) ? 'fill-[var(--accent-color)] text-[var(--accent-color)] drop-shadow-[0_0_8px_var(--accent-color)]' : 'text-gray-600 hover:text-gray-400'}`} 
            />
          </button>
        );
      })}
      {rating > 0 && <span className="text-gray-400 text-xs font-bold ml-2 hidden md:block">Your Rating: {rating}/5</span>}
    </div>
  );
}

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          month: Math.floor(difference / (1000 * 60 * 60 * 24 * 30.44)),
          days: Math.floor((difference / (1000 * 60 * 60 * 24)) % 30.44),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          min: Math.floor((difference / 1000 / 60) % 60),
          sec: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (num) => String(num).padStart(2, '0');

  if (Object.keys(timeLeft).length === 0) return null;

  return (
    <div className="flex space-x-2 md:space-x-4 mb-8">
      {['month', 'days', 'hours', 'min', 'sec'].map(interval => (
        <div key={interval} className="flex flex-col items-center bg-[#222]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_10px_20px_rgba(0,0,0,0.5)] min-w-[70px] md:min-w-[90px]">
          <span className="text-4xl md:text-5xl font-display font-light tracking-wider text-white">
            {pad(timeLeft[interval] || 0)}
          </span>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-2 font-bold">{interval}</span>
        </div>
      ))}
    </div>
  );
}

function TitlePage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [details, setDetails] = useState(location.state?.movie || null);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  const [similar, setSimilar] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [bgColor, setBgColor] = useState('rgba(20,20,20,1)');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [collectionMovies, setCollectionMovies] = useState([]);
  
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const [likedMovies, setLikedMovies] = useLocalStorage('netphlix_liked', []);
  const [personalRatings, setPersonalRatings] = useLocalStorage('netphlix_ratings', {});
  const currentRating = personalRatings[id] || 0;
  const inList = myList.some(m => m.id === parseInt(id));
  const isLiked = likedMovies.some(m => m.id === parseInt(id));

  const toggleLike = () => {
    if (isLiked) {
      setLikedMovies(prev => prev.filter(m => m.id !== parseInt(id)));
    } else {
      setLikedMovies(prev => [{
        id: parseInt(id),
        title: details.title || details.name,
        name: details.title || details.name,
        media_type: type,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path
      }, ...prev]);
    }
  };

  const handleRating = (value) => {
    setPersonalRatings(prev => ({...prev, [id]: value}));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchDetails() {
      const appendStr = type === 'movie' 
        ? 'credits,videos,images,reviews,keywords,release_dates,watch/providers' 
        : 'credits,videos,images,reviews,keywords,content_ratings,watch/providers';
      const url = `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=${appendStr}`;
      const res = await fetch(url).then(r => r.json());
      setDetails(res);
      
      const similarUrl = `${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}`;
      const simRes = await fetch(similarUrl).then(r => r.json());
      setSimilar(simRes.results?.slice(0, 12) || []);

      if (type === 'tv') {
        fetchSeasonEpisodes(1);
      }

      if (res.belongs_to_collection) {
        try {
          const colUrl = `${BASE_URL}/collection/${res.belongs_to_collection.id}?api_key=${API_KEY}`;
          const colRes = await fetch(colUrl).then(r => r.json());
          if (colRes.parts) {
            setCollectionMovies(colRes.parts.sort((a, b) => new Date(a.release_date || '2099-01-01') - new Date(b.release_date || '2099-01-01')));
          }
        } catch(e) {}
      }

      // Color extraction
      if (res.poster_path || res.backdrop_path) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = `${IMAGE_BASE_URL_W500}${res.poster_path || res.backdrop_path}`;
        img.onload = () => {
          fac.getColorAsync(img).then(color => setBgColor(color.rgba)).catch(e => console.log(e));
        };
      }
    }
    fetchDetails();
  }, [type, id]);

  const fetchSeasonEpisodes = async (seasonNum) => {
    setSelectedSeason(seasonNum);
    const url = `${BASE_URL}/tv/${id}/season/${seasonNum}?api_key=${API_KEY}`;
    try {
      const res = await fetch(url).then(r => r.json());
      setEpisodes(res.episodes || []);
    } catch(e) {
      setEpisodes([]);
    }
  };

  const toggleMyList = () => {
    if (inList) {
      setMyList(prev => prev.filter(m => m.id !== parseInt(id)));
    } else {
      setMyList(prev => [{
        id: parseInt(id),
        title: details.title || details.name,
        name: details.title || details.name,
        media_type: type,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path
      }, ...prev]);
    }
  };

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], ['0%', '30%']);

  if (!details) return (
    <div className="min-h-screen bg-shows-dark text-white pt-32 px-4 md:px-12">
      <div className="container mx-auto flex flex-col lg:flex-row gap-12 animate-pulse">
        <div className="w-full md:w-[320px] aspect-[2/3] bg-white/5 rounded-2xl mx-auto lg:mx-0 flex-none border border-white/5 shadow-2xl"></div>
        <div className="flex-1 flex flex-col space-y-8 justify-center">
          <div className="h-16 bg-white/5 rounded-xl w-3/4"></div>
          <div className="flex gap-4 mb-4">
             <div className="h-12 w-32 bg-white/5 rounded-full"></div>
             <div className="h-12 w-32 bg-white/5 rounded-full"></div>
          </div>
          <div className="h-4 bg-white/5 rounded w-1/2"></div>
          <div className="h-4 bg-white/5 rounded w-1/3"></div>
          <div className="h-40 bg-white/5 rounded-xl w-full mt-8"></div>
        </div>
        <div className="w-full lg:w-[300px] flex-none border-l border-white/5 lg:pl-10">
          <div className="h-8 bg-white/5 rounded w-1/2 mb-8"></div>
          {[1,2,3,4].map(i => <div key={i} className="flex gap-4 items-center mb-6"><div className="w-14 h-14 rounded-full bg-white/5 flex-none"></div><div className="h-4 bg-white/5 rounded w-32"></div></div>)}
        </div>
      </div>
    </div>
  );

  const trailer = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const castList = details.credits?.cast?.slice(0, 5) || [];
  const genres = details.genres?.map(g => g.name).join(', ') || 'Unknown';
  const runtime = details.runtime ? `${details.runtime} minutes (${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m)` : 'TBA';
  const releaseYear = details.release_date?.substring(0,4) || details.first_air_date?.substring(0,4) || 'Unknown';

  const director = details.credits?.crew?.find(c => c.job === 'Director');
  const companies = details.production_companies || [];
  const ratingColor = details.vote_average >= 8 ? 'ring-green-400' : details.vote_average >= 6 ? 'ring-yellow-400' : 'ring-red-400';
  const releaseDate = details.release_date || details.first_air_date;
  const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
  const logo = details.images?.logos?.find(l => l.iso_639_1 === 'en')?.file_path || details.images?.logos?.[0]?.file_path;

  const KNOWN_AWARD_WINNERS = [
    872585, // Oppenheimer
    496243, // Parasite
    545609, // Everything Everywhere All at Once
    155,    // The Dark Knight
    13,     // Forrest Gump
    122,    // The Lord of the Rings: The Return of the King
    680,    // Pulp Fiction
    278,    // The Shawshank Redemption
    238,    // The Godfather
    424,    // Schindler's List
    157336, // Interstellar (VFX)
    118340, // Guardians of the Galaxy (Nominated/VFX)
    603,    // The Matrix
    70160,  // The Hunger Games (not Oscar but huge awards)
  ];
  const kwds = details.keywords?.results || details.keywords?.keywords || [];
  const hasAwardKeyword = kwds.some(k => k.name.toLowerCase().includes('oscar') || k.name.toLowerCase().includes('emmy') || k.name.toLowerCase().includes('award'));
  const isAwardWinner = hasAwardKeyword || KNOWN_AWARD_WINNERS.includes(parseInt(id));

  let ageRating = null;
  if (type === 'movie' && details.release_dates) {
     const usRelease = details.release_dates.results?.find(r => r.iso_3166_1 === 'US');
     if (usRelease && usRelease.release_dates.length > 0) {
        ageRating = usRelease.release_dates[0].certification;
     }
  } else if (type === 'tv' && details.content_ratings) {
     const usRating = details.content_ratings.results?.find(r => r.iso_3166_1 === 'US');
     if (usRating) {
        ageRating = usRating.rating;
     }
  }

  const usProviders = details['watch/providers']?.results?.US;
  const watchProviders = usProviders?.flatrate || usProviders?.rent || usProviders?.buy || [];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -15 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-shows-dark text-white pb-20 md:pb-0 font-sans relative overflow-hidden"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      
      {/* Top Floating Back Button */}
      <div className="fixed top-20 left-4 md:left-8 z-40">
        <button 
          onClick={handleBack}
          className="flex items-center space-x-2 bg-black/70 hover:bg-black text-white px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all hover:scale-105 border border-white/20 backdrop-blur-md cursor-pointer shadow-2xl"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Background with Parallax */}
      <div className="absolute top-0 left-0 w-full h-[100vh] z-0 pointer-events-none overflow-hidden bg-[#0a0a0a]">
        <motion.img style={{ y: backgroundY }} src={`${IMAGE_BASE_URL}${details.backdrop_path}`} className="w-full h-[120%] -top-[10%] relative object-cover opacity-50 transition-opacity duration-500" alt="bg" />
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-shows-dark via-shows-dark/60 via-20% to-transparent to-80%"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-shows-dark/80 via-shows-dark/20 to-transparent"></div>
      </div>

      <motion.div 
        initial={{ y: "100vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 container mx-auto px-4 md:px-12 pt-32 pb-20 flex flex-col lg:flex-row gap-12 lg:gap-20"
      >
        
        {/* Left Column: Poster */}
        <div className="w-full md:w-[300px] mx-auto lg:mx-0 flex-none z-20 pt-4">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/80">
            <img src={`${IMAGE_BASE_URL_W500}${details.poster_path}`} className="w-full h-full object-cover" alt={details.title || details.name} />
            
            {details.vote_average > 0 && (
              <div className={`absolute top-4 left-4 w-12 h-12 bg-[#111] rounded-full flex items-center justify-center ring-4 ${ratingColor} shadow-xl shadow-black/60`}>
                <span className="font-bold text-sm text-white">{details.vote_average.toFixed(1)}</span>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-netflix-red text-white text-center py-3 font-bold text-xs tracking-wider uppercase">
              Most Viewed on NETPHLIX ★
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Info Area */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Center Column: Details */}
            <div className="flex-1 flex flex-col justify-start">
          {isAwardWinner && (
             <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-yellow-400/10 border border-yellow-500/30 text-yellow-500 px-4 py-1.5 rounded-full w-max mb-4 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Star className="w-4 h-4 fill-yellow-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Award Winner</span>
             </div>
          )}

          {logo ? (
            <img src={`${IMAGE_BASE_URL_W500}${logo}`} alt={details.title || details.name} className="w-full max-w-[400px] object-contain mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter contrast-125" />
          ) : (
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight mb-6 drop-shadow-2xl leading-none">
              {details.title || details.name}
            </h1>
          )}
          
          {/* Production Companies */}
          {companies.filter(c => c.logo_path).length > 0 && (
            <div className="flex flex-wrap items-center gap-8 mb-10">
              {companies.filter(c => c.logo_path).slice(0, 4).map(c => (
                <motion.div 
                  key={c.id} 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative group/logo cursor-pointer flex items-center justify-center"
                  onClick={() => navigate(`/company/${c.id}`)}
                >
                  <img src={`${IMAGE_BASE_URL_W500}${c.logo_path}`} className="h-6 md:h-8 object-contain filter brightness-0 invert opacity-90 group-hover/logo:brightness-100 group-hover/logo:invert-0 group-hover/logo:opacity-100 transition-all duration-300 drop-shadow-md" alt={c.name} />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/logo:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50 backdrop-blur-sm">
                    {c.name}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex flex-col space-y-2 text-gray-300 font-medium mb-6">
            <div className="flex items-center text-[13px]"><Calendar className="w-4 h-4 mr-2 text-gray-400"/> {formattedDate} (United States)</div>
            <div className="flex items-center text-[13px]">
               <Clock className="w-4 h-4 mr-2 text-gray-400"/> {runtime}
               {ageRating && (
                 <span className="ml-3 border border-white/40 text-gray-300 px-1.5 py-0.5 text-[11px] rounded font-bold tracking-wider">{ageRating}</span>
               )}
            </div>
          </div>

          {details.genres && (
            <div className="flex flex-wrap gap-2 mb-8">
              {details.genres.map(g => (
                <span key={g.id} className="px-4 py-1.5 bg-white/5 rounded-full text-[12px] font-medium text-gray-300 border border-white/10 cursor-default">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {director && (
            <div className="flex items-center mb-12 cursor-pointer group w-max" onClick={() => navigate(`/person/${director.id}`)}>
              <div className="w-12 h-12 rounded-full mr-4 overflow-hidden flex-none">
                {director.profile_path ? (
                  <img src={`${IMAGE_BASE_URL_W500}${director.profile_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={director.name} />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><User className="w-5 h-5 text-gray-400"/></div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-bold text-white text-base leading-none group-hover:text-netflix-red transition-colors">{director.name}</p>
                <p className="text-gray-400 text-xs mt-1 leading-none">Director</p>
              </div>
            </div>
          )}

          <div className="mb-6 mt-4">
            <p className="text-xs font-bold text-gray-100 mb-3">Available on</p>
            <div className="w-12 h-12 bg-[#01b4e4] rounded-lg flex items-center justify-center font-black text-[10px] leading-none text-[#0d253f] text-center shadow-lg">THE<br/>MOVIE<br/>DB</div>
          </div>

          {new Date(releaseDate) > new Date() && (
            <Countdown targetDate={releaseDate} />
          )}

          <div className="flex flex-wrap gap-3 mb-12">
            {new Date(releaseDate) <= new Date() && (
              <button onClick={() => navigate(`/watch/${type}/${id}`, { state: { from: location.pathname + location.search } })} className="flex items-center bg-netflix-red hover:bg-red-700 text-white rounded-full px-8 py-2.5 text-sm font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-105">
                <Play className="w-5 h-5 mr-2 fill-current" />
                Play Now
              </button>
            )}
            <button onClick={toggleMyList} className="flex items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors group">
              <Bookmark className={`w-4 h-4 mr-2 ${inList ? 'fill-white text-white' : ''}`} />
              {inList ? 'In Watchlist' : 'Watchlist'}
            </button>
            <button onClick={toggleLike} className="flex items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors group">
              <Calendar className={`w-4 h-4 mr-2 ${isLiked ? 'fill-white text-white' : ''}`} />
              Reminder
            </button>
            <button className="flex items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors group">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>

          </div>

            {/* Right Column: Cast */}
            <div className="w-full lg:w-[280px] flex-none">
              <h3 className="text-lg font-bold mb-6 text-white font-display tracking-tight">Casts & Credits</h3>
              <div className="flex flex-col space-y-4">
                {castList.map(person => (
                  <div key={person.id} className="flex items-center space-x-4 cursor-pointer group" onClick={() => navigate(`/person/${person.id}`)}>
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-none bg-white/5">
                      {person.profile_path ? (
                        <img src={`${IMAGE_BASE_URL_W500}${person.profile_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300" alt={person.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><User className="w-4 h-4 text-gray-500" /></div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="font-bold text-[13px] text-gray-200 group-hover:text-white transition-colors leading-tight">{person.name}</span>
                      <span className="text-[11px] text-gray-500 mt-0.5 leading-tight">{person.character}</span>
                    </div>
                  </div>
                ))}
                <button className="text-blue-500 text-xs font-bold mt-2 flex items-center hover:text-blue-400 transition w-max">
                  Show All <ChevronDown className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Content Area (Aligned under logo) */}
          <div className="mt-8 w-full max-w-4xl pb-20">
            <div className="mb-12 pr-4 md:pr-12">
              <h3 className="text-lg font-bold mb-4 font-display">Overview</h3>
              <p className="text-gray-300 text-[13px] leading-relaxed mb-6">{details.overview}</p>
              
              {watchProviders.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold text-gray-400 mb-3">Available to Watch On</p>
                  <div className="flex flex-wrap gap-3">
                    {watchProviders.map(provider => (
                       <div key={provider.provider_id} className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shadow-lg" title={provider.provider_name}>
                          <img src={`${IMAGE_BASE_URL_W500}${provider.logo_path}`} alt={provider.provider_name} className="w-full h-full object-cover" />
                       </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {trailer && (
              <div className="mb-12 relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer mx-auto lg:mx-0" onClick={() => navigate(`/watch/${type}/${id}`, { state: { from: location.pathname + location.search } })}>
                <img src={`${IMAGE_BASE_URL}${details.backdrop_path}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/30">
                     <Play className="w-8 h-8 text-white ml-1 fill-current" />
                   </div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                   <h2 className="text-xl md:text-2xl font-black text-white font-display drop-shadow-lg tracking-tight">{details.title || details.name}</h2>
                   <p className="text-gray-300 font-medium tracking-widest text-[10px] uppercase mt-1">Official Trailer</p>
                </div>
              </div>
            )}

            {details.belongs_to_collection && collectionMovies.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-bold mb-6 text-white font-display">The {details.belongs_to_collection.name} - Watch in Order</h3>
                <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
                  {collectionMovies.map(movie => (
                    <div 
                      key={movie.id} 
                      className={`flex-none w-32 md:w-40 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer relative group border-2 ${movie.id === parseInt(id) ? 'border-netflix-red shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105 z-10' : 'border-transparent hover:border-white/30'}`}
                      onClick={() => navigate(`/title/movie/${movie.id}`)}
                    >
                      <img src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={movie.title} />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-current shadow-lg" />
                      </div>
                      {movie.id === parseInt(id) && (
                        <div className="absolute top-2 left-2 bg-netflix-red text-[10px] font-bold px-2 py-0.5 rounded shadow-md">YOU ARE HERE</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {similar?.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-bold mb-6 text-white font-display">Recommendation & Similar</h3>
                <div className="flex flex-col space-y-3">
                  {similar.slice(0, 4).map((movie, index) => (
                    <div 
                      key={movie.id} 
                      className="flex bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 p-3 items-center transition-colors cursor-pointer group"
                      onClick={() => {
                        navigate(`/${movie.media_type || type}/${movie.id}`, { state: { movie } });
                        window.scrollTo(0,0);
                      }}
                    >
                      <span className="text-gray-500 font-bold px-4 md:px-6">{index + 1}</span>
                      <img src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`} className="w-12 h-20 md:w-16 md:h-24 rounded object-cover shadow-md group-hover:shadow-lg transition-shadow" alt={movie.title || movie.name} />
                      <div className="ml-4 flex-1">
                        <h4 className="font-bold text-white text-[13px] md:text-sm mb-1">{movie.title || movie.name}</h4>
                        <div className="flex items-center text-[11px] text-gray-400 space-x-3">
                          {movie.vote_average > 0 && (
                            <span className="flex items-center text-yellow-500"><Star className="w-3 h-3 mr-1 fill-current" /> {movie.vote_average.toFixed(1)}</span>
                          )}
                          <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-300">{movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 max-w-[260px] md:max-w-md line-clamp-2 hidden sm:block pl-6 pr-4">
                        {movie.overview}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
      </div>
      </motion.div>
      <Footer />
    </motion.div>
  );
}

import Hls from 'hls.js';

const CustomPlayer = ({ url, type = 'm3u8', title, onBack, externalCaptions = [], hasNextEpisode, onNextEpisode, onProgress }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showCenterIcon, setShowCenterIcon] = useState(null); // 'play' or 'pause'
  const [seekRipple, setSeekRipple] = useState(null); // 'left' or 'right'
  const [showControls, setShowControls] = useState(true);
  
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const [hlsSubtitles, setHlsSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [subtitleOffset, setSubtitleOffset] = useState(0);
  const prevOffsetRef = useRef(0);

  const [audioTracks, setAudioTracks] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(0);
  const [showAudioMenu, setShowAudioMenu] = useState(false);

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const centerIconTimeout = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const lastTapRef = useRef(0);
  const wakeLockRef = useRef(null);
  const lastProgressUpdateRef = useRef(-1);

  useEffect(() => {
    if (playing && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLockRef.current = lock;
      }).catch(err => console.log('WakeLock error:', err));
    } else if (!playing && wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      });
    }
  }, [playing]);

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [playing]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          setPlaying(p => !p);
          setShowCenterIcon(!playing ? 'play' : 'pause');
          if (centerIconTimeout.current) clearTimeout(centerIconTimeout.current);
          centerIconTimeout.current = setTimeout(() => setShowCenterIcon(null), 800);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          setVolume(v => v === 0 ? 1 : 0);
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          setSeekRipple('left');
          setTimeout(() => setSeekRipple(null), 500);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          setSeekRipple('right');
          setTimeout(() => setSeekRipple(null), 500);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing]);

  // Next Episode Auto-Play logic
  useEffect(() => {
    if (duration > 0 && played * duration >= duration - 1) {
      if (hasNextEpisode && onNextEpisode) {
        onNextEpisode();
      }
    }
  }, [played, duration, hasNextEpisode, onNextEpisode]);

  useEffect(() => {
    const video = playerRef.current;
    if (!video) return;

    if (Hls.isSupported() && type !== 'mp4' && !url.includes('.mp4')) {
      const hls = new Hls({
        maxBufferLength: 30,
        enableWorker: true,
      });
      hlsRef.current = hls;
      
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
         setIsBuffering(false);
         setQualities(hls.levels);
         if (hls.audioTracks) setAudioTracks(hls.audioTracks);
      });

      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
         setHlsSubtitles(hls.subtitleTracks);
      });

      // Handle dynamic audio tracks if they update
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
         setAudioTracks(hls.audioTracks);
      });

      hls.on(Hls.Events.ERROR, (e, data) => {
         if (data.fatal) setIsBuffering(true);
      });

      return () => {
        hls.destroy();
      };
    } else {
      // Fallback to native video src for MP4 or native HLS (Safari)
      video.src = url;
      setIsBuffering(false); // Can't precisely know manifest parse, assume ready
    }
  }, [url, type]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (playerRef.current) {
      if (playing) {
        playerRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        playerRef.current.pause();
      }
    }
  }, [playing]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (playerRef.current) {
      playerRef.current.currentTime = pos * playerRef.current.duration;
    }
  };

  const skip = (amount) => {
    if (playerRef.current) {
      playerRef.current.currentTime += amount;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    return `${mm}:${ss}`;
  };

  const handleVideoClick = () => {
    if (showQualityMenu || showSubtitleMenu || showAudioMenu) {
      setShowQualityMenu(false);
      setShowSubtitleMenu(false);
      setShowAudioMenu(false);
      return;
    }
    const newPlaying = !playing;
    setPlaying(newPlaying);
    
    if ("vibrate" in navigator) navigator.vibrate(50);
    
    setShowCenterIcon(newPlaying ? 'play' : 'pause');
    if (centerIconTimeout.current) clearTimeout(centerIconTimeout.current);
    centerIconTimeout.current = setTimeout(() => setShowCenterIcon(null), 800);
  };

  const handleTouchEnd = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    
    if (tapLength < 300 && tapLength > 0) {
      if ("vibrate" in navigator) navigator.vibrate(50);
      const touchX = e.changedTouches[0].clientX;
      if (touchX < window.innerWidth / 2) {
        skip(-10);
        setSeekRipple('left');
      } else {
        skip(10);
        setSeekRipple('right');
      }
      setTimeout(() => setSeekRipple(null), 500);
      e.preventDefault(); // Prevent default click
    }
    lastTapRef.current = currentTime;
  };

  const handleQualityChange = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
    }
  };

  const handleSubtitleChange = (trackId) => {
    setCurrentSubtitle(trackId);
    setShowSubtitleMenu(false);
    // If it's an HLS track (number), tell HLS
    if (typeof trackId === 'number' && hlsRef.current) {
      hlsRef.current.subtitleTrack = trackId;
    } else if (hlsRef.current) {
      hlsRef.current.subtitleTrack = -1; // disable HLS subtitle if external or off
    }
  };

  const handleSubtitleSync = (delta) => {
     const newOffset = subtitleOffset + delta;
     const actualDelta = newOffset - prevOffsetRef.current;
     
     const video = playerRef.current;
     if (video && video.textTracks) {
        for (let i = 0; i < video.textTracks.length; i++) {
           const track = video.textTracks[i];
           if (track.mode === 'showing' && track.cues) {
              for (let j = 0; j < track.cues.length; j++) {
                 track.cues[j].startTime += actualDelta;
                 track.cues[j].endTime += actualDelta;
              }
           }
        }
     }
     prevOffsetRef.current = newOffset;
     setSubtitleOffset(newOffset);
  };

  const handleAudioChange = (trackId) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId;
      setCurrentAudio(trackId);
      setShowAudioMenu(false);
    }
  };

  // Combine external captions and HLS subtitles
  const allSubtitles = [
     ...hlsSubtitles.map(t => ({ id: t.id, name: t.name || `Track ${t.id}` })),
     ...externalCaptions.map((cap, i) => ({ id: `ext-${i}`, name: cap.language || `Ext ${i}`, url: cap.url }))
  ];

  const activeExternalTrack = externalCaptions.find((_, i) => `ext-${i}` === currentSubtitle);

  // Force the native text track to display when an external track is selected
  useEffect(() => {
    const video = playerRef.current;
    if (video && video.textTracks) {
      // Small timeout to allow React to render the <track> element first
      setTimeout(() => {
        for (let i = 0; i < video.textTracks.length; i++) {
          if (video.textTracks[i].kind === 'subtitles' || video.textTracks[i].kind === 'captions') {
            video.textTracks[i].mode = activeExternalTrack ? 'showing' : 'hidden';
          }
        }
      }, 50);
    }
  }, [activeExternalTrack, currentSubtitle]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full aspect-video bg-black rounded-none md:rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] border-0 md:border border-gray-800 font-sans select-none ${showControls ? '' : 'cursor-none'}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={resetControlsTimeout}
    >
      <video
        ref={playerRef}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={(e) => {
          const p = e.target.currentTime / e.target.duration || 0;
          setPlayed(p);
          const currentSec = Math.floor(e.target.currentTime);
          if (onProgress && currentSec % 5 === 0 && currentSec !== lastProgressUpdateRef.current) {
              lastProgressUpdateRef.current = currentSec;
              onProgress(p * 100);
          }
        }}
        onDurationChange={(e) => setDuration(e.target.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onClick={handleVideoClick}
        onTouchEnd={handleTouchEnd}
        crossOrigin="anonymous"
      >
        {activeExternalTrack && (
           <track 
              key={activeExternalTrack.url}
              kind="subtitles" 
              src={activeExternalTrack.url} 
              srcLang="en" 
              label={activeExternalTrack.language} 
              default 
              onLoad={(e) => {
                 const track = e.target.track;
                 if (track && track.cues && subtitleOffset !== 0) {
                    for (let i = 0; i < track.cues.length; i++) {
                       track.cues[i].startTime += subtitleOffset;
                       track.cues[i].endTime += subtitleOffset;
                    }
                 }
                 prevOffsetRef.current = subtitleOffset;
              }}
           />
        )}
      </video>
      
      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Center Action Icon Animation */}
      {showCenterIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-20 h-20 md:w-28 md:h-28 bg-black/60 rounded-full flex items-center justify-center animate-ping-short">
            {showCenterIcon === 'play' ? (
              <Play className="w-10 h-10 md:w-12 md:h-12 text-white ml-2" />
            ) : showCenterIcon === 'pause' ? (
              <Pause className="w-10 h-10 md:w-12 md:h-12 text-white" />
            ) : showCenterIcon === 'rewind' ? (
              <RotateCcw className="w-10 h-10 md:w-12 md:h-12 text-white" />
            ) : (
              <RotateCw className="w-10 h-10 md:w-12 md:h-12 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Visual Seek Ripples (Mobile) */}
      {seekRipple && (
        <div className={`absolute top-0 bottom-0 w-1/2 flex items-center justify-center pointer-events-none overflow-hidden z-20 ${seekRipple === 'left' ? 'left-0' : 'right-0'}`}>
          <div 
            className="w-full h-full bg-white/10 flex flex-col items-center justify-center animate-ping-short"
            style={{ 
               borderTopRightRadius: seekRipple === 'left' ? '100%' : '0',
               borderBottomRightRadius: seekRipple === 'left' ? '100%' : '0',
               borderTopLeftRadius: seekRipple === 'right' ? '100%' : '0',
               borderBottomLeftRadius: seekRipple === 'right' ? '100%' : '0'
            }}
          >
             {seekRipple === 'left' ? <RotateCcw className="w-8 h-8 text-white mb-2" /> : <RotateCw className="w-8 h-8 text-white mb-2" />}
             <span className="text-white font-bold">{seekRipple === 'left' ? '-10s' : '+10s'}</span>
          </div>
        </div>
      )}

      {/* Auto-Play Next Episode Overlay */}
      {hasNextEpisode && duration > 0 && played * duration >= duration - 15 && (
        <div className="absolute bottom-24 right-8 z-40 pointer-events-auto transition-opacity duration-500 opacity-100">
          <button onClick={onNextEpisode} className="flex items-center space-x-4 bg-black/80 hover:bg-black border border-gray-600 rounded-md px-6 py-4 shadow-2xl transition-transform hover:scale-105 group">
             <div className="flex flex-col text-left">
                <span className="text-white font-bold text-lg">Up Next</span>
                <span className="text-gray-300 text-sm">Starting in {Math.floor(duration - played*duration)}s</span>
             </div>
             <Play className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* Top Gradient Overlay */}
      <div className={`absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-500 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Top Left: Back Button & Title */}
      <div className={`absolute top-4 left-4 md:top-6 md:left-6 z-20 transition-opacity duration-500 pointer-events-auto flex items-center space-x-2 md:space-x-4 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {onBack && (
          <button onClick={onBack} className="text-white hover:text-white/80 transition-colors bg-black/40 hover:bg-black/60 rounded-full p-1.5 md:p-2 backdrop-blur-md">
            <ArrowLeft className="w-5 h-5 md:w-8 md:h-8" />
          </button>
        )}
        <h1 className="text-lg md:text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide line-clamp-1">{title}</h1>
      </div>

      {/* Controls Overlay */}
      <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent px-2 md:px-8 py-3 md:py-8 transition-opacity duration-500 flex flex-col justify-end z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
         
         {/* Progress Bar */}
         <div className="w-full h-8 cursor-pointer relative flex items-center group/scrub mb-2" onClick={handleSeek}>
            <div className="w-full h-1 bg-white/20 relative group-hover/scrub:h-1.5 transition-all duration-300">
               {/* Buffered Bar */}
               <div className="absolute top-0 left-0 h-full bg-white/30 pointer-events-none" style={{ width: `${(played + 0.05) * 100}%`, maxWidth: '100%' }}></div>
               {/* Netflix-style Red Progress Bar */}
               <div className="absolute top-0 left-0 h-full bg-[#E50914] pointer-events-none shadow-[0_0_10px_#E50914]" style={{ width: `${played * 100}%` }}></div>
            </div>
            {/* Thumb */}
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full scale-0 group-hover/scrub:scale-100 transition-transform shadow-md pointer-events-none z-10" style={{ left: `calc(${played * 100}% - 8px)` }}></div>
         </div>

         {/* Controls */}
         <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 md:space-x-6">
               <button onClick={() => setPlaying(!playing)} className="text-white hover:text-gray-300 transition-colors drop-shadow-md">
                  {playing ? <Pause className="w-8 h-8 md:w-10 md:h-10" /> : <Play className="w-8 h-8 md:w-10 md:h-10" />}
               </button>

               <button onClick={() => skip(-10)} className="text-white hover:text-gray-300 transition-colors hidden sm:block drop-shadow-md" title="Rewind 10s">
                  <RotateCcw className="w-7 h-7 md:w-8 md:h-8" />
               </button>

               <button onClick={() => skip(10)} className="text-white hover:text-gray-300 transition-colors hidden sm:block drop-shadow-md" title="Forward 10s">
                  <RotateCw className="w-7 h-7 md:w-8 md:h-8" />
               </button>
               
               {/* Volume */}
               <div className="hidden sm:flex items-center space-x-2 group/vol relative">
                  <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-white hover:text-gray-300 transition-colors drop-shadow-md">
                     {volume === 0 ? <VolumeX className="w-7 h-7 md:w-8 md:h-8" /> : <Volume2 className="w-7 h-7 md:w-8 md:h-8" />}
                  </button>
                  <div className="w-0 group-hover/vol:w-24 overflow-hidden opacity-0 group-hover/vol:opacity-100 transition-all duration-300 flex items-center">
                    <input 
                       type="range" min={0} max={1} step={0.05} value={volume} 
                       onChange={(e) => setVolume(parseFloat(e.target.value))}
                       className="w-full accent-[#E50914] cursor-pointer h-1 bg-white/30 rounded-full appearance-none"
                    />
                  </div>
               </div>

               {/* Time Display */}
               <div className="text-white text-xs md:text-sm font-medium tracking-wide drop-shadow-md tabular-nums pl-2">
                  {formatTime(played * duration)} <span className="text-white/60 mx-1">/</span> {formatTime(duration)}
               </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6 relative">
               
               {/* Subtitles Menu */}
               {allSubtitles.length > 0 && (
                 <div className="relative group/subs">
                   <button onClick={() => {setShowSubtitleMenu(!showSubtitleMenu); setShowQualityMenu(false); setShowAudioMenu(false);}} className={`text-white hover:text-gray-300 transition-colors drop-shadow-md ${showSubtitleMenu ? 'text-[#E50914]' : ''}`} title="Subtitles">
                      <Subtitles className="w-7 h-7 md:w-8 md:h-8" />
                   </button>
                   {showSubtitleMenu && (
                     <div className="absolute bottom-full right-0 mb-4 w-48 bg-black/95 border border-gray-800 rounded-lg overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 transition-all origin-bottom">
                       <div className="py-2 max-h-60 overflow-y-auto scrollbar-hide">
                         <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-black/95">Subtitles</div>
                         <button 
                           onClick={() => handleSubtitleChange(-1)} 
                           className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentSubtitle === -1 ? 'text-white bg-white/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                         >
                           Off
                           {currentSubtitle === -1 && <Check className="w-4 h-4" />}
                         </button>
                         {allSubtitles.map(track => (
                           <button 
                             key={track.id} 
                             onClick={() => handleSubtitleChange(track.id)} 
                             className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentSubtitle === track.id ? 'text-white bg-white/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                           >
                             {track.name}
                             {currentSubtitle === track.id && <Check className="w-4 h-4" />}
                           </button>
                         ))}
                       </div>
                       
                       {/* Subtitle Sync Tool */}
                       {currentSubtitle !== -1 && (
                         <div className="border-t border-gray-800 p-3 bg-black/50">
                            <div className="text-xs text-gray-400 mb-2 flex justify-between">
                               <span>Sync Delay</span>
                               <span className="text-white font-mono">{subtitleOffset > 0 ? '+' : ''}{(subtitleOffset).toFixed(1)}s</span>
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                               <button onClick={() => handleSubtitleSync(-0.5)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-mono">-0.5s</button>
                               <button onClick={() => handleSubtitleSync(0.5)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-mono">+0.5s</button>
                            </div>
                         </div>
                       )}
                     </div>
                   )}
                 </div>
               )}

               {/* Audio Menu */}
               {audioTracks.length > 1 && (
                  <div className="relative group/audio">
                    <button onClick={() => {setShowAudioMenu(!showAudioMenu); setShowQualityMenu(false); setShowSubtitleMenu(false);}} className={`text-white hover:text-gray-300 transition-colors drop-shadow-md ${showAudioMenu ? 'text-[#E50914]' : ''}`} title="Audio Tracks">
                      <Headphones className="w-7 h-7 md:w-8 md:h-8" />
                    </button>
                    {showAudioMenu && (
                      <div className="absolute bottom-full right-0 mb-4 w-48 bg-black/95 border border-gray-800 rounded-lg overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50">
                        <div className="py-2 max-h-60 overflow-y-auto scrollbar-hide">
                          <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-black/95">Audio</div>
                          {audioTracks.map((track, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleAudioChange(i)} 
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentAudio === i ? 'text-white bg-white/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                            >
                              {track.name || `Audio ${i + 1}`}
                              {currentAudio === i && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
               )}

               {/* Quality Settings */}
               {qualities.length > 0 && (
                 <div className="relative group/quality">
                   <button onClick={() => {setShowQualityMenu(!showQualityMenu); setShowSubtitleMenu(false); setShowAudioMenu(false);}} className={`text-white hover:text-gray-300 transition-colors drop-shadow-md ${showQualityMenu ? 'text-[#E50914]' : ''}`} title="Quality">
                     <Settings className={`w-7 h-7 md:w-8 md:h-8 transition-transform ${showQualityMenu ? 'rotate-90' : ''}`} />
                   </button>
                   {showQualityMenu && (
                     <div className="absolute bottom-full right-0 mb-4 w-40 bg-black/95 border border-gray-800 rounded-lg overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50">
                       <div className="py-2 max-h-60 overflow-y-auto scrollbar-hide">
                         <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-black/95">Quality</div>
                         <button 
                           onClick={() => handleQualityChange(-1)} 
                           className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentQuality === -1 ? 'text-white bg-white/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                         >
                           Auto
                           {currentQuality === -1 && <Check className="w-4 h-4" />}
                         </button>
                         {[...qualities].reverse().map((q, idx) => {
                           const originalIndex = qualities.length - 1 - idx;
                           return (
                             <button 
                               key={originalIndex} 
                               onClick={() => handleQualityChange(originalIndex)} 
                               className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentQuality === originalIndex ? 'text-white bg-white/10 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                             >
                               {q.height}p
                               {currentQuality === originalIndex && <Check className="w-4 h-4" />}
                             </button>
                           );
                         })}
                       </div>
                     </div>
                   )}
                 </div>
               )}

               <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors drop-shadow-md" title="Fullscreen">
                  <Maximize className="w-7 h-7 md:w-8 md:h-8" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const SERVERS = [
  { id: 'Peachify', name: 'Peachify (Fast / Multi-server)', shortName: '⚡ Peachify', getUrl: (t, id, s, e) => t === 'tv' ? `https://peachify.pro/embed/tv/${id}/${s}/${e}?theme=netflix` : `https://peachify.pro/embed/movie/${id}?theme=netflix` },
  { id: 'VidLink', name: 'VidLink (Recommended)', shortName: '🚀 VidLink', getUrl: (t, id, s, e) => t === 'tv' ? `https://vidlink.pro/tv/${id}/${s}/${e}` : `https://vidlink.pro/movie/${id}` },
  { id: 'VidSrcSH', name: 'VidSrc Official (Primary)', shortName: '🎬 VidSrc SH', getUrl: (t, id, s, e) => t === 'tv' ? `https://vidsrc.sh/embed/tv/${id}/${s}/${e}` : `https://vidsrc.sh/embed/movie/${id}` },
  { id: 'VidEasy', name: 'VidEasy (Fast HD)', shortName: '🌟 VidEasy', getUrl: (t, id, s, e) => t === 'tv' ? `https://player.videasy.to/tv/${id}/${s}/${e}` : `https://player.videasy.to/movie/${id}` },
  { id: 'VidCore', name: 'VidCore (HLS Edge)', shortName: '⚡ VidCore', getUrl: (t, id, s, e) => t === 'tv' ? `https://www.vidcore.org/embed/tv/${id}/${s}/${e}` : `https://www.vidcore.org/embed/movie/${id}` },
  { id: 'VidSrc2', name: 'VidSrc Mirror (Mirror 2)', shortName: '🔄 VidSrc 2', getUrl: (t, id, s, e) => t === 'tv' ? `https://vidsrc2.ru/embed/tv/${id}/${s}/${e}` : `https://vidsrc2.ru/embed/movie/${id}` },
  { id: 'AutoEmbed', name: 'AutoEmbed (Multi-server)', shortName: '🌐 AutoEmbed', getUrl: (t, id, s, e) => t === 'tv' ? `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` : `https://autoembed.co/movie/tmdb/${id}` },
  { id: 'VidSrcPM', name: 'VidSrc PM (Multi-sub)', shortName: '💬 VidSrc PM', getUrl: (t, id, s, e) => t === 'tv' ? `https://vidsrc.pm/embed/tv/${id}/${s}/${e}` : `https://vidsrc.pm/embed/movie/${id}` },
  { id: '2EmbedSkin', name: '2Embed (Mirror 1)', shortName: '📺 2Embed 1', getUrl: (t, id, s, e) => t === 'tv' ? `https://www.2embed.skin/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.skin/embed/${id}` },
  { id: '2EmbedCC', name: '2Embed (Mirror 2)', shortName: '📺 2Embed 2', getUrl: (t, id, s, e) => t === 'tv' ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.cc/embed/${id}` },
  { id: 'NontonGo', name: 'NontonGo (Asian / Global)', shortName: '🌏 NontonGo', getUrl: (t, id, s, e) => t === 'tv' ? `https://www.nontongo.win/embed/tv/${id}/${s}/${e}` : `https://www.nontongo.win/embed/movie/${id}` },
  { id: 'VidSrcIR', name: 'VidSrc Backup (Mirror 3)', shortName: '🛡️ VidSrc IR', getUrl: (t, id, s, e) => t === 'tv' ? `https://vidsrc.ir/embed/tv/${id}/${s}/${e}` : `https://vidsrc.ir/embed/movie/${id}` },
];

function WatchPage() {
  const { type, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const season = queryParams.get('s') || 1;
  const episode = queryParams.get('e') || 1;
  const [selectedServerId, setSelectedServerId] = useLocalStorage('netphlix_selectedServer', SERVERS[0].id);
  const [useSandbox, setUseSandbox] = useLocalStorage('netphlix_useSandbox', false);

  const [watchHistory, setWatchHistory] = useLocalStorage('netphlix_watchHistory', []);
  
  const [details, setDetails] = useState(null);
  const [episodesList, setEpisodesList] = useState([]);
  const [activeTab, setActiveTab] = useState('');

  const activeServer = SERVERS.find(s => s.id === selectedServerId) || SERVERS[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, season, episode]);

  // Fetch Details & Save to watch history
  useEffect(() => {
    const fetchTitleAndSave = async () => {
      try {
        const tmdbUrl = type === 'tv' 
          ? `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&append_to_response=credits,similar`
          : `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,similar`;
        
        const tmdbRes = await fetch(tmdbUrl);
        const tmdbData = await tmdbRes.json();
        setDetails(tmdbData);
        const title = tmdbData.name || tmdbData.title;

        if (title) {
          setWatchHistory(prev => {
            const filtered = prev.filter(m => m.id !== parseInt(id));
            return [{
              id: parseInt(id),
              title: title,
              name: title,
              media_type: type,
              poster_path: tmdbData.poster_path,
              backdrop_path: tmdbData.backdrop_path,
              last_watched: new Date().toISOString()
            }, ...filtered];
          });
        }
      } catch (err) {
        console.error("Failed to fetch details", err);
      }
    };

    fetchTitleAndSave();
  }, [id, type]);

  useEffect(() => {
    if (type === 'tv') {
      const fetchEpisodes = async () => {
        const epsRes = await fetch(`${BASE_URL}/tv/${id}/season/${season}?api_key=${API_KEY}`).then(r => r.json());
        setEpisodesList(epsRes.episodes || []);
      };
      fetchEpisodes();
    }
  }, [id, type, season]);

  // Listen to postMessage from embeds (e.g. Peachify, Videasy) to track watch progress
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data) {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          const currentTime = data.currentTime || data.progress || data.peachifyProgress?.currentTime;
          const duration = data.duration || data.peachifyProgress?.duration;
          if (currentTime && duration) {
            setWatchHistory(prev => prev.map(item => {
              if (item.id === parseInt(id)) {
                return { 
                  ...item, 
                  currentTime: Math.round(currentTime), 
                  duration: Math.round(duration), 
                  progressPercent: Math.min(100, Math.round((currentTime / duration) * 100)) 
                };
              }
              return item;
            }));
          }
        } catch (err) {}
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, setWatchHistory]);

  const handleNextEpisode = () => {
    const currentEpNum = parseInt(episode);
    const nextEp = episodesList.find(ep => ep.episode_number === currentEpNum + 1);
    if (nextEp) {
      navigate(`/watch/tv/${id}?s=${season}&e=${currentEpNum + 1}`, { state: location.state });
    } else if (details?.seasons) {
      const currentSeasonNum = parseInt(season);
      const nextSeason = details.seasons.find(s => s.season_number === currentSeasonNum + 1);
      if (nextSeason) {
        navigate(`/watch/tv/${id}?s=${currentSeasonNum + 1}&e=1`, { state: location.state });
      }
    }
  };

  const handlePrevEpisode = () => {
    const currentEpNum = parseInt(episode);
    if (currentEpNum > 1) {
      navigate(`/watch/tv/${id}?s=${season}&e=${currentEpNum - 1}`, { state: location.state });
    } else if (parseInt(season) > 1 && details?.seasons) {
      const prevSeasonNum = parseInt(season) - 1;
      navigate(`/watch/tv/${id}?s=${prevSeasonNum}&e=1`, { state: location.state });
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const key = e.key.toLowerCase();
      
      if (key === 'f') {
        const player = document.getElementById('video-player-container');
        if (player) {
          if (!document.fullscreenElement) player.requestFullscreen().catch(err => console.log(err));
          else document.exitFullscreen();
        }
      }
      
      if (key === 's') {
        const currentIndex = SERVERS.findIndex(s => s.id === activeServer.id);
        const nextServer = SERVERS[(currentIndex + 1) % SERVERS.length];
        setSelectedServerId(nextServer.id);
      }
      
      if (key === 'n' && type === 'tv') {
        handleNextEpisode();
      }

      if (key === 'p' && type === 'tv') {
        handlePrevEpisode();
      }

      if (key === 'b') {
        handleBack();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, id, season, episode, episodesList, details, navigate, activeServer]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(`/title/${type}/${id}`);
    }
  };

  if (!details) {
    return <div className="w-screen h-screen bg-[#141414] flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const currentEpData = type === 'tv' ? episodesList.find(e => e.episode_number === parseInt(episode)) : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -15 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-[#141414] text-white pb-20 md:pb-0"
    >
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Full-width Player Section */}
      <div className="pt-20 md:pt-24 w-full bg-black relative">
        <div className="max-w-[1800px] mx-auto px-4 pb-3 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all hover:scale-105 border border-white/10 backdrop-blur-md cursor-pointer shadow-md"
            title="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span className="hidden sm:inline">Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">S</kbd> to cycle server</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[var(--accent-color)] font-semibold">{activeServer.name}</span>
          </div>
        </div>

        <div className="max-w-[1800px] mx-auto relative group">
          <div id="video-player-container" className="relative w-full aspect-video bg-black md:rounded-xl overflow-hidden md:shadow-[0_0_60px_rgba(0,0,0,0.8)] md:border border-gray-800 transition-all duration-500">
            <iframe
              key={`${activeServer.id}-${type}-${id}-${season}-${episode}-${useSandbox}`}
              src={activeServer.getUrl(type, id, season, episode)}
              className="w-full h-full border-none"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              {...(useSandbox ? { sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation" } : {})}
            ></iframe>
          </div>
        </div>
      </div>

      {/* Control Bar (Below Player) */}
      <div className="max-w-[1800px] mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5">
         <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-md">
              {details.title || details.name}
            </h1>
            {type === 'tv' && currentEpData && (
              <p className="text-[var(--accent-color)] font-bold text-sm md:text-base mt-1">
                 Season {season} Episode {episode} <span className="text-gray-500 mx-2">•</span> <span className="text-gray-300">{currentEpData.name}</span>
              </p>
            )}
         </div>
         
         <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {type === 'tv' && (
              <div className="flex items-center gap-2">
                {parseInt(episode) > 1 && (
                  <button 
                    onClick={handlePrevEpisode}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg flex items-center space-x-1.5 transition-all font-semibold border border-white/10 text-sm"
                    title="Previous Episode (P)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                )}
                {episodesList.length > 0 && (
                  <button 
                    onClick={handleNextEpisode}
                    className="bg-white text-black px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex items-center space-x-2 transition-all hover:bg-gray-200 font-bold shadow-lg text-sm"
                    title="Next Episode (N)"
                  >
                    <span>Next Episode</span>
                    <Play className="w-4 h-4 fill-black" />
                  </button>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="flex items-center bg-[#1a1a1a] px-3 py-2 md:py-2.5 rounded-lg border border-gray-700 hover:border-gray-500 transition shadow-lg w-full md:w-auto">
                <span className="text-[var(--accent-color)] text-xs font-semibold mr-2 hidden sm:block">SERVER:</span>
                <select 
                  value={activeServer.id} 
                  onChange={(e) => setSelectedServerId(e.target.value)}
                  className="bg-transparent text-white font-bold outline-none text-sm cursor-pointer w-full"
                >
                  {SERVERS.map((s) => (
                    <option key={s.id} value={s.id} className="bg-gray-900 text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => setUseSandbox(!useSandbox)}
                className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-2 md:py-2.5 rounded-lg border transition-all shadow-lg text-sm font-bold ${
                  useSandbox 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : 'bg-black/70 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400'
                }`}
                title="Toggles Anti-Popup Sandbox Shield. When ON, popups are blocked. If a player fails to load, turn OFF."
              >
                <span>{useSandbox ? '🛡️ Shield ON' : '🛡️ Shield OFF'}</span>
              </button>
            </div>
         </div>
      </div>

      {/* Quick Server Switcher Pills */}
      <div className="max-w-[1800px] mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-white/5">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex-none flex items-center gap-1.5 mr-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Quick Servers:
        </span>
        {SERVERS.slice(0, 7).map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedServerId(s.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex-none flex items-center space-x-1 border ${
              activeServer.id === s.id
                ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-md scale-105'
                : 'bg-[#1b1b1b] border-gray-700 text-gray-300 hover:text-white hover:border-gray-500'
            }`}
          >
            <span>{s.shortName || s.name}</span>
          </button>
        ))}
      </div>

      {/* Details Section */}
      <div className="relative">
         {/* Backdrop Image */}
         {details.backdrop_path && (
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent z-10" />
               <img src={`${IMAGE_BASE_URL}${details.backdrop_path}`} className="w-full h-full object-cover" />
            </div>
         )}
         
         <div className="relative z-20 max-w-[1800px] mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="flex-1">
               <div className="flex flex-wrap items-center gap-3 mb-6 font-semibold text-xs md:text-sm bg-white/5 inline-flex px-4 py-2 rounded-full border border-white/10">
                  <span className="text-green-500 font-black">98% Match</span>
                  <span className="text-gray-300">{details.release_date?.substring(0,4) || details.first_air_date?.substring(0,4)}</span>
                  <span className="border border-gray-500 px-1.5 py-0.5 text-[10px] md:text-xs text-gray-300 rounded">HD</span>
                  {type === 'tv' && <span className="text-gray-300">{details.number_of_seasons} Seasons</span>}
               </div>

               <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-8 max-w-3xl">
                 {details.overview}
               </p>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 bg-black/40 p-6 rounded-xl border border-white/5 backdrop-blur-sm max-w-3xl">
                  <div>
                     <p className="mb-2"><strong className="text-white block mb-1">Genres</strong> {details.genres?.map(g => g.name).join(', ')}</p>
                  </div>
                  <div>
                     <p><strong className="text-white block mb-1">Cast</strong> {details.credits?.cast?.slice(0, 6).map(c => c.name).join(', ')}</p>
                  </div>
               </div>
            </div>

            {/* Episodes Sidebar (if TV) */}
            {type === 'tv' && (
              <div className="lg:w-[450px] flex-none">
                 <div className="sticky top-2">
                 <div className="flex items-center justify-between mb-4 bg-black/60 p-4 rounded-xl backdrop-blur-md border border-white/5">
                    <h3 className="text-xl font-bold">Episodes</h3>
                    <select 
                       className="bg-[#242424] text-white border border-gray-700 rounded px-3 py-1.5 font-semibold outline-none text-sm hover:border-gray-500 transition cursor-pointer"
                       value={season}
                       onChange={(e) => navigate(`/watch/tv/${id}?s=${e.target.value}&e=1`)}
                    >
                       {details.seasons?.filter(s => s.season_number > 0).map(s => (
                          <option key={s.id} value={s.season_number}>Season {s.season_number}</option>
                       ))}
                    </select>
                 </div>

                 <div className="bg-[#111] rounded-xl border border-gray-800 overflow-hidden max-h-[70vh] overflow-y-auto scrollbar-hide shadow-2xl">
                    {episodesList.map(ep => (
                       <div 
                         key={ep.id}
                         onClick={() => navigate(`/watch/tv/${id}?s=${season}&e=${ep.episode_number}`)}
                         className={`flex items-start gap-4 p-4 cursor-pointer transition border-b border-gray-800/50 last:border-0 group ${parseInt(episode) === ep.episode_number ? 'bg-white/10' : 'hover:bg-white/5'}`}
                       >
                          <div className="w-28 md:w-36 aspect-video bg-gray-900 rounded-md overflow-hidden flex-none relative shadow-lg">
                             <img src={`${IMAGE_BASE_URL_W500}${ep.still_path}`} className={`w-full h-full object-cover transition duration-500 ${parseInt(episode) !== ep.episode_number && 'group-hover:scale-105 opacity-80 group-hover:opacity-100'}`} />
                             <div className="absolute inset-0 flex items-center justify-center">
                                {parseInt(episode) === ep.episode_number ? (
                                  <div className="w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.8)]">
                                     <div className="w-3 h-3 bg-white mx-0.5 rounded-sm animate-pulse"></div>
                                  </div>
                                ) : (
                                  <Play className="w-8 h-8 text-white fill-white shadow-lg drop-shadow-xl opacity-0 group-hover:opacity-100 transition duration-300 scale-75 group-hover:scale-100" />
                                )}
                             </div>
                             <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                E{ep.episode_number}
                             </div>
                          </div>
                          <div className="flex-1 pr-2">
                             <h4 className={`font-bold text-sm mb-1 line-clamp-2 ${parseInt(episode) === ep.episode_number ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{ep.name}</h4>
                             <p className="text-[11px] text-gray-500 line-clamp-2 leading-snug">{ep.overview}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
         )}
      </div>

      {/* More Like This (Similar Titles) Section */}
      {details.similar?.results?.length > 0 && (
        <div className="relative z-20 max-w-[1800px] mx-auto px-4 md:px-8 pb-16">
           <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center">
             <span className="w-1.5 h-6 bg-[var(--accent-color)] rounded-full mr-3 inline-block"></span>
             More Like This
           </h3>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
             {details.similar.results.slice(0, 12).filter(m => m.poster_path || m.backdrop_path).map((item) => (
               <div 
                 key={item.id}
                 onClick={() => navigate(`/watch/${item.media_type || type}/${item.id}`, { state: { from: location.pathname + location.search } })}
                 className="group cursor-pointer rounded-lg overflow-hidden bg-[#1a1a1a] border border-white/5 hover:border-[var(--accent-color)] transition-all duration-300 hover:scale-105 shadow-lg relative aspect-[2/3]"
               >
                 <img 
                   src={`${IMAGE_BASE_URL_W500}${item.poster_path || item.backdrop_path}`} 
                   alt={item.title || item.name}
                   className="w-full h-full object-cover group-hover:opacity-80 transition duration-300"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                   <Play className="w-8 h-8 text-white fill-white self-center mb-auto mt-auto drop-shadow-lg" />
                   <p className="text-white font-bold text-xs line-clamp-1">{item.title || item.name}</p>
                   <div className="flex items-center justify-between text-[11px] text-gray-300 mt-1">
                     <span className="text-green-400 font-semibold">{item.vote_average ? `${item.vote_average.toFixed(1)} ★` : ''}</span>
                     <span>{(item.release_date || item.first_air_date)?.substring(0, 4)}</span>
                   </div>
                 </div>
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

function ProfilePage() {
  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const [likedMovies, setLikedMovies] = useLocalStorage('netphlix_liked', []);
  const navigate = useNavigate();
  const location = useLocation();

  const removeFromList = (id) => {
    setMyList(prev => prev.filter(m => m.id !== id));
  };
  const removeFromLiked = (id) => {
    setLikedMovies(prev => prev.filter(m => m.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -15 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-shows-dark text-white pt-32 px-4 md:px-12 pb-20"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      <div className="container mx-auto">
         <div className="flex items-center mb-12">
            <div className="w-20 h-20 bg-[#2a2a2a] rounded-full border border-gray-600 flex items-center justify-center mr-6 shadow-xl">
               <User className="w-10 h-10 text-gray-300" />
            </div>
            <div>
               <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">My Profile</h1>
               <p className="text-gray-400 mt-2">Manage your watchlist and liked movies</p>
            </div>
         </div>
         
         <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center">
               <Bookmark className="w-6 h-6 mr-3 text-netflix-red" /> My Watchlist <span className="ml-3 text-gray-500 text-lg">({myList.length})</span>
            </h2>
            {myList.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                 {myList.map(movie => (
                    <div key={movie.id} className="w-full flex justify-center">
                      <RowCard movie={movie} isLargeRow={true} isTop10={false} onNavigate={(m, action) => {
                        const mediaType = m.name ? 'tv' : 'movie';
                        if (action === 'play') navigate(`/watch/${mediaType}/${m.id}`, { state: { from: location.pathname + location.search } });
                        else navigate(`/title/${mediaType}/${m.id}`, { state: { movie: m, from: location.pathname + location.search } });
                      }} onRemove={() => removeFromList(movie.id)} />
                    </div>
                 ))}
               </div>
            ) : (
               <div className="bg-[#111] border border-white/5 p-8 rounded-xl text-center">
                  <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Your watchlist is empty.</p>
                  <button onClick={() => navigate('/')} className="mt-4 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition text-sm font-semibold">Explore Movies</button>
               </div>
            )}
         </div>

         <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center">
               <ThumbsUp className="w-6 h-6 mr-3 text-netflix-red" /> Liked Movies <span className="ml-3 text-gray-500 text-lg">({likedMovies.length})</span>
            </h2>
            {likedMovies.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                 {likedMovies.map(movie => (
                    <div key={movie.id} className="w-full flex justify-center">
                      <RowCard movie={movie} isLargeRow={true} isTop10={false} onNavigate={(m, action) => {
                        const mediaType = m.name ? 'tv' : 'movie';
                        if (action === 'play') navigate(`/watch/${mediaType}/${m.id}`, { state: { from: location.pathname + location.search } });
                        else navigate(`/title/${mediaType}/${m.id}`, { state: { movie: m, from: location.pathname + location.search } });
                      }} onRemove={() => removeFromLiked(movie.id)} />
                    </div>
                 ))}
               </div>
            ) : (
               <div className="bg-[#111] border border-white/5 p-8 rounded-xl text-center">
                  <ThumbsUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">You haven't liked anything yet.</p>
               </div>
            )}
         </div>
      </div>
      <Footer />
    </motion.div>
  );
}

function CategoryPage() {
  const { title } = useParams();
  const location = useLocation();
  const fetchUrl = location.state?.fetchUrl;
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0,0);
    if (!fetchUrl) return;
    
    setMovies([]);
    setPage(1);
    setHasMore(true);

    async function fetchInitial() {
      setIsLoading(true);
      const separator = fetchUrl.includes('?') ? '&' : '?';
      const url = `${fetchUrl}${separator}page=1`;
      const req = await fetch(url).then(r=>r.json());
      setMovies(req.results || []);
      if (req.page >= req.total_pages || !req.results || req.results.length === 0) setHasMore(false);
      setIsLoading(false);
    }
    fetchInitial();
  }, [fetchUrl]);

  useEffect(() => {
    if (!fetchUrl || page === 1 || !hasMore) return;

    async function fetchMore() {
      setIsLoading(true);
      const separator = fetchUrl.includes('?') ? '&' : '?';
      const url = `${fetchUrl}${separator}page=${page}`;
      const req = await fetch(url).then(r=>r.json());
      setMovies(prev => {
        const newMovies = req.results || [];
        const map = new Map(prev.map(m => [m.id, m]));
        newMovies.forEach(m => map.set(m.id, m));
        return Array.from(map.values());
      });
      if (req.page >= req.total_pages || !req.results || req.results.length === 0) setHasMore(false);
      setIsLoading(false);
    }
    fetchMore();
  }, [page, fetchUrl]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && hasMore && !isLoading) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -15 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-shows-dark text-white pt-32 px-4 md:px-12 pb-20"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      <h1 className="text-3xl md:text-5xl font-display font-bold mb-10 tracking-tight">{decodeURIComponent(title)}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {movies.map(movie => (
           <div key={movie.id} className="w-full flex justify-center">
             <RowCard movie={movie} isLargeRow={true} isTop10={false} onNavigate={(m, action) => {
               const mediaType = m.name ? 'tv' : 'movie';
               if (action === 'play') navigate(`/watch/${mediaType}/${m.id}`, { state: { from: location.pathname + location.search } });
               else navigate(`/title/${mediaType}/${m.id}`, { state: { movie: m, from: location.pathname + location.search } });
             }} />
           </div>
        ))}
      </div>
      <Footer />
    </motion.div>
  );
}

function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchPerson() {
      const url = `${BASE_URL}/person/${id}?api_key=${API_KEY}&append_to_response=movie_credits,tv_credits`;
      try {
        const res = await fetch(url).then(r => r.json());
        setPerson(res);
      } catch(e) {
        console.error("Failed to fetch person", e);
      }
    }
    fetchPerson();
  }, [id]);

  if (!person) return (
    <div className="min-h-screen bg-shows-dark text-white pt-32 px-4 md:px-12 flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const knownFor = [...(person.movie_credits?.cast || []), ...(person.tv_credits?.cast || [])]
    .filter(m => m.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) return acc.concat([current]);
      return acc;
    }, [])
    .slice(0, 20);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-shows-dark text-white font-sans relative"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      
      <div className="container mx-auto px-4 md:px-12 pt-32 pb-20">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-[300px] flex-none">
             <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl mb-6 bg-white/5">
                {person.profile_path ? (
                  <img src={`${IMAGE_BASE_URL_W500}${person.profile_path}`} className="w-full h-full object-cover" alt={person.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-20 h-20 text-gray-500" /></div>
                )}
             </div>
             <h2 className="text-xl font-bold mb-4 font-display">Personal Info</h2>
             <div className="space-y-4 text-sm">
                <div><strong className="block text-gray-400">Known For</strong><br/>{person.known_for_department}</div>
                <div><strong className="block text-gray-400">Gender</strong><br/>{person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'Other'}</div>
                {person.birthday && <div><strong className="block text-gray-400">Birthday</strong><br/>{person.birthday}</div>}
                {person.place_of_birth && <div><strong className="block text-gray-400">Place of Birth</strong><br/>{person.place_of_birth}</div>}
             </div>
          </div>
          
          <div className="flex-1">
             <h1 className="text-4xl md:text-6xl font-black font-display mb-6">{person.name}</h1>
             
             {person.biography && (
               <div className="mb-12">
                 <h3 className="text-xl font-bold mb-4 font-display">Biography</h3>
                 <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">{person.biography}</p>
               </div>
             )}

             {knownFor.length > 0 && (
               <div>
                 <h3 className="text-xl font-bold mb-6 font-display">Known For</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                   {knownFor.map(movie => (
                     <div key={movie.id} className="cursor-pointer group" onClick={() => navigate(`/title/${movie.media_type || 'movie'}/${movie.id}`)}>
                        <div className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 mb-2 shadow-lg">
                           <img src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={movie.title || movie.name} />
                        </div>
                        <h4 className="text-sm font-bold truncate group-hover:text-netflix-red transition-colors">{movie.title || movie.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{movie.character}</p>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}

function CompanyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [movies, setMovies] = useState([]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      try {
        const compRes = await fetch(`${BASE_URL}/company/${id}?api_key=${API_KEY}`).then(r => r.json());
        setCompany(compRes);
        
        const movRes = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=${id}&sort_by=popularity.desc`).then(r => r.json());
        setMovies(movRes.results || []);
      } catch(e) {
        console.error("Failed to fetch company", e);
      }
    }
    fetchData();
  }, [id]);

  if (!company) return (
    <div className="min-h-screen bg-shows-dark text-white pt-32 px-4 flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-shows-dark text-white font-sans relative pb-20"
    >
      <Navbar activeTab="" setActiveTab={() => navigate('/')} />
      
      <div className="container mx-auto px-4 md:px-12 pt-32">
         <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-12 border-b border-white/10 pb-12">
            {company.logo_path ? (
               <div className="bg-white p-6 rounded-2xl shadow-xl w-48 md:w-64 h-48 md:h-64 flex items-center justify-center flex-none">
                 <img src={`${IMAGE_BASE_URL_W500}${company.logo_path}`} className="max-w-[80%] max-h-[80%] object-contain" alt={company.name} />
               </div>
            ) : (
               <div className="w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl flex-none">
                  <span className="text-gray-500 font-bold text-xl">{company.name}</span>
               </div>
            )}
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
               <h1 className="text-4xl md:text-6xl font-black font-display mb-4 tracking-tight">{company.name}</h1>
               <p className="text-gray-400 font-bold tracking-widest text-sm uppercase bg-white/10 px-4 py-1.5 rounded-full w-max mx-auto md:mx-0">Production Studio</p>
               {company.headquarters && <p className="text-gray-300 text-base mt-6 flex items-center justify-center md:justify-start"><span className="text-gray-500 mr-2">📍</span> {company.headquarters}</p>}
               {company.homepage && <a href={company.homepage} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 font-medium mt-3 inline-block">Visit Official Website ↗</a>}
            </div>
         </div>
         
         <h2 className="text-2xl md:text-3xl font-bold font-display mb-8">Produced by {company.name}</h2>
         {movies.length > 0 ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
             {movies.map(movie => (
               <div key={movie.id} className="cursor-pointer group relative rounded-xl overflow-hidden aspect-[2/3] border border-white/10 shadow-lg hover:shadow-2xl transition-all hover:scale-105" onClick={() => navigate(`/title/movie/${movie.id}`)}>
                  <img src={`${IMAGE_BASE_URL_W500}${movie.poster_path}`} className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500" alt={movie.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                     <p className="text-white font-bold text-sm line-clamp-2">{movie.title}</p>
                     {movie.release_date && <p className="text-gray-400 text-[10px] mt-1 font-medium">{movie.release_date.substring(0,4)}</p>}
                  </div>
               </div>
             ))}
           </div>
         ) : (
           <p className="text-gray-500 text-lg">No movies found for this studio.</p>
         )}
      </div>
      <Footer />
    </motion.div>
  );
}

function HlsPlayer({ src, className, autoPlay, controls }) {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (!videoRef.current || !src) return;
    
    // Check if Hls is defined (it's imported globally in this file)
    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          videoRef.current.play().catch(e => console.log('Auto-play prevented:', e));
        }
      });
      return () => {
        hls.destroy();
      };
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', () => {
        if (autoPlay) {
          videoRef.current.play().catch(e => console.log('Auto-play prevented:', e));
        }
      });
    }
  }, [src, autoPlay]);

  return <video ref={videoRef} className={className} controls={controls} playsInline autoPlay={autoPlay} />;
}

function LiveTvPage() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchChannels() {
      try {
        const res = await fetch('http://localhost:4000/api/livetv');
        if (!res.ok) throw new Error('Failed to fetch channels');
        const data = await res.json();
        setChannels(data);
        if (data.length > 0) setActiveChannel(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, []);

  const groups = ['All', ...new Set(channels.map(c => c.group).filter(Boolean))].sort();

  const filteredChannels = channels.filter(c => {
    const safeName = c.name || '';
    const safeGroup = c.group || '';
    const matchesSearch = safeName.toLowerCase().includes(searchQuery.toLowerCase()) || safeGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || safeGroup === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // Automatically update the video player if the active channel is filtered out
  useEffect(() => {
    if (filteredChannels.length > 0) {
      const isStillVisible = filteredChannels.some(c => c.id === activeChannel?.id);
      if (!isStillVisible) {
        setActiveChannel(filteredChannels[0]);
      }
    } else {
      if (activeChannel) setActiveChannel(null);
    }
  }, [searchQuery, selectedGroup, channels]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white pt-32 px-4 flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#141414] text-white font-sans flex flex-col h-screen overflow-hidden">
      <Navbar activeTab="Live TV" setActiveTab={() => {}} onSearch={setSearchQuery} mobileSearchOpen={mobileSearchOpen} toggleMobileSearch={() => setMobileSearchOpen(!mobileSearchOpen)} />
      
      {/* Inline Player Section */}
      <div className="w-full flex-none bg-black pt-20 pb-4 h-[45vh] md:h-[55vh] relative border-b border-white/10 shadow-2xl z-10">
         {activeChannel ? (
           <div className="w-full h-full max-w-7xl mx-auto relative flex items-center justify-center group">
              <HlsPlayer src={activeChannel.url} className="w-full h-full object-contain bg-black" autoPlay controls />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg flex items-center space-x-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                 {activeChannel.logo ? (
                    <img src={activeChannel.logo} className="h-8 w-auto object-contain max-w-[80px]" alt="logo" onError={(e) => e.target.style.display = 'none'} />
                 ) : (
                    <Radio className="w-6 h-6 text-white" />
                 )}
                 <div>
                   <p className="font-bold text-white leading-tight">{activeChannel.name}</p>
                   <p className="text-xs text-[var(--accent-color)] font-bold uppercase tracking-wider flex items-center mt-0.5"><span className="w-2 h-2 rounded-full bg-[var(--accent-color)] mr-1.5 animate-pulse"></span> LIVE</p>
                 </div>
              </div>
           </div>
         ) : (
           <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col">
              <Radio className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a channel to play</p>
           </div>
         )}
      </div>

      {/* Guide Section */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#141414]">
         <div className="p-4 border-b border-white/5 flex items-center justify-start flex-none z-10 bg-[#141414]">
            <div className="flex space-x-2 overflow-x-auto w-full scrollbar-hide pb-2 md:pb-0">
              {groups.map(g => (
                <button key={g} onClick={() => setSelectedGroup(g)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedGroup === g ? 'bg-white text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                  {g}
                </button>
              ))}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-20 md:pb-0">
               {filteredChannels.map(channel => (
                 <div key={channel.id} onClick={() => setActiveChannel(channel)} className={`cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 ${activeChannel?.id === channel.id ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/50 scale-105 bg-[var(--accent-color)]/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5 bg-white/5'}`}>
                    <div className="aspect-[4/3] flex items-center justify-center p-4 bg-black/40">
                       {channel.logo ? (
                         <img src={channel.logo} className="max-w-full max-h-full object-contain filter drop-shadow-md" alt={channel.name || 'Channel'} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                       ) : null}
                       <div className="w-full h-full flex flex-col items-center justify-center text-gray-500" style={{ display: channel.logo ? 'none' : 'flex' }}>
                         <Radio className="w-8 h-8 mb-2 opacity-50" />
                         <span className="text-[10px] uppercase font-bold tracking-wider text-center px-2">{(channel.name || 'Unknown').substring(0, 15)}</span>
                       </div>
                    </div>
                    <div className="p-3 bg-black/60 border-t border-white/5 flex flex-col justify-between min-h-[60px]">
                       <p className="text-white text-xs font-bold line-clamp-1 leading-snug">{channel.name || 'Unknown Channel'}</p>
                       <p className="text-gray-500 text-[9px] uppercase tracking-wider mt-1 line-clamp-1">{channel.group || 'Uncategorized'}</p>
                    </div>
                 </div>
               ))}
            </div>
            {filteredChannels.length === 0 && (
              <div className="text-center text-gray-500 mt-12 py-12 flex flex-col items-center">
                 <Radio className="w-16 h-16 mb-4 opacity-20" />
                 <p>No channels found matching your criteria.</p>
              </div>
            )}
         </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [fadeLoader, setFadeLoader] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // The animation takes about 4.5 seconds to complete based on CSS.
    const fadeTimer = setTimeout(() => setFadeLoader(true), 3800);
    const removeTimer = setTimeout(() => setShowLoader(false), 4500);
    
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  return (
    <>
      {showLoader && (
        <div className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-700 ${fadeLoader ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <NetflixIntro />
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/title/:type/:id" element={<TitlePage />} />
          <Route path="/watch/:type/:id" element={<WatchPage />} />
          <Route path="/category/:title" element={<CategoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/person/:id" element={<PersonPage />} />
          <Route path="/company/:id" element={<CompanyPage />} />
          <Route path="/live" element={<LiveTvPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
