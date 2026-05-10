'use client';

import { useNandutiLocale } from './LocaleProvider';
import { APP_ICON } from './landing/icons';

export type AppId = 'wallet' | 'gov' | 'health' | 'edu' | 'crypto' | 'info' | 'alerts' | 'police' | 'docs';

const APPS: Array<{ id: AppId; tokenColor: string }> = [
  { id: 'wallet', tokenColor: 'var(--nd-app-wallet)' },
  { id: 'gov',    tokenColor: 'var(--nd-app-gov)' },
  { id: 'health', tokenColor: 'var(--nd-app-health)' },
  { id: 'edu',    tokenColor: 'var(--nd-app-edu)' },
  { id: 'crypto', tokenColor: 'var(--nd-app-crypto)' },
  { id: 'info',   tokenColor: 'var(--nd-app-info)' },
  { id: 'alerts', tokenColor: 'var(--nd-app-alerts)' },
  { id: 'police', tokenColor: 'var(--nd-app-police)' },
  { id: 'docs',   tokenColor: 'var(--nd-app-docs)' },
];

export default function Sidebar({ active, onPick }: { active: AppId | null; onPick: (id: AppId) => void }) {
  const { t } = useNandutiLocale();
  return (
    <aside className="sb">
      <span className="nd-eyebrow sb__title">{t('sidebar.title')}</span>
      <ul className="sb__grid">
        {APPS.map((a) => {
          const Icon = APP_ICON[a.id];
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onPick(a.id)}
                aria-pressed={active === a.id}
                className={active === a.id ? 'is-active' : ''}
                style={{ '--app-c': a.tokenColor } as React.CSSProperties}
              >
                <span className="sb__icon" aria-hidden="true">
                  <Icon width={20} height={20} />
                </span>
                <span className="sb__label">{t(`sidebar.${a.id}`)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <style jsx>{`
        .sb { display: flex; flex-direction: column; gap: 12px; height: 100%; min-width: 0; }
        .sb__title { padding: 0 4px; }
        .sb__grid { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; align-content: start; }
        .sb__grid button {
          display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between;
          gap: 10px; padding: 14px;
          min-height: 92px;
          background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 14px;
          color: var(--nd-t1); cursor: pointer; transition: all 200ms ease;
          text-align: left; width: 100%; position: relative; overflow: hidden;
        }
        .sb__grid button::before { content: ''; position: absolute; inset: 0; background: var(--app-c); opacity: 0; transition: opacity 200ms ease; }
        .sb__grid button:hover { border-color: var(--app-c); transform: translateY(-2px); }
        .sb__grid button:hover::before { opacity: 0.06; }
        .sb__grid button:hover :global(svg) { color: var(--app-c); }
        .sb__grid button.is-active { border-color: var(--app-c); }
        .sb__grid button.is-active::before { opacity: 0.10; }
        .sb__grid button.is-active::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--app-c); }
        .sb__grid button.is-active :global(svg) { color: var(--app-c); }
        .sb__icon { position: relative; z-index: 1; color: rgba(244,244,255,0.85); display: inline-flex; transition: color 200ms ease; }
        .sb__label { font-size: 13px; font-weight: 600; position: relative; z-index: 1; line-height: 1.2; }
        @media (max-width: 768px) {
          .sb__grid { grid-template-columns: repeat(3, 1fr); }
          .sb__grid button { min-height: 84px; padding: 10px; }
          .sb__label { font-size: 11px; }
        }
      `}</style>
    </aside>
  );
}
