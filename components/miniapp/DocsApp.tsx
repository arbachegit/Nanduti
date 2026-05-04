'use client';

import { useEffect, useState } from 'react';
import { callTool } from '@/lib/api-client';
import { useNandutiLocale } from '@/components/LocaleProvider';
import VCCard from '@/components/primitive/VCCard';
import AuditTrail from '@/components/primitive/AuditTrail';
import type { DocItem } from '@/data/mock-docs';
import type { AuditEntry } from '@/lib/audit-logger';

export default function DocsApp() {
  const { t } = useNandutiLocale();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    callTool<{ items: DocItem[] }>('docs.list').then((d) => setDocs(d?.items ?? []));
    callTool<{ items: AuditEntry[] }>('docs.audit').then((d) => setAudit(d?.items ?? []));
  }, []);

  return (
    <div className="docs">
      <button type="button" className="nd-btn" onClick={() => setShowAudit((v) => !v)}>
        {showAudit ? '← Volver a documentos' : t('docs.audit_btn')}
      </button>

      {!showAudit ? (
        <section className="docs__grid">
          {docs.map((d) => (
            <VCCard key={d.id} doc={d} onShare={async (id) => { await callTool('docs.share', { doc_id: id, ttl_sec: 600 }); }} />
          ))}
        </section>
      ) : (
        <section>
          <h4 className="docs__h">{t('docs.audit_title')}</h4>
          <AuditTrail items={audit} />
        </section>
      )}

      <style jsx>{`
        .docs { display: flex; flex-direction: column; gap: 12px; }
        .docs__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .docs__h { font-size: 14px; margin: 0 0 8px; color: var(--nd-t2); letter-spacing: 0.04em; text-transform: uppercase; }
      `}</style>
    </div>
  );
}
