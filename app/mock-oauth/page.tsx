'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockCitizen } from '@/data/mock-citizen';

export default function MockOauthPage() {
  const router = useRouter();

  useEffect(() => {
    const tm = setTimeout(() => {
      try {
        window.localStorage.setItem('nanduti.session', JSON.stringify({ ts: Date.now(), cic: mockCitizen.cic, source: 'mitic' }));
      } catch { /* noop */ }
      router.push('/');
    }, 1600);
    return () => clearTimeout(tm);
  }, [router]);

  return (
    <main className="mo">
      <div className="mo__panel">
        <span className="nd-eyebrow">paraguay.gov.py · MITIC</span>
        <h1>Identidad Electrónica</h1>
        <p>Autenticando como <strong>{mockCitizen.name}</strong>…</p>
        <div className="mo__bar"><span /></div>
        <small>Demo · OAuth simulado. En producción, redirección real a paraguay.gov.py.</small>
      </div>
      <style jsx>{`
        .mo { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #001f5c 0%, #08080f 80%); color: var(--nd-t1); padding: 24px; }
        .mo__panel { background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 18px; padding: 32px; max-width: 420px; width: 100%; display: flex; flex-direction: column; gap: 12px; text-align: center; }
        .mo__panel h1 { margin: 0; font-size: 24px; }
        .mo__panel p { margin: 0; color: var(--nd-t2); }
        .mo__bar { height: 4px; border-radius: 999px; background: var(--nd-surface-2); overflow: hidden; margin-top: 8px; }
        .mo__bar :global(span) { display: block; height: 100%; background: linear-gradient(90deg, var(--nd-cyan), var(--nd-purple)); animation: mooauthbar 1.6s ease-out forwards; }
        @keyframes mooauthbar { from { width: 0; } to { width: 100%; } }
        .mo__panel small { font-size: 11px; color: var(--nd-t3); margin-top: 4px; }
      `}</style>
    </main>
  );
}
