import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * Optical SVG Refraction Filter for Liquid Glass (Inspired by liquidglass.dev & visionOS)
 * Uses feDisplacementMap and feTurbulence with sRGB color interpolation
 * to simulate real optical physics and physical light-bending glass.
 */
export default function LiquidGlassFilter() {
  const [themeMaterial] = useLocalStorage('netphlix_theme_material', 'obsidian');

  if (themeMaterial !== 'liquid-glass') {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <defs>
        {/* Optical Lens Refraction Filter: Micro-bends background pixels along an organic fluid field */}
        <filter id="liquid-glass-refraction" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="2"
            result="noiseMap"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noiseMap"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Squishy Caustic Lens Filter for buttons and interactive pills */}
        <filter id="liquid-squish-lens" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.025"
            numOctaves="1"
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="B"
          />
        </filter>
      </defs>
    </svg>
  );
}
