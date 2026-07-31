import { useEffect, useMemo, useState } from 'react';
import { Youtube, HardDrive, Gamepad2, Trophy, ArrowDown } from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
import KineticGrid from './components/KineticGrid';
import WaveArcs from './components/WaveArcs';
import TextVaporize from './components/TextVaporize';
import RandomLetterSwap from './components/RandomLetterSwap';
import MeshText from './components/MeshText';
import SmokeyHeading from './components/SmokeyHeading';
import GameCard from './components/GameCard';
import TodoDeck from './components/TodoDeck';
import { CATEGORY_META, CATEGORY_ORDER } from './lib/types';
import type { Game } from './lib/types';
import supabase from './lib/supabase';

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showNsfw, setShowNsfw] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .order('rank', { ascending: true });
        if (error) throw error;
        setGames((data ?? []) as Game[]);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visible = useMemo(
    () => games.filter((g) => showNsfw || !g.nsfw),
    [games, showNsfw]
  );

  const totalSize = useMemo(
    () => visible.reduce((s, g) => s + Number(g.size_gb), 0),
    [visible]
  );

  const grouped = useMemo(() => {
    const map: Record<string, Game[]> = {};
    for (const g of visible) {
      (map[g.category] ||= []).push(g);
    }
    return map;
  }, [visible]);

  return (
    <div className="app-root">
      <CustomCursor />
      <ScrollProgress />
      <KineticGrid />

      {/* HERO */}
      <header className="hero">
        <img src={`${import.meta.env.BASE_URL}smoke.png`} className="hero-smoke" alt="" aria-hidden />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="pulse-dot" />
            PERSONAL GAME VAULT · {games.length} TITLES ARCHIVED
          </div>

          <div className="hero-mesh">
            <MeshText text="ZED'S VAULT" fontSize={150} />
          </div>

          <div className="hero-vapor">
            <TextVaporize
              words={['CONQUERED.', 'PLATINUMED.', 'REPLAYED.', 'MASTERED.']}
            />
          </div>

          <p className="hero-sub">
            A cinematic archive of every world I've bled, sprinted and stared
            through — {games.length} games, roughly{' '}
            <b>{totalSize.toFixed(0)} GB</b> of pure obsession, curated for the
            channel.
          </p>

          <div className="hero-actions">
            <a
              className="btn-primary"
              href="https://youtube.com/@AmilgaulZed"
              target="_blank"
              rel="noreferrer"
              data-cursor
            >
              <Youtube size={18} /> @AmilgaulZed
            </a>
            <a className="btn-ghost" href="#library" data-cursor>
              Enter the Library <ArrowDown size={16} />
            </a>
          </div>

          <div className="hero-stats">
            <Stat icon={<Gamepad2 size={18} />} label="Games" value={String(games.length)} accent="#D9FFF4" />
            <Stat icon={<HardDrive size={18} />} label="Storage" value={`${(totalSize / 1024).toFixed(2)} TB`} accent="#EEF8CD" />
            <Stat icon={<Trophy size={18} />} label="Categories" value={String(CATEGORY_ORDER.length)} accent="#FFC5AA" />
          </div>
        </div>
        <div className="scroll-hint" data-cursor>
          <span>scroll</span>
          <ArrowDown size={14} />
        </div>
      </header>

      {/* LIBRARY */}
      <main id="library" className="library">
        <div className="library-head">
          <span className="section-kicker">the collection</span>
          <SmokeyHeading text="Every World Worth The Grind" accent="#FFC5AA" />
          <div className="nsfw-switch">
            <label data-cursor>
              <input
                type="checkbox"
                checked={showNsfw}
                onChange={(e) => setShowNsfw(e.target.checked)}
              />
              <span className="switch-track"><span className="switch-thumb" /></span>
              Show 18+ titles
            </label>
          </div>
        </div>

        {err && <div className="global-error">⚠ {err}</div>}
        {loading ? (
          <div className="lib-loading">
            <span className="spinner big" />
            <p>Decrypting the vault…</p>
          </div>
        ) : (
          CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <section key={cat} className="cat-section">
                <div className="cat-header">
                  <span className="cat-icon" style={{ background: `${meta.accent}22`, color: meta.accent }}>
                    {meta.icon}
                  </span>
                  <div>
                    <h3 className="cat-title">
                      <RandomLetterSwap text={cat} />
                    </h3>
                    <p className="cat-blurb">
                      {meta.blurb} · <b>{grouped[cat].length}</b> titles
                    </p>
                  </div>
                </div>
                <div className="card-grid">
                  {grouped[cat].map((g, i) => (
                    <GameCard key={g.id} game={g} index={i} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* TODO + GRAVITY */}
      <section className="quest-section">
        <WaveArcs />
        <div className="quest-inner">
          <span className="section-kicker" style={{ color: '#D9FFF4' }}>
            the backlog
          </span>
          <SmokeyHeading text="What I'm Grinding Next" accent="#EEF8CD" />
          <p className="quest-lead">
            A live quest log with per-game timers — then spill it all into a
            gravity sandbox and toss the tiles around.
          </p>
          <TodoDeck />
        </div>
      </section>

      <footer className="footer">
        <div className="footer-mesh">
          <MeshText text="GG" fontSize={120} />
        </div>
        <p>
          Built for the channel ·{' '}
          <a href="https://youtube.com/@AmilgaulZed" target="_blank" rel="noreferrer" data-cursor>
            youtube.com/@AmilgaulZed
          </a>
        </p>
        <p className="footer-sub">{games.length} games archived · {(totalSize / 1024).toFixed(2)} TB of memories</p>
      </footer>
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="stat" data-cursor style={{ ['--accent' as string]: accent }}>
      <span className="stat-icon" style={{ color: accent }}>{icon}</span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
