export const mockPolice = {
  deams: [
    { id: 'deam-asu', name: 'DEAM Asunción Centro', address: 'Iturbe e/ Eligio Ayala', distance_km: 1.8, phone: '021-449-700' },
    { id: 'deam-lam', name: 'DEAM Lambaré', address: 'Cerro Cora 433', distance_km: 4.2, phone: '021-908-220' },
    { id: 'deam-fde', name: 'DEAM Fernando de la Mora', address: 'Ruta Mcal. Estigarribia 4500', distance_km: 5.7, phone: '021-501-118' },
  ],
  hotlines: [
    { id: '911', label: '911 - Emergencia general', desc: 'Policía 24/7' },
    { id: '137', label: 'SOS Mujer 137', desc: 'Asistencia violencia 24/7' },
    { id: '155', label: 'Línea 155 - Salud Mental', desc: 'MSPyBS, gratuito' },
    { id: '147', label: '147 - Ayuda Niñez', desc: 'Ministerio de la Niñez 24/7' },
  ],
  cases: [
    { id: 'pn_2026_0042', ts: new Date(Date.now() - 86400_000 * 4).toISOString(), type: 'robo', status: 'en_proceso', body: 'Cartera arrancada en Mercado 4 - chofer huyó en moto', officer: 'Sub. Of. Ayala' },
  ],
};

export function mockComplaint(type: string, body: string, discrete: boolean) {
  const id = 'pn_' + new Date().getFullYear() + '_' + Math.random().toString(36).slice(2, 6).toUpperCase();
  return {
    ok: true,
    id,
    type,
    discrete,
    body,
    status: 'recibido',
    next: 'Vas a recibir un código de seguimiento por SMS. Si es urgente, llamá ya al 911.',
    audit_isolated: discrete,
    created_ts: new Date().toISOString(),
  };
}

export function mockPanic(lat: number, lng: number) {
  const nearest = mockPolice.deams[0];
  return {
    ok: true,
    dispatched_to: ['911', 'SOS 137', nearest.name],
    nearest_deam: nearest,
    eta_min: 9,
    countdown_sec: 3,
    geo: { lat, lng },
    note: 'Demo: en producción se contacta automáticamente a contactos de confianza si lo activaste.',
  };
}
