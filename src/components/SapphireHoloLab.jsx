import { useState } from 'react';
import { Compass, Target, Check } from 'lucide-react';
import { haptics } from '../utils/audioHaptics';

const HOLO_MODES = [
  { id: 'tactical', label: 'TACTICAL HUD', desc: 'Active vector targeting reticle & orbital telemetry' },
  { id: 'scanline', label: 'RETRO CRT', desc: 'Interlaced electron-beam scanline raster' },
  { id: 'plasma', label: 'PLASMA TUBE', desc: 'Overdriven electric cobalt neon photon glow' },
];

export default function SapphireHoloLab() {
  const [selectedMode, setSelectedMode] = useState('tactical');
  const [scanlineDensity, setScanlineDensity] = useState(65);
  const [plasmaFrequency, setPlasmaFrequency] = useState(88);

  return (
    <div className="space-y-6 select-none font-mono">
      {/* 1. Cyber Sapphire Holo-Deck Stage */}
      <div className="apple-glass rounded-2xl p-4 md:p-6 border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden bg-[#030712]/95">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full border border-blue-500/40 bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-widest flex items-center gap-2">
                CYBER SAPPHIRE HOLO-DECK
                <span className="text-[10px] px-2 py-0.5 rounded border border-blue-500/40 text-blue-300">
                  GRID // 77-A
                </span>
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                Volumetric deep-space navy optics, dual-frequency neon tube emission, and holographic targeting reticles.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#3B82F6]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300">
              HUD // ENGAGED
            </span>
          </div>
        </div>

        {/* Live Holographic Display Stage */}
        <div className="p-6 rounded-2xl bg-[#050814] border border-blue-500/30 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
          {/* Simulated CRT Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${Math.max(2, Math.round(10 - scanlineDensity / 15))}px, rgba(59, 130, 246, 0.25) ${Math.max(3, Math.round(11 - scanlineDensity / 15))}px)`,
            }}
          />

          {/* Holographic Targeting Reticle */}
          <div className="relative z-10 w-full max-w-sm border border-blue-500/40 rounded-xl p-4 bg-blue-950/20 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.25)] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-[10px] text-blue-400">
              <span className="font-bold">[SYS // NETPHLIX-OS]</span>
              <span>37.7749° N, 122.4194° W</span>
            </div>

            <div className="flex items-center space-x-3 py-2">
              <div className="w-12 h-12 rounded-lg border border-blue-400/60 flex items-center justify-center bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                <Target className="w-6 h-6 text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wider">TARGET // BLADE RUNNER 2049</h4>
                <span className="text-[10px] text-cyan-300 block">STREAM // 4K HDR • BITRATE: 24.5 Mbps</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-blue-300/60 border-t border-blue-500/20 pt-2">
              <span>FREQ: {plasmaFrequency}0 THz</span>
              <span>SCANLINES: {scanlineDensity}%</span>
              <span>STATUS: LOCK CONFIRMED</span>
            </div>
          </div>
        </div>

        {/* Holo Modes & Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#8a8a93] font-bold block">
              Hologram Configuration
            </label>
            <div className="space-y-2">
              {HOLO_MODES.map((mode) => {
                const isSelected = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSelectedMode(mode.id);
                      haptics.playClick();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{mode.label}</div>
                      <div className="text-[10px] text-white/50">{mode.desc}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 flex-none" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CRT Scanline Dial */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/60">SCANLINE DENSITY</span>
                <span className="text-blue-400 font-bold">{scanlineDensity}%</span>
              </div>
              <p className="text-[11px] text-[#8a8a93] leading-relaxed">
                Adjusts interlaced raster line density across video backdrops and UI panels.
              </p>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              value={scanlineDensity}
              onChange={(e) => setScanlineDensity(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
            />

            <div className="flex items-center justify-between text-[10px] text-white/40">
              <span>MINIMAL</span>
              <span>OPTIMIZED</span>
              <span>HEAVY CRT</span>
            </div>
          </div>

          {/* Plasma Frequency Dial */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/60">PLASMA TUBE FREQUENCY</span>
                <span className="text-cyan-400 font-bold">{plasmaFrequency} MHz</span>
              </div>
              <p className="text-[11px] text-[#8a8a93] leading-relaxed">
                Controls neon excitation frequency for glowing cobalt tube borders and active indicators.
              </p>
            </div>

            <input
              type="range"
              min="40"
              max="100"
              value={plasmaFrequency}
              onChange={(e) => setPlasmaFrequency(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
            />

            <div className="flex items-center justify-between text-[10px] text-white/40">
              <span>40 MHz</span>
              <span>88 MHz</span>
              <span>100 MHz ULTRA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}