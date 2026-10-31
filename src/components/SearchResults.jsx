import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import RowCard from './RowCard';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type) return item.media_type;
  if (item.first_air_date || item.name) return 'tv';
  return 'movie';
}

export default function SearchResults({ query: initialQuery = '', onQueryChange }) {
  const [query, setQuery] = useState(initialQuery);
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleQueryChange = (val) => {
    setQuery(val);
    if (onQueryChange) onQueryChange(val);
  };

  const handleClear = () => {
    setQuery('');
    if (onQueryChange) onQueryChange('');
    inputRef.current?.focus();
  };

  // Fetch trending for empty state (Section 3.6)
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`).then((r) =>
          r.json()
        );
        setTrending((res.results || []).filter((m) => m.media_type !== 'person').slice(0, 12));
      } catch {
        // ignore
      }
    }
    fetchTrending();
  }, []);

  // Global '/' shortcut to focus search input
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setMovies([]);
      return;
    }

    setMovies([]);
    setPage(1);
    setHasMore(true);

    async function searchMovies() {
      setIsLoading(true);
      try {
        const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}&page=1`;
        const res = await fetch(url).then((r) => r.json());
        setMovies((res.results || []).filter((m) => m.media_type !== 'person'));
        if (res.page >= res.total_pages || !res.results || res.results.length === 0) {
          setHasMore(false);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(searchMovies, 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (query.length < 2 || page === 1 || !hasMore) return;

    async function fetchMore() {
      setIsLoading(true);
      try {
        const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}&page=${page}`;
        const res = await fetch(url).then((r) => r.json());
        setMovies((prev) => {
          const newMovies = (res.results || []).filter((m) => m.media_type !== 'person');
          const map = new Map(prev.map((m) => [m.id, m]));
          newMovies.forEach((m) => map.set(m.id, m));
          return Array.from(map.values());
        });
        if (res.page >= res.total_pages || !res.results || res.results.length === 0) {
          setHasMore(false);
        }
      } catch (err) {
        console.error('Pagination search error', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMore();
  }, [page, query, hasMore]);

  const onNavigate = (movie, action) => {
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

  const filteredMovies = movies.filter((m) => {
    if (filterYear) {
      const year = (m.release_date || m.first_air_date || '').substring(0, 4);
      if (year !== filterYear) return false;
    }
    if (filterRating) {
      if ((m.vote_average || 0) < parseFloat(filterRating)) return false;
    }
    return m.poster_path || m.backdrop_path;
  });

  const displayList = query.length >= 2 ? filteredMovies : trending;

  return (
    <div className="max-w-[1920px] mx-auto px-4 md:px-12 pt-24 md:pt-28 pb-24 min-h-screen bg-[#0f1014] select-none font-sans">
      {/* Search Header / Empty State (Section 3.6: centered prompt + large 56px pill) */}
      <div className="flex flex-col items-center justify-center text-center my-6 md:my-10 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold font-display text-white mb-4">
          {query.length >= 2 ? 'Search Results' : 'What are you in the mood for?'}
        </h2>

        {/* Large 56px Frosted Pill Input */}
        <div className="relative w-full h-14 frost-pill rounded-full px-5 flex items-center shadow-2xl">
          <Search className="w-5 h-5 text-white/50 mr-3 flex-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies, TV shows, genres..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="bg-transparent text-white placeholder-white/40 text-sm md:text-base w-full outline-none font-medium"
          />
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-white/40 hover:text-white transition-colors"
              aria-label="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono text-white/50 frost-pill rounded">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Filter Bar if query results active */}
      {query.length >= 2 && movies.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-3 border-b border-white/[0.06]">
          <span className="text-xs text-[#8a8a93] font-medium">
            Found {filteredMovies.length} title{filteredMovies.length !== 1 ? 's' : ''}
          </span>

          <div className="flex items-center space-x-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="frost-pill rounded-full px-3 py-1 text-xs text-white outline-none cursor-pointer"
            >
              <option value="" className="bg-[#0f1014]">All Years</option>
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y.toString()} className="bg-[#0f1014]">
                  {y}
                </option>
              ))}
            </select>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="frost-pill rounded-full px-3 py-1 text-xs text-white outline-none cursor-pointer"
            >
              <option value="" className="bg-[#0f1014]">Any Rating</option>
              <option value="8" className="bg-[#0f1014]">8.0+ Stars</option>
              <option value="7" className="bg-[#0f1014]">7.0+ Stars</option>
              <option value="6" className="bg-[#0f1014]">6.0+ Stars</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid: 3-up mobile, 6-up desktop per Section 3.6 */}
      <div>
        {query.length < 2 && (
          <h3 className="text-xs uppercase tracking-wider text-[#8a8a93] font-semibold mb-4">
            Trending Searches
          </h3>
        )}

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {displayList.map((movie) => (
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

        {filteredMovies.length === 0 && !isLoading && query.length >= 2 && (
          <div className="py-20 text-center text-[#8a8a93] text-sm frost-panel rounded-2xl max-w-md mx-auto">
            No titles matching "{query}". Try checking the spelling or search another title.
          </div>
        )}
      </div>
    </div>
  );
}
