import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RowCard from '../components/RowCard';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type) return item.media_type;
  if (item.first_air_date || item.name) return 'tv';
  return 'movie';
}

export default function CompanyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      try {
        const compRes = await fetch(`${BASE_URL}/company/${id}?api_key=${API_KEY}`).then((r) =>
          r.json()
        );
        setCompany(compRes);

        const movRes = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=${id}&sort_by=popularity.desc`
        ).then((r) => r.json());
        setMovies(movRes.results || []);
      } catch (e) {
        console.error('Failed to fetch company', e);
      }
    }
    fetchData();
  }, [id]);

  if (!company) {
    return (
      <div className="min-h-screen bg-[#0f1014] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const onNavigate = (movie, action) => {
    const mediaType = getMediaType(movie);
    if (action === 'play') {
      navigate(`/watch/${mediaType}/${movie.id}`);
    } else {
      navigate(`/title/${mediaType}/${movie.id}`, { state: { movie } });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-[#0f1014] text-white pt-24 md:pt-28 px-4 md:px-12 pb-20 select-none font-sans"
    >
      <Navbar />

      <div className="max-w-[1920px] mx-auto">
        <div className="flex items-center space-x-5 p-6 rounded-2xl frost-panel mb-8">
          {company.logo_path && (
            <div className="p-3 frost-pill rounded-xl">
              <img
                src={`${IMAGE_BASE_URL_W500}${company.logo_path}`}
                alt={company.name}
                className="h-10 md:h-12 object-contain filter brightness-0 invert"
              />
            </div>
          )}
          <div>
            <h1 className="text-xl md:text-3xl font-bold font-display text-white">
              {company.name}
            </h1>
            <p className="text-xs text-[#8a8a93] mt-0.5">{company.headquarters || 'Production Studio'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
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
      </div>

      <Footer />
    </motion.div>
  );
}
