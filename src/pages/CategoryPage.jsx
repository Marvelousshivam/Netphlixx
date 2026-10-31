import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Film, Loader2 } from 'lucide-react';
import { haptics } from '../utils/audioHaptics';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RowCard from '../components/RowCard';

function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type) return item.media_type;
  if (item.first_air_date || item.name) return 'tv';
  return 'movie';
}

export default function CategoryPage() {
  const { title } = useParams();
  const location = useLocation();
  const fetchUrl = location.state?.fetchUrl;
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (!fetchUrl) return;

    setMovies([]);
    setPage(1);
    setHasMore(true);

    async function fetchInitial() {
      setIsLoading(true);
      try {
        const separator = fetchUrl.includes('?') ? '&' : '?';
        const url = `${fetchUrl}${separator}page=1`;
        const req = await fetch(url).then((r) => r.json());
        setMovies(req.results || []);
        if (req.page >= req.total_pages || !req.results || req.results.length === 0) {
          setHasMore(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitial();
  }, [fetchUrl]);

  useEffect(() => {
    if (!fetchUrl || page === 1 || !hasMore) return;

    async function fetchMore() {
      setIsLoading(true);
      try {
        const separator = fetchUrl.includes('?') ? '&' : '?';
        const url = `${fetchUrl}${separator}page=${page}`;
        const req = await fetch(url).then((r) => r.json());
        setMovies((prev) => [...prev, ...(req.results || [])]);
        if (req.page >= req.total_pages || !req.results || req.results.length === 0) {
          setHasMore(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMore();
  }, [page, fetchUrl, hasMore]);

  const onNavigate = (movie, action) => {
    haptics.playClick();
    const mediaType = getMediaType(movie);
    if (action === 'play') {
      navigate(`/watch/${mediaType}/${movie.id}`, {
        state: { from: location.pathname + location.search },
      });
    } else {
      navigate(`/title/${mediaType}/${movie.id}`, {
        state: { movie, from: location.pathname + location.search },
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-[#07080B] text-white pt-24 md:pt-28 px-4 md:px-12 pb-20 select-none font-sans overflow-x-hidden"
    >
      <Navbar />

      <div className="max-w-[1920px] mx-auto space-y-8">
        {/* Category Header (Apple visionOS Liquid Glass) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => {
                haptics.playClick();
                navigate(-1);
              }}
              className="p-2 rounded-full apple-glass-pill text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Return"
              aria-label="Return"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider apple-glass-pill uppercase text-white/90">
                  Curated Catalog
                </span>
                <span className="text-xs text-[#8a8a93] font-medium">
                  {movies.length} Loaded
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold font-display tracking-tight text-white mt-1">
                {title}
              </h1>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {movies.map((movie) => (
            <div key={movie.id} className="w-full">
              <RowCard
                movie={movie}
                isLargeRow={true}
                isTop10={false}
                onNavigate={onNavigate}
              />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                haptics.playClick();
                setPage((p) => p + 1);
              }}
              disabled={isLoading}
              className="cta-shine px-8 py-3 rounded-full apple-glass text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center space-x-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading titles...</span>
                </>
              ) : (
                <>
                  <Film className="w-3.5 h-3.5 text-white/70" />
                  <span>Load More Titles</span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </motion.div>
  );
}
