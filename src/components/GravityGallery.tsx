import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import type { Todo } from '../lib/types';

interface Props {
  todos: Todo[];
}

// Drop todo tiles into a Matter.js physics world with gravity, walls, and
// click-drag tossing.
export default function GravityGallery({ todos }: Props) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sceneRef.current!;
    const W = el.clientWidth;
    const H = el.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const engine = Matter.Engine.create();
    engine.gravity.y = 0.9;
    const render = Matter.Render.create({
      element: el,
      engine,
      options: {
        width: W,
        height: H,
        wireframes: false,
        background: 'transparent',
        pixelRatio: dpr,
      },
    });

    const wallOpts = { isStatic: true, render: { visible: false } };
    const walls = [
      Matter.Bodies.rectangle(W / 2, H + 30, W + 100, 60, wallOpts),
      Matter.Bodies.rectangle(-30, H / 2, 60, H * 2, wallOpts),
      Matter.Bodies.rectangle(W + 30, H / 2, 60, H * 2, wallOpts),
      Matter.Bodies.rectangle(W / 2, -200, W + 100, 60, wallOpts),
    ];
    Matter.World.add(engine.world, walls);

    const palette = ['#EEF8CD', '#FFC5AA', '#D9FFF4'];
    const items = todos.length ? todos : [{ id: 0, task: 'Add a quest \u2192', done: false, seconds: 0 }];
    const bodies = items.map((t, i) => {
      const size = 66 + Math.min(60, t.task.length * 1.5);
      const circle = i % 2 === 0;
      const color = palette[i % 3];
      const common = {
        restitution: 0.55,
        friction: 0.2,
        render: {
          fillStyle: t.done ? '#2a2a30' : color,
          strokeStyle: color,
          lineWidth: 2,
        },
      };
      const x = 40 + Math.random() * (W - 80);
      const y = -Math.random() * 300 - 40;
      return circle
        ? Matter.Bodies.circle(x, y, size / 2, common)
        : Matter.Bodies.rectangle(x, y, size, size, { ...common, chamfer: { radius: 10 } });
    });
    Matter.World.add(engine.world, bodies);

    const mouse = Matter.Mouse.create(render.canvas);
    const mc = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.World.add(engine.world, mc);
    // allow page scroll over canvas
    mouse.element.removeEventListener('wheel', (mouse as any).mousewheel);

    // label overlay drawing
    const ctx = render.context;
    Matter.Events.on(render, 'afterRender', () => {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "600 12px 'Space Mono', monospace";
      bodies.forEach((b, i) => {
        const t = items[i];
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(b.angle);
        ctx.fillStyle = t.done ? '#EEF8CD' : '#111';
        const label = t.task.length > 16 ? t.task.slice(0, 15) + '\u2026' : t.task;
        ctx.fillText(label, 0, 0);
        ctx.restore();
      });
      ctx.restore();
    });

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      (render as any).textures = {};
    };
  }, [todos]);

  return <div ref={sceneRef} className="gravity-scene" />;
}
