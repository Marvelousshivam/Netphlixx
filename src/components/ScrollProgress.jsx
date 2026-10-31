import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function ScrollProgress() {
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 30,
    restDelta: 0.001,
  });

  const [showTopButton, setShowTopButton] = useState(false);
  const [accentColor] = useLocalStorage('netphlix_accent', '#E50914');

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setShowTopButton(latest > 450);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. Micro-Scroll Progress Line (Top of Viewport) */}
      <motion.div
        className="scroll-progress-bar fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left pointer-events-none opacity-80"
        style={{
          scaleX,
          backgroundColor: accentColor || '#E50914',
          boxShadow: `0 0 10px ${accentColor || '#E50914'}`,
        }}
      />

      {/* 2. Floating Frosted Glass Back-to-Top Pill Button */}
      <AnimatePresence>
        {showTopButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 12 }}
            whileHover={{ y: -3, scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-40 p-2.5 sm:p-3 rounded-full frost-pill text-white/80 hover:text-white shadow-[0_15px_30px_rgba(0,0,0,0.8)] border border-white/15 cursor-pointer flex items-center justify-center group"
            title="Scroll to Top"
            aria-label="Scroll to Top"
          >
            <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
