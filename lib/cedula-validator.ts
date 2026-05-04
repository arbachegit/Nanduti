/**
 * Paraguay CIC (Cédula de Identidad Civil) module 11 validator.
 * Spec from CLAUDE prompt §3.5 — verbatim.
 */
export function validateCedula(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  if (digits.length < 6 || digits.length > 9) return false;
  const num = digits.slice(0, -1);
  const check = parseInt(digits.slice(-1), 10);
  const sum = num
    .split('')
    .reverse()
    .reduce((acc, d, i) => acc + parseInt(d, 10) * ((i % 6) + 2), 0);
  const remainder = sum % 11;
  const expected = remainder < 2 ? 0 : 11 - remainder;
  return expected === check;
}

export function formatCedula(input: string): string {
  const d = input.replace(/\D/g, '');
  if (d.length < 2) return d;
  return `${d.slice(0, -1)}-${d.slice(-1)}`;
}

export function formatRuc(cedula: string, dv: string | number): string {
  return `${cedula.replace(/\D/g, '')}-${dv}`;
}
