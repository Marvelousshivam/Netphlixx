import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Palette,
  Film,
  Volume2,
  VolumeX,
  Shield,
  X,
  Check,
  Sparkles,
  Sliders,
  User,
  Sun,
  Play,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../context/ToastContext';
import { haptics } from '../utils/audioHaptics';
import { squishTap, squishHover, mercurySpring } from '../utils/motionSprings';
import LiquidGlassOpticsLab from './LiquidGlassOpticsLab';
import MaterialYouStudio from './MaterialYouStudio';
import NothingGlyphStudio from './NothingGlyphStudio';
import ObsidianCinemaLab from './ObsidianCinemaLab';
import OledEfficiencyLab from './OledEfficiencyLab';
import SapphireHoloLab from './SapphireHoloLab';

const THEME_MATERIALS = [
  {
    id: 'obsidian',
    name: 'Obsidian Cinema',
    badge: 'Default',
    description: 'Deep #07080B matte void, technical 1px hair lines, iconic cinema darkroom.',
    previewBg: 'bg-[#07080B]',
    borderColor: 'border-white/15',
    accentDot: '#E50914',
  },
  {
    id: 'liquid-glass',
    name: 'Liquid Glass',
    badge: 'Apple visionOS',
    description: 'Living chromatic aurora, 3D cushion bevels, and squishy droplet physics.',
    previewBg: 'bg-gradient-to-br from-cyan-500/25 via-violet-500/20 to-rose-500/25 backdrop-blur-2xl',
    borderColor: 'border-cyan-400/50',
    accentDot: '#06B6D4',
  },
  {
    id: 'material-you',
    name: 'Material You',
    badge: 'M3 Expressive',
    description: 'Asymmetric squircles, dynamic shape morphing, and tonal Monet color harmony.',
    previewBg: 'bg-gradient-to-br from-[#1d1b20] via-[#25232a] to-[#141218]',
    borderColor: 'border-amber-400/40',
    accentDot: '#A8C7FA',
  },
  {
    id: 'oled',
    name: 'OLED Pitch Black',
    badge: 'Infinite Contrast',
    description: 'True #000000 canvas. Zero backlight bleed, maximum battery efficiency.',
    previewBg: 'bg-black',
    borderColor: 'border-[#222]',
    accentDot: '#F4F5F7',
  },
  {
    id: 'sapphire',
    name: 'Midnight Sapphire',
    badge: 'Cyber Cinema',
    description: 'Deep midnight navy void (#050814) with electric radiant cobalt highlights.',
    previewBg: 'bg-[#050814]',
    borderColor: 'border-blue-500/30',
    accentDot: '#3B82F6',
  },
  {
    id: 'nothing',
    name: 'Nothing OS',
    badge: 'GLYPH (2.5)',
    description: 'Monochromatic technical brutalism, Doto matrix typography, transparent hardware, and red diode accents.',
    previewBg: 'bg-[#000000]',
    borderColor: 'border-white/40',
    accentDot: '#D71921',
  },
];

const ACCENT_COLORS = [
  { name: 'Netflix Red', hex: '#E50914' },
  { name: 'Electric Blue', hex: '#2B82F6' },
  { name: 'Neon Amber', hex: '#FF9900' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Royal Violet', hex: '#8B5CF6' },
  { name: 'Cinema Gold', hex: '#F59E0B' },
];

const AMBILIGHT_LEVELS = [
  { id: 'off', label: 'Off', desc: 'No ambient light bleed' },
  { id: 'subtle', label: 'Subtle', desc: 'Default 25% atmospheric warmth' },
  { id: 'vivid', label: 'Theatrical Vivid', desc: 'Expansive 60% living room aura' },
];

// Apple visionOS Physical Mercury Capsule Switch
function AppleSwitch({ checked, onChange, ariaLabel }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => {
        haptics.playClick();
        onChange(!checked);
      }}
      className={`relative w-12 h-6.5 rounded-full p-0.5 transition-all duration-300 cursor-pointer flex-none flex items-center shadow-inner ${
        checked ? 'mercury-track-active' : 'mercury-track'
      }`}
    >
      <motion.div
        layout
        transition={mercurySpring}
        whileTap={{ scaleX: 1.35, scaleY: 0.78 }}
        className={`w-5 h-5 rounded-full shadow-md ${
          checked ? 'ml-auto bg-[#07080B]' : 'bg-white/95'
        }`}
      />
    </button>
  );
}

// Live Interactive Sandbox Preview Widget
function LiveSandboxPreview({ themeMaterial, accentColor, ambilightLevel, filmGrain }) {
  return (
    <div className="relative rounded-2xl overflow-hidden p-4 border border-white/15 bg-black/40 backdrop-blur-md shadow-xl select-none group">
      {/* Living Chromatic Aurora Simulation for Liquid Glass */}
      {themeMaterial === 'liquid-glass' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
          <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-cyan-500/40 blur-2xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-violet-500/40 blur-2xl" />
        </div>
      )}

      {/* Dynamic Monet Tonal Glow Simulation for Material You */}
      {themeMaterial === 'material-you' && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-60 mix-blend-screen"
          style={{
            background: `radial-gradient(circle at 70% 40%, color-mix(in srgb, ${accentColor} 35%, transparent) 0%, transparent 75%)`,
          }}
        />
      )}

      {/* Nothing OS Stipple Grid Simulation */}
      {themeMaterial === 'nothing' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
      )}

      {/* Dynamic Simulated Ambilight Glow */}
      {ambilightLevel !== 'off' && (
        <div
          className={`absolute -inset-2 rounded-2xl filter blur-2xl pointer-events-none transition-all duration-700 mix-blend-screen ${
            ambilightLevel === 'vivid' ? 'opacity-80' : 'opacity-40'
          }`}
          style={{
            background: `radial-gradient(circle at 60% 30%, ${accentColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Simulated 35mm Film Grain Overlay if enabled */}
      {filmGrain && (
        <div
          className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Header Eyebrow */}
      <div className="relative z-20 flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          Live Sandbox Preview
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full apple-glass-pill text-white/90">
          {themeMaterial.toUpperCase()}
        </span>
      </div>

      {/* Mini Media Card Preview */}
      <div className="relative z-20 flex items-center space-x-3.5 p-2.5 rounded-xl apple-glass poster-card">
        <div className="relative w-14 aspect-video rounded-lg overflow-hidden bg-[#181a22] flex-none border border-white/10 shadow">
          <div
            className="w-full h-full flex items-center justify-center text-white/40 font-black text-xs"
            style={{ backgroundColor: accentColor }}
          >
            <Play className="w-4 h-4 fill-white text-white opacity-80" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h5 className="text-xs font-bold text-white truncate font-display">
            The Dark Knight
          </h5>
          <span className="text-[10px] text-[#8a8a93] font-medium block">
            4K UHD • 2008 • Action
          </span>
        </div>

        <motion.button
          whileHover={squishHover}
          whileTap={squishTap}
          onClick={() => haptics.playClick()}
          style={{ backgroundColor: accentColor }}
          className="cta-shine m3-btn-fab px-3 py-1.5 rounded-full text-white text-[11px] font-bold shadow-md cursor-pointer flex-none flex items-center space-x-1 squish-btn"
        >
          <Play className="w-3 h-3 fill-current ml-0.5" />
          <span>Play</span>
        </motion.button>
      </div>
    </div>
  );
}

export default function SettingsCommandModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('themes');

  const [themeMaterial, setThemeMaterial] = useLocalStorage('netphlix_theme_material', 'obsidian');
  const [accentColor, setAccentColor] = useLocalStorage('netphlix_accent', '#E50914');
  const [filmGrain, setFilmGrain] = useLocalStorage('netphlix_film_grain', false);
  const [ambilightLevel, setAmbilightLevel] = useLocalStorage('netphlix_ambilight_level', 'subtle');
  const [soundEnabled, setSoundEnabled] = useLocalStorage('netphlix_sound_enabled', false);

  // Sync HTML data-theme on change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeMaterial);
    }
  }, [themeMaterial]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTheme = (id, name) => {
    setThemeMaterial(id);
    haptics.playClick();
    showToast({
      title: 'Material Theme Activated',
      message: `${name} material applied across all surfaces`,
      type: 'magic',
    });
  };

  const handleSelectAccent = (color) => {
    setAccentColor(color.hex);
    haptics.playClick();
    showToast({
      title: 'Accent Color Updated',
      message: `Theme accent set to ${color.name}`,
      type: 'info',
    });
  };

  const toggleSound = (val) => {
    setSoundEnabled(val);
    haptics.setEnabled(val);
    showToast({
      title: val ? 'Interface Audio ON' : 'Interface Audio Muted',
      message: val ? 'Tactile Web Audio feedback active' : 'Silent browsing restored',
      type: 'magic',
    });
  };

  const testAudio = () => {
    haptics.playChime();
    showToast({
      title: 'Audio Synthesizer Test',
      message: 'Dual-tone 587Hz/880Hz harmonic chime played',
      type: 'magic',
    });
  };

  const toggleGrain = (val) => {
    setFilmGrain(val);
    showToast({
      title: val ? '35mm Film Grain ON' : 'Film Grain Disabled',
      message: val ? 'Analog film stock texture enabled' : 'Clean vector surface restored',
      type: 'info',
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="relative w-full max-w-4xl max-h-[90vh] apple-glass rounded-[28px] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col border border-white/20"
      >
        {/* Header Bar */}
        <div className="px-5 md:px-7 py-4 border-b border-white/[0.08] flex items-center justify-between flex-none bg-[#07080B]/50 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full apple-glass-pill flex items-center justify-center text-white/90">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold font-display text-white tracking-tight">
                Settings & Visual Aesthetics
              </h2>
              <p className="text-[11px] text-[#8a8a93] font-medium hidden sm:block">
                Pure Apple visionOS Liquid Glass optics and physical micro-controls
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-full apple-glass-pill text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Modal Body: Left Tab Rail + Right Tab Content */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Navigation Tab Bar with Smooth layoutId Gliding Lozenge */}
          <nav
            aria-label="Settings Categories"
            className="flex md:flex-col p-2.5 md:p-3.5 space-x-1.5 md:space-x-0 md:space-y-1.5 border-b md:border-b-0 md:border-r border-white/[0.08] flex-none md:w-56 overflow-x-auto md:overflow-x-visible scrollbar-hide bg-white/[0.02]"
          >
            {[
              { id: 'themes', label: 'Themes & Materials', icon: Palette },
              { id: 'atmosphere', label: 'Atmosphere & Light', icon: Film },
              { id: 'sound', label: 'Audio & Haptics', icon: Volume2 },
              { id: 'playback', label: 'Playback & Profile', icon: Shield },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    haptics.playClick();
                  }}
                  className={`relative flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex-none md:w-full text-left z-10 ${
                    isActive ? 'text-[#07080B] font-bold' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="settingsNavActive"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      className="absolute inset-0 bg-white rounded-xl -z-10 shadow-md"
                    />
                  )}
                  <Icon className="w-4 h-4 flex-none" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Panel Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide space-y-6">
            {/* TAB 1: THEMES & MATERIALS */}
            {activeTab === 'themes' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs uppercase tracking-widest text-[#8a8a93] font-bold">
                      Material System (5)
                    </label>
                    <span className="text-[11px] text-white/50">Instant Real-time preview</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {THEME_MATERIALS.map((theme) => {
                      const isSelected = themeMaterial === theme.id;
                      return (
                        <motion.div
                          key={theme.id}
                          whileHover={{ y: -3, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectTheme(theme.id, theme.name)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                            isSelected
                              ? 'bg-white/15 border-white ring-1 ring-white/30 shadow-xl'
                              : 'apple-glass border-white/[0.08] hover:border-white/25 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center space-x-2">
                              <span
                                className="w-3 h-3 rounded-full flex-none shadow-sm"
                                style={{ backgroundColor: theme.accentDot }}
                              />
                              <h4 className="text-xs font-bold text-white font-display">
                                {theme.name}
                              </h4>
                            </div>
                            <span
                              className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                                isSelected
                                  ? 'bg-white text-[#07080B]'
                                  : 'bg-white/10 text-white/70'
                              }`}
                            >
                              {theme.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                            {theme.description}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Colors Palette */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#8a8a93] font-bold mb-3 block">
                    Accent Hue Palette
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {ACCENT_COLORS.map((c) => {
                      const isSelected = accentColor === c.hex;
                      return (
                        <motion.button
                          key={c.hex}
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleSelectAccent(c)}
                          className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white/15 border-white text-white shadow-md'
                              : 'apple-glass border-white/10 text-white/70 hover:bg-white/[0.08]'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full flex-none shadow-sm"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="truncate">{c.name}</span>
                          {isSelected && <Check className="w-3 h-3 ml-auto text-white" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Dedicated Theme Studio */}
                {themeMaterial === 'nothing' ? (
                  <NothingGlyphStudio />
                ) : themeMaterial === 'material-you' ? (
                  <MaterialYouStudio accentColor={accentColor} />
                ) : themeMaterial === 'obsidian' ? (
                  <ObsidianCinemaLab />
                ) : themeMaterial === 'oled' ? (
                  <OledEfficiencyLab />
                ) : themeMaterial === 'sapphire' ? (
                  <SapphireHoloLab />
                ) : (
                  <LiquidGlassOpticsLab />
                )}

                {/* Live Sandbox Preview Widget */}
                <LiveSandboxPreview
                  themeMaterial={themeMaterial}
                  accentColor={accentColor}
                  ambilightLevel={ambilightLevel}
                  filmGrain={filmGrain}
                />
              </motion.div>
            )}

            {/* TAB 2: ATMOSPHERE & LIGHT */}
            {activeTab === 'atmosphere' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* 35mm Analog Film Grain Card with Apple Switch */}
                <div className="apple-glass rounded-2xl p-4 md:p-5 border border-white/15 shadow-lg flex items-center justify-between gap-4">
                  <div className="flex-1 pr-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Sparkles className="w-4 h-4 text-[#FFB800]" />
                      <h4 className="text-sm font-bold text-white font-display">
                        35mm Analog Film Grain
                      </h4>
                    </div>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Organic subtle noise overlay to eliminate flat digital vector smoothness and
                      reintroduce cinematic 35mm film stock warmth.
                    </p>
                  </div>

                  <AppleSwitch
                    checked={filmGrain}
                    onChange={toggleGrain}
                    ariaLabel="Toggle 35mm Film Grain"
                  />
                </div>

                {/* Living Ambilight Dial */}
                <div className="apple-glass rounded-2xl p-4 md:p-5 border border-white/15 shadow-lg space-y-3">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-[#06B6D4]" />
                    <h4 className="text-sm font-bold text-white font-display">
                      Living Ambilight Projection
                    </h4>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">
                    Dynamic ambient lighting extracted in real-time from poster and player backdrops.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    {AMBILIGHT_LEVELS.map((lvl) => {
                      const isSelected = ambilightLevel === lvl.id;
                      return (
                        <motion.div
                          key={lvl.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAmbilightLevel(lvl.id);
                            haptics.playClick();
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-white/15 border-white text-white shadow-md'
                              : 'apple-glass border-white/[0.08] text-white/70 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{lvl.label}</span>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-[10px] text-[#8a8a93] leading-tight block">
                            {lvl.desc}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Dedicated Theme Studio */}
                {themeMaterial === 'nothing' ? (
                  <NothingGlyphStudio />
                ) : themeMaterial === 'material-you' ? (
                  <MaterialYouStudio accentColor={accentColor} />
                ) : themeMaterial === 'obsidian' ? (
                  <ObsidianCinemaLab />
                ) : themeMaterial === 'oled' ? (
                  <OledEfficiencyLab />
                ) : themeMaterial === 'sapphire' ? (
                  <SapphireHoloLab />
                ) : (
                  <LiquidGlassOpticsLab />
                )}

                {/* Live Sandbox Preview Widget */}
                <LiveSandboxPreview
                  themeMaterial={themeMaterial}
                  accentColor={accentColor}
                  ambilightLevel={ambilightLevel}
                  filmGrain={filmGrain}
                />
              </motion.div>
            )}

            {/* TAB 3: AUDIO & HAPTICS */}
            {activeTab === 'sound' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="apple-glass rounded-2xl p-4 md:p-5 border border-white/15 shadow-lg flex items-center justify-between gap-4">
                  <div className="flex-1 pr-3">
                    <div className="flex items-center space-x-2 mb-1">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-white/50" />
                      )}
                      <h4 className="text-sm font-bold text-white font-display">
                        Tactile Audio Feedback
                      </h4>
                    </div>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Zero-asset Web Audio synthesis. Delivers mechanical micro-clicks on button
                      taps and harmonic chimes on Watchlist addition without downloading any files.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {soundEnabled && (
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={testAudio}
                        className="px-3.5 py-1.5 rounded-full apple-glass-pill text-xs font-semibold text-white/90 hover:text-white cursor-pointer"
                        title="Play sample sound"
                      >
                        Test Chime
                      </motion.button>
                    )}

                    <AppleSwitch
                      checked={soundEnabled}
                      onChange={toggleSound}
                      ariaLabel="Toggle Interface Audio"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl apple-glass border border-white/[0.08] text-xs text-[#8a8a93] space-y-1.5">
                  <span className="font-semibold text-white block">Designed for Zero-Friction:</span>
                  <p>
                    Audio haptics are synthesized entirely on your device’s GPU/Audio processor in
                    under 1 millisecond. They never compete with movie playback or background music.
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB 4: PLAYBACK & PROFILE */}
            {activeTab === 'playback' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="apple-glass rounded-2xl p-4 md:p-5 border border-white/15 shadow-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">
                      Watchlist & Viewing History
                    </h4>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      Review completed movies, continue watching bookmarks, and profile stats.
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      onClose();
                      navigate('/profile');
                    }}
                    className="px-4 py-2 rounded-full bg-white text-[#07080B] text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer hover:opacity-90"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </motion.button>
                </div>

                <div className="apple-glass rounded-2xl p-4 md:p-5 border border-white/15 shadow-lg space-y-2">
                  <h4 className="text-sm font-bold text-white font-display">
                    Streaming Failover Engine
                  </h4>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    Netphlix integrates 7 verified high-speed failover providers (VidLink Pro, VidEasy,
                    VidSrc Official, 2Embed Cloud, VidCore Edge, 2Embed Mirror, NontonGo).
                  </p>
                  <p className="text-[11px] text-[#8a8a93] pt-1">
                    Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">S</kbd> while watching to cycle streaming servers instantly.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="px-6 py-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#8a8a93] bg-[#07080B]/50 backdrop-blur-xl">
          <span>Netphlix Architecture • VisionOS Liquid Glass</span>
          <button
            onClick={onClose}
            className="text-white hover:underline font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
