'use client';

import { useEffect, useState } from 'react';
import { callTool, fmtPyg, fmtUsdc } from '@/lib/api-client';
import { useNandutiLocale } from '@/components/LocaleProvider';

interface CryptoData {
  card: { last4: string; locked: boolean; bin_sponsor: string };
  balances: { usdc: number; pyg_equiv: number };
  quote: { usdc_pyg: number; source: string };
  disclaimer: Partial<Record<'es' | 'gn' | 'jopara' | 'pt' | 'en', string>>;
}

export default function CryptoCardApp() {
  const { t, locale } = useNandutiLocale();
  const [data, setData] = useState<CryptoData | null>(null);
  const [topupAmt, setTopupAmt] = useState('');
  const [locked, setLocked] = useState(false);
  const [topupResult, setTopupResult] = useState<{ ok: boolean; usdc_received: number; code: string | null } | null>(null);

  useEffect(() => { callTool<CryptoData>('crypto.balance').then((d) => { setData(d); setLocked(!!d?.card.locked); }); }, []);

  const doTopup = async () => {
    const r = await callTool<{ ok: boolean; usdc_received: number; code: string | null }>('crypto.topup', { amount_pyg: Number(topupAmt.replace(/\D/g, '')) });
    setTopupResult(r);
    if (r?.ok) callTool<CryptoData>('crypto.balance').then(setData);
  };

  const toggle = async () => {
    const next = !locked;
    setLocked(next);
    await callTool('crypto.toggle_lock', { lock: next });
  };

  return (
    <div className="cry">
      <div className={`nd-disclaimer is-permanent nd-disclaimer--crypto`} role="note">
        <strong>{data?.disclaimer[locale] ?? t('crypto.disclaimer')}</strong>
      </div>

      <article className="cry__card">
        <header>
          <span className="cry__brand">mastercard</span>
          <span className="cry__bin">BIN sponsor: {data?.card.bin_sponsor ?? 'ueno'}</span>
        </header>
        <div className="cry__num nd-mono">···· ···· ···· {data?.card.last4 ?? '4827'}</div>
        <footer>
          <div>
            <span className="nd-eyebrow">USDC</span>
            <strong className="nd-mono cry__usdc">{data ? fmtUsdc(data.balances.usdc) : '—'}</strong>
          </div>
          <div className="cry__pyg">
            <span className="nd-eyebrow">≈ Gs.</span>
            <strong className="nd-mono">{data ? fmtPyg(data.balances.pyg_equiv) : '—'}</strong>
          </div>
        </footer>
      </article>

      <p className="cry__quote nd-mono">{t('crypto.rate').replace('{rate}', String(data?.quote.usdc_pyg ?? 7620))} · {data?.quote.source}</p>

      <section className="nd-card cry__topup">
        <span className="nd-eyebrow">{t('crypto.topup')}</span>
        <div className="cry__row">
          <input className="nd-input nd-mono" value={topupAmt} onChange={(e) => setTopupAmt(e.target.value)} placeholder={t('crypto.topup_placeholder')} inputMode="numeric" />
          <button type="button" className="nd-btn nd-btn--primary" onClick={doTopup} disabled={!topupAmt}>+ USDC</button>
        </div>
        {topupResult ? (
          <p className={topupResult.ok ? 'cry__ok' : 'cry__err'}>
            {topupResult.ok ? `+${fmtUsdc(topupResult.usdc_received)} USDC · ${topupResult.code}` : 'Monto fuera de rango (50.000 - 50.000.000 Gs.)'}
          </p>
        ) : null}
      </section>

      <button type="button" className={`nd-btn ${locked ? 'nd-btn--danger' : ''}`} onClick={toggle}>
        {locked ? t('crypto.unlock') : t('crypto.lock')}
      </button>

      <style jsx>{`
        .cry { display: flex; flex-direction: column; gap: 12px; }
        .cry__card { background: linear-gradient(135deg, #1A0033 0%, #4C1D95 60%, #7C3AED 100%); border-radius: 18px; padding: 22px; color: white; min-height: 200px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 18px 50px rgba(76,29,149,0.5); }
        .cry__card header { display: flex; justify-content: space-between; align-items: center; }
        .cry__brand { font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; font-size: 14px; }
        .cry__bin { font-size: 11px; opacity: 0.7; font-family: 'JetBrains Mono', monospace; }
        .cry__num { font-size: 22px; letter-spacing: 0.18em; }
        .cry__card footer { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
        .cry__usdc { font-size: 28px; }
        .cry__pyg { text-align: right; }
        .cry__pyg strong { display: block; font-size: 16px; opacity: 0.9; }
        .cry__quote { font-size: 11px; color: var(--nd-t3); text-align: center; }
        .cry__topup { display: flex; flex-direction: column; gap: 8px; }
        .cry__row { display: flex; gap: 8px; }
        .cry__row input { flex: 1; }
        .cry__ok { color: var(--nd-success); font-size: 13px; }
        .cry__err { color: var(--nd-danger); font-size: 13px; }
      `}</style>
    </div>
  );
}
