'use client';

import type { AuditEntry } from '@/lib/audit-logger';
import { useNandutiLocale } from '@/components/LocaleProvider';

const AGENCY_COLOR: Record<string, string> = {
  mitic: '#0038A8', dnit: '#10B981', ips: '#06B6D4', mec: '#F97316',
  policia: '#EF4444', rcp: '#F59E0B', sen: '#A855F7', bcp: '#38BDF8', iconsai: '#00E5FF',
};

export default function AuditTrail({ items }: { items: AuditEntry[] }) {
  const { t } = useNandutiLocale();
  if (items.length === 0) {
    return <p className="audit-empty">{t('docs.audit_empty')}</p>;
  }
  return (
    <ol className="audit">
      {items.map((it) => (
        <li key={it.id} className="audit__row">
          <span className="audit__dot" style={{ background: AGENCY_COLOR[it.agencyKey] ?? '#8FA' }} aria-hidden="true" />
          <div className="audit__body">
            <div className="audit__line">
              <strong>{it.agency}</strong>
              <span className="nd-pill nd-pill--info">{it.action}</span>
            </div>
            <div className="audit__meta">
              <span className="nd-mono">{new Date(it.ts).toLocaleString('es-PY')}</span>
              <span>·</span>
              <span>{it.resource}</span>
            </div>
            <div className="audit__reason">{it.reason}</div>
          </div>
        </li>
      ))}
      <style jsx>{`
        .audit { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .audit__row { display: grid; grid-template-columns: 12px 1fr; gap: 12px; padding: 12px; background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 10px; }
        .audit__dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 4px; box-shadow: 0 0 0 3px rgba(255,255,255,0.04); }
        .audit__body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .audit__line { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .audit__line strong { color: var(--nd-t1); }
        .audit__meta { display: flex; gap: 6px; align-items: center; font-size: 11px; color: var(--nd-t3); flex-wrap: wrap; }
        .audit__reason { font-size: 13px; color: var(--nd-t2); line-height: 1.45; }
        .audit-empty { padding: 24px; text-align: center; color: var(--nd-t3); }
      `}</style>
    </ol>
  );
}
