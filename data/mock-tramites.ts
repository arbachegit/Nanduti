export interface Tramite {
  id: string;
  name: string;
  agency: string;
  agency_color: string;
  duration_min: number;
  cost_pyg: number;
  digital: boolean;
  tags: string[];
  description: string;
}

export const mockTramites: Tramite[] = [
  { id: 'tr-cic-renew', name: 'Renovación de Cédula de Identidad Civil', agency: 'Policía Nacional - Identificaciones', agency_color: '#0038A8', duration_min: 30, cost_pyg: 35_000, digital: false, tags: ['cedula', 'identidad', 'renovacion'], description: 'Renovación CIC vence cada 10 años. Requiere foto biométrica presencial.' },
  { id: 'tr-antecedentes', name: 'Antecedentes Policiales', agency: 'Policía Nacional', agency_color: '#0038A8', duration_min: 5, cost_pyg: 20_000, digital: true, tags: ['antecedentes', 'policiales'], description: 'Certificado online via paraguay.gov.py. Vigencia 30 días.' },
  { id: 'tr-dnit-rep', name: 'Liquidación IVA simplificada', agency: 'DNIT', agency_color: '#10B981', duration_min: 10, cost_pyg: 0, digital: true, tags: ['dnit', 'iva', 'impuesto'], description: 'Auto-servicio para personas físicas. Vencimiento día 7 del mes siguiente.' },
  { id: 'tr-ruc-alta', name: 'Alta de RUC Persona Física', agency: 'DNIT', agency_color: '#10B981', duration_min: 15, cost_pyg: 0, digital: true, tags: ['ruc', 'alta', 'empresa'], description: 'API pública DNIT desde 09/05/2024. Confirmación inmediata.' },
  { id: 'tr-empresa-uni', name: 'Constitución de SAS Unipersonal', agency: 'MIC + DNIT', agency_color: '#A855F7', duration_min: 90, cost_pyg: 350_000, digital: true, tags: ['empresa', 'sas', 'mic'], description: 'Formación digital 100% via paraguay.gov.py. Capital mínimo G. 1.000.000.' },
  { id: 'tr-nac', name: 'Inscripción de Nacimiento (Partida)', agency: 'Registro Civil', agency_color: '#F59E0B', duration_min: 25, cost_pyg: 15_000, digital: false, tags: ['nacimiento', 'partida', 'registro'], description: 'Primera vía gratis. Plazo legal: 60 días desde el parto.' },
];

export function lookupRuc(ruc: string) {
  const clean = ruc.replace(/\D/g, '');
  const valid = clean.length >= 7 && clean.length <= 9;
  return {
    ok: valid,
    ruc,
    razon_social: valid ? 'GONZÁLEZ ACOSTA, MARÍA' : null,
    estado: valid ? 'ACTIVO' : 'NO ENCONTRADO',
    regimen: valid ? 'IRP - Renta Personal' : null,
    actividad: valid ? '702009 - Otras actividades de consultoría' : null,
    inicio_actividades: valid ? '2018-03-04' : null,
    fuente: 'API DNIT (mock)',
  };
}
