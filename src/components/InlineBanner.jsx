import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type) return item.media_type;
  if (item.first_air_date || item.name) return 'tv';
  return 'movie';
}

export default function InlineBanner({ movie }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!movie) return null;

  const isTV = getMediaType(movie) === 'tv';
  const title = movie.title || movie.name;

  return (
    <div className="mx-4 md:mx-12 my-8 md:my-12 relative rounded-2xl overflow-hidden frost-panel flex flex-col md:flex-row h-auto md:h-[340px] group select-none">
      <div className="w-full md:w-3/5 relative h-56 md:h-full overflow-hidden bg-[#12141a]">
        <img
          src={`${IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`}
          alt={title}
          className="w-full h-full object-cover filter brightness-[0.85] group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0f1014] via-[#0f1014]/60 to-transparent" />
      </div>

      <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-center relative z-10 -mt-12 md:mt-0 bg-gradient-to-t md:bg-none from-[#0f1014] via-[#0f1014] to-transparent">
        <div className="flex items-center space-x-2 mb-2 text-xs text-[#8a8a93]">
          <span className="px-2 py-0.5 rounded-full frost-pill text-[10px] font-semibold text-white/80">
            Featured
          </span>
          {movie.vote_average > 0 && (
            <span className="flex items-center space-x-1 font-medium text-white/90">
              <Star className="w-3 h-3 fill-[#ffb800] text-[#ffb800]" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </span>
          )}
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white mb-2 font-display tracking-tight line-clamp-1">
          {title}
        </h2>

        <p className="text-white/70 text-xs md:text-sm line-clamp-3 mb-5 leading-relaxed">
          {movie.overview}
        </p>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() =>
              navigate(`/watch/${isTV ? 'tv' : 'movie'}/${movie.id}`, {
                state: { from: location.pathname + location.search },
              })
            }
            className="px-5 py-2 rounded-full bg-white text-[#0f1014] font-bold text-xs flex items-center space-x-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all"
            aria-label="Play Now"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            <span>Play</span>
          </button>

          <button
            onClick={() =>
              navigate(`/title/${isTV ? 'tv' : 'movie'}/${movie.id}`, {
                state: { movie, from: location.pathname + location.search },
              })
            }
            className="px-4 py-2 rounded-full frost-pill text-white/80 hover:text-white font-medium text-xs flex items-center space-x-1.5 transition-all active:scale-95"
            aria-label="View Details"
          >
            <Info className="w-3.5 h-3.5 text-white/60" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
