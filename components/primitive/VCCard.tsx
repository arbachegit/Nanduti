'use client';

import type { DocItem } from '@/data/mock-docs';

export default function VCCard({ doc, onShare }: { doc: DocItem; onShare?: (id: string) => void }) {
  return (
    <article className="vc">
      <header className="vc__h">
        <span className="nd-eyebrow">{doc.format}</span>
        <span className="nd-pill">{doc.issuer}</span>
      </header>
      <h3 className="vc__title">{doc.title}</h3>
      <dl className="vc__grid">
        <div><dt>Emisión</dt><dd className="nd-mono">{doc.issued}</dd></div>
        <div><dt>Vence</dt><dd className="nd-mono">{doc.expires ?? '—'}</dd></div>
        <div><dt>VC ID</dt><dd className="nd-mono vc__vcid">{doc.vc_id}</dd></div>
      </dl>
      <footer className="vc__f">
        <div className="vc__qr" aria-hidden="true">
          <svg viewBox="0 0 80 80" width="64" height="64">
            <rect width="80" height="80" fill="white" />
            {Array.from({ length: 64 }).map((_, i) => {
              const x = (i % 8) * 10;
              const y = Math.floor(i / 8) * 10;
              const on = ((doc.vc_id.charCodeAt(i % doc.vc_id.length) + i) & 1) === 0;
              return on ? <rect key={i} x={x} y={y} width="10" height="10" fill="black" /> : null;
            })}
          </svg>
        </div>
        {onShare ? (
          <button type="button" className="nd-btn" onClick={() => onShare(doc.id)}>
            Compartir
          </button>
        ) : null}
      </footer>
      <style jsx>{`
        .vc { background: linear-gradient(135deg, rgba(0,229,255,0.05), rgba(168,85,247,0.05)); border: 1px solid var(--nd-border); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .vc__h { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .vc__title { margin: 0; font-size: 16px; line-height: 1.3; color: var(--nd-t1); }
        .vc__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin: 0; font-size: 12px; }
        .vc__grid > div { display: flex; flex-direction: column; gap: 2px; }
        .vc__grid dt { color: var(--nd-t3); letter-spacing: 0.04em; text-transform: uppercase; font-size: 10px; }
        .vc__grid dd { margin: 0; color: var(--nd-t1); }
        .vc__vcid { font-size: 10px; color: var(--nd-cyan); overflow: hidden; text-overflow: ellipsis; }
        .vc__f { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-top: 8px; border-top: 1px dashed var(--nd-border); }
        .vc__qr { background: white; padding: 4px; border-radius: 6px; }
      `}</style>
    </article>
  );
}
