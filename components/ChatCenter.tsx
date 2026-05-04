'use client';

import { useState, useRef, useEffect } from 'react';
import { useNandutiLocale } from './LocaleProvider';
import VoiceButton from './primitive/VoiceButton';
import { chatStreamUrl } from '@/lib/api-client';

interface Msg {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  toolPayload?: unknown;
}

export default function ChatCenter() {
  const { t, locale } = useNandutiLocale();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const greetedRef = useRef(false);

  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    setMessages([{ id: 'g0', role: 'assistant', content: t('chat.greeting') }]);
  }, [t]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (raw?: string) => {
    const message = (raw ?? input).trim();
    if (!message || streaming) return;
    setInput('');
    setStreaming(true);
    const uid = 'u_' + Date.now().toString(36);
    setMessages((m) => [...m, { id: uid, role: 'user', content: message }]);

    try {
      const r = await fetch(chatStreamUrl(), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message, lang: locale }),
      });
      if (!r.body) {
        setMessages((m) => [...m, { id: 'e_' + Date.now(), role: 'assistant', content: t('chat.error') }]);
        setStreaming(false);
        return;
      }
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let assistantId: string | null = null;

      const append = (text: string) => {
        if (!assistantId) {
          const id = 'a_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
          assistantId = id;
          setMessages((m) => [...m, { id, role: 'assistant', content: text }]);
        } else {
          setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + (msg.content ? ' ' : '') + text } : msg)));
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try {
            const obj = JSON.parse(line.slice(5).trim());
            if (obj.type === 'text' && obj.text) append(obj.text);
            else if (obj.type === 'tool_call') {
              setMessages((m) => [...m, { id: 'tc_' + Date.now() + Math.random(), role: 'tool', content: `▸ ${obj.tool}`, toolName: obj.tool, toolPayload: obj.input }]);
            } else if (obj.type === 'tool_result') {
              setMessages((m) => [...m, { id: 'tr_' + Date.now() + Math.random(), role: 'tool', content: '◀', toolName: obj.tool, toolPayload: obj.result }]);
              assistantId = null;
            } else if (obj.type === 'error') {
              append(t('chat.error'));
            }
          } catch {
            /* noop */
          }
        }
      }
    } catch {
      setMessages((m) => [...m, { id: 'err_' + Date.now(), role: 'assistant', content: t('chat.error') }]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <section className="cc">
      <header className="cc__h">
        <span className="nd-eyebrow">Ñandutí · IA bilingüe</span>
        <span className="cc__lang nd-mono">{locale}</span>
      </header>
      <div ref={scrollRef} className="cc__scroll">
        {messages.map((msg) => (
          <div key={msg.id} className={`cc__msg cc__msg--${msg.role}`}>
            {msg.role === 'tool' ? (
              <details className="cc__tool">
                <summary><strong>{msg.content}</strong> · <span className="nd-mono">{msg.toolName}</span></summary>
                <pre className="nd-mono">{JSON.stringify(msg.toolPayload, null, 2)}</pre>
              </details>
            ) : (
              <p>{msg.content}</p>
            )}
          </div>
        ))}
        {streaming ? <div className="cc__typing"><span /><span /><span /></div> : null}
        {messages.length <= 1 ? (
          <div className="cc__sugg">
            <span className="nd-eyebrow">{t('chat.suggested')}</span>
            <ul>
              {(t('chat.examples') as unknown as string[]).slice ? (t('chat.examples') as unknown as string[]).slice(0, 5).map((s) => (
                <li key={s}><button type="button" className="nd-btn" onClick={() => send(s)}>{s}</button></li>
              )) : null}
            </ul>
          </div>
        ) : null}
      </div>

      <form className="cc__input" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <VoiceButton onTranscript={(text) => { setInput(text); setTimeout(() => send(text), 50); }} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="nd-input"
          placeholder={t('chat.placeholder')}
          disabled={streaming}
        />
        <button type="submit" className="nd-btn nd-btn--primary" disabled={!input.trim() || streaming}>
          {streaming ? '…' : t('chat.send')}
        </button>
      </form>

      <style jsx>{`
        .cc { display: flex; flex-direction: column; height: 100%; min-height: 0; gap: 12px; }
        .cc__h { display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; }
        .cc__lang { font-size: 11px; color: var(--nd-t3); padding: 4px 8px; border: 1px solid var(--nd-border); border-radius: 999px; text-transform: uppercase; }
        .cc__scroll { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding: 8px 4px; min-height: 0; }
        .cc__msg p { margin: 0; padding: 12px 16px; border-radius: 16px; line-height: 1.55; max-width: 85%; }
        .cc__msg--assistant p { background: var(--nd-surface); border: 1px solid var(--nd-border); align-self: flex-start; color: var(--nd-t1); }
        .cc__msg--user { display: flex; justify-content: flex-end; }
        .cc__msg--user p { background: linear-gradient(135deg, var(--nd-cyan), var(--nd-purple)); color: var(--nd-bg); align-self: flex-end; font-weight: 500; }
        .cc__msg--assistant, .cc__msg--user { display: flex; }
        .cc__msg--assistant { justify-content: flex-start; }
        .cc__tool { background: rgba(168,85,247,0.06); border: 1px solid rgba(168,85,247,0.20); border-radius: 10px; padding: 8px 12px; font-size: 12px; max-width: 100%; }
        .cc__tool summary { cursor: pointer; color: var(--nd-purple); }
        .cc__tool pre { margin: 8px 0 0; max-height: 240px; overflow: auto; font-size: 11px; color: var(--nd-t2); padding: 8px; background: rgba(0,0,0,0.25); border-radius: 6px; white-space: pre-wrap; }
        .cc__typing { display: inline-flex; gap: 4px; padding: 12px 16px; background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 16px; align-self: flex-start; }
        .cc__typing :global(span) { width: 6px; height: 6px; background: var(--nd-cyan); border-radius: 50%; animation: nd-pulse 1.2s ease-in-out infinite; }
        .cc__typing :global(span:nth-child(2)) { animation-delay: 0.18s; }
        .cc__typing :global(span:nth-child(3)) { animation-delay: 0.36s; }
        .cc__sugg { padding: 12px 4px; }
        .cc__sugg ul { list-style: none; padding: 0; margin: 8px 0 0; display: flex; gap: 6px; flex-wrap: wrap; }
        .cc__input { display: flex; gap: 8px; align-items: center; padding-top: 8px; border-top: 1px solid var(--nd-border); }
        .cc__input input { flex: 1; min-width: 0; }
      `}</style>
    </section>
  );
}
