# Netphlix Master Design System (Obsidian Cinema)

*Established in accordance with `Leonxlnx/taste-skill` and `AThevon/genjutsu`.*

## 1. Color Palette & Atmospheric Depth
- **Canvas Obsidian**: `#07080B` — Absolute dark base, eliminates muddy gray washes.
- **Surface Dark**: `#0E1015` — Primary card and container background.
- **Surface Elevated**: `#151821` — Elevated drawers, modals, and spotlight banners.
- **Surface Glass**: `rgba(14, 16, 21, 0.75)` with `backdrop-filter: blur(20px)`.
- **Specular Rim Border**: `rgba(255, 255, 255, 0.08)` (default) / `rgba(255, 255, 255, 0.18)` (hover).
- **Brand Ruby**: `#E50914` — Iconic focal accent for active states and primary brand signifiers.
- **Star Amber**: `#FFB800` — High-legibility warmth for ratings and accolades.
- **Platinum High-Contrast**: `#F4F5F7` — Primary headings and call-to-action text.
- **Slate Secondary**: `#9CA3AF` — Synopses, subtitles, and secondary navigation.
- **Muted Carbon**: `#525866` — Timestamps, dividers, and low-priority labels.

## 2. Typography Hierarchy
- **Display Headings**: `font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: -0.03em;`
- **Section Headers**: `font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.5rem / 24px;`
- **Micro-Eyebrows / Badges**: `font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.6875rem / 11px; letter-spacing: 0.2em; text-transform: uppercase;`
- **Body & Synopsis**: `font-family: 'Inter', sans-serif; font-weight: 400; line-height: 1.6; color: #9CA3AF;`

## 3. Motion & Interaction Specifications
- **Spring Preset (Tactile)**:
  `{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }`
- **Card Hover Physics**:
  - `scale: 1.04`
  - `translateY: -4px`
  - `box-shadow: 0 20px 40px -10px rgba(0,0,0,0.8), 0 0 25px rgba(229,9,20,0.12)`
  - `ring-1 ring-white/20`
  - Contextual action bar fades in via opacity (`duration: 0.2s`).
- **Page Transitions**:
  `{ initial: { opacity: 0, scale: 0.99 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 0.28, ease: "easeOut" } }`
- **Ambient Light (Ambilight)**:
  Hero and video players project their dominant color into a radial aura:
  `background: radial-gradient(circle at 60% 30%, ${ambientColor} 0%, transparent 70%); mix-blend-mode: screen; opacity: 0.35;`
