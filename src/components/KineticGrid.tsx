import { useEffect, useRef } from 'react';

// Reactive kinetic canvas grid: dots attract toward the cursor, mesh lines
// animate, plus a subtle cursor trail. Fixed full-screen background layer.
export default function KineticGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setSize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    interface P { ox: number; oy: number; x: number; y: number; vx: number; vy: number; }
    let pts: P[] = [];
    const gap = 46;

    const build = () => {
      pts = [];
      for (let y = -gap; y < h + gap; y += gap) {
        for (let x = -gap; x < w + gap; x += gap) {
          pts.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
        }
      }
    };

    const mouse = { x: -9999, y: -9999 };
    const trail: { x: number; y: number; a: number }[] = [];
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      trail.push({ x: e.clientX, y: e.clientY, a: 1 });
      if (trail.length > 20) trail.shift();
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', setSize);
    setSize();

    const colors = ['#D9FFF4', '#EEF8CD', '#FFC5AA'];
    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.round(w / gap) + 3;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160 && dist > 0.01) {
          const force = (160 - dist) / 160;
          p.vx += (dx / dist) * force * 1.6;
          p.vy += (dy / dist) * force * 1.6;
        }
        // spring home
        p.vx += (p.ox - p.x) * 0.045;
        p.vy += (p.oy - p.y) * 0.045;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;
      }

      // mesh lines
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const right = pts[i + 1];
        const down = pts[i + cols];
        const disp = Math.min(1, (Math.abs(p.x - p.ox) + Math.abs(p.y - p.oy)) / 40);
        if (right && (i + 1) % cols !== 0) {
          ctx.strokeStyle = `rgba(217,255,244,${0.05 + disp * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(right.x, right.y);
          ctx.stroke();
        }
        if (down) {
          ctx.strokeStyle = `rgba(238,248,205,${0.04 + disp * 0.3})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(down.x, down.y);
          ctx.stroke();
        }
      }

      // dots
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const disp = Math.min(1, (Math.abs(p.x - p.ox) + Math.abs(p.y - p.oy)) / 30);
        const r = 0.7 + disp * 2.2;
        ctx.fillStyle = disp > 0.15 ? colors[i % 3] : 'rgba(217,255,244,0.25)';
        ctx.globalAlpha = 0.3 + disp * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // cursor trail
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        t.a *= 0.9;
        ctx.fillStyle = `rgba(255,197,170,${t.a * 0.5})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.a * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return <canvas ref={canvasRef} className="kinetic-grid" />;
}
