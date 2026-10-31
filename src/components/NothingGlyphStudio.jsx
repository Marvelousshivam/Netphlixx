import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, Cpu } from 'lucide-react';
import { haptics } from '../utils/audioHaptics';

const GLYPH_MODES = [
  { id: 'steady', label: 'STEADY', desc: 'Constant 100% LED glow' },
  { id: 'pulse', label: 'BREATHE', desc: 'Organic sinusoidal pulse' },
  { id: 'chase', label: 'CHASE', desc: 'Clockwise sector sequence' },
  { id: 'strobe', label: 'NOTIFICATION', desc: 'Crisp camera strobe' },
];

export default function NothingGlyphStudio() {
  const [glyphMode, setGlyphMode] = useState('pulse');
  const [brightness, setBrightness] = useState(85);
  const [recordingActive, setRecordingActive] = useState(true);
  const [activeSector, setActiveSector] = useState(0);

  // Chase animation timer
  useEffect(() => {
    if (glyphMode !== 'chase') return;
    const timer = setInterval(() => {
      setActiveSector((prev) => (prev + 1) % 4);
    }, 280);
    return () => clearInterval(timer);
  }, [glyphMode]);

  const handleSelectMode = (mode) => {
    setGlyphMode(mode);
    haptics.playClick();
  };

  const getGlyphOpacity = (sectorIndex) => {
    const base = brightness / 100;
    if (glyphMode === 'steady') return base;
    if (glyphMode === 'pulse') return base * 0.9;
    if (glyphMode === 'strobe') return base;
    if (glyphMode === 'chase') {
      return activeSector === sectorIndex ? base : base * 0.15;
    }
    return base;
  };

  return (
    <div className="space-y-6 select-none font-mono">
      {/* 1. Glyph LED Hardware Interface Stage */}
      <div className="apple-glass rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl relative overflow-hidden bg-black/90">
        {/* Subtle Stipple Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white bg-white/5">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-doto tracking-wide flex items-center gap-2">
                NOTHING GLYPH INTERFACE
                <span className="text-[10px] px-2 py-0.5 rounded border border-white/30 text-white/80 font-mono">
                  HARDWARE v2.5
                </span>
              </h3>
              <p className="text-xs text-white/50 font-mono">
                Hardware-synced LED strip lighting architecture with physical photonic bloom.
              </p>
            </div>
          </div>

          {/* Red Diode Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 self-start sm:self-auto">
            <span
              className={`w-2 h-2 rounded-full ${
                recordingActive ? 'bg-[#D71921] shadow-[0_0_8px_#D71921] animate-pulse' : 'bg-white/20'
              }`}
            />
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/80 font-doto">
              {recordingActive ? 'REC // ACTIVE' : 'REC // STANDBY'}
            </span>
          </div>
        </div>

        {/* Interactive Glyph Simulator & Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Glyph Phone Backplate Visualization */}
          <div className="md:col-span-6 flex justify-center py-4">
            <div className="relative w-52 h-80 rounded-[36px] bg-[#0c0c0e] border border-white/25 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden">
              {/* Internal Screws & Registration Coordinates */}
              <div className="absolute top-3 left-4 text-[9px] text-white/30 font-mono">+ 00.1</div>
              <div className="absolute top-3 right-4 text-[9px] text-white/30 font-mono">+ 00.2</div>
              <div className="absolute bottom-3 left-4 text-[9px] text-white/30 font-mono">NOTHING (2a)</div>
              <div className="absolute bottom-3 right-4 text-[9px] text-white/30 font-mono">+ 00.4</div>

              {/* SECTOR 0: Camera Module LED Ring (Top Left) */}
              <motion.div
                animate={{
                  opacity: getGlyphOpacity(0),
                  scale: glyphMode === 'pulse' ? [0.98, 1.02, 0.98] : 1,
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full border-4 border-white/90 shadow-[0_0_20px_rgba(255,255,255,0.85)] flex items-center justify-center p-1.5"
                style={{
                  boxShadow: `0 0 ${brightness * 0.3}px rgba(255, 255, 255, 0.9)`,
                }}
              >
                <div className="w-12 h-12 rounded-full border border-white/30 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#D71921]" />
                  </div>
                </div>
              </motion.div>

              {/* SECTOR 1: Diagonal Slash Glyph */}
              <motion.div
                animate={{
                  opacity: getGlyphOpacity(1),
                }}
                className="absolute top-12 right-6 w-12 h-1.5 bg-white rounded-full origin-right -rotate-45"
                style={{
                  boxShadow: `0 0 ${brightness * 0.25}px rgba(255, 255, 255, 0.9)`,
                }}
              />

              {/* SECTOR 2: Center Wireless C-Coil Glyph */}
              <motion.div
                animate={{
                  opacity: getGlyphOpacity(2),
                  scale: glyphMode === 'pulse' ? [1, 1.03, 1] : 1,
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="self-center w-24 h-24 rounded-full border-4 border-white/90 border-r-transparent rotate-45"
                style={{
                  boxShadow: `0 0 ${brightness * 0.3}px rgba(255, 255, 255, 0.85)`,
                }}
              />

              {/* SECTOR 3: Bottom Exclamation Line Glyph (Battery Meter) */}
              <div className="flex flex-col items-center space-y-1.5 mb-2">
                <motion.div
                  animate={{
                    opacity: getGlyphOpacity(3),
                  }}
                  className="w-1.5 h-10 bg-white rounded-full"
                  style={{
                    boxShadow: `0 0 ${brightness * 0.25}px rgba(255, 255, 255, 0.9)`,
                  }}
                />
                <motion.div
                  animate={{
                    opacity: getGlyphOpacity(3),
                  }}
                  className="w-1.5 h-1.5 bg-white rounded-full"
                  style={{
                    boxShadow: `0 0 ${brightness * 0.25}px rgba(255, 255, 255, 0.9)`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Glyph Light Mode Selector & Tuning Dials */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2.5 block font-doto">
                GLYPH SEQUENCE MODES
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GLYPH_MODES.map((m) => {
                  const isSelected = glyphMode === m.id;
                  return (
                    <motion.button
                      key={m.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelectMode(m.id)}
                      className={`p-2.5 text-left border rounded-xl transition-all cursor-pointer font-mono ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                          : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold text-xs tracking-wider font-doto">{m.label}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-black/70' : 'text-white/40'}`}>
                        {m.desc}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Brightness Dial */}
            <div className="p-3.5 rounded-xl border border-white/15 bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/60 font-doto">PHOTONIC LUMINANCE</span>
                <span className="text-white font-bold">{brightness}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-white cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
              />
            </div>

            {/* Recording Diode Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/15 bg-white/5">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D71921] shadow-[0_0_8px_#D71921]" />
                <span className="text-xs text-white font-doto">HARDWARE RED DIODE</span>
              </div>
              <button
                onClick={() => {
                  setRecordingActive(!recordingActive);
                  haptics.playClick();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  recordingActive
                    ? 'bg-[#D71921] text-white shadow-[0_0_12px_#D71921]'
                    : 'bg-white/10 text-white/40 border border-white/10'
                }`}
              >
                {recordingActive ? 'ENABLED' : 'MUTED'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Doto Matrix Typography Benchmark */}
      <div className="apple-glass rounded-2xl p-4 md:p-6 border border-white/15 shadow-xl space-y-4 bg-black/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-doto tracking-wide">
                DOTO MATRIX TYPOGRAPHY BENCHMARK
              </h3>
              <p className="text-xs text-white/50 font-mono">
                Google Doto variable dot-matrix typography paired with Space Mono telemetry.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest hidden sm:inline">
            SPEC // ISO-8859
          </span>
        </div>

        {/* Live Typographic Specimens */}
        <div className="p-4 rounded-xl border border-dashed border-white/20 bg-[#070709] space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-2.5">
            <span className="text-xs text-white/40 font-mono">H1 DISPLAY HEADER:</span>
            <span className="text-xl md:text-2xl font-black text-white font-doto tracking-tight">
              AVENGERS // DOOMSDAY
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <span className="text-xs text-white/40 font-mono">TELEMETRY ROW:</span>
            <div className="flex items-center space-x-2 text-xs font-mono text-white/80">
              <span className="px-2 py-0.5 rounded border border-white/25 bg-white/5">[4K // UHD]</span>
              <span className="px-2 py-0.5 rounded border border-white/25 bg-white/5">[ATMOS // 7.1]</span>
              <span className="px-2 py-0.5 rounded border border-white/25 bg-white/5">[REL // 2026]</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-xs text-white/40 font-mono">ACTION CTA BUTTON:</span>
            <button className="px-5 py-2 rounded-full bg-white text-black font-doto font-black text-xs tracking-wider flex items-center space-x-2 shadow-[0_0_16px_rgba(255,255,255,0.5)]">
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>ENGAGE PLAYBACK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}