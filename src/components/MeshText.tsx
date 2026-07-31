import { useEffect, useRef } from 'react';

interface Props {
  text: string;
  fontSize?: number;
  className?: string;
}

// Warp text on a canvas mesh that drags and springs back under the cursor,
// with chromatic color-split fringes cycling through the palette.
export default function MeshText({ text, fontSize = 120 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const off = document.createElement('canvas');
    const octx = off.getContext('2d')!;

    const draw = () => {
      octx.clearRect(0, 0, off.width, off.height);
      octx.fillStyle = '#fff';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      let fs = fontSize;
      octx.font = `800 ${fs}px 'Clash Display', sans-serif`;
      while (octx.measureText(text).width > off.width * 0.9 && fs > 20) {
        fs -= 4;
        octx.font = `800 ${fs}px 'Clash Display', sans-serif`;
      }
      octx.fillText(text, off.width / 2, off.height / 2);
    };

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      off.width = w * dpr;
      off.height = h * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: -9999, y: -9999, active: false };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * dpr;
      mouse.y = (e.clientY - r.top) * dpr;
      mouse.active = true;
    };
    const onLeave = () => (mouse.active = false);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    const cols = 22;
    const rows = 8;
    interface Node { ox: number; oy: number; x: number; y: number; vx: number; vy: number; }
    let grid: Node[] = [];
    const buildGrid = () => {
      grid = [];
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = (c / cols) * off.width;
          const y = (r / rows) * off.height;
          grid.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
        }
      }
    };
    buildGrid();
    const resizeGrid = () => buildGrid();
    window.addEventListener('resize', resizeGrid);

    let hue = 0;
    let raf = 0;
    const loop = () => {
      hue += 0.01;
      for (const n of grid) {
        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const R = 180 * dpr;
          if (d < R && d > 0.01) {
            const f = (R - d) / R;
            n.vx += (dx / d) * f * 6;
            n.vy += (dy / d) * f * 6;
          }
        }
        n.vx += (n.ox - n.x) * 0.08;
        n.vy += (n.oy - n.y) * 0.08;
        n.vx *= 0.8;
        n.vy *= 0.8;
        n.x += n.vx;
        n.y += n.vy;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cw = off.width / cols;
      const ch = off.height / rows;
      const fringe = 3 * dpr + Math.sin(hue) * 2 * dpr;

      const drawWarp = (dx: number, dy: number, comp: GlobalCompositeOperation, style: string) => {
        ctx.globalCompositeOperation = comp;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const i = r * (cols + 1) + c;
            const tl = grid[i];
            const tr = grid[i + 1];
            const bl = grid[i + cols + 1];
            const sx = c * cw;
            const sy = r * ch;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(tl.x + dx, tl.y + dy);
            ctx.lineTo(tr.x + dx, tr.y + dy);
            ctx.lineTo(bl.x + dx, bl.y + dy);
            ctx.closePath();
            ctx.clip();
            const denom = cw;
            const a = (tr.x - tl.x) / denom;
            const b = (tr.y - tl.y) / denom;
            const cc = (bl.x - tl.x) / ch;
            const d = (bl.y - tl.y) / ch;
            ctx.transform(a, b, cc, d, tl.x + dx, tl.y + dy);
            ctx.drawImage(off, sx, sy, cw + 1, ch + 1, sx, sy, cw + 1, ch + 1);
            ctx.restore();
          }
        }
        ctx.globalCompositeOperation = 'source-over';
      };

      // chromatic split — tint via composite fills would be heavy; approximate
      // with offset white copies then overlay palette gradient.
      ctx.globalAlpha = 0.85;
      drawWarp(-fringe, 0, 'lighter', '');
      drawWarp(fringe, 0, 'lighter', '');
      drawWarp(0, 0, 'source-over', '');
      ctx.globalAlpha = 1;

      // palette overlay
      ctx.globalCompositeOperation = 'source-atop';
      const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
      const shift = (Math.sin(hue) + 1) / 2;
      g.addColorStop(0, '#D9FFF4');
      g.addColorStop(Math.max(0.01, Math.min(0.99, 0.4 + shift * 0.2)), '#EEF8CD');
      g.addColorStop(1, '#FFC5AA');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', resizeGrid);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [text, fontSize]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
