'use client';

import { useEffect, useState } from 'react';
import { callTool } from '@/lib/api-client';
import { useNandutiLocale } from '@/components/LocaleProvider';
import type { InfoItem } from '@/data/mock-info-feed';

const CAT_COLOR: Record<string, string> = { salud: '#06B6D4', economia: '#10B981', educacion: '#F97316', seguridad: '#EF4444', tecnologia: '#38BDF8', clima: '#A855F7' };

export default function InfoApp() {
  const { t, locale } = useNandutiLocale();
  const [tab, setTab] = useState<'feed' | 'summary'>('feed');
  const [items, setItems] = useState<InfoItem[]>([]);
  const [summary, setSummary] = useState<{ summary: string } | null>(null);

  useEffect(() => { callTool<{ items: InfoItem[] }>('info.feed').then((d) => setItems(d?.items ?? [])); }, []);
  useEffect(() => { if (tab === 'summary' && !summary) callTool<{ summary: string }>('info.weekly_summary', { lang: locale }).then(setSummary); }, [tab, summary, locale]);

  return (
    <div className="inf">
      <nav className="inf__tabs" role="tablist">
        <button onClick={() => setTab('feed')} aria-selected={tab === 'feed'} className={tab === 'feed' ? 'is-active' : ''}>{t('info.tab_feed')}</button>
        <button onClick={() => setTab('summary')} aria-selected={tab === 'summary'} className={tab === 'summary' ? 'is-active' : ''}>{t('info.tab_summary')}</button>
      </nav>

      {tab === 'feed' ? (
        <ul className="inf__list">
          {items.map((it) => (
            <li key={it.id} className="nd-card inf__row">
              <header>
                <span className="inf__cat" style={{ background: CAT_COLOR[it.category] }}>{it.category}</span>
                <strong>{it.source}</strong>
                <span className="nd-mono inf__ts">{new Date(it.ts).toLocaleString('es-PY', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </header>
              <h4>{it.title}</h4>
              <p>{it.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <article className="nd-card inf__summary">
          <span className="nd-eyebrow">Resumen IA · {locale}</span>
          {summary ? <p>{summary.summary}</p> : <p className="nd-pulse">Cargando…</p>}
        </article>
      )}

      <style jsx>{`
        .inf { display: flex; flex-direction: column; gap: 12px; }
        .inf__tabs { display: flex; gap: 4px; padding: 4px; background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 999px; align-self: flex-start; }
        .inf__tabs button { padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--nd-t2); background: transparent; border: none; border-radius: 999px; cursor: pointer; }
        .inf__tabs button.is-active { background: linear-gradient(135deg, var(--nd-app-info), var(--nd-cyan)); color: var(--nd-bg); }
        .inf__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .inf__row { display: flex; flex-direction: column; gap: 6px; }
        .inf__row header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .inf__cat { padding: 2px 8px; border-radius: 4px; font-size: 10px; color: white; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
        .inf__ts { font-size: 11px; color: var(--nd-t3); margin-left: auto; }
        .inf__row h4 { margin: 0; font-size: 14px; color: var(--nd-t1); }
        .inf__row p { margin: 0; font-size: 13px; color: var(--nd-t2); line-height: 1.5; }
        .inf__summary p { line-height: 1.7; color: var(--nd-t1); }
      `}</style>
    </div>
  );
}
