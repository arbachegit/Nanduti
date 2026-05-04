/**
 * Ñandutí — 28 tool registry. Each tool has: name, description (es), input shape (TS),
 * and a deterministic mock handler. Used both as direct REST handlers and as Anthropic
 * tool_use dispatch targets.
 */
import { mockCitizen } from '@/data/mock-citizen';
import { mockWallet, mockTransfer, mockQRPayment, walletHistory } from '@/data/mock-wallet';
import { mockTramites, lookupRuc } from '@/data/mock-tramites';
import { mockHealth, mockTriage } from '@/data/mock-health';
import { mockEdu, mockTutor } from '@/data/mock-edu';
import { mockCrypto, mockTopup } from '@/data/mock-crypto';
import { mockInfoFeed, mockWeeklySummary } from '@/data/mock-info-feed';
import { mockAlerts, mockSubscribe } from '@/data/mock-alerts';
import { mockPolice, mockComplaint, mockPanic } from '@/data/mock-police';
import { mockDocs, mockShare } from '@/data/mock-docs';
import { SEED_AUDIT } from './audit-logger';
import { mockDelay } from './mock-delay';
import { validateCedula } from './cedula-validator';

export interface ToolDef {
  name: string;
  description: string;
  miniapp: string;
  input_schema: Record<string, unknown>;
  handler: (input: Record<string, unknown>) => Promise<unknown>;
}

const tool = (def: ToolDef) => def;

export const TOOLS: ToolDef[] = [
  tool({
    name: 'auth.cic_otp',
    description: 'Valida cédula paraguaya y OTP. Demo: cualquier OTP "123456" pasa.',
    miniapp: 'auth',
    input_schema: { type: 'object', properties: { cedula: { type: 'string' }, otp: { type: 'string' } }, required: ['cedula', 'otp'] },
    handler: async (i) => {
      await mockDelay(JSON.stringify(i));
      const cedula = String(i.cedula ?? '');
      const otp = String(i.otp ?? '');
      const cedulaValid = validateCedula(cedula);
      const otpValid = otp === '123456';
      return { ok: cedulaValid && otpValid, cedula_valid: cedulaValid, otp_valid: otpValid, citizen: cedulaValid && otpValid ? mockCitizen : null };
    },
  }),
  tool({
    name: 'auth.identidad',
    description: 'OAuth mock MITIC. Acepta cualquier code y devuelve María González.',
    miniapp: 'auth',
    input_schema: { type: 'object', properties: { code: { type: 'string' } } },
    handler: async (i) => { await mockDelay(JSON.stringify(i)); return { ok: true, citizen: mockCitizen, source: 'identidad-electronica-mitic' }; },
  }),

  tool({ name: 'wallet.balance', description: 'Devuelve saldo PYG y USDC.', miniapp: 'wallet', input_schema: { type: 'object', properties: {} }, handler: async () => { await mockDelay('wallet.balance'); return mockWallet; } }),
  tool({ name: 'wallet.transfer', description: 'Transferencia P2P en guaraníes (mock SIP-BCP).', miniapp: 'wallet', input_schema: { type: 'object', properties: { to: { type: 'string' }, amount: { type: 'number' }, concept: { type: 'string' } }, required: ['to', 'amount'] }, handler: async (i) => { await mockDelay(JSON.stringify(i)); return mockTransfer(String(i.to), Number(i.amount), String(i.concept ?? '')); } }),
  tool({ name: 'wallet.qr_pay', description: 'Pago QR Hub BCP. Cicla 3 comercios.', miniapp: 'wallet', input_schema: { type: 'object', properties: { qr_seed: { type: 'string' } } }, handler: async (i) => { await mockDelay(JSON.stringify(i)); return mockQRPayment(String(i.qr_seed ?? Date.now())); } }),
  tool({ name: 'wallet.history', description: 'Histórico de transacciones recientes.', miniapp: 'wallet', input_schema: { type: 'object', properties: { limit: { type: 'number' } } }, handler: async (i) => { await mockDelay('wallet.history'); return { items: walletHistory(Number(i.limit ?? 20)) }; } }),

  tool({ name: 'gov.tramite_search', description: 'Busca trámites en paraguay.gov.py (mock).', miniapp: 'gov', input_schema: { type: 'object', properties: { query: { type: 'string' } } }, handler: async (i) => { await mockDelay(String(i.query ?? '')); const q = String(i.query ?? '').toLowerCase(); return { items: mockTramites.filter((t) => !q || t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q))) }; } }),
  tool({ name: 'gov.tramite_book', description: 'Reserva turno para un trámite.', miniapp: 'gov', input_schema: { type: 'object', properties: { tramite_id: { type: 'string' }, office: { type: 'string' }, date: { type: 'string' } }, required: ['tramite_id'] }, handler: async (i) => { await mockDelay(JSON.stringify(i)); const t = mockTramites.find((x) => x.id === i.tramite_id); return { ok: !!t, tramite: t, office: i.office ?? 'Asunción Centro', date: i.date ?? new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10), code: 'PY-' + Math.random().toString(36).slice(2, 8).toUpperCase() }; } }),
  tool({ name: 'gov.ruc_lookup', description: 'Consulta RUC en DNIT.', miniapp: 'gov', input_schema: { type: 'object', properties: { ruc: { type: 'string' } }, required: ['ruc'] }, handler: async (i) => { await mockDelay(String(i.ruc)); return lookupRuc(String(i.ruc)); } }),

  tool({ name: 'health.triage', description: 'Triagem en es/gn/jopará. Disclaimer permanente.', miniapp: 'health', input_schema: { type: 'object', properties: { symptoms: { type: 'string' } }, required: ['symptoms'] }, handler: async (i) => { await mockDelay(String(i.symptoms)); return mockTriage(String(i.symptoms)); } }),
  tool({ name: 'health.book_appointment', description: 'Reserva turno en USF.', miniapp: 'health', input_schema: { type: 'object', properties: { usf_id: { type: 'string' }, reason: { type: 'string' } } }, handler: async (i) => { await mockDelay(JSON.stringify(i)); const usf = mockHealth.usfs.find((u) => u.id === i.usf_id) ?? mockHealth.usfs[0]; return { ok: true, usf, when: new Date(Date.now() + 86400000 * 2).toISOString(), code: 'IPS-' + Math.random().toString(36).slice(2, 8).toUpperCase() }; } }),
  tool({ name: 'health.vaccination_card', description: 'Carnet de vacunación familiar.', miniapp: 'health', input_schema: { type: 'object', properties: { member: { type: 'string' } } }, handler: async (i) => { await mockDelay(String(i.member ?? 'all')); return { card: mockHealth.vaccination, family: mockCitizen.family.map((m) => ({ name: m.name, age: m.age, vaccines: mockHealth.vaccination.byMember[m.cic ?? ''] ?? mockHealth.vaccination.byMember.default })) }; } }),

  tool({ name: 'edu.report_card', description: 'Boletín escolar de Sofía González.', miniapp: 'edu', input_schema: { type: 'object', properties: { student_id: { type: 'string' } } }, handler: async () => { await mockDelay('edu.report'); return mockEdu.report; } }),
  tool({ name: 'edu.enroll', description: 'Matrícula escolar 2026.', miniapp: 'edu', input_schema: { type: 'object', properties: { student_id: { type: 'string' }, school_id: { type: 'string' } } }, handler: async (i) => { await mockDelay(JSON.stringify(i)); return { ok: true, status: 'confirmed', school: mockEdu.schools[0], code: 'MEC-' + Math.random().toString(36).slice(2, 8).toUpperCase() }; } }),
  tool({ name: 'edu.tutor', description: 'Tutor IA bilingüe (mat/lectura). Gap PISA 2022.', miniapp: 'edu', input_schema: { type: 'object', properties: { topic: { type: 'string' }, lang: { type: 'string' } }, required: ['topic'] }, handler: async (i) => { await mockDelay(String(i.topic)); return mockTutor(String(i.topic), String(i.lang ?? 'jopara')); } }),

  tool({ name: 'crypto.balance', description: 'Saldo USDC + cotización mock. Disclaimer activo virtual experimental.', miniapp: 'crypto', input_schema: { type: 'object', properties: {} }, handler: async () => { await mockDelay('crypto.balance'); return mockCrypto; } }),
  tool({ name: 'crypto.topup', description: 'Recarga USDC desde saldo PYG (mock Circle/Ueno).', miniapp: 'crypto', input_schema: { type: 'object', properties: { amount_pyg: { type: 'number' } }, required: ['amount_pyg'] }, handler: async (i) => { await mockDelay(JSON.stringify(i)); return mockTopup(Number(i.amount_pyg ?? 0)); } }),
  tool({ name: 'crypto.toggle_lock', description: 'Bloquea/desbloquea Mastercard USDC.', miniapp: 'crypto', input_schema: { type: 'object', properties: { lock: { type: 'boolean' } }, required: ['lock'] }, handler: async (i) => { await mockDelay(JSON.stringify(i)); return { ok: true, locked: !!i.lock, last4: '4827' }; } }),

  tool({ name: 'info.feed', description: 'Feed curado de comunicados oficiales.', miniapp: 'info', input_schema: { type: 'object', properties: { category: { type: 'string' }, limit: { type: 'number' } } }, handler: async (i) => { await mockDelay(JSON.stringify(i)); const list = mockInfoFeed.filter((x) => !i.category || x.category === i.category); return { items: list.slice(0, Number(i.limit ?? 10)) }; } }),
  tool({ name: 'info.weekly_summary', description: 'Resumen semanal IA del feed oficial.', miniapp: 'info', input_schema: { type: 'object', properties: { lang: { type: 'string' } } }, handler: async (i) => { await mockDelay('weekly'); return mockWeeklySummary(String(i.lang ?? 'jopara')); } }),

  tool({ name: 'alerts.subscribe', description: 'Subscripción geo + categorías SEN/DINAC.', miniapp: 'alerts', input_schema: { type: 'object', properties: { categories: { type: 'array', items: { type: 'string' } }, geo: { type: 'string' } } }, handler: async (i) => { await mockDelay(JSON.stringify(i)); return mockSubscribe(Array.isArray(i.categories) ? (i.categories as string[]) : [], String(i.geo ?? 'Asunción')); } }),
  tool({ name: 'alerts.recent', description: 'Alertas recientes geolocalizadas.', miniapp: 'alerts', input_schema: { type: 'object', properties: { limit: { type: 'number' } } }, handler: async (i) => { await mockDelay('alerts.recent'); return { items: mockAlerts.slice(0, Number(i.limit ?? 10)) }; } }),

  tool({ name: 'police.complaint', description: 'Denuncia online. Audit aislado en modo discreto.', miniapp: 'police', input_schema: { type: 'object', properties: { type: { type: 'string' }, body: { type: 'string' }, discrete: { type: 'boolean' } }, required: ['type'] }, handler: async (i) => { await mockDelay(JSON.stringify(i)); return mockComplaint(String(i.type), String(i.body ?? ''), !!i.discrete); } }),
  tool({ name: 'police.panic', description: 'Botón pánico. Despacha 911 + 137 + DEAM más cercana.', miniapp: 'police', input_schema: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' } } }, handler: async (i) => { await mockDelay('panic'); return mockPanic(Number(i.lat ?? mockCitizen.geo.lat), Number(i.lng ?? mockCitizen.geo.lng)); } }),
  tool({ name: 'police.track', description: 'Seguimiento de denuncias activas.', miniapp: 'police', input_schema: { type: 'object', properties: { case_id: { type: 'string' } } }, handler: async () => { await mockDelay('police.track'); return { items: mockPolice.cases }; } }),

  tool({ name: 'docs.list', description: 'Lista 6 credenciales W3C VC.', miniapp: 'docs', input_schema: { type: 'object', properties: {} }, handler: async () => { await mockDelay('docs.list'); return { items: mockDocs }; } }),
  tool({ name: 'docs.share', description: 'VC de un solo uso para compartir.', miniapp: 'docs', input_schema: { type: 'object', properties: { doc_id: { type: 'string' }, ttl_sec: { type: 'number' } }, required: ['doc_id'] }, handler: async (i) => { await mockDelay(JSON.stringify(i)); return mockShare(String(i.doc_id), Number(i.ttl_sec ?? 600)); } }),
  tool({ name: 'docs.audit', description: 'Audit trail estoniano: quién consultó tus datos.', miniapp: 'docs', input_schema: { type: 'object', properties: { limit: { type: 'number' } } }, handler: async (i) => { await mockDelay('docs.audit'); return { items: SEED_AUDIT.slice(0, Number(i.limit ?? 50)) }; } }),
];

export function getTool(name: string): ToolDef | undefined {
  return TOOLS.find((t) => t.name === name);
}

export function asAnthropicTools() {
  return TOOLS.map((t) => ({ name: t.name.replace(/\./g, '_'), description: t.description, input_schema: t.input_schema as { type: 'object'; properties: Record<string, unknown> } }));
}

export function dotName(snake: string): string | null {
  const m = TOOLS.find((t) => t.name.replace(/\./g, '_') === snake);
  return m ? m.name : null;
}
