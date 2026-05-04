export interface DocItem {
  id: string;
  type: 'cedula' | 'ruc' | 'antecedentes' | 'partida' | 'titulo' | 'carnet_ips';
  title: string;
  issuer: string;
  issued: string;
  expires: string | null;
  format: 'W3C VC';
  vc_id: string;
  qr_url: string;
}

export const mockDocs: DocItem[] = [
  { id: 'doc-cedula', type: 'cedula', title: 'Cédula de Identidad Civil', issuer: 'Policía Nacional - Identificaciones', issued: '2018-09-12', expires: '2028-09-12', format: 'W3C VC', vc_id: 'vc_cedula_4521846', qr_url: '/qr/vc_cedula_4521846' },
  { id: 'doc-ruc', type: 'ruc', title: 'Constancia RUC 4521846-6', issuer: 'DNIT', issued: '2018-03-04', expires: null, format: 'W3C VC', vc_id: 'vc_ruc_4521846', qr_url: '/qr/vc_ruc_4521846' },
  { id: 'doc-antec', type: 'antecedentes', title: 'Antecedentes Policiales', issuer: 'Policía Nacional', issued: '2026-04-15', expires: '2026-05-15', format: 'W3C VC', vc_id: 'vc_antec_4521846', qr_url: '/qr/vc_antec_4521846' },
  { id: 'doc-partida-sofia', type: 'partida', title: 'Partida de Nacimiento - Sofía González', issuer: 'Registro Civil', issued: '2017-08-28', expires: null, format: 'W3C VC', vc_id: 'vc_partida_5432109', qr_url: '/qr/vc_partida_5432109' },
  { id: 'doc-titulo', type: 'titulo', title: 'Título Universitario - Lic. en Marketing', issuer: 'UNA - Facultad CCEE', issued: '2014-12-10', expires: null, format: 'W3C VC', vc_id: 'vc_titulo_4521846', qr_url: '/qr/vc_titulo_4521846' },
  { id: 'doc-ips', type: 'carnet_ips', title: 'Carnet IPS - Trabajador Activo', issuer: 'IPS', issued: '2018-09-20', expires: null, format: 'W3C VC', vc_id: 'vc_ips_4521846', qr_url: '/qr/vc_ips_4521846' },
];

export function mockShare(docId: string, ttlSec: number) {
  const doc = mockDocs.find((d) => d.id === docId);
  return {
    ok: !!doc,
    error: doc ? null : 'Documento no encontrado',
    share_id: 'shr_' + Math.random().toString(36).slice(2, 10),
    qr_url: doc?.qr_url ?? null,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    one_time_use: true,
  };
}
