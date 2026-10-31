import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HlsPlayer({ src, className, autoPlay = true, controls = true }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          videoRef.current.play().catch(() => {});
        }
      });
      return () => {
        hls.destroy();
      };
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', () => {
        if (autoPlay) {
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls={controls}
      playsInline
      autoPlay={autoPlay}
    />
  );
}
