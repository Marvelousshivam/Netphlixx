import { motion } from 'framer-motion';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * Living Chromatic Liquid Aurora Canvas
 * Active exclusively in 'liquid-glass' mode to provide vibrant refractive light
 * for backdrop-blur frosted surfaces to illuminate and refract through.
 */
export default function LiquidAuroraOverlay() {
  const [themeMaterial] = useLocalStorage('netphlix_theme_material', 'obsidian');

  if (themeMaterial !== 'liquid-glass') {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-1000"
    >
      {/* 1. Deep Radiant Cyan Liquid Orb (Top Left) */}
      <motion.div
        animate={{
          x: [0, 90, -50, 0],
          y: [0, -70, 60, 0],
          scale: [1, 1.3, 0.95, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-24 -left-24 w-[650px] h-[650px] rounded-full blur-[120px] opacity-65 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle, rgba(6, 182, 212, 0.65) 0%, rgba(59, 130, 246, 0.35) 50%, transparent 75%)',
        }}
      />

      {/* 2. Electric Violet / Magenta Liquid Orb (Top Right) */}
      <motion.div
        animate={{
          x: [0, -100, 70, 0],
          y: [0, 80, -60, 0],
          scale: [1, 0.9, 1.25, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-10 right-[-80px] w-[700px] h-[700px] rounded-full blur-[130px] opacity-60 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle, rgba(168, 85, 247, 0.65) 0%, rgba(99, 102, 241, 0.35) 55%, transparent 75%)',
        }}
      />

      {/* 3. Cinema Ruby / Hot Pink Liquid Orb (Center Floating) */}
      <motion.div
        animate={{
          x: [0, 70, -80, 0],
          y: [0, 90, -70, 0],
          scale: [0.95, 1.25, 0.9, 0.95],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[35vh] left-[25vw] w-[550px] h-[550px] rounded-full blur-[120px] opacity-45 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle, rgba(244, 63, 94, 0.55) 0%, rgba(225, 29, 72, 0.28) 60%, transparent 80%)',
        }}
      />

      {/* 4. Sapphire Azure Deep Bloom (Bottom Right) */}
      <motion.div
        animate={{
          x: [0, -80, 60, 0],
          y: [0, -90, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-32 right-[10vw] w-[750px] h-[750px] rounded-full blur-[140px] opacity-55 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle, rgba(37, 99, 235, 0.6) 0%, rgba(6, 182, 212, 0.25) 60%, transparent 80%)',
        }}
      />
    </div>
  );
}
