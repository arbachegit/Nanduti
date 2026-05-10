# lib/data-source/

Camada de acesso a dados real (Supabase) para os 28 tools do Ñandutí.

Cada arquivo aqui exporta funções server-side que substituem o
correspondente `data/mock-*.ts` quando `dbAvailable()` (lib/supabase.ts).

## Pattern

```typescript
import { serverClient } from '@/lib/supabase';

export async function getAlertasRecentes(limit = 10) {
  const sb = serverClient();
  if (!sb) return null;  // fallback pro mock
  const { data, error } = await sb
    .from('staging_alerta')
    .select('*')
    .order('ts_evento', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
```

E em `lib/tool-registry.ts`:

```typescript
handler: async (i) => {
  const real = await getAlertasRecentes(Number(i.limit ?? 10));
  if (real) return { items: real };
  return { items: mockAlerts.slice(0, Number(i.limit ?? 10)) };
}
```

A interface dos tools **não muda**. O usuário não percebe a transição.

## Arquivos esperados (semana 1-3)

- `info.ts`     — feed estado (semana 1)
- `alerts.ts`   — alertas + subscriptions (semana 1)
- `gov.ts`      — trámites + RUC (semana 2)
- `health.ts`   — USFs + triage support (semana 2)
- `edu.ts`      — escuelas + matrículas (semana 2)
- `wallet.ts`   — cotação BCP + Pagopar bridge (semana 3)
- `crypto.ts`   — disclaimer SEPRELAD dinâmico (semana 3)
- `police.ts`   — complaints + DEAM list (semana 3)
- `docs.ts`     — VCs + audit (semana 3)
- `auth.ts`     — Infobip OTP + módulo 11 (semana 1)
