import { useState } from 'react';
import { Film, Check } from 'lucide-react';
import { haptics } from '../utils/audioHaptics';

const FILM_STOCKS = [
  {
    id: 'kodak-500t',
    name: 'Kodak Vision3 500T (5219)',
    type: 'Color Negative',
    grain: 'Rich Anamorphic',
    desc: 'The gold standard of 35mm Hollywood cinema. Organic tungsten grain and halation.',
    tint: '#f4a261',
  },
  {
    id: 'double-x',
    name: 'Eastman Double-X (5222)',
    type: 'Monochrome Noir',
    grain: 'High-Contrast Silver',
    desc: 'Iconic Criterion black-and-white stock. Deep velvety shadows and crisp sharpness.',
    tint: '#e0e0e0',
  },
  {
    id: 'eterna-250d',
    name: 'Fujifilm Eterna 250D',
    type: 'Daylight Fine Grain',
    grain: 'Ultra-Fine Grain',
    desc: 'Subtle European art-house palette with soft highlight roll-off and neutral grays.',
    tint: '#81b29a',
  },
];

const ASPECT_RATIOS = [
  { id: '2.39', label: '2.39:1', name: 'CinemaScope', desc: 'Anamorphic widescreen' },
  { id: '1.85', label: '1.85:1', name: 'Flat Widescreen', desc: 'Standard theatrical' },
  { id: '1.33', label: '1.33:1', name: 'Academy Ratio', desc: 'Classic 35mm & IMAX' },
];

export default function ObsidianCinemaLab() {
  const [selectedStock, setSelectedStock] = useState('kodak-500t');
  const [selectedRatio, setSelectedRatio] = useState('2.39');
  const [colorTemp, setColorTemp] = useState(3200);

  const activeStock = FILM_STOCKS.find((s) => s.id === selectedStock) || FILM_STOCKS[0];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Archival 35mm Projection Stage */}
      <div className="apple-glass rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl relative overflow-hidden bg-[#07080B]/95">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-serif tracking-wider flex items-center gap-2">
                CRITERION 35MM PROJECTION BOOTH
                <span className="text-[10px] px-2 py-0.5 rounded border border-amber-500/30 text-amber-300 font-mono">
                  ARCHIVAL v35
                </span>
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                Photochemical darkroom optics: silver halide grain physics, anamorphic gate framing, and 3200K tungsten warmth.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200 font-mono">
              PROJECTOR // 24 FPS
            </span>
          </div>
        </div>

        {/* Live Cinema Gate & Clapperboard Stage */}
        <div className="p-4 sm:p-6 rounded-2xl bg-black/70 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
          {/* 35mm Film Gate Aspect Ratio Simulation */}
          <div className="w-full max-w-lg relative transition-all duration-500 flex flex-col items-center">
            {/* Top Matted Black Letterbox Bar */}
            <div
              className={`w-full bg-black border-b border-white/15 transition-all duration-500 flex items-center justify-center text-[9px] text-white/30 font-mono ${
                selectedRatio === '2.39' ? 'h-7' : selectedRatio === '1.85' ? 'h-3' : 'h-0'
              }`}
            >
              {selectedRatio !== '1.33' && <span>2.39:1 ANAMORPHIC GATE MASK</span>}
            </div>

            {/* Projected Frame with Live Grain Overlay & Warmth Tint */}
            <div
              className="relative w-full aspect-video bg-[#121318] border border-amber-500/30 overflow-hidden flex flex-col justify-between p-4 shadow-[0_0_40px_rgba(245,158,11,0.15)]"
              style={{
                boxShadow: `0 0 40px ${activeStock.tint}22`,
              }}
            >
              {/* Clapperboard Framing Marks */}
              <div className="flex items-center justify-between text-[9px] font-mono text-amber-200/60">
                <span>SCENE 01 / TAKE 04</span>
                <span className="uppercase">{activeStock.name}</span>
                <span>24.00 FPS</span>
              </div>

              {/* Title Card in Cinzel Serif */}
              <div className="my-auto text-center space-y-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-mono block">
                  Criterion Archive No. 1042
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white font-serif tracking-widest drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                  THE THIRD MAN
                </h4>
                <p className="text-[11px] text-white/70 italic font-serif">
                  Restored in 4K from the Original 35mm Nitrate Camera Negative
                </p>
              </div>

              {/* Bottom Telemetry */}
              <div className="flex items-center justify-between text-[9px] font-mono text-white/40 border-t border-white/10 pt-2">
                <span>ISO 500 // TUNGSTEN</span>
                <span>GATE: {selectedRatio}:1</span>
                <span>TEMP: {colorTemp}K</span>
              </div>
            </div>

            {/* Bottom Matted Black Letterbox Bar */}
            <div
              className={`w-full bg-black border-t border-white/15 transition-all duration-500 ${
                selectedRatio === '2.39' ? 'h-7' : selectedRatio === '1.85' ? 'h-3' : 'h-0'
              }`}
            />
          </div>
        </div>

        {/* Controls: Stock Selector, Aspect Ratio, Color Temp */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Film Stock Selector */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#8a8a93] font-bold block font-mono">
              35mm Emulsion Stock
            </label>
            <div className="space-y-2">
              {FILM_STOCKS.map((stock) => {
                const isSelected = selectedStock === stock.id;
                return (
                  <button
                    key={stock.id}
                    onClick={() => {
                      setSelectedStock(stock.id);
                      haptics.playClick();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-white/15 border-amber-400/80 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-bold font-serif">{stock.name}</div>
                      <div className="text-[10px] text-white/50 font-mono">{stock.type} • {stock.grain}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-none" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Mattes */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#8a8a93] font-bold block font-mono">
              Theatrical Aspect Ratio
            </label>
            <div className="space-y-2">
              {ASPECT_RATIOS.map((ratio) => {
                const isSelected = selectedRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => {
                      setSelectedRatio(ratio.id);
                      haptics.playClick();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-white/15 border-amber-400/80 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-bold font-mono">{ratio.label} ({ratio.name})</div>
                      <div className="text-[10px] text-white/50">{ratio.desc}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-none" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projector Tungsten Temperature Dial */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-white/60">TUNGSTEN LAMP WARMTH</span>
                <span className="text-amber-400 font-bold">{colorTemp}K</span>
              </div>
              <p className="text-[11px] text-[#8a8a93] leading-relaxed">
                Adjust projector bulb temperature from warm 2800K nitrate glow to 5600K Xenon daylight.
              </p>
            </div>

            <input
              type="range"
              min="2800"
              max="5600"
              step="100"
              value={colorTemp}
              onChange={(e) => setColorTemp(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
            />

            <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
              <span>2800K NITRATE</span>
              <span>3200K TUNGSTEN</span>
              <span>5600K XENON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}