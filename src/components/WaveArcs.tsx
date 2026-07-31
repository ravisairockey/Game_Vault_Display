import { useEffect, useRef } from 'react';

// Wave arc canvas background — flowing layered sine arcs that drift and
// gently follow the horizontal cursor position.
export default function WaveArcs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let mx = 0.5;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
    };
    window.addEventListener('mousemove', onMove);

    const colors = ['#D9FFF4', '#EEF8CD', '#FFC5AA'];
    let t = 0;
    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.006;
      for (let l = 0; l < 5; l++) {
        ctx.beginPath();
        const amp = 22 + l * 10;
        const base = h * (0.35 + l * 0.13);
        const phase = t + l * 0.7 + mx * 1.5;
        for (let x = 0; x <= w; x += 6) {
          const y =
            base +
            Math.sin(x * 0.008 + phase) * amp +
            Math.sin(x * 0.02 + phase * 1.7) * (amp * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = colors[l % 3];
        ctx.globalAlpha = 0.10 + l * 0.03;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="wave-arcs" />;
}
