// Lightweight, zero-asset Web Audio API synthesizer for tactile UI clicks and chimes
class AudioHapticsEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    if (typeof window !== 'undefined') {
      try {
        this.enabled = localStorage.getItem('netphlix_sound_enabled') === 'true';
      } catch {
        this.enabled = false;
      }
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('netphlix_sound_enabled', this.enabled ? 'true' : 'false');
      } catch {
        // ignore
      }
    }
    if (this.enabled) {
      this.init();
      this.playChime();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(350, t + 0.035);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.035);
    } catch {
      // ignore audio errors
    }
  }

  playChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, t);

      gain1.gain.setValueAtTime(0.05, t);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.35);

      // Note 2: 880 Hz (A5) slightly delayed
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, t + 0.07);

      gain2.gain.setValueAtTime(0.0001, t);
      gain2.gain.setValueAtTime(0.06, t + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.07);
      osc2.stop(t + 0.45);
    } catch {
      // ignore audio errors
    }
  }
}

export const haptics = new AudioHapticsEngine();
