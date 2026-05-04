'use client';

import { useEffect, useState } from 'react';
import { callTool } from '@/lib/api-client';
import { useNandutiLocale } from '@/components/LocaleProvider';
import type { AlertItem } from '@/data/mock-alerts';

const LEVEL_COLOR: Record<string, string> = { verde: '#10B981', amarillo: '#F59E0B', naranja: '#F97316', rojo: '#EF4444' };
const ALL_CATS = ['clima', 'seguridad', 'salud', 'transito', 'apagon'];

export default function AlertsApp() {
  const { t } = useNandutiLocale();
  const [items, setItems] = useState<AlertItem[]>([]);
  const [subscribed, setSubscribed] = useState<string[]>(['clima', 'seguridad']);

  useEffect(() => { callTool<{ items: AlertItem[] }>('alerts.recent').then((d) => setItems(d?.items ?? [])); }, []);

  const toggle = async (cat: string) => {
    const next = subscribed.includes(cat) ? subscribed.filter((c) => c !== cat) : [...subscribed, cat];
    setSubscribed(next);
    await callTool('alerts.subscribe', { categories: next, geo: 'Asunción - Trinidad' });
  };

  return (
    <div className="al">
      <section className="al__sub nd-card">
        <span className="nd-eyebrow">{t('alerts.subscribe')}</span>
        <div className="al__chips">
          {ALL_CATS.map((c) => {
            const active = subscribed.includes(c);
            return (
              <button key={c} onClick={() => toggle(c)} className={active ? 'is-on' : ''}>
                {t(`alerts.category_${c}`)}
              </button>
            );
          })}
        </div>
      </section>
      <ul className="al__list">
        {items.map((a) => (
          <li key={a.id} className="nd-card al__row" style={{ borderLeft: `3px solid ${LEVEL_COLOR[a.level]}` }}>
            <header>
              <span className={`nd-pill nd-pill--${a.level === 'verde' ? 'success' : a.level === 'rojo' ? 'danger' : 'warn'}`}>{a.level}</span>
              <strong>{a.title}</strong>
              <span className="al__src nd-mono">{a.source}</span>
            </header>
            <p>{a.body}</p>
            <footer>
              <span className="nd-mono">{a.geo.label} · {a.geo.radius_km} km</span>
              <span className="nd-mono al__ts">{new Date(a.ts).toLocaleString('es-PY', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </footer>
          </li>
        ))}
      </ul>
      <style jsx>{`
        .al { display: flex; flex-direction: column; gap: 12px; }
        .al__sub { display: flex; flex-direction: column; gap: 8px; }
        .al__chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .al__chips button { padding: 6px 12px; font-size: 12px; font-weight: 600; background: var(--nd-surface-2); border: 1px solid var(--nd-border); border-radius: 999px; color: var(--nd-t2); cursor: pointer; }
        .al__chips button.is-on { background: var(--nd-app-alerts); border-color: var(--nd-app-alerts); color: var(--nd-bg); }
        .al__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .al__row { display: flex; flex-direction: column; gap: 4px; }
        .al__row header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .al__row strong { font-size: 14px; }
        .al__src { font-size: 11px; color: var(--nd-t3); margin-left: auto; }
        .al__row p { margin: 0; font-size: 13px; line-height: 1.5; color: var(--nd-t2); }
        .al__row footer { display: flex; gap: 8px; font-size: 11px; color: var(--nd-t3); }
        .al__ts { margin-left: auto; }
      `}</style>
    </div>
  );
}
