import { useRef, useState } from 'react';

interface Props {
  text: string;
  className?: string;
}

// Swap each letter vertically on hover, revealing a duplicate glyph in a
// randomized, staggered order.
export default function RandomLetterSwap({ text, className = '' }: Props) {
  const [active, setActive] = useState(false);
  const delays = useRef<number[]>(
    text.split('').map(() => Math.random() * 0.35)
  );

  return (
    <span
      className={`rls ${className}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      data-cursor
    >
      {text.split('').map((ch, i) => (
        <span key={i} className="rls-char">
          <span
            className="rls-inner"
            style={{
              transitionDelay: `${delays.current[i]}s`,
              transform: active ? 'translateY(-100%)' : 'translateY(0)',
            }}
          >
            <span className="rls-glyph">{ch === ' ' ? '\u00A0' : ch}</span>
            <span className="rls-glyph rls-glyph-alt">{ch === ' ' ? '\u00A0' : ch}</span>
          </span>
        </span>
      ))}
    </span>
  );
}
