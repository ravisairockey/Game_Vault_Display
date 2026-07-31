import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.body.classList.add('has-custom-cursor');

    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const t = e.target as HTMLElement;
      setHovering(!!t.closest('a,button,[data-cursor]'));
    };
    window.addEventListener('mousemove', move);

    let raf = 0;
    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.18;
      ring.current.y += (pos.current.y - ring.current.y) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
      document.body.classList.remove('has-custom-cursor');
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{ opacity: hovering ? 0 : 1 }}
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{
          width: hovering ? 56 : 30,
          height: hovering ? 56 : 30,
          borderColor: hovering ? '#FFC5AA' : 'rgba(217,255,244,0.7)',
          background: hovering ? 'rgba(255,197,170,0.08)' : 'transparent',
        }}
      />
    </>
  );
}
