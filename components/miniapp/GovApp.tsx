'use client';

import { useEffect, useState } from 'react';
import { callTool, fmtPyg } from '@/lib/api-client';
import { useNandutiLocale } from '@/components/LocaleProvider';
import type { Tramite } from '@/data/mock-tramites';

export default function GovApp() {
  const { t } = useNandutiLocale();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Tramite[]>([]);
  const [booking, setBooking] = useState<{ tramite: Tramite | null; code: string | null } | null>(null);
  const [ruc, setRuc] = useState('');
  const [rucResult, setRucResult] = useState<{ ok: boolean; razon_social: string | null; estado: string; regimen: string | null } | null>(null);

  useEffect(() => {
    callTool<{ items: Tramite[] }>('gov.tramite_search', { query }).then((d) => setItems(d?.items ?? []));
  }, [query]);

  return (
    <div className="gov">
      <input className="nd-input" placeholder={t('gov.search_placeholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul className="gov__list">
        {items.map((tr) => (
          <li key={tr.id} className="nd-card gov__row" style={{ borderLeft: `3px solid ${tr.agency_color}` }}>
            <div className="gov__row_top">
              <strong>{tr.name}</strong>
              <span className="nd-pill">{tr.agency}</span>
            </div>
            <p className="gov__desc">{tr.description}</p>
            <div className="gov__meta">
              <span className="nd-mono">{t('gov.duration').replace('{min}', String(tr.duration_min))}</span>
              <span>·</span>
              <span className="nd-mono">{tr.cost_pyg === 0 ? t('gov.free') : `Gs. ${fmtPyg(tr.cost_pyg)}`}</span>
              <span>·</span>
              <span>{tr.digital ? t('gov.digital') : t('gov.presencial')}</span>
            </div>
            <button type="button" className="nd-btn nd-btn--primary" onClick={async () => { const r = await callTool<{ tramite: Tramite | null; code: string }>('gov.tramite_book', { tramite_id: tr.id }); setBooking({ tramite: r?.tramite ?? null, code: r?.code ?? null }); }}>
              {t('gov.book')}
            </button>
          </li>
        ))}
      </ul>

      {booking?.tramite ? (
        <div className="gov__confirm nd-card">
          <span className="nd-pill nd-pill--success">{t('common.confirmed')}</span>
          <strong>{booking.tramite.name}</strong>
          <span className="nd-mono">{t('common.code_label')}: {booking.code}</span>
        </div>
      ) : null}

      <hr className="gov__sep" />

      <div className="gov__ruc nd-card">
        <span className="nd-eyebrow">{t('gov.ruc_lookup')}</span>
        <div className="gov__ruc_row">
          <input className="nd-input nd-mono" placeholder={t('gov.ruc_placeholder')} value={ruc} onChange={(e) => setRuc(e.target.value)} />
          <button type="button" className="nd-btn" onClick={async () => { const r = await callTool<{ ok: boolean; razon_social: string | null; estado: string; regimen: string | null }>('gov.ruc_lookup', { ruc }); setRucResult(r); }}>
            {t('gov.search_btn')}
          </button>
        </div>
        {rucResult ? (
          <ul className="gov__ruc_res">
            <li><dt>{t('gov.ruc_razon')}</dt><dd>{rucResult.razon_social ?? '—'}</dd></li>
            <li><dt>{t('gov.ruc_estado')}</dt><dd className={rucResult.estado === 'ACTIVO' ? 'is-ok' : ''}>{rucResult.estado}</dd></li>
            <li><dt>{t('gov.ruc_regimen')}</dt><dd>{rucResult.regimen ?? '—'}</dd></li>
          </ul>
        ) : null}
      </div>

      <style jsx>{`
        .gov { display: flex; flex-direction: column; gap: 12px; }
        .gov__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .gov__row { display: flex; flex-direction: column; gap: 8px; }
        .gov__row_top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .gov__row_top strong { font-size: 14px; color: var(--nd-t1); }
        .gov__desc { font-size: 13px; color: var(--nd-t2); margin: 0; line-height: 1.5; }
        .gov__meta { display: flex; gap: 6px; flex-wrap: wrap; font-size: 11px; color: var(--nd-t3); align-items: center; }
        .gov__confirm { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; padding: 14px; }
        .gov__sep { border: 0; border-top: 1px dashed var(--nd-border); margin: 0; }
        .gov__ruc { display: flex; flex-direction: column; gap: 8px; }
        .gov__ruc_row { display: flex; gap: 8px; }
        .gov__ruc_row input { flex: 1; }
        .gov__ruc_res { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr; gap: 6px; font-size: 13px; }
        .gov__ruc_res li { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px dashed var(--nd-border); }
        .gov__ruc_res dt { color: var(--nd-t3); margin: 0; }
        .gov__ruc_res dd { color: var(--nd-t1); margin: 0; }
        .is-ok { color: var(--nd-success); }
      `}</style>
    </div>
  );
}
