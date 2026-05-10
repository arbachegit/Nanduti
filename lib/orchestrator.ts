/**
 * Ñandutí orchestrator. Calls Anthropic with the 28 tool registry. Falls back to a
 * deterministic intent router when ANTHROPIC_API_KEY is missing.
 */
import { TOOLS, asAnthropicTools, getTool, dotName } from './tool-registry';
import { cacheGet, cacheSet, cacheKey } from './redis-cache';
import { llm, llmAvailable, MODEL_FAST } from './llm-client';

export type Lang = 'es' | 'gn' | 'jopara';

export interface OrchestrateInput {
  message: string;
  lang: Lang;
  citizenId?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface OrchestrateChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error';
  text?: string;
  tool?: string;
  input?: unknown;
  result?: unknown;
  error?: string;
}

const SYSTEM_PROMPT_BY_LANG: Record<Lang, string> = {
  es: `Eres Ñandutí, asistente del ciudadano paraguayo. Hablás en español rioplatense neutral, voseo, cordial y directo. Sin formalismos. Saludo "Mba'éichapa" cuando suene natural.\n\nTené en cuenta:\n- Salud: SIEMPRE incluí "Esta orientación es informativa. NO sustituye atención médica profesional."\n- Cripto USDC: SIEMPRE incluí "USDC es activo virtual experimental. Marco regulatorio paraguayo en formación."\n- Si pregunta por trámites, salud, billetera, escuela, alertas, denuncia o documentos, USÁ las herramientas disponibles.\n- Errores en voz humana: nunca digas "error 500"; decí "algo no anduvo bien, ¿probamos de nuevo?".\n- Valores en guaraníes: separador de millar = punto. "Gs. 200.000".\n- USDC: decimal con coma. "247,83 USDC".\n\nResponde corto. 2-4 oraciones.`,
  gn: `Nde ha'e Ñandutí, paraguáio rendape ipytyvõhára. Eñe'ẽ guaraní simple-pe, ndaha'éi formal-pe. Saludo "Mba'éichapa" eipuru.\n\nTesãi: emombe'u always "Ko jehechauka marandurã ñoite. NDOJOJÁI pohãnohára ndive."\nUSDC: emombe'u always "USDC ha'e mba'erepy virtual jehechauka. Marco regulatorio paraguáipe oĩ."\n\nEipuru tools, eñembohovái mbyky.`,
  jopara: `Eres Ñandutí, asistente paraguayo. Hablás en jopará natural — castellano y guaraní mezclados como en la calle. Saludo "Mba'éichapa". Cordial, directo, no formal.\n\nReglas:\n- Salud: incluí "Esta orientación es informativa. NO sustituye atención médica profesional."\n- USDC: "USDC es activo virtual experimental. Marco regulatorio paraguáipe oĩ."\n- Usá tools cuando aplique.\n- Errores: "Algo no anduvo bien. Ñañepyrũjey?"\n- Gs. 200.000 (punto de millar). 247,83 USDC (coma decimal).\n\nMbyky responde — 2 a 4 oraciones.`,
};

async function deterministicReply(input: OrchestrateInput, push: (c: OrchestrateChunk) => void) {
  const m = input.message.toLowerCase();
  push({ type: 'text', text: 'Pensando…' });

  type RouteRule = { keywords: string[]; tool: string; args: Record<string, unknown>; intro: Record<Lang, string> };
  const rules: RouteRule[] = [
    { keywords: ['saldo', 'plata', 'cuanto tengo', 'mboypa'], tool: 'wallet.balance', args: {}, intro: { es: 'Tu saldo:', gn: 'Ne viru:', jopara: 'Ne saldo:' } },
    { keywords: ['transferir', 'enviar', 'mbohasa', 'transferencia'], tool: 'wallet.history', args: { limit: 5 }, intro: { es: 'Tus últimas transferencias:', gn: 'Ne mbohasa paha:', jopara: 'Tus últimas transferencias:' } },
    { keywords: ['cedula', 'cédula', 'renovar', 'tramite', 'trámite'], tool: 'gov.tramite_search', args: { query: 'cedula' }, intro: { es: 'Estos trámites te sirven:', gn: 'Ko\'ã tembiapo nepytyvõ:', jopara: 'Estos tembiapo nepytyvõ:' } },
    { keywords: ['fiebre', 'tos', 'gripe', 'akãnundu', 'sintoma', 'síntoma', 'doctor'], tool: 'health.triage', args: { symptoms: input.message }, intro: { es: 'Te oriento, pero recordá:', gn: 'Ñepytyvõ, ñembohovái:', jopara: 'Te oriento, pero acordate:' } },
    { keywords: ['boletin', 'boletín', 'sofia', 'sofía', 'escuela', 'mbo\'ehao'], tool: 'edu.report_card', args: {}, intro: { es: 'Boletín del primer período:', gn: 'Mbo\'ehao boletín:', jopara: 'El boletín de Sofía:' } },
    { keywords: ['usdc', 'cripto', 'mastercard', 'tarjeta', 'circle'], tool: 'crypto.balance', args: {}, intro: { es: 'Tu cuenta USDC:', gn: 'Ne USDC:', jopara: 'Tu USDC:' } },
    { keywords: ['noticia', 'news', 'feed', 'comunicado', 'marandu'], tool: 'info.feed', args: { limit: 5 }, intro: { es: 'Lo nuevo del Estado:', gn: 'Marandu pyahu:', jopara: 'Las novedades:' } },
    { keywords: ['alerta', 'tormenta', 'apagón', 'emergencia', 'sen'], tool: 'alerts.recent', args: { limit: 5 }, intro: { es: 'Alertas activas:', gn: 'Sãso oĩháicha:', jopara: 'Alertas oĩva:' } },
    { keywords: ['denuncia', 'panic', 'pánico', 'sos', 'feminicidio', 'violencia'], tool: 'police.track', args: {}, intro: { es: 'Tus denuncias activas. Si es urgente, llamá al 911 o tocá el botón de pánico.', gn: 'Ne denuncia. Ndoroavýi: 911 térã pánico.', jopara: 'Tus denuncias. Si es urgente: 911 o pánico.' } },
    { keywords: ['documento', 'docs', 'carnet', 'partida', 'auditor'], tool: 'docs.list', args: {}, intro: { es: 'Tus documentos digitales:', gn: 'Ne kuatia digital:', jopara: 'Tus documentos:' } },
  ];

  const hit = rules.find((r) => r.keywords.some((k) => m.includes(k)));
  if (!hit) {
    const fallbacks: Record<Lang, string> = {
      es: 'Mba\'éichapa! Soy Ñandutí. Probá: "¿cuánto tengo?", "renovar cédula", "boletín de Sofía", "alertas cerca", "denuncia online".',
      gn: 'Mba\'éichapa! Che ha\'e Ñandutí. Eha\'arõ: "mboýpa areko", "renovar cédula", "Sofía boletín", "alerta", "denuncia".',
      jopara: 'Mba\'éichapa! Che ha\'e Ñandutí. Probá: "¿cuánto tengo?", "renovar cédula", "boletín de Sofía", "alertas", "denuncia".',
    };
    push({ type: 'text', text: fallbacks[input.lang] });
    push({ type: 'done' });
    return;
  }

  const t = getTool(hit.tool);
  if (!t) {
    push({ type: 'error', error: 'tool not found' });
    return;
  }
  push({ type: 'tool_call', tool: hit.tool, input: hit.args });
  const result = await t.handler(hit.args);
  push({ type: 'tool_result', tool: hit.tool, result });
  push({ type: 'text', text: hit.intro[input.lang] });
  push({ type: 'done' });
}

export async function orchestrate(input: OrchestrateInput, push: (c: OrchestrateChunk) => void) {
  const key = cacheKey(input.citizenId ?? 'demo', input.message, input.lang);
  const cached = await cacheGet<OrchestrateChunk[]>(key);
  if (cached) {
    for (const c of cached) push(c);
    return;
  }

  const buf: OrchestrateChunk[] = [];
  const wrapped = (c: OrchestrateChunk) => { buf.push(c); push(c); };

  if (!llmAvailable() || !llm) {
    await deterministicReply(input, wrapped);
    await cacheSet(key, buf, 300);
    return;
  }

  try {
    const client = llm;
    const tools = asAnthropicTools();

    const msgs: Array<{ role: 'user' | 'assistant'; content: unknown }> = [];
    if (input.history) for (const h of input.history) msgs.push({ role: h.role, content: h.content });
    msgs.push({ role: 'user', content: input.message });

    let safetyTurns = 4;
    while (safetyTurns-- > 0) {
      const resp = await client.messages.create({
        model: MODEL_FAST,
        max_tokens: 800,
        system: SYSTEM_PROMPT_BY_LANG[input.lang],
        tools: tools as unknown as Parameters<typeof client.messages.create>[0]['tools'],
        messages: msgs as Parameters<typeof client.messages.create>[0]['messages'],
      });

      const toolUses: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];
      for (const block of resp.content) {
        if (block.type === 'text') {
          wrapped({ type: 'text', text: block.text });
        } else if (block.type === 'tool_use') {
          toolUses.push({ id: block.id, name: block.name, input: (block.input as Record<string, unknown>) ?? {} });
        }
      }

      if (toolUses.length === 0 || resp.stop_reason !== 'tool_use') break;

      msgs.push({ role: 'assistant', content: resp.content });
      const toolResults: unknown[] = [];
      for (const u of toolUses) {
        const real = dotName(u.name);
        const t = real ? getTool(real) : undefined;
        wrapped({ type: 'tool_call', tool: real ?? u.name, input: u.input });
        try {
          const result = t ? await t.handler(u.input) : { error: 'tool_not_found' };
          wrapped({ type: 'tool_result', tool: real ?? u.name, result });
          toolResults.push({ type: 'tool_result', tool_use_id: u.id, content: JSON.stringify(result) });
        } catch (e) {
          wrapped({ type: 'tool_result', tool: real ?? u.name, result: { error: String(e) } });
          toolResults.push({ type: 'tool_result', tool_use_id: u.id, content: JSON.stringify({ error: String(e) }), is_error: true });
        }
      }
      msgs.push({ role: 'user', content: toolResults });
    }
    wrapped({ type: 'done' });
    await cacheSet(key, buf, 300);
  } catch (e) {
    wrapped({ type: 'error', error: String(e) });
    await deterministicReply(input, wrapped);
  }
}
