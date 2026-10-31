import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Film, Award, ChevronDown, ArrowLeft } from 'lucide-react';
import { haptics } from '../utils/audioHaptics';
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

export default function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    async function fetchPerson() {
      const url = `${BASE_URL}/person/${id}?api_key=${API_KEY}&append_to_response=movie_credits,tv_credits`;
      try {
        const res = await fetch(url).then((r) => r.json());
        setPerson(res);
      } catch (e) {
        console.error('Failed to fetch person', e);
      }
    }
    fetchPerson();
  }, [id]);

  if (!person) {
    return (
      <div className="min-h-screen bg-[#07080B] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const allCredits = [
    ...(person.movie_credits?.cast || []),
    ...(person.tv_credits?.cast || []),
  ].filter((m) => m.poster_path);

  const knownFor = allCredits
    .sort((a, b) => b.popularity - a.popularity)
    .reduce((acc, current) => {
      const exists = acc.find((item) => item.id === current.id);
      if (!exists) return acc.concat([current]);
      return acc;
    }, [])
    .slice(0, 24);

  const onNavigate = (movie, action) => {
    haptics.playClick();
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
      className="min-h-screen bg-[#07080B] text-white pt-24 md:pt-28 px-4 md:px-12 pb-20 select-none font-sans overflow-x-hidden"
    >
      <Navbar />

      <div className="max-w-[1500px] mx-auto space-y-10">
        {/* Back navigation pill */}
        <div>
          <button
            onClick={() => {
              haptics.playClick();
              navigate(-1);
            }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-glass-pill text-xs font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Editorial Bio Capsule (Apple visionOS Liquid Glass) */}
        <div className="relative rounded-3xl apple-glass p-6 md:p-8 shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            {/* Portrait Lens */}
            <div className="w-36 md:w-52 aspect-[2/3] rounded-2xl md:rounded-3xl overflow-hidden flex-none mx-auto md:mx-0 apple-glass border border-t-white/40 border-white/10 shadow-2xl bg-[#14151b]">
              {person.profile_path ? (
                <img
                  src={`${IMAGE_BASE_URL_W500}${person.profile_path}`}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#14151b] flex items-center justify-center">
                  <User className="w-12 h-12 text-white/30" />
                </div>
              )}
            </div>

            {/* Editorial Biography Breakdown */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider apple-glass-pill uppercase text-white/90">
                  {person.known_for_department || 'Artist'}
                </span>
                {person.place_of_birth && (
                  <span className="text-xs text-[#8a8a93] font-medium">
                    {person.place_of_birth}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-5xl font-bold font-display tracking-tight text-white mb-2">
                {person.name}
              </h1>

              {/* Specular Stats Badges */}
              <div className="flex items-center space-x-2 my-3 flex-wrap gap-y-2">
                <div className="apple-glass-pill px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 text-white/80">
                  <Film className="w-3.5 h-3.5 text-white/60" />
                  <span>{allCredits.length} Career Credits</span>
                </div>
                {person.birthday && (
                  <div className="apple-glass-pill px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 text-white/80">
                    <Award className="w-3.5 h-3.5 text-white/60" />
                    <span>Born {person.birthday}</span>
                  </div>
                )}
              </div>

              {person.biography && (
                <div className="mt-2">
                  <p
                    className={`text-xs md:text-sm text-white/75 leading-relaxed max-w-3xl ${
                      bioExpanded ? '' : 'line-clamp-4'
                    }`}
                  >
                    {person.biography}
                  </p>
                  {person.biography.length > 250 && (
                    <button
                      onClick={() => setBioExpanded(!bioExpanded)}
                      className="mt-1.5 text-xs text-white/60 hover:text-white font-medium flex items-center cursor-pointer"
                    >
                      <span>{bioExpanded ? 'Show less' : 'Read full biography'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 transition-transform ${
                          bioExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Known For Filmography Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h2 className="text-lg md:text-2xl font-bold font-display text-white">
              Signature Filmography ({knownFor.length})
            </h2>
            <span className="text-xs text-[#8a8a93] font-medium">Ranked by global popularity</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {knownFor.map((movie) => (
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
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </motion.div>
  );
}
