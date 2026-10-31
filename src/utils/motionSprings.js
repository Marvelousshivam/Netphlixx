/**
 * Genjutsu Motion Physics: Incompressible Fluid & Droplet Motion Tokens
 * Authored in alignment with AThevon/genjutsu & Leonxlnx/taste-skill
 */

// Incompressible liquid droplet squash-and-stretch on click/tap
export const squishTap = {
  scaleX: 1.055,
  scaleY: 0.875,
  y: 1.5,
  transition: {
    type: 'spring',
    stiffness: 650,
    damping: 14,
    mass: 0.45,
  },
};

// Buoyant float on hover with slight vertical elongation
export const squishHover = {
  scaleX: 1.015,
  scaleY: 1.025,
  y: -3,
  transition: {
    type: 'spring',
    stiffness: 450,
    damping: 18,
    mass: 0.6,
  },
};

// Fluid pill button tap (for capsules and lozenges)
export const pillTap = {
  scaleX: 1.04,
  scaleY: 0.9,
  y: 1,
  transition: {
    type: 'spring',
    stiffness: 700,
    damping: 15,
    mass: 0.4,
  },
};

// Mercury sliding transition for knobs and segment markers
export const mercurySpring = {
  type: 'spring',
  stiffness: 550,
  damping: 24,
  mass: 0.7,
};

// Jelly rebound transition when settling from active state
export const jellyRebound = {
  type: 'spring',
  stiffness: 500,
  damping: 14,
  mass: 0.5,
};
