export interface FamilyMember {
  name: string;
  cic: string;
  relation: 'spouse' | 'son' | 'daughter' | 'parent';
  age: number;
  school?: { id: string; name: string; grade: string };
}

export interface MockCitizen {
  name: string;
  cic: string;
  ruc: string;
  birthdate: string;
  age: number;
  city: string;
  neighborhood: string;
  geo: { lat: number; lng: number };
  phone: string;
  language_pref: 'es' | 'gn' | 'jopara';
  ips_segurada: boolean;
  ips_id: string;
  family: FamilyMember[];
  wallet: {
    pyg_balance: number;
    usdc_balance: number;
    card: { brand: string; last4: string; bin_sponsor: string };
  };
  identidad_electronica: { active: boolean; since: string };
}

export const mockCitizen: MockCitizen = {
  name: 'María González Acosta',
  cic: '4521846',
  ruc: '4521846-6',
  birthdate: '1991-08-14',
  age: 34,
  city: 'Asunción',
  neighborhood: 'Trinidad',
  geo: { lat: -25.262, lng: -57.616 },
  phone: '+595 981 234 567',
  language_pref: 'jopara',
  ips_segurada: true,
  ips_id: 'IPS-789-456-123',
  family: [
    { name: 'Juan González Pérez', cic: '3987654', relation: 'spouse', age: 36 },
    { name: 'Sofía González', cic: '5432109', age: 8, relation: 'daughter', school: { id: 'ESC-234', name: 'Escuela Pública 234 - Trinidad', grade: '3°' } },
    { name: 'Mateo González', cic: '5432110', age: 3, relation: 'son' },
  ],
  wallet: {
    pyg_balance: 4_350_000,
    usdc_balance: 247.83,
    card: { brand: 'mastercard', last4: '4827', bin_sponsor: 'ueno' },
  },
  identidad_electronica: { active: true, since: '2024-09-12' },
};
