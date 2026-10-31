import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, Calendar, ChevronDown } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Row from '../components/Row';
import SearchResults from '../components/SearchResults';
import InlineBanner from '../components/InlineBanner';
import UniverseHubs from '../components/UniverseHubs';
import UpcomingRadar from '../components/UpcomingRadar';
import Footer from '../components/Footer';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const requests = {
  fetchNowPlayingMovies: `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`,
  fetchUpcomingMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${
    new Date().toISOString().split('T')[0]
  }&sort_by=popularity.desc`,
  fetchTrendingMovies: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`,
  fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
  fetchSciFiMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=878`,
  fetchComedyMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`,
  fetchTrendingTV: `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`,
  fetchActionTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10759`,
  fetchSciFiTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10765`,
  fetchComedyTV: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=35`,
};

export default function Dashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Home');
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSearchOpen, setIsSearchOpen] = useState(
    !!searchParams.get('q') || searchParams.get('search') === 'true'
  );
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');

  // Sync search state with URL
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const isSearch = searchParams.get('search') === 'true';
    if (q !== searchQuery) {
      setSearchQuery(q);
    }
    if (q || isSearch) {
      setIsSearchOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (searchQuery && searchQuery !== currentQ) {
      setSearchParams({ q: searchQuery }, { replace: true });
    } else if (!searchQuery && currentQ) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      newParams.delete('search');
      setSearchParams(newParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const [myList, setMyList] = useLocalStorage('netphlix_myList', []);
  const [watchHistory, setWatchHistory] = useLocalStorage('netphlix_watchHistory', []);

  useEffect(() => {
    async function fetchGenres() {
      if (activeTab === 'Home' || activeTab === 'My List') return;
      const type = activeTab === 'TV Shows' || activeTab === 'Shows' ? 'tv' : 'movie';
      try {
        const res = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`).then((r) =>
          r.json()
        );
        setGenres(res.genres || []);
        setSelectedGenre('');
      } catch {
        // ignore
      }
    }
    fetchGenres();
  }, [activeTab]);

  useEffect(() => {
    async function fetchFeatured() {
      const endpoint =
        activeTab === 'TV Shows' || activeTab === 'Shows'
          ? requests.fetchTrendingTV
          : requests.fetchTrendingMovies;
      try {
        const request = await fetch(endpoint).then((res) => res.json());
        if (request.results?.length > 0) {
          setTrending(request.results);
          setFeatured(request.results[0]);
        }
      } catch {
        // ignore
      }
    }
    if (activeTab !== 'My List') fetchFeatured();
  }, [activeTab]);

  const getGenreUrl = (baseId) => {
    const type = activeTab === 'TV Shows' || activeTab === 'Shows' ? 'tv' : 'movie';
    return `${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${
      selectedGenre || baseId
    }`;
  };

  const removeFromList = (id) => {
    setMyList((prev) => prev.filter((m) => m.id !== id));
  };

  const removeFromHistory = (id) => {
    setWatchHistory((prev) => prev.filter((m) => m.id !== id));
  };

  const sanitizedWatchHistory = (watchHistory || []).map((item) => {
    if (item.media_type === 'movie' || (!item.first_air_date && item.release_date) || item.id === 1771) {
      const copy = { ...item, media_type: 'movie' };
      delete copy.season;
      delete copy.episode;
      return copy;
    }
    return item;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-[#0f1014] select-none flex flex-col font-sans"
    >
      <Navbar
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />

      <div className="flex-1">
        {searchQuery.length > 0 || isSearchOpen ? (
          <SearchResults
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onClose={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
            }}
          />
        ) : activeTab === 'My List' ? (
          <div className="pt-24 md:pt-28 px-4 md:px-12 min-h-[60vh]">
            <h1 className="text-xl md:text-2xl text-white font-semibold font-display mb-6">
              My Watchlist
            </h1>
            {myList.length > 0 ? (
              <div className="-ml-4 md:-ml-12">
                <Row title="" moviesArray={myList} onRemove={removeFromList} isLargeRow />
              </div>
            ) : (
              <div className="p-10 text-center text-[#8a8a93] text-sm frost-panel rounded-2xl max-w-md">
                Your watchlist is empty. Add movies and series from their cards or details page.
              </div>
            )}
          </div>
        ) : (
          <>
            <Hero movie={featured} trending={trending} onSelect={setFeatured} />

            {/* Genre Filter Pill for Movies / TV Shows */}
            {activeTab !== 'Home' && (
              <div className="max-w-[1920px] mx-auto px-4 md:px-12 -mt-8 mb-6 relative z-30 flex items-center space-x-3">
                <h1 className="text-lg md:text-xl font-semibold font-display text-white">
                  {activeTab === 'Shows' ? 'TV Shows' : activeTab}
                </h1>
                <div className="relative group/genre">
                  <button className="frost-pill text-white px-3.5 py-1.5 text-xs font-semibold rounded-full flex items-center hover:bg-white/10 transition-all shadow-sm">
                    <span>
                      {selectedGenre
                        ? genres.find((g) => g.id.toString() === selectedGenre)?.name
                        : 'All Genres'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 bg-[#12141a]/98 border border-white/10 rounded-2xl grid grid-cols-2 md:grid-cols-3 gap-2 p-3 min-w-[280px] md:min-w-[360px] opacity-0 invisible group-hover/genre:opacity-100 group-hover/genre:visible transition-all duration-200 z-50 backdrop-blur-xl shadow-2xl">
                    <div
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => setSelectedGenre('')}
                    >
                      All Genres
                    </div>
                    {genres.map((g) => (
                      <div
                        key={g.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors truncate ${
                          selectedGenre === g.id.toString()
                            ? 'text-white bg-white/15'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedGenre(g.id.toString())}
                      >
                        {g.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pb-16 relative z-20 space-y-2">
              {sanitizedWatchHistory && sanitizedWatchHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <Row
                    title="Continue Watching"
                    moviesArray={sanitizedWatchHistory}
                    onRemove={removeFromHistory}
                    isLandscape={true}
                  />
                </motion.div>
              )}

              {activeTab === 'Home' && myList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <Row title="My Watchlist" moviesArray={myList} onRemove={removeFromList} />
                </motion.div>
              )}

              {/* Cinematic Universes Hubs */}
              {activeTab === 'Home' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <UniverseHubs />
                </motion.div>
              )}

              {/* Upcoming Blockbusters Countdown Radar */}
              {activeTab === 'Home' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <UpcomingRadar />
                </motion.div>
              )}

              {activeTab === 'TV Shows' || activeTab === 'Shows' ? (
                <>
                  <Row
                    title={
                      selectedGenre
                        ? `Popular ${
                            genres.find((g) => g.id.toString() === selectedGenre)?.name
                          } Series`
                        : 'Trending TV Shows'
                    }
                    fetchUrl={selectedGenre ? getGenreUrl() : requests.fetchTrendingTV}
                    isLargeRow
                  />
                  <Row title="Action & Adventure TV" fetchUrl={getGenreUrl(10759)} />
                  <Row title="Sci-Fi & Fantasy TV" fetchUrl={getGenreUrl(10765)} />
                  <Row title="Comedy TV" fetchUrl={getGenreUrl(35)} />
                </>
              ) : activeTab === 'Movies' ? (
                <>
                  <Row
                    title={
                      selectedGenre
                        ? `Popular ${
                            genres.find((g) => g.id.toString() === selectedGenre)?.name
                          } Movies`
                        : 'Trending Movies'
                    }
                    fetchUrl={selectedGenre ? getGenreUrl() : requests.fetchTrendingMovies}
                    isLargeRow
                  />
                  <Row title="Action Movies" fetchUrl={getGenreUrl(28)} />
                  <Row title="Sci-Fi Movies" fetchUrl={getGenreUrl(878)} />
                  <Row title="Comedy Movies" fetchUrl={getGenreUrl(35)} />
                </>
              ) : (
                <>
                  <Row
                    title="Now Playing in Theaters"
                    icon={Radio}
                    fetchUrl={requests.fetchNowPlayingMovies}
                    isLargeRow
                    filterReleased
                  />
                  <Row
                    title="Upcoming Releases"
                    icon={Calendar}
                    fetchUrl={requests.fetchUpcomingMovies}
                    isLargeRow
                    filterUpcoming
                  />
                  <Row
                    title="Top 10 Shows Today"
                    fetchUrl={requests.fetchTrendingTV}
                    isLargeRow
                    isTop10
                  />
                  {featured && <InlineBanner movie={featured} />}
                  <Row title="Trending TV Shows" fetchUrl={requests.fetchTrendingTV} />
                  <Row title="Action & Thrillers" fetchUrl={requests.fetchActionMovies} />
                  <Row title="Sci-Fi & Fantasy" fetchUrl={requests.fetchSciFiMovies} />
                  <Row title="Comedy Hits" fetchUrl={requests.fetchComedyTV} />
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
