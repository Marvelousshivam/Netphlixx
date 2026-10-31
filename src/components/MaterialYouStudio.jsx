import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layers, Box, Play, Check, ShieldAlert, Cpu } from 'lucide-react';
import { haptics } from '../utils/audioHaptics';
import { squishTap } from '../utils/motionSprings';

const ELEVATION_LEVELS = [
  {
    level: 0,
    role: 'Surface',
    usage: 'Body canvas void',
    tint: '4%',
    darkBase: '#121215',
  },
  {
    level: 1,
    role: 'Surface Container Low',
    usage: 'Large cards & shelf backgrounds',
    tint: '6%',
    darkBase: '#17161c',
  },
  {
    level: 2,
    role: 'Surface Container',
    usage: 'Media cards & floating panels',
    tint: '9%',
    darkBase: '#1e1d24',
  },
  {
    level: 3,
    role: 'Surface Container High',
    usage: 'Floating navbar & dialogs',
    tint: '13%',
    darkBase: '#25242c',
  },
  {
    level: 4,
    role: 'Surface Container Highest',
    usage: 'Inactive pills & utility badges',
    tint: '18%',
    darkBase: '#2d2b35',
  },
  {
    level: 5,
    role: 'Primary Tonal Container',
    usage: 'Active nav pill & action FAB',
    tint: '32%',
    darkBase: '#383442',
  },
];

export default function MaterialYouStudio({ accentColor = '#E50914' }) {
  const [selectedElevation, setSelectedElevation] = useState(2);
  const [morphFlipped, setMorphFlipped] = useState(false);

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Monet Tonal Architecture Card */}
      <div className="apple-glass rounded-2xl p-4 md:p-5 border border-white/15 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[12px_4px_12px_4px] bg-white/10 flex items-center justify-center text-white/90 border border-white/10">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display tracking-tight flex items-center gap-2">
                5-Level Monet Tonal Architecture
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                  Google M3
                </span>
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                Pure elevation without fake shadows: surfaces are dynamic tonal tints derived from your active accent color.
              </p>
            </div>
          </div>
        </div>

        {/* 5 Tonal Elevation Swatches */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
          {ELEVATION_LEVELS.map((elev) => {
            const isSelected = selectedElevation === elev.level;
            const swatchBg = `color-mix(in srgb, ${accentColor} ${elev.tint}, ${elev.darkBase})`;

            return (
              <motion.button
                key={elev.level}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSelectedElevation(elev.level);
                  haptics.playClick();
                }}
                style={{ backgroundColor: swatchBg }}
                className={`p-2.5 text-left border rounded-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[96px] ${
                  isSelected
                    ? 'border-white ring-2 ring-white/30 shadow-lg'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-white/50">
                      L{elev.level}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/40 text-white/80">
                      +{elev.tint}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1 leading-snug line-clamp-1">
                    {elev.role.replace('Surface ', '')}
                  </h4>
                </div>

                <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[9px] text-white/60 truncate pr-1">
                    {elev.usage.split('&')[0]}
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-white flex-none" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Expressive Asymmetric Squircle Playground */}
      <div className="apple-glass rounded-2xl p-4 md:p-5 border border-white/15 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[4px_12px_4px_12px] bg-white/10 flex items-center justify-center text-white/90 border border-white/10">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display tracking-tight">
                Expressive Asymmetric Squircle Physics
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                Material 3 Expressive replaces robotic symmetric corners with dynamic organic silhouettes that morph on hover and press.
              </p>
            </div>
          </div>

          <motion.button
            whileTap={squishTap}
            onClick={() => {
              setMorphFlipped(!morphFlipped);
              haptics.playClick();
            }}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cycle Geometry</span>
          </motion.button>
        </div>

        {/* Live Morphing Demonstration Stage */}
        <div className="p-4 sm:p-6 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* 1. Asymmetric Poster Card */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8a8a93]">
              Poster Silhouettes
            </span>
            <div
              className={`w-36 h-48 p-3 flex flex-col justify-end text-left border border-white/20 shadow-xl transition-all duration-300 ${
                morphFlipped ? 'rounded-[10px_24px_10px_24px]' : 'rounded-[24px_8px_24px_8px]'
              }`}
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 20%, #1e1d24) 0%, #111115 100%)`,
              }}
            >
              <span className="text-[10px] font-bold text-white/70 uppercase">M3 Ratio</span>
              <h5 className="text-xs font-bold text-white">Spider-Man: Beyond</h5>
              <div className="flex items-center space-x-1 mt-1 text-[9px] text-white/50">
                <span>24px 8px Squircle</span>
              </div>
            </div>
          </div>

          {/* 2. Asymmetric Floating Action Pill */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8a8a93]">
              Dynamic Action Pill
            </span>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => haptics.playClick()}
              style={{ backgroundColor: accentColor }}
              className={`px-6 py-3 text-white font-bold text-xs flex items-center space-x-2 shadow-xl cursor-pointer transition-all duration-300 ${
                morphFlipped ? 'rounded-[12px_26px_12px_26px]' : 'rounded-[26px_10px_26px_10px]'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Now</span>
            </motion.button>
            <span className="text-[10px] text-white/40 font-mono">
              {morphFlipped ? '12px 26px' : '26px 10px'}
            </span>
          </div>

          {/* 3. Alternating Icon Badges */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8a8a93]">
              Tonal Icon Badges
            </span>
            <div className="flex items-center space-x-3">
              <div
                className={`w-11 h-11 flex items-center justify-center text-white/90 border border-white/15 transition-all duration-300 ${
                  morphFlipped ? 'rounded-[6px_14px_6px_14px]' : 'rounded-[14px_6px_14px_6px]'
                }`}
                style={{
                  backgroundColor: `color-mix(in srgb, ${accentColor} 26%, #282633)`,
                }}
              >
                <Cpu className="w-5 h-5" />
              </div>

              <div
                className={`w-11 h-11 flex items-center justify-center text-white/90 border border-white/15 transition-all duration-300 ${
                  morphFlipped ? 'rounded-[14px_6px_14px_6px]' : 'rounded-[6px_14px_6px_14px]'
                }`}
                style={{
                  backgroundColor: `color-mix(in srgb, ${accentColor} 26%, #282633)`,
                }}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-white/40 font-mono">Alternating Bi-Squircle</span>
          </div>
        </div>
      </div>
    </div>
  );
}