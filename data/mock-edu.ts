export const mockEdu = {
  schools: [
    { id: 'ESC-234', name: 'Escuela Pública 234 - Trinidad', tipo: 'publica', has_internet: true, students: 412, classroom: '3°-A', teacher: 'Prof. Liliana Romero' },
    { id: 'ESC-901', name: 'Escuela Privada Cristo Rey', tipo: 'privada', has_internet: true, students: 280, classroom: null, teacher: null },
  ],
  report: {
    student: { name: 'Sofía González', cic: '5432109', age: 8, grade: '3°', school: 'Escuela Pública 234 - Trinidad' },
    period: 'Primer período - 2026',
    subjects: [
      { name: 'Matemática', score: 3.6, max: 5, trend: 'up', pisa_band: 'nivel 2', note: 'Lectura de números hasta 1000 ok. Multiplicación en proceso.' },
      { name: 'Comunicación Castellana', score: 3.9, max: 5, trend: 'flat', note: 'Comprensión lectora arriba del promedio del aula.' },
      { name: 'Comunicación Guaraní', score: 4.2, max: 5, trend: 'up', note: 'Excelente expresión oral. Leer en voz alta una vez por semana.' },
      { name: 'Ciencias Naturales', score: 4.1, max: 5, trend: 'up', note: 'Curiosidad muy alta sobre plantas nativas.' },
      { name: 'Historia y Geografía', score: 3.4, max: 5, trend: 'flat', note: 'Necesita reforzar mapas del Paraguay.' },
    ],
    attendance: { presente: 38, ausente: 2, total: 40, pct: 95 },
    pisa_context: 'Paraguay 2022: 15% alcanzó nivel 2 en matemática vs 69% promedio OCDE. Sofía está en nivel 2. Bien encaminada.',
  },
};

const TUTOR_TEMPLATES: Record<string, { es: string; gn: string; jopara: string }> = {
  multiplicacion: {
    es: 'Para 7 × 6 podemos pensar en 7 grupos de 6 manzanas. Sumá: 7 + 7 + 7 + 7 + 7 + 7. De a dos: 14, 14, 14. 14 + 14 + 14 = 42. ¡Eso es! 7 × 6 = 42.',
    gn: 'Mba\'éichapa jaikuaa 7 × 6? Eipuru ne kuã. 7 vez 6 = 7+7+7+7+7+7. Mokõi-mokõi: 14, 14, 14. 14+14+14 = 42.',
    jopara: 'Para 7 × 6, eipuru ne kuã. 7+7+7+7+7+7 = 42. Mokõi-mokõi son 14. 14+14+14 = 42. ¡Listo!',
  },
  lectura: {
    es: 'Cuando una palabra es difícil, leéla en partes. Por ejemplo "ñandutí": ñan-du-tí. Tres golpes. Después juntá todo. ¿Probás con "Paraguay"? Pa-ra-guay. Tres golpes también.',
    gn: '\'Ẽ ne ñe\'ẽ peteĩteĩ. "Ñandutí": ñan-du-tí. Mbohapy chyrỹ. Upéi embojoaju.',
    jopara: 'Lee la palabra en partes. "Ñandutí": ñan-du-tí. Tres golpes. Upéi embojoaju.',
  },
};

export function mockTutor(topic: string, lang = 'jopara') {
  const t = topic.toLowerCase();
  const key = t.includes('multiplica') || t.includes('×') || /\bx\b/.test(t) ? 'multiplicacion' : 'lectura';
  const tpl = TUTOR_TEMPLATES[key];
  const safeLang = (lang === 'es' || lang === 'gn' ? lang : 'jopara') as 'es' | 'gn' | 'jopara';
  return {
    topic,
    lang: safeLang,
    explanation: tpl[safeLang],
    next_exercise: key === 'multiplicacion' ? '8 × 4 = ?' : 'Leé en voz alta: "Mi mamá ama la patria."',
    pisa_focus: 'Paraguay PISA 2022: 7 de 10 estudiantes no comprende lo que lee. Esta práctica ataca ese gap.',
  };
}
