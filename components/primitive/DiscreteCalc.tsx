'use client';

import { useState, useEffect, useRef } from 'react';

const KEYS = ['7', '8', '9', '/', '4', '5', '6', 'x', '1', '2', '3', '-', '0', '.', '=', '+'] as const;

export default function DiscreteCalc({ onExit }: { onExit: () => void }) {
  const [display, setDisplay] = useState('0');
  const tapsRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  const press = (k: string) => {
    if (k === '=') {
      try {
        const expr = display.replace(/x/g, '*').replace(/[^0-9+\-*/.]/g, '');
        const val = Function('"use strict";return (' + expr + ')')();
        setDisplay(typeof val === 'number' && Number.isFinite(val) ? String(val) : 'Err');
      } catch {
        setDisplay('Err');
      }
      return;
    }
    setDisplay((d) => (d === '0' || d === 'Err' ? k : d + k));
  };

  const onDisplayTap = () => {
    tapsRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => { tapsRef.current = 0; }, 1500);
    if (tapsRef.current >= 7) {
      tapsRef.current = 0;
      onExit();
    }
  };

  const onClear = () => setDisplay('0');

  return (
    <div className="calc">
      <button
        type="button"
        className="calc__display"
        onClick={onDisplayTap}
        aria-label="Display de la calculadora — 7 toques para salir del modo discreto"
      >
        <span className="calc__num nd-mono">{display}</span>
      </button>
      <div className="calc__row">
        <button type="button" className="calc__key calc__key--ac" onClick={onClear}>AC</button>
        <button type="button" className="calc__key" onClick={() => setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'))}>⌫</button>
        <button type="button" className="calc__key" onClick={() => press('%')}>%</button>
        <button type="button" className="calc__key calc__key--op" onClick={() => press('/')}>÷</button>
      </div>
      <div className="calc__grid">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className={`calc__key ${'+-/x='.includes(k) ? 'calc__key--op' : ''} ${k === '=' ? 'calc__key--eq' : ''}`}
            onClick={() => press(k)}
          >
            {k === '/' ? '÷' : k === 'x' ? '×' : k}
          </button>
        ))}
      </div>
      <p className="calc__hint">Toca el display 7 veces para salir.</p>
      <style jsx>{`
        .calc { max-width: 360px; margin: 0 auto; padding: 24px 18px; display: flex; flex-direction: column; gap: 12px; background: #0a0a13; border-radius: 24px; }
        .calc__display { background: #16161f; border: 1px solid var(--nd-border); border-radius: 16px; padding: 28px 18px; min-height: 120px; display: flex; align-items: flex-end; justify-content: flex-end; cursor: pointer; }
        .calc__num { font-size: 48px; color: var(--nd-t1); letter-spacing: -0.02em; }
        .calc__row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .calc__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .calc__key { padding: 16px; font: 600 18px 'Plus Jakarta Sans', system-ui, sans-serif; background: #1c1c2a; border: 1px solid var(--nd-border); border-radius: 14px; color: var(--nd-t1); cursor: pointer; transition: all 120ms ease; }
        .calc__key:hover { border-color: var(--nd-border-active); }
        .calc__key:active { transform: scale(0.97); }
        .calc__key--op { background: #2a2535; color: var(--nd-electric); }
        .calc__key--eq { background: linear-gradient(135deg, var(--nd-cyan), var(--nd-purple)); color: var(--nd-bg); border: none; }
        .calc__key--ac { background: rgba(239,68,68,0.15); color: var(--nd-danger); border-color: rgba(239,68,68,0.25); }
        .calc__hint { font-size: 11px; color: var(--nd-t3); text-align: center; margin: 12px 0 0; letter-spacing: 0.04em; }
      `}</style>
    </div>
  );
}
