'use client';

import { useEffect, useRef, useState } from 'react';
import { useNandutiLocale, type NandutiLocale } from './LocaleProvider';

const ORDER: NandutiLocale[] = ['es', 'gn', 'jopara', 'pt', 'en'];

/**
 * Dropdown de idioma — nomes completos, click pra abrir, escolha
 * fecha. Sem abreviações, sem bandeiras-emoji.
 */
export default function LangSwitcher({ tone = 'pill' }: { tone?: 'pill' | 'minimal' }) {
  const { locale, setLocale, t } = useNandutiLocale();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isMinimal = tone === 'minimal';

  return (
    <div ref={wrapRef} className={`lng ${isMinimal ? 'lng--min' : ''}`}>
      <button
        type="button"
        className="lng__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('lang.label')}
        onClick={() => setOpen((o) => !o)}
      >
        <svg className="lng__globe" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
        <span className="lng__name">{t(`lang.${locale}`)}</span>
        <svg className={`lng__chev ${open ? 'is-open' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <ul className="lng__menu" role="listbox" aria-label={t('lang.label')}>
          {ORDER.map((code) => {
            const active = code === locale;
            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`lng__opt ${active ? 'is-active' : ''}`}
                  onClick={() => { setLocale(code); setOpen(false); }}
                >
                  <span className="lng__optName">{t(`lang.${code}`)}</span>
                  {active ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <style jsx>{`
        .lng { position: relative; display: inline-block; }

        .lng__trigger {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 14px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 8px;
          color: rgba(244,244,255,0.86);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.005em;
          cursor: pointer;
          transition: border-color 200ms ease, color 200ms ease, background 200ms ease;
        }
        .lng__trigger:hover { border-color: rgba(34,211,238,0.36); color: #fff; }
        .lng__trigger:focus-visible { outline: none; border-color: var(--nd-cyan); box-shadow: 0 0 0 3px rgba(34,211,238,0.18); }
        .lng--min .lng__trigger {
          border-color: transparent;
          padding: 7px 10px;
        }
        .lng--min .lng__trigger:hover { border-color: rgba(255,255,255,0.10); }

        .lng__globe { color: rgba(244,244,255,0.55); flex: 0 0 auto; }
        .lng__name { display: inline-block; min-width: 56px; text-align: left; }
        .lng__chev { color: rgba(244,244,255,0.4); transition: transform 200ms ease; flex: 0 0 auto; }
        .lng__chev.is-open { transform: rotate(180deg); color: var(--nd-cyan); }

        .lng__menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 200px;
          list-style: none;
          margin: 0;
          padding: 6px;
          background: rgba(12,12,20,0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          box-shadow: 0 18px 48px -16px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.2);
          z-index: 200;
          animation: lng-in 180ms cubic-bezier(0.2,0.8,0.2,1);
        }
        @keyframes lng-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        .lng__opt {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%;
          padding: 10px 14px;
          background: transparent;
          border: none;
          color: rgba(244,244,255,0.74);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: -0.005em;
          text-align: left;
          cursor: pointer;
          border-radius: 8px;
          transition: background 140ms ease, color 140ms ease;
        }
        .lng__opt:hover { background: rgba(255,255,255,0.04); color: #fff; }
        .lng__opt:focus-visible { outline: none; background: rgba(34,211,238,0.08); color: #fff; }
        .lng__opt.is-active { color: var(--nd-cyan); }
        .lng__optName { flex: 1; }
      `}</style>
    </div>
  );
}
