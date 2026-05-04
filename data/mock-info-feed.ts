export interface InfoItem {
  id: string;
  ts: string;
  source: string;
  category: 'salud' | 'economia' | 'educacion' | 'seguridad' | 'tecnologia' | 'clima';
  title: string;
  summary: string;
  url: string;
}

export const mockInfoFeed: InfoItem[] = [
  { id: 'i1', ts: new Date(Date.now() - 3600_000 * 2).toISOString(), source: 'MITIC', category: 'tecnologia', title: 'Identidad Electrónica supera 1 millón de activaciones', summary: 'MITIC informa que paraguay.gov.py procesa 306 trámites digitales. Próximo: integración con Ñandutí.', url: 'https://www.mitic.gov.py' },
  { id: 'i2', ts: new Date(Date.now() - 3600_000 * 7).toISOString(), source: 'BCP', category: 'economia', title: 'SIP-BCP procesa transferencias 24/7 en PYG y USD', summary: 'Sistema de pagos modernizado. QR Hub interopera entre todas las billeteras del país.', url: 'https://www.bcp.gov.py' },
  { id: 'i3', ts: new Date(Date.now() - 3600_000 * 12).toISOString(), source: 'MSPyBS', category: 'salud', title: 'Campaña hexavalente alcanza 92% de cobertura', summary: 'En 2025 quedaron 28.000 niños sin primera dosis (vs 77.872 en 2023). Avance significativo.', url: 'https://www.mspbs.gov.py' },
  { id: 'i4', ts: new Date(Date.now() - 3600_000 * 24).toISOString(), source: 'MEC', category: 'educacion', title: '4.100 escuelas conectadas a internet (46%)', summary: 'En 2024 eran 23%. Plan Conectividad Educativa duplicó cobertura en 18 meses.', url: 'https://www.mec.gov.py' },
  { id: 'i5', ts: new Date(Date.now() - 3600_000 * 36).toISOString(), source: 'SEN', category: 'clima', title: 'Vigilancia activa Chaco - lluvias por encima de la media', summary: '800+ familias en alerta amarilla. Asistencia humanitaria desplegada.', url: 'https://www.sen.gov.py' },
  { id: 'i6', ts: new Date(Date.now() - 3600_000 * 48).toISOString(), source: 'Policía Nacional', category: 'seguridad', title: 'Lanzamiento de canal de denuncia online (piloto MITIC)', summary: 'Modo discreto disponible. Audit trail en línea con estándares estonianos.', url: 'https://policianacional.gov.py' },
  { id: 'i7', ts: new Date(Date.now() - 3600_000 * 72).toISOString(), source: 'DNIT', category: 'economia', title: 'API pública RUC supera 5 millones de consultas mensuales', summary: 'Disponible desde 09/05/2024. Permite integraciones de terceros sin coste.', url: 'https://www.dnit.gov.py' },
  { id: 'i8', ts: new Date(Date.now() - 3600_000 * 96).toISOString(), source: 'Conatel', category: 'tecnologia', title: '5G operativo en Asunción y Ciudad del Este', summary: 'Claro y Nubicom encienden 5G en grandes capitales. Tigo y Personal en cronograma.', url: 'https://www.conatel.gov.py' },
];

export function mockWeeklySummary(lang: string) {
  const out: Record<string, string> = {
    es: 'Esta semana en Paraguay: 1) Identidad Electrónica supera 1M de activaciones. 2) Hexavalente repunta a 92%. 3) Canal de denuncia online piloto en operación. 4) 5G activo en Asunción y CDE. Mantenete cerca, mantenete informada.',
    gn: 'Ko semana Paraguáipe: 1) Identidad Electrónica ohasáma 1M-pe. 2) Hexavalente 92%-pe. 3) Denuncia online piloto-pe. 4) 5G oĩma Paraguaýpe ha CDE-pe.',
    jopara: 'Ko semana Paraguáipe: Identidad Electrónica 1M+, hexavalente 92%, denuncia online piloto, 5G oĩma. Mantenete cerca.',
  };
  return { lang, summary: out[lang] ?? out.jopara, items_count: mockInfoFeed.length };
}
