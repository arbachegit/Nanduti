'use client';

import { useEffect, useState } from 'react';
import { callTool } from '@/lib/api-client';
import { useNandutiLocale } from '@/components/LocaleProvider';

interface ReportSubject { name: string; score: number; max: number; trend: string; pisa_band?: string; note: string; }
interface Report { student: { name: string; grade: string; school: string }; period: string; subjects: ReportSubject[]; attendance: { presente: number; ausente: number; total: number; pct: number }; pisa_context: string; }
interface TutorOut { explanation: string; next_exercise: string; pisa_focus: string; }

type Tab = 'report' | 'enroll' | 'tutor';

export default function EduApp() {
  const { t, locale } = useNandutiLocale();
  const [tab, setTab] = useState<Tab>('report');
  const [report, setReport] = useState<Report | null>(null);
  const [topic, setTopic] = useState('');
  const [tutor, setTutor] = useState<TutorOut | null>(null);

  useEffect(() => {
    if (tab === 'report' && !report) callTool<Report>('edu.report_card').then(setReport);
  }, [tab, report]);

  return (
    <div className="edu">
      <nav className="edu__tabs" role="tablist">
        {(['report', 'enroll', 'tutor'] as Tab[]).map((tk) => (
          <button key={tk} role="tab" aria-selected={tab === tk} className={tab === tk ? 'is-active' : ''} onClick={() => setTab(tk)}>
            {t(`edu.tab_${tk}`)}
          </button>
        ))}
      </nav>

      {tab === 'report' && report ? (
        <section className="edu__report">
          <header className="nd-card edu__head">
            <strong>{report.student.name}</strong>
            <span className="nd-pill">{report.student.grade} · {report.student.school}</span>
            <span className="edu__period">{report.period}</span>
          </header>
          <ul className="edu__subjects">
            {report.subjects.map((s) => (
              <li key={s.name} className="nd-card edu__subj">
                <div>
                  <strong>{s.name}</strong>
                  <p>{s.note}</p>
                </div>
                <div className="edu__score">
                  <span className="nd-mono">{s.score.toFixed(1)} / {s.max}</span>
                  <span className={`edu__trend edu__trend--${s.trend}`}>{s.trend === 'up' ? '↗' : s.trend === 'down' ? '↘' : '→'}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="edu__pisa">{report.pisa_context}</p>
        </section>
      ) : null}

      {tab === 'enroll' ? (
        <section className="nd-card">
          <h4>Matrícula 2026 — Sofía</h4>
          <p>Escuela Pública 234 - Trinidad. Clase 3°-A. Prof. Liliana Romero.</p>
          <button type="button" className="nd-btn nd-btn--primary" onClick={() => callTool('edu.enroll', { student_id: '5432109', school_id: 'ESC-234' })}>{t('edu.enroll_btn')}</button>
        </section>
      ) : null}

      {tab === 'tutor' ? (
        <section className="edu__tutor nd-card">
          <label>
            <span>{t('edu.tutor_topic_label')}</span>
            <input className="nd-input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t('edu.tutor_topic_placeholder')} />
          </label>
          <button type="button" className="nd-btn nd-btn--primary" disabled={!topic} onClick={async () => { const r = await callTool<TutorOut>('edu.tutor', { topic, lang: locale }); setTutor(r); }}>{t('edu.tutor_ask')}</button>
          {tutor ? (
            <div className="edu__tutor_out">
              <p>{tutor.explanation}</p>
              <p className="edu__exercise nd-pill nd-pill--info">{tutor.next_exercise}</p>
              <small className="edu__pisa">{tutor.pisa_focus}</small>
            </div>
          ) : null}
        </section>
      ) : null}

      <style jsx>{`
        .edu { display: flex; flex-direction: column; gap: 12px; }
        .edu__tabs { display: flex; gap: 4px; padding: 4px; background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 999px; align-self: flex-start; }
        .edu__tabs button { padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--nd-t2); background: transparent; border: none; border-radius: 999px; cursor: pointer; }
        .edu__tabs button.is-active { background: linear-gradient(135deg, var(--nd-app-edu), #FBBF24); color: var(--nd-bg); }
        .edu__head { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
        .edu__period { font-size: 11px; color: var(--nd-t3); }
        .edu__subjects { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .edu__subj { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
        .edu__subj strong { display: block; font-size: 14px; }
        .edu__subj p { margin: 4px 0 0; font-size: 12px; color: var(--nd-t2); }
        .edu__score { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .edu__trend { font-size: 18px; }
        .edu__trend--up { color: var(--nd-success); }
        .edu__trend--down { color: var(--nd-danger); }
        .edu__trend--flat { color: var(--nd-t3); }
        .edu__pisa { font-size: 12px; color: var(--nd-t3); padding: 12px; background: rgba(168,85,247,0.06); border-radius: 8px; line-height: 1.5; }
        .edu__tutor label { display: flex; flex-direction: column; gap: 4px; }
        .edu__tutor_out { display: flex; flex-direction: column; gap: 8px; padding: 12px; background: rgba(168,85,247,0.06); border-radius: 8px; }
        .edu__tutor_out p { margin: 0; line-height: 1.6; }
        .edu__exercise { align-self: flex-start; font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </div>
  );
}
