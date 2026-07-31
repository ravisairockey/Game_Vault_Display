import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Plus, Trash2, Check, Boxes, Timer } from 'lucide-react';
import type { Todo } from '../lib/types';
import GravityGallery from './GravityGallery';

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const STORAGE_KEY = 'zed-vault-todos';

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Todo[];
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    /* ignore quota errors */
  }
}

function nextId(todos: Todo[]): number {
  if (todos.length === 0) return 1;
  return Math.max(...todos.map((t) => t.id)) + 1;
}

export default function TodoDeck() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [input, setInput] = useState('');
  const [running, setRunning] = useState<number | null>(null);
  const [gravity, setGravity] = useState(false);
  const tickRef = useRef<Record<number, number>>({});

  // Load from localStorage on mount
  useEffect(() => {
    setTodos(loadTodos());
    setLoading(false);
  }, []);

  // Persist to localStorage whenever todos change
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  // timer loop
  useEffect(() => {
    if (running == null) return;
    const iv = setInterval(() => {
      setTodos((prev) =>
        prev.map((t) => {
          if (t.id === running) {
            const next = t.seconds + 1;
            tickRef.current[t.id] = next;
            return { ...t, seconds: next };
          }
          return t;
        })
      );
    }, 1000);
    return () => clearInterval(iv);
  }, [running]);

  const persistTime = (id: number) => {
    // No-op: time is already persisted via the todos useEffect above.
    // Kept for API parity / future use.
    void id;
  };

  const toggleTimer = (id: number) => {
    if (running === id) {
      setRunning(null);
      persistTime(id);
    } else {
      if (running != null) persistTime(running);
      setRunning(id);
    }
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const task = input.trim();
    if (!task) return;
    setInput('');
    setTodos((prev) => [
      ...prev,
      { id: nextId(prev), task, done: false, seconds: 0 },
    ]);
  };

  const toggleDone = (t: Todo) => {
    setTodos((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x))
    );
  };

  const remove = (id: number) => {
    if (running === id) setRunning(null);
    setTodos((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="todo-deck">
      <div className="todo-panel">
        <div className="todo-panel-head">
          <div>
            <span className="section-kicker" style={{ color: '#FFC5AA' }}>
              backlog
            </span>
            <h3 className="todo-title">Quest Log</h3>
          </div>
          <button
            className={`gravity-toggle ${gravity ? 'on' : ''}`}
            onClick={() => setGravity((g) => !g)}
            data-cursor
          >
            <Boxes size={16} />
            {gravity ? 'Reset Deck' : 'Drop the Cubes'}
          </button>
        </div>

        <form className="todo-form" onSubmit={add}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a game to conquer…"
            maxLength={60}
          />
          <button type="submit" data-cursor aria-label="Add">
            <Plus size={18} />
          </button>
        </form>

        {err && <div className="todo-error">{err}</div>}
        {loading ? (
          <div className="todo-loading">
            <span className="spinner" /> loading quests…
          </div>
        ) : (
          <ul className="todo-list">
            {todos.length === 0 && <li className="todo-empty">No quests yet. Add one above.</li>}
            {todos.map((t) => (
              <li key={t.id} className={`todo-item ${t.done ? 'done' : ''}`}>
                <button
                  className="todo-check"
                  onClick={() => toggleDone(t)}
                  data-cursor
                  aria-label="toggle done"
                >
                  {t.done && <Check size={13} />}
                </button>
                <span className="todo-task">{t.task}</span>
                <span className="todo-time">
                  <Timer size={13} /> {fmt(t.seconds)}
                </span>
                <button
                  className={`todo-timer ${running === t.id ? 'active' : ''}`}
                  onClick={() => toggleTimer(t.id)}
                  data-cursor
                  aria-label="timer"
                >
                  {running === t.id ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  className="todo-del"
                  onClick={() => remove(t.id)}
                  data-cursor
                  aria-label="delete"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`gravity-box ${gravity ? 'active' : ''}`}>
        {gravity ? (
          <GravityGallery todos={todos} />
        ) : (
          <div className="gravity-placeholder">
            <Boxes size={42} strokeWidth={1.2} />
            <p>
              Hit <b>Drop the Cubes</b> to spill your quest log into a physics
              sandbox. Grab & toss the tiles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}