import { mockCitizen } from './mock-citizen';

export interface WalletTx {
  id: string;
  ts: string;
  type: 'in' | 'out' | 'qr' | 'fx';
  amount: number;
  currency: 'PYG' | 'USDC';
  party: string;
  concept: string;
  status: 'completed' | 'pending';
}

export const mockWallet = {
  pyg_balance: mockCitizen.wallet.pyg_balance,
  usdc_balance: mockCitizen.wallet.usdc_balance,
  card: mockCitizen.wallet.card,
  network: { sip_status: 'online', qr_hub: 'online' as const },
};

const seed: WalletTx[] = [
  { id: 'tx_001', ts: new Date(Date.now() - 1000 * 60 * 35).toISOString(), type: 'in', amount: 2_650_000, currency: 'PYG', party: 'Empleador SA', concept: 'Sueldo abr/2026', status: 'completed' },
  { id: 'tx_002', ts: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), type: 'out', amount: 150_000, currency: 'PYG', party: 'ANDE 014-2334', concept: 'Factura abr 2026', status: 'completed' },
  { id: 'tx_003', ts: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), type: 'qr', amount: 28_500, currency: 'PYG', party: 'Farmacia Catedral', concept: 'QR Hub BCP', status: 'completed' },
  { id: 'tx_004', ts: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), type: 'out', amount: 75_000, currency: 'PYG', party: 'Tigo Money', concept: 'Transferencia mamá', status: 'completed' },
  { id: 'tx_005', ts: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), type: 'fx', amount: 50, currency: 'USDC', party: 'Circle.com', concept: 'Recarga USDC', status: 'completed' },
  { id: 'tx_006', ts: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), type: 'qr', amount: 12_300, currency: 'PYG', party: 'Petropar Av. Mcal.', concept: 'QR combustible', status: 'completed' },
  { id: 'tx_007', ts: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), type: 'out', amount: 320_000, currency: 'PYG', party: 'ESSAP 887234', concept: 'Agua abr 2026', status: 'completed' },
  { id: 'tx_008', ts: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), type: 'in', amount: 600_000, currency: 'PYG', party: 'Juan González', concept: 'Reembolso supermercado', status: 'completed' },
  { id: 'tx_009', ts: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), type: 'qr', amount: 95_000, currency: 'PYG', party: 'Aldea Restaurant', concept: 'QR almuerzo familia', status: 'completed' },
  { id: 'tx_010', ts: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(), type: 'out', amount: 47_800, currency: 'PYG', party: 'Conatel - Tigo', concept: 'Plan datos', status: 'completed' },
  { id: 'tx_011', ts: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), type: 'in', amount: 1_200_000, currency: 'PYG', party: 'Cooperativa Mercado 4', concept: 'Devolución capital', status: 'completed' },
  { id: 'tx_012', ts: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(), type: 'fx', amount: 100, currency: 'USDC', party: 'Bancard ↔ Circle', concept: 'Topup mensual', status: 'completed' },
  { id: 'tx_013', ts: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(), type: 'out', amount: 215_000, currency: 'PYG', party: 'IPS Aporte voluntario', concept: 'Aporte familiar', status: 'completed' },
  { id: 'tx_014', ts: new Date(Date.now() - 1000 * 60 * 60 * 288).toISOString(), type: 'qr', amount: 33_400, currency: 'PYG', party: 'Biggie Trinidad', concept: 'QR Hub BCP', status: 'completed' },
  { id: 'tx_015', ts: new Date(Date.now() - 1000 * 60 * 60 * 336).toISOString(), type: 'out', amount: 90_000, currency: 'PYG', party: 'MEC - Cuota cooperadora', concept: 'Escuela 234 - Sofía', status: 'completed' },
  { id: 'tx_016', ts: new Date(Date.now() - 1000 * 60 * 60 * 384).toISOString(), type: 'in', amount: 500_000, currency: 'PYG', party: 'DNIT Devolución IVA', concept: 'IVA factura turismo', status: 'completed' },
  { id: 'tx_017', ts: new Date(Date.now() - 1000 * 60 * 60 * 432).toISOString(), type: 'qr', amount: 18_200, currency: 'PYG', party: 'Café Asunción', concept: 'QR Hub BCP', status: 'completed' },
  { id: 'tx_018', ts: new Date(Date.now() - 1000 * 60 * 60 * 480).toISOString(), type: 'out', amount: 250_000, currency: 'PYG', party: 'BNF - Préstamo personal', concept: 'Cuota 8/12', status: 'completed' },
  { id: 'tx_019', ts: new Date(Date.now() - 1000 * 60 * 60 * 528).toISOString(), type: 'fx', amount: 98, currency: 'USDC', party: 'Mastercard 4827', concept: 'Compra Amazon', status: 'completed' },
  { id: 'tx_020', ts: new Date(Date.now() - 1000 * 60 * 60 * 600).toISOString(), type: 'in', amount: 80_000, currency: 'PYG', party: 'Cooperativa - utilidades', concept: 'Reparto utilidades', status: 'completed' },
];

export function walletHistory(limit = 20): WalletTx[] {
  return seed.slice(0, limit);
}

export function mockTransfer(to: string, amount: number, concept: string) {
  const success = amount > 0 && amount <= mockWallet.pyg_balance;
  return {
    ok: success,
    code: success ? 'SIP-' + Math.random().toString(36).slice(2, 8).toUpperCase() : null,
    error: success ? null : 'Saldo insuficiente',
    tx: success
      ? ({ id: 'tx_new_' + Date.now().toString(36), ts: new Date().toISOString(), type: 'out', amount, currency: 'PYG', party: to, concept, status: 'completed' } as WalletTx)
      : null,
  };
}

const QR_CYCLE = [
  { merchant: 'Farmacia Catedral', amount: 28_500, address: 'Mcal. López 1234' },
  { merchant: 'Petropar Av. Mcal.', amount: 12_300, address: 'Av. Mcal. López y Brasilia' },
  { merchant: 'Aldea Restaurant', amount: 95_000, address: 'Centro de Asunción' },
];

export function mockQRPayment(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h << 5) - h + seedStr.charCodeAt(i);
  const m = QR_CYCLE[Math.abs(h) % QR_CYCLE.length];
  return { ok: true, code: 'QR-' + Math.random().toString(36).slice(2, 6).toUpperCase(), merchant: m.merchant, address: m.address, amount: m.amount, currency: 'PYG' };
}
