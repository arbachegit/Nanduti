'use client';

import { useState } from 'react';
import { useNandutiLocale } from '@/components/LocaleProvider';

type Phase = 'idle' | 'recording' | 'thinking';

const DEMO_TRANSCRIPTS: Record<string, string[]> = {
  es: ['¿Cuánto tengo en la billetera?', 'Quiero renovar mi cédula', 'Mostrame el boletín de Sofía', 'Hay alertas cerca de Trinidad?', 'Necesito hablar con Línea 155'],
  gn: ['Mboýpa areko viru?', 'Renovar che kuatia', 'Sofía boletín', 'Sãso oĩháicha Trinidad-pe?', 'Línea 155'],
  jopara: ['¿Cuánto areko en la billetera?', 'Renovar che cédula', 'Boletín de Sofía', 'Sãso aguĩ Trinidad-pe?', 'Necesito Línea 155'],
};

export default function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const { locale } = useNandutiLocale();
  const [phase, setPhase] = useState<Phase>('idle');

  const click = async () => {
    if (phase !== 'idle') return;
    setPhase('recording');
    setTimeout(() => {
      setPhase('thinking');
      setTimeout(() => {
        const opts = DEMO_TRANSCRIPTS[locale] ?? DEMO_TRANSCRIPTS.jopara;
        const pick = opts[Math.floor(Math.random() * opts.length)];
        onTranscript(pick);
        setPhase('idle');
      }, 700);
    }, 1300);
  };

  return (
    <button
      type="button"
      onClick={click}
      className={`vbtn ${phase === 'recording' ? 'is-rec' : ''} ${phase === 'thinking' ? 'is-thinking' : ''}`}
      aria-label={phase === 'recording' ? 'Grabando' : 'Hablar'}
    >
      <span aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </span>
      <style jsx>{`
        .vbtn {
          width: 44px; height: 44px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--nd-surface-2); border: 1px solid var(--nd-border);
          color: var(--nd-t1); cursor: pointer; transition: all 160ms ease;
        }
        .vbtn:hover { border-color: var(--nd-cyan); }
        .vbtn.is-rec { background: var(--nd-danger); border-color: var(--nd-danger); color: white; animation: nd-pulse 1s ease-in-out infinite; }
        .vbtn.is-thinking { background: var(--nd-purple); border-color: var(--nd-purple); color: white; }
        .vbtn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </button>
  );
}
