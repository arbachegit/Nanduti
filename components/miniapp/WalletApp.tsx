'use client';

import { useEffect, useState } from 'react';
import { callTool, fmtPyg, fmtUsdc } from '@/lib/api-client';
import { useNandutiLocale } from '@/components/LocaleProvider';
import QRScanner from '@/components/primitive/QRScanner';
import type { WalletTx } from '@/data/mock-wallet';

type Tab = 'transfer' | 'qr' | 'history';

export default function WalletApp() {
  const { t } = useNandutiLocale();
  const [tab, setTab] = useState<Tab>('transfer');
  const [balance, setBalance] = useState<{ pyg_balance: number; usdc_balance: number; card: { last4: string } } | null>(null);
  const [history, setHistory] = useState<WalletTx[]>([]);

  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [transferResult, setTransferResult] = useState<{ ok?: boolean; code?: string | null; error?: string | null } | null>(null);
  const [qrResult, setQrResult] = useState<{ merchant: string; amount: number; address: string } | null>(null);

  useEffect(() => {
    callTool<{ pyg_balance: number; usdc_balance: number; card: { last4: string } }>('wallet.balance').then(setBalance);
    callTool<{ items: WalletTx[] }>('wallet.history', { limit: 10 }).then((d) => setHistory(d?.items ?? []));
  }, []);

  const submitTransfer = async () => {
    const r = await callTool<{ ok: boolean; code: string | null; error: string | null }>('wallet.transfer', { to, amount: Number(amount.replace(/\D/g, '')), concept });
    setTransferResult(r);
    if (r?.ok) {
      setTo(''); setAmount(''); setConcept('');
      callTool<{ pyg_balance: number; usdc_balance: number; card: { last4: string } }>('wallet.balance').then(setBalance);
      callTool<{ items: WalletTx[] }>('wallet.history', { limit: 10 }).then((d) => setHistory(d?.items ?? []));
    }
  };

  return (
    <div className="wapp">
      <header className="wapp__balance nd-card">
        <div>
          <span className="nd-eyebrow">{t('wallet.balance_pyg')}</span>
          <strong className="wapp__big nd-num">Gs. {balance ? fmtPyg(balance.pyg_balance) : '—'}</strong>
        </div>
        <div className="wapp__usdc">
          <span className="nd-eyebrow">{t('wallet.balance_usdc')}</span>
          <strong className="wapp__mid nd-num">{balance ? fmtUsdc(balance.usdc_balance) : '—'}</strong>
          <span className="wapp__card">{t('wallet.card_label').replace('{last4}', balance?.card.last4 ?? '····')}</span>
        </div>
      </header>

      <nav className="wapp__tabs" role="tablist">
        {(['transfer', 'qr', 'history'] as Tab[]).map((tk) => (
          <button key={tk} role="tab" aria-selected={tab === tk} onClick={() => setTab(tk)} className={tab === tk ? 'is-active' : ''}>
            {t(`wallet.tab_${tk}`)}
          </button>
        ))}
      </nav>

      {tab === 'transfer' ? (
        <section className="wapp__form nd-card">
          <label><span>{t('wallet.to_label')}</span><input className="nd-input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Nombre o cédula" /></label>
          <label><span>{t('wallet.amount_label')}</span><input className="nd-input nd-mono" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100.000" inputMode="numeric" /></label>
          <label><span>{t('wallet.concept_label')}</span><input className="nd-input" value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Almuerzo familia" /></label>
          <button type="button" onClick={submitTransfer} disabled={!to || !amount} className="nd-btn nd-btn--primary">{t('wallet.send_btn')}</button>
          {transferResult ? (
            <p className={`wapp__msg ${transferResult.ok ? 'is-ok' : 'is-err'}`}>
              {transferResult.ok ? t('wallet.success').replace('{amount}', fmtPyg(Number(amount.replace(/\D/g, '')))) : transferResult.error ?? t('wallet.error_balance')}
              {transferResult.ok ? <span className="nd-mono"> · {transferResult.code}</span> : null}
            </p>
          ) : null}
        </section>
      ) : null}

      {tab === 'qr' ? (
        <section className="wapp__qr nd-card">
          <QRScanner onResult={async (seed) => { const r = await callTool<{ merchant: string; amount: number; address: string }>('wallet.qr_pay', { qr_seed: seed }); setQrResult(r); }} />
          {qrResult ? (
            <div className="wapp__qrres">
              <strong>{qrResult.merchant}</strong>
              <span className="nd-mono">Gs. {fmtPyg(qrResult.amount)}</span>
              <span>{qrResult.address}</span>
              <button type="button" className="nd-btn nd-btn--primary">Confirmar pago</button>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === 'history' ? (
        <ul className="wapp__hist">
          {history.map((tx) => (
            <li key={tx.id} className="nd-card wapp__tx">
              <div className="wapp__tx_left">
                <span className={`wapp__tx_type wapp__tx_type--${tx.type}`}>{tx.type === 'in' ? '↓' : tx.type === 'qr' ? '◫' : tx.type === 'fx' ? '⇄' : '↑'}</span>
                <div>
                  <strong>{tx.party}</strong>
                  <span className="wapp__meta">{tx.concept}</span>
                </div>
              </div>
              <div className="wapp__tx_right">
                <span className={`nd-mono wapp__tx_amount wapp__tx_amount--${tx.type}`}>
                  {tx.type === 'in' ? '+' : tx.type === 'qr' ? '−' : tx.type === 'fx' ? '' : '−'}
                  {tx.currency === 'PYG' ? `Gs. ${fmtPyg(tx.amount)}` : `${fmtUsdc(tx.amount)} USDC`}
                </span>
                <span className="wapp__meta nd-mono">{new Date(tx.ts).toLocaleString('es-PY', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <style jsx>{`
        .wapp { display: flex; flex-direction: column; gap: 16px; }
        .wapp__balance { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 16px; padding: 20px; background: linear-gradient(135deg, rgba(16,185,129,0.06), rgba(0,229,255,0.04)); }
        .wapp__big { display: block; font-size: 32px; letter-spacing: -0.02em; color: var(--nd-t1); }
        .wapp__mid { display: block; font-size: 20px; color: var(--nd-t1); }
        .wapp__usdc { text-align: right; display: flex; flex-direction: column; gap: 2px; }
        .wapp__card { font-size: 11px; color: var(--nd-t3); font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .wapp__tabs { display: flex; gap: 4px; padding: 4px; background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 999px; align-self: flex-start; }
        .wapp__tabs button { padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--nd-t2); background: transparent; border: none; border-radius: 999px; cursor: pointer; }
        .wapp__tabs button.is-active { background: var(--nd-grad-cta); color: var(--nd-bg); }
        .wapp__form { display: flex; flex-direction: column; gap: 12px; }
        .wapp__form label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--nd-t2); }
        .wapp__msg { padding: 8px 12px; border-radius: 8px; font-size: 13px; }
        .wapp__msg.is-ok { background: rgba(16,185,129,0.10); color: var(--nd-success); }
        .wapp__msg.is-err { background: rgba(239,68,68,0.10); color: var(--nd-danger); }
        .wapp__qr { display: flex; flex-direction: column; gap: 32px; padding: 8px; align-items: stretch; }
        .wapp__qrres { display: flex; flex-direction: column; gap: 6px; padding: 14px; background: var(--nd-surface-2); border-radius: 10px; }
        .wapp__hist { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .wapp__tx { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 14px; }
        .wapp__tx_left { display: flex; gap: 12px; align-items: center; min-width: 0; }
        .wapp__tx_type { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; background: var(--nd-surface-2); border: 1px solid var(--nd-border); }
        .wapp__tx_type--in { color: var(--nd-success); }
        .wapp__tx_type--out { color: var(--nd-warn); }
        .wapp__tx_type--qr { color: var(--nd-cyan); }
        .wapp__tx_type--fx { color: var(--nd-purple); }
        .wapp__tx_left strong { display: block; font-size: 13px; color: var(--nd-t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        .wapp__meta { display: block; font-size: 11px; color: var(--nd-t3); }
        .wapp__tx_right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .wapp__tx_amount { font-size: 13px; font-weight: 600; }
        .wapp__tx_amount--in { color: var(--nd-success); }
      `}</style>
    </div>
  );
}
