import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const IMAGE_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[9999] flex flex-col space-y-2.5 max-w-[340px] sm:max-w-sm w-full pointer-events-none select-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon =
            toast.icon ||
            (toast.type === 'success'
              ? CheckCircle
              : toast.type === 'error'
              ? AlertCircle
              : toast.type === 'magic'
              ? Sparkles
              : Info);

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              className="pointer-events-auto relative overflow-hidden rounded-2xl p-3 sm:p-3.5 backdrop-blur-2xl bg-[#0E1015]/95 border border-white/10 ring-1 ring-white/5 shadow-[0_20px_45px_rgba(0,0,0,0.85)] flex items-center space-x-3 group"
            >
              {/* Optional Mini Poster Thumbnail */}
              {toast.poster ? (
                <div className="relative w-9 h-13 rounded-lg overflow-hidden flex-none bg-[#181a22] border border-white/10">
                  <img
                    src={
                      toast.poster.startsWith('http')
                        ? toast.poster
                        : `${IMAGE_BASE_URL_W500}${toast.poster}`
                    }
                    alt={toast.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-none bg-white/[0.08] text-white/90 border border-white/10">
                  <Icon className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Text Information */}
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-xs sm:text-[13px] font-bold text-white font-display tracking-tight truncate">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-[11px] text-[#9CA3AF] line-clamp-1 mt-0.5">
                    {toast.message}
                  </p>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-none"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Countdown Progress Micro-Line */}
              {toast.duration > 0 && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#E50914] via-[#FFB800] to-[#E50914] opacity-80"
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </aside>
  );
}
