/**
 * Ñandutí LLM client.
 *
 * Provedor único: DigitalOcean Gradient AI ("Manage Model Access Keys").
 * SDK Anthropic apontado pra base URL do DO. Modelos com hífen
 * (anthropic-claude-3.5-haiku, anthropic-claude-sonnet-4).
 *
 * Em dev local, ANTHROPIC_API_KEY (sem base URL) faz fallback pra
 * Anthropic direto — útil pra testar sem queimar quota DO.
 */
import Anthropic from '@anthropic-ai/sdk';

const DO_BASE = process.env.DO_INFERENCE_BASE_URL?.trim() || '';
const DO_KEY = process.env.DO_INFERENCE_KEY?.trim() || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY?.trim() || '';

function build(): { client: Anthropic | null; provider: 'do-gradient' | 'anthropic-direct' | 'none' } {
  if (DO_BASE && DO_KEY) {
    return {
      client: new Anthropic({ apiKey: DO_KEY, baseURL: DO_BASE }),
      provider: 'do-gradient',
    };
  }
  if (ANTHROPIC_KEY) {
    return { client: new Anthropic({ apiKey: ANTHROPIC_KEY }), provider: 'anthropic-direct' };
  }
  return { client: null, provider: 'none' };
}

const built = build();

export const llm = built.client;
export const llmProvider = built.provider;

export const MODEL_FAST = process.env.LLM_MODEL_FAST?.trim() || 'anthropic-claude-3.5-haiku';
export const MODEL_DEEP = process.env.LLM_MODEL_DEEP?.trim() || 'anthropic-claude-sonnet-4';

export function llmAvailable(): boolean {
  return built.client !== null;
}
