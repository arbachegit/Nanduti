export const mockHealth = {
  ips: { active: true, segurada_id: 'IPS-789-456-123', plan: 'Trabajador Activo', last_visit: '2026-02-18' },
  usfs: [
    { id: 'usf-trinidad', name: 'USF Trinidad', address: 'Av. Mcal. López 4810', distance_km: 0.8, especialidades: ['general', 'pediatría', 'ginecología'], turnos_disponibles: 5 },
    { id: 'usf-salembee', name: 'USF Salem Beegou', address: 'Calle Choferes 123', distance_km: 1.4, especialidades: ['general', 'odontología'], turnos_disponibles: 3 },
    { id: 'usf-ssa', name: 'USF San Pablo', address: 'Av. de la Victoria 990', distance_km: 2.1, especialidades: ['general', 'salud mental'], turnos_disponibles: 2 },
    { id: 'usf-tres', name: 'USF Tres Bocas', address: 'Cerro Cora 45', distance_km: 3.4, especialidades: ['general', 'pediatría'], turnos_disponibles: 7 },
    { id: 'usf-cdc', name: 'Hospital Distrital Central', address: 'Eligio Ayala 987', distance_km: 4.6, especialidades: ['emergencia 24h', 'cirugía menor'], turnos_disponibles: 12 },
  ],
  vaccination: {
    family_status: 'al-dia-parcial',
    next_due: { name: 'Mateo González', age: 3, vaccine: 'Hexavalente refuerzo', due_date: '2026-06-12' },
    byMember: {
      '5432109': [
        { vaccine: 'BCG', date: '2017-08-15', dose: 'única' },
        { vaccine: 'Hexavalente', date: '2017-10-15', dose: '1°' },
        { vaccine: 'Hexavalente', date: '2017-12-15', dose: '2°' },
        { vaccine: 'Hexavalente', date: '2018-02-15', dose: '3°' },
        { vaccine: 'SPR', date: '2018-08-15', dose: '1°' },
        { vaccine: 'COVID-19 pediátrica', date: '2023-04-20', dose: '1°' },
      ],
      '5432110': [
        { vaccine: 'BCG', date: '2022-04-22', dose: 'única' },
        { vaccine: 'Hexavalente', date: '2022-06-22', dose: '1°' },
        { vaccine: 'Hexavalente', date: '2022-08-22', dose: '2°' },
        { vaccine: 'Hexavalente', date: '2022-10-22', dose: '3°' },
      ],
      default: [{ vaccine: 'Vacunas adulto', date: '2024-04-01', dose: 'al día' }],
    } as Record<string, Array<{ vaccine: string; date: string; dose: string }>>,
  },
};

const TRIAGE_PATTERNS = [
  { match: ['fiebre', 'tos', 'gripe', 'akãnundu', 'fiebrépe'], level: 'verde', action: 'usf', message: 'Síntomas compatibles con cuadro viral leve. Reposo, hidratación y paracetamol. Si la fiebre persiste >72h o aparece dificultad respiratoria, consulta presencial en USF.' },
  { match: ['dolor', 'pecho', 'corazón'], level: 'rojo', action: 'emergency', message: 'Dolor torácico requiere evaluación médica inmediata. Llamá al 911 o asistí a emergencia más cercana ahora.' },
  { match: ['embarazo', 'sangrado'], level: 'amarillo', action: 'usf', message: 'Sangrado en embarazo requiere consulta el mismo día. Reservá turno en USF Trinidad ahora.' },
  { match: ['tristeza', 'angustia', 'suicidio', '155', 'mental', 'angustiado'], level: 'amarillo', action: 'mental', message: 'Reconocer lo que sentís ya es un paso. Línea 155 está disponible 24h, gratis y confidencial. ¿Querés que te conecte?' },
  { match: ['niño', 'mitã', 'fiebre alta'], level: 'amarillo', action: 'usf', message: 'En menores de 5 años con fiebre alta hay que descartar deshidratación. Reservá turno hoy o llamá al 911 si decae mucho.' },
];

export function mockTriage(symptoms: string) {
  const lower = symptoms.toLowerCase();
  const hit = TRIAGE_PATTERNS.find((p) => p.match.some((m) => lower.includes(m)));
  return {
    level: hit?.level ?? 'verde',
    action: hit?.action ?? 'usf',
    message: hit?.message ?? 'Síntomas leves probables. Hidratación y observación 24h. Si empeora, consulta en USF.',
    disclaimer: 'Esta orientación es informativa. NO sustituye atención médica profesional.',
    nearest_usf: mockHealth.usfs[0],
    line_155: { active: true, label: 'Línea 155 — Salud Mental 24h' },
  };
}
