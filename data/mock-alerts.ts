export interface AlertItem {
  id: string;
  ts: string;
  category: 'clima' | 'seguridad' | 'salud' | 'transito' | 'apagon';
  level: 'verde' | 'amarillo' | 'naranja' | 'rojo';
  title: string;
  body: string;
  geo: { lat: number; lng: number; radius_km: number; label: string };
  source: string;
}

export const mockAlerts: AlertItem[] = [
  { id: 'al1', ts: new Date(Date.now() - 3600_000 * 1).toISOString(), category: 'clima', level: 'amarillo', title: 'Tormenta eléctrica en Asunción', body: 'Vientos hasta 70 km/h previstos entre 18h y 22h. Aseguren objetos sueltos.', geo: { lat: -25.262, lng: -57.616, radius_km: 15, label: 'Gran Asunción' }, source: 'DINAC + SEN' },
  { id: 'al2', ts: new Date(Date.now() - 3600_000 * 6).toISOString(), category: 'transito', level: 'naranja', title: 'Corte Av. España por evento', body: 'Av. España entre Brasilia y San Martín cortada hasta las 22h. Use rutas alternas.', geo: { lat: -25.286, lng: -57.605, radius_km: 2, label: 'Asunción Centro' }, source: 'Caminera' },
  { id: 'al3', ts: new Date(Date.now() - 3600_000 * 11).toISOString(), category: 'apagon', level: 'amarillo', title: 'Mantenimiento ANDE - Trinidad', body: 'Corte programado domingo 06h-10h. Avise vecinos con pacientes electrodependientes.', geo: { lat: -25.262, lng: -57.616, radius_km: 1.5, label: 'Trinidad' }, source: 'ANDE' },
  { id: 'al4', ts: new Date(Date.now() - 3600_000 * 26).toISOString(), category: 'clima', level: 'rojo', title: 'Inundación Chaco - alerta máxima', body: 'Crecida del río Pilcomayo. Operativos SEN en Pte. Hayes.', geo: { lat: -25.337, lng: -57.518, radius_km: 80, label: 'Chaco - Pte. Hayes' }, source: 'SEN' },
  { id: 'al5', ts: new Date(Date.now() - 3600_000 * 36).toISOString(), category: 'salud', level: 'verde', title: 'Brote dengue controlado en Lambaré', body: 'Cobertura fumigación 80%. Mantenete sin agua estancada en patios.', geo: { lat: -25.341, lng: -57.612, radius_km: 5, label: 'Lambaré' }, source: 'MSPyBS' },
  { id: 'al6', ts: new Date(Date.now() - 3600_000 * 50).toISOString(), category: 'seguridad', level: 'amarillo', title: 'Robos a motos - zona Mercado 4', body: 'Dos hechos reportados últimas 24h. Evite circular solo después de 22h.', geo: { lat: -25.296, lng: -57.643, radius_km: 1, label: 'Mercado 4' }, source: 'Policía Nacional' },
  { id: 'al7', ts: new Date(Date.now() - 3600_000 * 80).toISOString(), category: 'transito', level: 'verde', title: 'Operativo verano carretera Itá', body: 'Control documental 06h-12h. Lleve cédula original.', geo: { lat: -25.486, lng: -57.351, radius_km: 5, label: 'Itá' }, source: 'Caminera' },
  { id: 'al8', ts: new Date(Date.now() - 3600_000 * 110).toISOString(), category: 'clima', level: 'amarillo', title: 'Ola de calor 39-41°C', body: 'Pico previsto domingo y lunes. Hidratación y evitar sol 11h-15h.', geo: { lat: -25.262, lng: -57.616, radius_km: 25, label: 'Gran Asunción' }, source: 'DINAC' },
  { id: 'al9', ts: new Date(Date.now() - 3600_000 * 130).toISOString(), category: 'apagon', level: 'rojo', title: 'Falla regional ANDE - 4 barrios', body: 'Tres Bocas, Pinozá, Salem y Trinidad. ETA 4h. Reporte: 113.', geo: { lat: -25.262, lng: -57.616, radius_km: 6, label: 'Asunción Norte' }, source: 'ANDE' },
  { id: 'al10', ts: new Date(Date.now() - 3600_000 * 150).toISOString(), category: 'salud', level: 'verde', title: 'Vacunación móvil escuela 234', body: 'Refuerzo hexavalente y SPR. Trae carnet IPS.', geo: { lat: -25.262, lng: -57.616, radius_km: 0.5, label: 'Trinidad' }, source: 'MSPyBS + IPS' },
];

export function mockSubscribe(categories: string[], geo: string) {
  return { ok: true, categories, geo, subscriber_id: 'sub_' + Math.random().toString(36).slice(2, 10), channels: ['push', 'sms-fallback'], note: 'Demo: en producción usa SMS push oficial DINAC (gap actual).' };
}
