import { useState } from 'react';
import { Activity, Zap, Shield, Check } from 'lucide-react';
import { haptics } from '../utils/audioHaptics';

const OLED_PROFILES = [
  {
    id: 'pure-black',
    label: 'PURE VOID #000000',
    powerDraw: '0.00 W',
    efficiency: '100% (Diodes Powered OFF)',
    nits: '0.000 nits',
    desc: 'Organic emitters are completely shut off. Zero backlight glow, infinite contrast ratio.',
  },
  {
    id: 'deep-charcoal',
    label: 'DEEP CHARCOAL #0E0E12',
    powerDraw: '0.82 W',
    efficiency: '83% Energy Savings',
    nits: '0.120 nits',
    desc: 'Sub-threshold driving voltage. Minimal cathode current across organic layers.',
  },
  {
    id: 'full-white',
    label: 'PEAK HDR WHITE #FFFFFF',
    powerDraw: '4.85 W',
    efficiency: '0% Energy Savings',
    nits: '1,000 nits',
    desc: 'Maximum red, green, and blue subpixel excitation with full backlight power.',
  },
];

export default function OledEfficiencyLab() {
  const [selectedProfile, setSelectedProfile] = useState('pure-black');
  const [pixelShiftEnabled, setPixelShiftEnabled] = useState(true);

  const activeProfile = OLED_PROFILES.find((p) => p.id === selectedProfile) || OLED_PROFILES[0];

  return (
    <div className="space-y-6 select-none font-mono">
      {/* 1. Emissive OLED Diode Telemetry Stage */}
      <div className="apple-glass rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl relative overflow-hidden bg-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2 font-mono">
                OLED EMISSIVE POWER BENCHMARK
                <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-300 font-mono">
                  TRUE BLACK v0.0
                </span>
              </h3>
              <p className="text-xs text-[#8a8a93]">
                Self-illuminating organic diodes: zero backlight bleed, 0.000 nits black level, and physical pixel shut-off.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
              POWER // {activeProfile.powerDraw}
            </span>
          </div>
        </div>

        {/* Live Power Consumption Meter & Pixel Micro-Grid */}
        <div className="p-4 sm:p-6 rounded-2xl bg-black border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          {/* Left: Pixel State Stage */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 rounded-xl border border-white/15 bg-black relative overflow-hidden">
            <div
              className={`w-32 h-32 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${
                selectedProfile === 'pure-black'
                  ? 'bg-black border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : selectedProfile === 'deep-charcoal'
                  ? 'bg-[#0e0e12] border-white/20'
                  : 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.7)]'
              }`}
            >
              <Activity className={`w-8 h-8 mb-2 ${selectedProfile === 'full-white' ? 'text-black' : 'text-emerald-400'}`} />
              <span className={`text-[10px] font-bold ${selectedProfile === 'full-white' ? 'text-black' : 'text-white'}`}>
                {activeProfile.powerDraw}
              </span>
              <span className={`text-[9px] ${selectedProfile === 'full-white' ? 'text-black/60' : 'text-white/40'}`}>
                {activeProfile.nits}
              </span>
            </div>

            <span className="text-[10px] text-white/50 mt-3 text-center">
              {pixelShiftEnabled ? '• Pixel-Shift Burn-In Guard: ACTIVE' : '• Pixel-Shift: STANDBY'}
            </span>
          </div>

          {/* Right: Live Telemetry Gauges */}
          <div className="w-full md:w-1/2 space-y-3">
            <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
              <span className="text-xs text-white/60">ESTIMATED POWER DRAW:</span>
              <span className="text-sm font-black text-emerald-400">{activeProfile.powerDraw}</span>
            </div>

            <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
              <span className="text-xs text-white/60">CONTRAST RATIO:</span>
              <span className="text-sm font-black text-white">
                {selectedProfile === 'pure-black' ? '∞ : 1 (INFINITE)' : '1,000,000 : 1'}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
              <span className="text-xs text-white/60">DIODE STATUS:</span>
              <span className={`text-xs font-bold ${selectedProfile === 'pure-black' ? 'text-emerald-400' : 'text-amber-300'}`}>
                {selectedProfile === 'pure-black' ? '0.0V EMITTERS OFF' : 'POWERED ON'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6">
          {OLED_PROFILES.map((prof) => {
            const isSelected = selectedProfile === prof.id;
            return (
              <button
                key={prof.id}
                onClick={() => {
                  setSelectedProfile(prof.id);
                  haptics.playClick();
                }}
                className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white/15 border-emerald-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{prof.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold mb-1">{prof.powerDraw} • {prof.nits}</div>
                <p className="text-[10px] text-[#8a8a93] leading-snug">{prof.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Pixel Shift Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/5 mt-4">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-white block">Subpixel Burn-In Micro-Shift</span>
              <span className="text-[10px] text-white/50">Periodically shifts static UI elements 1px to extend panel longevity.</span>
            </div>
          </div>

          <button
            onClick={() => {
              setPixelShiftEnabled(!pixelShiftEnabled);
              haptics.playClick();
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
              pixelShiftEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-white/10 text-white/40 border border-white/10'
            }`}
          >
            {pixelShiftEnabled ? 'ENABLED' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}