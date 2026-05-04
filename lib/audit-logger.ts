/**
 * Estonia X-Road style audit trail. In-memory + localStorage on the client side.
 */
export interface AuditEntry {
  id: string;
  ts: string;
  agency: string;
  agencyKey: 'mitic' | 'dnit' | 'ips' | 'mec' | 'policia' | 'rcp' | 'sen' | 'bcp' | 'iconsai';
  action: 'read' | 'write' | 'share';
  resource: string;
  reason: string;
  citizenId: string;
}

const STORAGE_KEY = 'nanduti.audit';
const MEMORY_LOG: AuditEntry[] = [];

function uid(): string {
  return `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function logAudit(entry: Omit<AuditEntry, 'id' | 'ts'>): AuditEntry {
  const full: AuditEntry = { ...entry, id: uid(), ts: new Date().toISOString() };
  MEMORY_LOG.unshift(full);
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list: AuditEntry[] = raw ? JSON.parse(raw) : [];
      list.unshift(full);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
    } catch {
      /* noop */
    }
  }
  return full;
}

export function getAudit(): AuditEntry[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AuditEntry[];
    } catch {
      /* noop */
    }
  }
  return [...MEMORY_LOG];
}

export const SEED_AUDIT: AuditEntry[] = [
  { id: 'aud_seed_1', ts: new Date(Date.now() - 86400000 * 2).toISOString(), agency: 'IPS', agencyKey: 'ips', action: 'read', resource: 'vaccination_card', reason: 'Verificación campaña hexavalente', citizenId: '4521846' },
  { id: 'aud_seed_2', ts: new Date(Date.now() - 86400000 * 5).toISOString(), agency: 'DNIT', agencyKey: 'dnit', action: 'read', resource: 'ruc_status', reason: 'Consulta RUC autoservicio', citizenId: '4521846' },
  { id: 'aud_seed_3', ts: new Date(Date.now() - 86400000 * 12).toISOString(), agency: 'MEC', agencyKey: 'mec', action: 'read', resource: 'enrollment_status', reason: 'Confirmación matrícula 2026', citizenId: '4521846' },
  { id: 'aud_seed_4', ts: new Date(Date.now() - 86400000 * 18).toISOString(), agency: 'MITIC', agencyKey: 'mitic', action: 'read', resource: 'identity_electronica', reason: 'Login paraguay.gov.py', citizenId: '4521846' },
  { id: 'aud_seed_5', ts: new Date(Date.now() - 86400000 * 22).toISOString(), agency: 'BCP', agencyKey: 'bcp', action: 'read', resource: 'wallet_kyc', reason: 'Onboarding billetera Ñandutí', citizenId: '4521846' },
  { id: 'aud_seed_6', ts: new Date(Date.now() - 86400000 * 28).toISOString(), agency: 'Registro Civil', agencyKey: 'rcp', action: 'read', resource: 'birth_certificate', reason: 'Inscripción Mateo González (3 años)', citizenId: '4521846' },
];
