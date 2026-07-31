import { useRef, useState } from 'react';
import type { Game } from '../lib/types';

interface Props {
  game: Game;
  index: number;
}

// Cinematic interactive card with liquid image-distortion hover (SVG
// turbulence displacement) + hover-follow 3D tilt.
export default function GameCard({ game, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [hover, setHover] = useState(false);
  const filterId = `liquid-${game.id}`;

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -14;
    const ry = (px - 0.5) * 16;
    setStyle({
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(14px)`,
    });
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };

  const reset = () => {
    setStyle({ transform: 'perspective(900px) rotateX(0) rotateY(0)' });
    setHover(false);
  };

  return (
    <div
      ref={ref}
      className="game-card"
      style={{ ...style, animationDelay: `${(index % 8) * 0.05}s`, borderColor: hover ? game.accent : undefined }}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={reset}
      data-cursor
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency={hover ? '0.012 0.02' : '0'} numOctaves="2" result="noise">
            {hover && (
              <animate attributeName="baseFrequency" dur="8s" values="0.008 0.014;0.016 0.024;0.008 0.014" repeatCount="indefinite" />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={hover ? 18 : 0} />
        </filter>
      </svg>

      <div className="game-card-rank" style={{ color: game.accent }}>
        {String(game.rank).padStart(2, '0')}
      </div>

      <div
        className="game-card-art"
        style={{
          filter: `url(#${filterId})`,
          background: `radial-gradient(120% 90% at var(--mx,50%) var(--my,50%), ${game.accent}44, transparent 60%), linear-gradient(135deg, ${game.accent}22, #0c0c10)`,
        }}
      >
        <span className="game-card-glyph" style={{ color: game.accent }}>
          {game.title.charAt(0)}
        </span>
      </div>

      <div className="game-card-body">
        <h3 className="game-card-title">
          {game.nsfw && <span className="nsfw-tag">18+</span>}
          {game.title}
        </h3>
        <div className="game-card-meta">
          <span style={{ color: game.accent }}>{game.size_gb} GB</span>
          <span className="game-card-status">{game.status}</span>
        </div>
      </div>
      <div className="game-card-sheen" style={{ background: `radial-gradient(300px circle at var(--mx,50%) var(--my,50%), ${game.accent}22, transparent 65%)` }} />
    </div>
  );
}
