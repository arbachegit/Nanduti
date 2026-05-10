'use client';

import { useState } from 'react';
import { callTool } from '@/lib/api-client';
import { useNandutiLocale } from '@/components/LocaleProvider';
import PanicButton from '@/components/primitive/PanicButton';
import { mockPolice } from '@/data/mock-police';

export default function PoliceApp({ onDiscrete }: { onDiscrete: () => void }) {
  const { t } = useNandutiLocale();
  const [type, setType] = useState('');
  const [body, setBody] = useState('');
  const [discrete, setDiscrete] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);
  const [panic, setPanic] = useState<{ dispatched_to: string[]; nearest_deam: { name: string; phone: string }; eta_min: number } | null>(null);

  const submit = async () => {
    if (!type) return;
    const r = await callTool<{ id: string }>('police.complaint', { type, body, discrete });
    setSubmitted(r);
    if (discrete) onDiscrete();
  };

  return (
    <div className="pol">
      <PanicButton onPanic={async () => {
        const r = await callTool<{ dispatched_to: string[]; nearest_deam: { name: string; phone: string }; eta_min: number }>('police.panic', {});
        setPanic(r);
      }} />

      {panic ? (
        <section className="pol__panic">
          <span className="nd-pill nd-pill--danger">DESPACHADO</span>
          <ul>
            {panic.dispatched_to.map((d) => <li key={d}><strong>{d}</strong></li>)}
            <li><strong>{panic.nearest_deam.name}</strong> · {panic.nearest_deam.phone}</li>
            <li className="nd-mono">ETA: {panic.eta_min} min</li>
          </ul>
        </section>
      ) : null}

      <section className="nd-card pol__hot">
        <span className="nd-eyebrow">{t('police.hotlines_title')}</span>
        <ul>
          {mockPolice.hotlines.map((h) => (
            <li key={h.id}>
              <a href={`tel:${h.id}`} className="nd-btn">{h.label}</a>
              <small>{h.desc}</small>
            </li>
          ))}
        </ul>
      </section>

      <form className="nd-card pol__form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <span className="nd-eyebrow">{t('police.title')}</span>
        <label><span>{t('police.complaint_type')}</span>
          <select className="nd-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">—</option>
            <option value="violencia">{t('police.complaint_type_violencia')}</option>
            <option value="robo">{t('police.complaint_type_robo')}</option>
            <option value="acoso">{t('police.complaint_type_acoso')}</option>
            <option value="estafa">{t('police.complaint_type_estafa')}</option>
          </select>
        </label>
        <label><span>{t('police.complaint_body')}</span>
          <textarea className="nd-input" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <label className="pol__discrete">
          <input type="checkbox" checked={discrete} onChange={(e) => setDiscrete(e.target.checked)} />
          <span>{t('police.discrete')}</span>
          <small>{t('police.discrete_intro')}</small>
        </label>
        <button type="submit" className="nd-btn nd-btn--primary" disabled={!type}>{t('police.submit')}</button>
        {submitted ? <p className="pol__ok">{t('police.submitted')} <span className="nd-mono">#{submitted.id}</span></p> : null}
      </form>

      <style jsx>{`
        .pol { display: flex; flex-direction: column; gap: 12px; }
        .pol__panic { padding: 12px 14px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.30); border-radius: 10px; display: flex; flex-direction: column; gap: 8px; }
        .pol__panic ul { list-style: none; padding: 0; margin: 0; font-size: 13px; }
        .pol__panic li { padding: 4px 0; }
        .pol__hot ul { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 6px; }
        .pol__hot li { display: flex; flex-direction: column; gap: 2px; padding: 6px 0; border-bottom: 1px dashed var(--nd-border); }
        .pol__hot li small { font-size: 11px; color: var(--nd-t3); }
        .pol__form { display: flex; flex-direction: column; gap: 8px; }
        .pol__form label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--nd-t2); }
        .pol__discrete { background: rgba(168,85,247,0.06); padding: 10px; border-radius: 8px; }
        .pol__discrete small { font-size: 11px; color: var(--nd-t3); display: block; margin-top: 4px; }
        .pol__ok { color: var(--nd-success); font-size: 13px; padding: 8px 12px; background: rgba(16,185,129,0.1); border-radius: 8px; }
      `}</style>
    </div>
  );
}
