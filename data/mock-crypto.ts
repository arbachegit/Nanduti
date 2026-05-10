export const mockCrypto = {
  card: { brand: 'mastercard', last4: '4827', bin_sponsor: 'ueno', custodian: 'Circle', acquirer: 'Bancard', locked: false },
  balances: { usdc: 247.83, pyg_equiv: 1_887_945 },
  quote: { usdc_pyg: 7620, source: 'BCP/Circle indicativo', ts: new Date().toISOString(), spread_pct: 0.4 },
  recent: [
    { ts: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), kind: 'topup', amount: 50, currency: 'USDC', concept: 'Recarga PYG → USDC' },
    { ts: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(), kind: 'topup', amount: 100, currency: 'USDC', concept: 'Recarga mensual' },
    { ts: new Date(Date.now() - 1000 * 60 * 60 * 528).toISOString(), kind: 'spend', amount: 98, currency: 'USDC', concept: 'Compra Amazon' },
  ],
  disclaimer: {
    es: 'Stablecoin USDC es activo virtual experimental. Sujeto al marco regulatorio paraguayo en formación.',
    gn: 'Stablecoin USDC ha\'e mba\'erepy virtual jehechauka. Marco regulatorio paraguáipe oĩ.',
    jopara: 'Stablecoin USDC es activo virtual experimental. Marco regulatorio paraguáipe oĩ.',
    pt: 'Stablecoin USDC é ativo virtual experimental. Sujeito ao marco regulatório paraguaio em formação.',
    en: 'Stablecoin USDC is an experimental virtual asset. Subject to Paraguay\'s regulatory framework still in formation.',
  },
};

export function mockTopup(amountPyg: number) {
  const rate = mockCrypto.quote.usdc_pyg;
  const usdc = +(amountPyg / rate).toFixed(2);
  const ok = amountPyg >= 50_000 && amountPyg <= 50_000_000;
  return {
    ok,
    error: ok ? null : 'Monto fuera de rango (50.000 - 50.000.000 Gs.)',
    usdc_received: ok ? usdc : 0,
    rate,
    fee_pct: 0.4,
    code: ok ? 'CIRCLE-' + Math.random().toString(36).slice(2, 8).toUpperCase() : null,
  };
}
