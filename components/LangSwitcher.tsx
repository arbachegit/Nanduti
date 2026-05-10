'use client';

import { useNandutiLocale, type NandutiLocale } from './LocaleProvider';

const ORDER: Array<{ code: NandutiLocale; short: string }> = [
  { code: 'es',     short: 'ES' },
  { code: 'gn',     short: 'GN' },
  { code: 'jopara', short: 'JO' },
  { code: 'pt',     short: 'PT' },
  { code: 'en',     short: 'EN' },
];

/**
 * Idiomas em horizontal compacto, alinhados, mono.
 * ES · GN · JO · PT · EN com active em cyan.
 */
export default function LangSwitcher({ tone = 'pill' }: { tone?: 'pill' | 'minimal' }) {
  const { locale, setLocale, t } = useNandutiLocale();
  const isMinimal = tone === 'minimal';

  return (
    <div className={`lang ${isMinimal ? 'lang--min' : ''}`} role="group" aria-label={t('lang.label')}>
      {ORDER.map(({ code, short }, i) => {
        const active = code === locale;
        return (
          <span key={code} className="lang__cell">
            {i > 0 ? <span className="lang__sep" aria-hidden>·</span> : null}
            <button
              type="button"
              className={`lang__b ${active ? 'is-active' : ''}`}
              aria-pressed={active}
              onClick={() => setLocale(code)}
              title={t(`lang.${code}`)}
            >
              {short}
            </button>
          </span>
        );
      })}
      <style jsx>{`
        .lang { display: inline-flex; align-items: center; gap: 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.18em; }
        .lang__cell { display: inline-flex; align-items: center; }
        .lang__sep { color: rgba(245,245,247,0.20); padding: 0 6px; user-select: none; }
        .lang__b { background: transparent; border: none; padding: 4px 2px; color: rgba(245,245,247,0.42); cursor: pointer; font: inherit; letter-spacing: inherit; transition: color 160ms ease; }
        .lang__b:hover { color: rgba(245,245,247,0.85); }
        .lang__b.is-active { color: var(--nd-cyan, #22d3ee); font-weight: 600; }

        .lang--min { font-size: 10.5px; }
      `}</style>
    </div>
  );
}
