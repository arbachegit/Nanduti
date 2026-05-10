'use client';

import { useState, useEffect } from 'react';
import { callTool } from '@/lib/api-client';
import { useNandutiLocale } from '@/components/LocaleProvider';

interface TriageResult { level: 'verde' | 'amarillo' | 'rojo'; action: string; message: string; disclaimer: string; nearest_usf: { name: string; address: string }; line_155: { active: boolean; label: string }; }
interface VaccineFamily { family: Array<{ name: string; age: number; vaccines: Array<{ vaccine: string; date: string; dose: string }> }> }

type Tab = 'triage' | 'book' | 'vaccine';

export default function HealthApp() {
  const { t } = useNandutiLocale();
  const [tab, setTab] = useState<Tab>('triage');
  const [symptoms, setSymptoms] = useState('');
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [vaccines, setVaccines] = useState<VaccineFamily | null>(null);

  useEffect(() => {
    if (tab === 'vaccine' && !vaccines) callTool<VaccineFamily>('health.vaccination_card').then(setVaccines);
  }, [tab, vaccines]);

  const askTriage = async () => {
    const r = await callTool<TriageResult>('health.triage', { symptoms });
    setTriage(r);
  };

  return (
    <div className="hea">
      <div className="nd-disclaimer is-permanent" role="note">
        <strong>{t('health.triage_disclaimer')}</strong>
      </div>
      <nav className="hea__tabs" role="tablist">
        {(['triage', 'book', 'vaccine'] as Tab[]).map((tk) => (
          <button key={tk} role="tab" aria-selected={tab === tk} className={tab === tk ? 'is-active' : ''} onClick={() => setTab(tk)}>
            {t(`health.tab_${tk}`)}
          </button>
        ))}
      </nav>

      {tab === 'triage' ? (
        <section className="hea__triage nd-card">
          <label>
            <span>{t('health.symptoms_label')}</span>
            <textarea className="nd-input" rows={3} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder={t('health.symptoms_placeholder')} />
          </label>
          <button type="button" className="nd-btn nd-btn--primary" disabled={!symptoms} onClick={askTriage}>{t('health.ask')}</button>
          {triage ? (
            <div className={`hea__res hea__res--${triage.level}`}>
              <span className={`nd-pill nd-pill--${triage.level === 'verde' ? 'success' : triage.level === 'rojo' ? 'danger' : 'warn'}`}>
                {t(`health.level_${triage.level}`)}
              </span>
              <p>{triage.message}</p>
              <div className="hea__actions">
                {triage.level === 'rojo' ? (
                  <a className="nd-btn nd-btn--danger" href="tel:911">{t('health.emergency_call')}</a>
                ) : null}
                <a className="nd-btn" href="tel:155">{t('health.linea_155')}</a>
                <span className="nd-pill">{triage.nearest_usf.name} · {triage.nearest_usf.address}</span>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === 'book' ? (
        <section className="hea__book nd-card">
          <p>USF Trinidad — Av. Mcal. López 4810. Próximos turnos en 48h.</p>
          <button type="button" className="nd-btn nd-btn--primary" onClick={() => callTool('health.book_appointment', { usf_id: 'usf-trinidad' })}>{t('health.book_btn')}</button>
        </section>
      ) : null}

      {tab === 'vaccine' ? (
        <section className="hea__vac">
          {vaccines?.family.map((member) => (
            <article key={member.name} className="nd-card">
              <header>
                <strong>{member.name}</strong>
                <span className="nd-pill">{member.age} años</span>
              </header>
              <ul>
                {member.vaccines.map((v, i) => (
                  <li key={i}>
                    <span>{v.vaccine}</span>
                    <span className="nd-mono">{v.date} · {v.dose}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      ) : null}

      <style jsx>{`
        .hea { display: flex; flex-direction: column; gap: 12px; }
        .hea__tabs { display: flex; gap: 4px; padding: 4px; background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 999px; align-self: flex-start; }
        .hea__tabs button { padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--nd-t2); background: transparent; border: none; border-radius: 999px; cursor: pointer; }
        .hea__tabs button.is-active { background: linear-gradient(135deg, var(--nd-app-health), var(--nd-cyan)); color: var(--nd-bg); }
        .hea__triage label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--nd-t2); }
        .hea__triage textarea { resize: vertical; font-family: inherit; }
        .hea__res { display: flex; flex-direction: column; gap: 10px; padding: 14px; border-radius: 10px; margin-top: 10px; }
        .hea__res--verde { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); }
        .hea__res--amarillo { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2); }
        .hea__res--rojo { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); }
        .hea__res p { margin: 0; line-height: 1.6; color: var(--nd-t1); }
        .hea__actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .hea__vac { display: flex; flex-direction: column; gap: 10px; }
        .hea__vac header { display: flex; justify-content: space-between; gap: 8px; align-items: center; margin-bottom: 8px; }
        .hea__vac ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
        .hea__vac ul li { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--nd-border); font-size: 12px; }
      `}</style>
    </div>
  );
}
