'use client';

import { useState, useEffect, useRef } from 'react';
import { useNandutiLocale } from '@/components/LocaleProvider';

export default function PanicButton({ onPanic }: { onPanic: () => void }) {
  const { t } = useNandutiLocale();
  const [armed, setArmed] = useState(false);
  const [count, setCount] = useState(3);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (tickRef.current) clearInterval(tickRef.current); }, []);

  const arm = () => {
    if (armed) return;
    setArmed(true);
    setCount(3);
    tickRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          tickRef.current = null;
          onPanic();
          setArmed(false);
          return 3;
        }
        return c - 1;
      });
    }, 1000);
  };

  const cancel = () => {
    setArmed(false);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    setCount(3);
  };

  return (
    <button
      type="button"
      onClick={armed ? cancel : arm}
      className={`pbtn ${armed ? 'is-armed' : ''}`}
      aria-pressed={armed}
    >
      {armed ? t('police.panic_holding').replace('{sec}', String(count)) : t('police.panic_btn')}
      <style jsx>{`
        .pbtn {
          width: 100%; min-height: 80px; padding: 20px;
          background: var(--nd-danger); color: white; border: none;
          border-radius: 18px; font: 800 20px/1.2 'Plus Jakarta Sans', system-ui, sans-serif;
          letter-spacing: 0.04em; text-transform: uppercase;
          cursor: pointer; transition: all 200ms ease;
          box-shadow: 0 12px 40px rgba(239,68,68,0.35), 0 0 0 1px rgba(255,255,255,0.04);
        }
        .pbtn:hover { transform: translateY(-2px); box-shadow: 0 18px 50px rgba(239,68,68,0.45); }
        .pbtn:active { transform: translateY(0); }
        .pbtn.is-armed { animation: nd-pulse 0.7s ease-in-out infinite; background: #b91c1c; font-size: 16px; }
      `}</style>
    </button>
  );
}
