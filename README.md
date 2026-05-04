# Ñandutí

> **Tu Paraguay, en una conversación.**

Super-app IA-first para el ciudadano paraguayo. Mockup ejecutivo presentado
ante MITIC y la Presidencia del Paraguay. Todo el contenido es ficticio para
demostración — no contiene PII real.

## Arquitectura híbrida

WeChat (UX integrada) + Singpass (identidad estatal) + India Stack (rails
públicos) + e-Estonia / X-Road (audit trail) + ChatGPT (capa conversacional
sobre todo).

## Stack

- **Next.js 15** App Router · **React 19** · **TypeScript strict**
- **Anthropic Claude** (orchestrator) con fallback determinístico
- **OpenAI** Whisper / TTS (producción) — mockup usa atajos locales
- **Redis** (cache 300s, opcional; in-memory fallback)
- **DigitalOcean** + systemd standalone (sin Vercel — política IconsAI)

## Funcionalidades (28 tools, 9 mini-apps)

| Mini-app | Tools | Realidad imitada |
|---|---|---|
| 💸 Wallet | 4 | Saldo PYG/USDC, transferencia mock SIP-BCP, QR Hub (3 comercios), 20 tx |
| 🏛️ Trámites | 3 | 6 trámites paraguay.gov.py · API RUC DNIT · turnos |
| 🏥 Salud | 3 | Triage es/gn/jopará · 5 USF · vacunas familia · Línea 155 |
| 📚 Educación | 3 | Boletín Sofía · matrícula MEC · tutor IA bilingüe (gap PISA 2022) |
| 💳 Tarjeta USDC | 3 | Mastercard ··· 4827 · BIN Ueno · Bancard adq · Circle custodian |
| 📰 Informativos | 2 | Feed estado · resumen IA semanal |
| ⚠️ Alertas | 2 | Subscripción geo · 10 alertas SEN/DINAC (ataca gap nacional) |
| 🚨 Denuncia | 3 | Botón pánico 80px · DEAM · modo discreto (calculadora · 7 toques) |
| 📂 Documentos | 3 | 6 W3C VC · audit trail estoniano · QR validación |

**Más:** `auth.cic_otp` (validador CIC módulo 11 real) y `auth.identidad`
(OAuth mock MITIC).

## Persona demo

María González Acosta — CIC `4521846` (válida módulo 11) · OTP `123456` ·
PIN `0000`. Trinidad, Asunción. Familia: Juan (esposo), Sofía (8a, escuela
234), Mateo (3a). Saldo: Gs. 4.350.000 + 247,83 USDC.

## Cómo correr local

```bash
npm install
cp .env.example .env.local       # opcional: agregá ANTHROPIC_API_KEY
npm run dev                      # http://localhost:3030
```

Sin `ANTHROPIC_API_KEY`, el chat usa un router determinístico por keywords
que llama las 28 tools con datos mock — la demo igual fluye.

## Cómo testear los 28 endpoints

```bash
curl -s -X POST http://localhost:3030/api/__catalog | jq
curl -s -X POST http://localhost:3030/api/wallet/balance -d '{}' \
  -H 'content-type: application/json' | jq
curl -s -X POST http://localhost:3030/api/health/triage \
  -H 'content-type: application/json' \
  -d '{"symptoms":"fiebre y tos"}' | jq
```

## Idiomas

3 locales equipotentes — castellano, guaraní, jopará. Nunca tratamos guaraní
como secundario (Constitución art. 77). Toggle en la esquina superior derecha.

## Disclaimers permanentes

- **Salud:** "Esta orientación es informativa. NO sustituye atención médica
  profesional."
- **Cripto:** "USDC es activo virtual experimental. Marco regulatorio
  paraguayo en formación."

## Datos del Paraguay incrustados

- INE 2024: 6.372.623 hab · 70% usa guaraní
- BCP 2025: bancarización 81%
- IPS: cobertura 24,6% (gap salud)
- MEC 2024: 23% escuelas con internet (PISA 2022 nivel 2: 15% mat vs 69% OCDE)
- 27 feminicidios 2024 · 66.349 denúncias bienais (gap denuncia online — Ñandutí ataca)
- DINAC sin SMS push oficial (gap alertas — Ñandutí ataca)

## Licencia

Mockup demo · IconsAI · 2026.

## Decisiones cerradas

Ver `docs/PROMPT_MASTER.md` para el contrato nuclear (30 decisiones, 18
ítems de roadmap, 20 criterios de aceptación, restricciones legales).
