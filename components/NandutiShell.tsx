'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LangSwitcher from './LangSwitcher';
import Sidebar, { type AppId } from './Sidebar';
import ChatCenter from './ChatCenter';
import Onboarding from './Onboarding';
import WalletApp from './miniapp/WalletApp';
import GovApp from './miniapp/GovApp';
import HealthApp from './miniapp/HealthApp';
import EduApp from './miniapp/EduApp';
import CryptoCardApp from './miniapp/CryptoCardApp';
import InfoApp from './miniapp/InfoApp';
import AlertsApp from './miniapp/AlertsApp';
import PoliceApp from './miniapp/PoliceApp';
import DocsApp from './miniapp/DocsApp';
import { useNandutiLocale } from './LocaleProvider';
import { mockCitizen } from '@/data/mock-citizen';

const TITLE_KEY: Record<AppId, string> = {
  wallet: 'wallet.title', gov: 'gov.title', health: 'health.title', edu: 'edu.title',
  crypto: 'crypto.title', info: 'info.title', alerts: 'alerts.title', police: 'police.title', docs: 'docs.title',
};

export default function NandutiShell() {
  const { t } = useNandutiLocale();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [active, setActive] = useState<AppId | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('nanduti.session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.cic) { setAuthed(true); return; }
      }
    } catch { /* noop */ }
    setAuthed(false);
    setShowOnboarding(true);
  }, []);

  const close = useCallback(() => setActive(null), []);

  if (authed === null) return <div className="nd-loading">…</div>;

  if (showOnboarding) {
    return (
      <main className="nd-root">
        <div className="nd-orb nd-orb--cyan" aria-hidden="true" />
        <div className="nd-orb nd-orb--purple" aria-hidden="true" />
        <div className="nd-orb nd-orb--red" aria-hidden="true" />
        <Onboarding onDone={() => { setShowOnboarding(false); setAuthed(true); }} />
        <style jsx>{`
          .nd-root { min-height: 100vh; background: radial-gradient(ellipse at top, #0d0d18 0%, #08080f 60%); color: var(--nd-t1); position: relative; overflow: hidden; }
          .nd-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.30; pointer-events: none; }
          .nd-orb--cyan { width: 480px; height: 480px; background: var(--nd-cyan); top: -160px; left: -120px; }
          .nd-orb--purple { width: 520px; height: 520px; background: var(--nd-purple); bottom: -200px; right: -160px; }
          .nd-orb--red { width: 320px; height: 320px; background: var(--nd-py-red); top: 40%; left: 60%; opacity: 0.15; }
        `}</style>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="shell__h">
        <div className="shell__brand">
          <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
            <defs>
              <linearGradient id="ndshellgrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
            <g fill="none" stroke="url(#ndshellgrad)" strokeWidth="1.4">
              <circle cx="32" cy="32" r="28" />
              <circle cx="32" cy="32" r="20" />
              <circle cx="32" cy="32" r="12" />
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * Math.PI) / 6;
                return <line key={i} x1={32 + Math.cos(a) * 4} y1={32 + Math.sin(a) * 4} x2={32 + Math.cos(a) * 28} y2={32 + Math.sin(a) * 28} />;
              })}
            </g>
          </svg>
          <span className="nd-grad-text shell__name">Ñandutí</span>
          <span className="shell__user">{mockCitizen.name.split(' ').slice(0, 2).join(' ')}</span>
        </div>
        <div className="shell__r">
          <LangSwitcher />
          <button type="button" className="shell__logout" onClick={() => { try { window.localStorage.removeItem('nanduti.session'); } catch { /* noop */ } setAuthed(false); setShowOnboarding(true); }}>Cerrar sesión</button>
        </div>
      </header>

      <div className="shell__grid">
        <div className="shell__chat">
          <ChatCenter />
        </div>
        <div className="shell__side">
          <Sidebar active={active} onPick={setActive} />
        </div>
      </div>

      {active ? (
        <div className="shell__modal" role="dialog" aria-modal="true" aria-label={t(TITLE_KEY[active])}>
          <div className="shell__modal_card">
            <header>
              <h3>{t(TITLE_KEY[active])}</h3>
              <button type="button" className="shell__close" onClick={close} aria-label="Cerrar">✕</button>
            </header>
            <div className="shell__modal_body">
              {active === 'wallet' ? <WalletApp /> : null}
              {active === 'gov' ? <GovApp /> : null}
              {active === 'health' ? <HealthApp /> : null}
              {active === 'edu' ? <EduApp /> : null}
              {active === 'crypto' ? <CryptoCardApp /> : null}
              {active === 'info' ? <InfoApp /> : null}
              {active === 'alerts' ? <AlertsApp /> : null}
              {active === 'police' ? <PoliceApp onDiscrete={() => router.push('/discrete')} /> : null}
              {active === 'docs' ? <DocsApp /> : null}
            </div>
          </div>
          <button type="button" className="shell__backdrop" aria-label="Cerrar" onClick={close} />
        </div>
      ) : null}

      <style jsx>{`
        .shell { min-height: 100vh; background: radial-gradient(ellipse at top, #0d0d18 0%, #08080f 60%); color: var(--nd-t1); display: flex; flex-direction: column; }
        .shell__h { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--nd-border); gap: 12px; flex-wrap: wrap; }
        .shell__brand { display: flex; align-items: center; gap: 12px; }
        .shell__name { font-weight: 800; font-size: 22px; }
        .shell__user { font-size: 12px; color: var(--nd-t3); padding-left: 12px; border-left: 1px solid var(--nd-border); }
        .shell__r { display: flex; align-items: center; gap: 12px; }
        .shell__logout { background: transparent; border: 1px solid var(--nd-border); color: var(--nd-t2); font-size: 12px; padding: 6px 12px; border-radius: 999px; cursor: pointer; }
        .shell__logout:hover { color: var(--nd-t1); border-color: var(--nd-border-active); }
        .shell__grid { flex: 1; display: grid; grid-template-columns: 1fr 320px; gap: 18px; padding: 18px 24px 24px; min-height: 0; }
        .shell__chat { background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 18px; padding: 16px; min-height: 0; min-width: 0; }
        .shell__side { min-width: 0; }
        @media (max-width: 920px) {
          .shell__grid { grid-template-columns: 1fr; }
          .shell__side { order: -1; }
        }
        .shell__modal { position: fixed; inset: 0; z-index: 50; display: flex; align-items: stretch; justify-content: flex-end; }
        .shell__backdrop { position: absolute; inset: 0; background: rgba(8,8,15,0.65); backdrop-filter: blur(4px); border: none; cursor: pointer; }
        .shell__modal_card { position: relative; z-index: 1; width: min(620px, 100%); height: 100%; background: var(--nd-surface); border-left: 1px solid var(--nd-border); display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.4); }
        .shell__modal_card header { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid var(--nd-border); flex-shrink: 0; }
        .shell__modal_card h3 { margin: 0; font-size: 20px; color: var(--nd-t1); font-weight: 700; }
        .shell__close { background: transparent; border: none; color: var(--nd-t2); font-size: 22px; cursor: pointer; line-height: 1; padding: 4px 8px; border-radius: 6px; }
        .shell__close:hover { color: var(--nd-t1); background: var(--nd-surface-2); }
        .shell__modal_body { flex: 1; overflow-y: auto; padding: 22px; min-height: 0; }
        @media (max-width: 768px) {
          .shell__modal_card { width: 100%; border-left: none; }
        }
        .nd-loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; color: var(--nd-t2); background: var(--nd-bg); }
      `}</style>
    </main>
  );
}
