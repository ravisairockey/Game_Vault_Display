import { useEffect, useRef } from 'react';

interface Props {
  words: string[];
  className?: string;
  height?: number;
}

// Text that dissolves into drifting particles and reassembles as the next word.
export default function TextVaporize({ words, height = 90 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    const h = height;

    const resize = () => {
      w = canvas.offsetWidth;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number; y: number; tx: number; ty: number;
      vx: number; vy: number; color: string; home: boolean;
    }
    let particles: Particle[] = [];
    const colors = ['#D9FFF4', '#EEF8CD', '#FFC5AA'];

    const sampleWord = (word: string) => {
      const off = document.createElement('canvas');
      off.width = Math.max(200, w);
      off.height = h;
      const octx = off.getContext('2d')!;
      octx.fillStyle = '#fff';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      let fs = 62;
      octx.font = `800 ${fs}px 'Clash Display', sans-serif`;
      while (octx.measureText(word).width > off.width * 0.92 && fs > 14) {
        fs -= 2;
        octx.font = `800 ${fs}px 'Clash Display', sans-serif`;
      }
      octx.fillText(word, off.width / 2, h / 2);
      const data = octx.getImageData(0, 0, off.width, h).data;
      const targets: { x: number; y: number }[] = [];
      const step = 4;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 128) {
            targets.push({ x: x * (w / off.width), y });
          }
        }
      }
      return targets;
    };

    let wi = 0;
    const assignWord = (word: string) => {
      const targets = sampleWord(word);
      const next: Particle[] = [];
      for (let i = 0; i < targets.length; i++) {
        const src = particles[i];
        next.push({
          x: src ? src.x : Math.random() * w,
          y: src ? src.y : Math.random() * h,
          tx: targets[i].x,
          ty: targets[i].y,
          vx: 0, vy: 0,
          color: colors[i % 3],
          home: false,
        });
      }
      particles = next;
    };
    assignWord(words[0]);

    let phase: 'form' | 'hold' | 'vapor' = 'form';
    let timer = 0;
    let raf = 0;

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      timer++;

      if (phase === 'hold' && timer > 120) {
        phase = 'vapor';
        timer = 0;
        for (const p of particles) {
          p.vx = (Math.random() - 0.5) * 5;
          p.vy = -Math.random() * 4 - 1;
        }
      } else if (phase === 'vapor' && timer > 55) {
        wi = (wi + 1) % words.length;
        assignWord(words[wi]);
        phase = 'form';
        timer = 0;
      }

      let settled = 0;
      for (const p of particles) {
        if (phase === 'vapor') {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04;
          p.vx *= 0.99;
        } else {
          p.vx += (p.tx - p.x) * 0.08;
          p.vy += (p.ty - p.y) * 0.08;
          p.vx *= 0.72;
          p.vy *= 0.72;
          p.x += p.vx;
          p.y += p.vy;
          if (Math.abs(p.tx - p.x) < 0.6 && Math.abs(p.ty - p.y) < 0.6) settled++;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = phase === 'vapor' ? Math.max(0, 1 - timer / 55) : 1;
        ctx.fillRect(p.x, p.y, 2.4, 2.4);
      }
      ctx.globalAlpha = 1;

      if (phase === 'form' && settled > particles.length * 0.9) {
        phase = 'hold';
        timer = 0;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [words, height]);

  return <canvas ref={canvasRef} style={{ width: '100%', height }} />;
}
