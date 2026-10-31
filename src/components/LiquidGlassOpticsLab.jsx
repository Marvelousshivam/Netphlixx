import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Sliders, Sparkles, Eye, Compass, Layers, Check } from 'lucide-react';
import { renderLensMap } from '../lib/liquid-glass';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { haptics } from '../utils/audioHaptics';
import { squishTap } from '../utils/motionSprings';

export default function LiquidGlassOpticsLab() {
  const [dockLayout, setDockLayout] = useLocalStorage('netphlix_dock_layout', 'top');

  // Optics parameters matching liquidglass.dev
  const [refraction, setRefraction] = useState(24);
  const [bezel, setBezel] = useState(0.65);
  const [curvature, setCurvature] = useState(4);
  const [ior, setIor] = useState(1.52);
  const [chroma, setChroma] = useState(0.16);
  const [specular, setSpecular] = useState(0.6);
  const [lightAngle, setLightAngle] = useState(-120);

  const canvasRef = useRef(null);
  const stageRef = useRef(null);

  // Motion physics for playground lens
  const lensX = useMotionValue(120);
  const lensY = useMotionValue(80);
  const springX = useSpring(lensX, { mass: 0.1, stiffness: 350, damping: 26 });
  const springY = useSpring(lensY, { mass: 0.1, stiffness: 350, damping: 26 });
  const [isHoveringLens, setIsHoveringLens] = useState(false);

  // Render runtime displacement map to canvas
  useEffect(() => {
    try {
      const { canvas } = renderLensMap(
        {
          width: 140,
          height: 90,
          radius: 40,
          refraction,
          bezel,
          curvature,
          ior,
          invert: false,
          chroma,
          blur: 0,
          specular,
          specularWidth: 2.2,
          lightAngle,
          mapScale: 2,
        },
        2
      );

      const target = canvasRef.current;
      if (target && canvas) {
        const ctx = target.getContext('2d');
        ctx.clearRect(0, 0, target.width, target.height);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(canvas, 0, 0, target.width, target.height);
      }
    } catch {
      // Fallback silently if offscreen rendering is constrained
    }
  }, [refraction, bezel, curvature, ior, chroma, specular, lightAngle]);

  const handleStageMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    lensX.set(e.clientX - rect.left);
    lensY.set(e.clientY - rect.top);
  };

  const handleStageMouseEnter = () => setIsHoveringLens(true);
  const handleStageMouseLeave = () => {
    setIsHoveringLens(false);
    if (stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      lensX.set(rect.width / 2);
      lensY.set(rect.height / 2);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. DOCK NAVIGATION ARCHITECTURE SELECTOR */}
      <div className="apple-glass rounded-2xl p-4 md:p-5 border border-white/15 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white font-display">
              Dock Navigation Architecture
            </h4>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            visionOS Physics
          </span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          Choose where your optical magnification dock lives. The left side dock features colorful
          liquid squircle app icons matching the <code className="text-cyan-300">liquidglass.dev</code> demo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {[
            {
              id: 'top',
              label: 'Top Floating Pill',
              desc: 'Classic minimalist Apple TV top pill',
            },
            {
              id: 'side',
              label: 'VisionOS Side Dock',
              desc: 'Left vertical rail with squircle zoom icons',
            },
            {
              id: 'both',
              label: 'Dual Dock (Top + Side)',
              desc: 'Full studio setup with dual quick-access',
            },
          ].map((mode) => {
            const isSelected = dockLayout === mode.id;
            return (
              <motion.button
                key={mode.id}
                whileTap={squishTap}
                onClick={() => {
                  haptics.playClick();
                  setDockLayout(mode.id);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-white/15 border-white text-white shadow-lg ring-1 ring-white/30'
                    : 'apple-glass border-white/10 text-white/70 hover:bg-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-display">{mode.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-white/50">{mode.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 2. LIQUID GLASS OPTICAL LABORATORY */}
      <div className="apple-glass rounded-2xl p-4 md:p-5 border border-cyan-500/30 shadow-2xl space-y-5 bg-gradient-to-br from-cyan-950/20 via-transparent to-violet-950/20">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white font-display">
              Liquid Glass Optical Laboratory
            </h4>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-300">
            Real Canvas Refraction Engine
          </span>
        </div>

        {/* Top: Side-by-Side Playground Stage + Realtime Displacement Map */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Interactive Lens Playground Stage */}
          <div className="md:col-span-7 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="font-semibold flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Interactive Refraction Stage</span>
              </span>
              <span className="text-[11px] text-cyan-400/80">Hover & Glide</span>
            </div>

            <div
              ref={stageRef}
              onMouseMove={handleStageMouseMove}
              onMouseEnter={handleStageMouseEnter}
              onMouseLeave={handleStageMouseLeave}
              className="relative h-48 rounded-xl overflow-hidden cursor-crosshair border border-white/20 shadow-inner group select-none"
            >
              {/* High-res Atmospheric Backdrop */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Sample Movie UI Content underneath */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-600 text-white shadow">
                    Cinema Premiere
                  </span>
                  <span className="text-xs font-mono font-bold text-white/90">4K HDR · Dolby Vision</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-display drop-shadow-md">
                    Interstellar Horizons
                  </h3>
                  <p className="text-[11px] text-white/80 line-clamp-1">
                    Light bends along event horizons with authentic optical lens curvature.
                  </p>
                </div>
              </div>

              {/* Floating Magnification Liquid Lens Puck */}
              <motion.div
                style={{
                  x: springX,
                  y: springY,
                  translateX: '-50%',
                  translateY: '-50%',
                  scale: isHoveringLens ? 1.08 : 1.0,
                }}
                className="pointer-events-none absolute w-24 h-24 rounded-full z-20 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.4)] border border-white/60 backdrop-blur-[3px] backdrop-saturate-[180%]"
              >
                {/* Internal Refraction Highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-white/10" />
                <div className="absolute inset-x-2 top-1.5 h-6 rounded-full bg-white/40 blur-[1px]" />
              </motion.div>
            </div>
          </div>

          {/* Realtime Displacement Map Canvas (R, G, B Channels) */}
          <div className="md:col-span-5 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="font-semibold flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Displacement Map Preview</span>
              </span>
              <span className="text-[10px] font-mono text-white/50">Runtime Canvas</span>
            </div>

            <div className="relative h-48 rounded-xl bg-black/60 border border-white/15 p-2 flex flex-col items-center justify-center shadow-inner overflow-hidden">
              <canvas
                ref={canvasRef}
                width={140}
                height={90}
                className="w-full h-32 object-contain rounded-lg drop-shadow-md"
              />
              <div className="mt-2 text-center">
                <span className="text-[10px] font-mono text-cyan-300 block">
                  R: Horiz Bend · G: Vert Bend · B: Specular
                </span>
                <span className="text-[9px] text-white/40">
                  Tabulated via Snell's Law &tan;(&theta; - r)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sliders Grid for Live Optics Tuning */}
        <div className="pt-2 border-t border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Optical Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* 1. Refraction */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-white/80 font-medium">Refraction Strength</span>
                <span className="font-mono text-cyan-300 font-bold">{refraction}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={refraction}
                onChange={(e) => setRefraction(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
              <span className="text-[10px] text-white/40 block">Maximum rim pixel displacement</span>
            </div>

            {/* 2. Bezel Ratio */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-white/80 font-medium">Bezel Width</span>
                <span className="font-mono text-cyan-300 font-bold">{bezel.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={bezel}
                onChange={(e) => setBezel(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
              <span className="text-[10px] text-white/40 block">Curved rim fraction (1 = full dome)</span>
            </div>

            {/* 3. Curvature Profile */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-white/80 font-medium">Curvature Exponent</span>
                <span className="font-mono text-cyan-300 font-bold">{curvature}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={curvature}
                onChange={(e) => setCurvature(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
              <span className="text-[10px] text-white/40 block">2 = spherical, 4 = visionOS squircle</span>
            </div>

            {/* 4. IOR */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-white/80 font-medium">Index of Refraction</span>
                <span className="font-mono text-cyan-300 font-bold">{ior.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.4"
                step="0.02"
                value={ior}
                onChange={(e) => setIor(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
              <span className="text-[10px] text-white/40 block">Crown glass = 1.52, Diamond = 2.42</span>
            </div>

            {/* 5. Chroma Fringe */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-white/80 font-medium">Chromatic Dispersion</span>
                <span className="font-mono text-cyan-300 font-bold">{chroma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.3"
                step="0.01"
                value={chroma}
                onChange={(e) => setChroma(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
              <span className="text-[10px] text-white/40 block">Spectral blue / red channel split</span>
            </div>

            {/* 6. Specular Highlight */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="text-white/80 font-medium">Specular Glare</span>
                <span className="font-mono text-cyan-300 font-bold">{specular.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={specular}
                onChange={(e) => setSpecular(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
              <span className="text-[10px] text-white/40 block">Anisotropic rim light intensity</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-white/50">Optical Presets:</span>
            {[
              {
                label: 'Apple visionOS Dome',
                params: { refraction: 24, bezel: 0.65, curvature: 4, ior: 1.52, chroma: 0.16, specular: 0.6, lightAngle: -120 },
              },
              {
                label: 'Crown Glass Lens',
                params: { refraction: 18, bezel: 0.5, curvature: 2, ior: 1.48, chroma: 0.08, specular: 0.45, lightAngle: -120 },
              },
              {
                label: 'Hyper-Prismatic Crystal',
                params: { refraction: 36, bezel: 0.85, curvature: 6, ior: 2.1, chroma: 0.28, specular: 0.9, lightAngle: -90 },
              },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  haptics.playClick();
                  setRefraction(preset.params.refraction);
                  setBezel(preset.params.bezel);
                  setCurvature(preset.params.curvature);
                  setIor(preset.params.ior);
                  setChroma(preset.params.chroma);
                  setSpecular(preset.params.specular);
                  setLightAngle(preset.params.lightAngle);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white/80 hover:text-white transition-colors cursor-pointer border border-white/10"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
