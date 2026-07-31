import { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  className?: string;
  accent?: string;
}

// Smokey text reveal + ink underline that draws in when scrolled into view.
export default function SmokeyHeading({ text, className = '', accent = '#D9FFF4' }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <h2 ref={ref} className={`smokey-heading ${visible ? 'is-visible' : ''} ${className}`}>
      <span className="smokey-words">
        {text.split(' ').map((word, wi) => (
          <span key={wi} className="smokey-word">
            <span className="smokey-inner" style={{ transitionDelay: `${wi * 0.08}s` }}>
              {word}
            </span>{' '}
          </span>
        ))}
      </span>
      <span className="ink-underline" style={{ background: accent }} />
    </h2>
  );
}
