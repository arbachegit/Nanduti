'use client';

import { useState } from 'react';
import { useNandutiLocale } from './LocaleProvider';
import CedulaInput from './primitive/CedulaInput';
import { callTool } from '@/lib/api-client';

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { t } = useNandutiLocale();
  const [step, setStep] = useState(0);
  const [cedula, setCedula] = useState('4521846');
  const [valid, setValid] = useState(true);
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = () => setStep((s) => s + 1);

  const submitLogin = async () => {
    setErr(null);
    setLoading(true);
    const r = await callTool<{ ok: boolean; cedula_valid: boolean; otp_valid: boolean }>('auth.cic-otp', { cedula, otp });
    setLoading(false);
    if (r?.ok) {
      try { window.localStorage.setItem('nanduti.session', JSON.stringify({ ts: Date.now(), cic: cedula })); } catch { /* noop */ }
      onDone();
      return;
    }
    if (!r?.cedula_valid) setErr(t('auth.invalid_cedula'));
    else setErr(t('auth.invalid_otp'));
  };

  const skip = () => onDone();

  if (step < 3) {
    const titles = [t('onboarding.step1_title'), t('onboarding.step2_title'), t('onboarding.step3_title')];
    const bodies = [t('onboarding.step1_body'), t('onboarding.step2_body'), t('onboarding.step3_body')];
    return (
      <div className="onb">
        <button type="button" className="onb__skip" onClick={skip}>{t('onboarding.skip')}</button>
        <article className="onb__card">
          <span className="nd-eyebrow">{step + 1} / 4</span>
          <h2 className="nd-grad-text">{titles[step]}</h2>
          <p>{bodies[step]}</p>
        </article>
        <div className="onb__dots" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => <span key={i} className={i === step ? 'is-on' : ''} />)}
        </div>
        <button type="button" className="nd-btn nd-btn--primary onb__next" onClick={next}>{t('onboarding.next')}</button>
        <style jsx>{`
          .onb { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; gap: 24px; max-width: 540px; margin: 0 auto; position: relative; }
          .onb__skip { position: absolute; top: 24px; right: 24px; background: transparent; border: none; color: var(--nd-t3); font-size: 13px; cursor: pointer; }
          .onb__skip:hover { color: var(--nd-t1); }
          .onb__card { text-align: center; display: flex; flex-direction: column; gap: 12px; align-items: center; }
          .onb__card h2 { font-size: clamp(28px, 5vw, 44px); margin: 0; line-height: 1.1; font-weight: 800; }
          .onb__card :global(p) { font-size: 17px; line-height: 1.6; color: var(--nd-t2); margin: 0; max-width: 460px; }
          .onb__dots { display: flex; gap: 6px; }
          .onb__dots :global(span) { width: 8px; height: 8px; border-radius: 50%; background: var(--nd-border); transition: all 200ms ease; }
          .onb__dots :global(span.is-on) { background: var(--nd-cyan); width: 24px; border-radius: 4px; }
          .onb__next { min-width: 200px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="onb">
      <button type="button" className="onb__skip" onClick={skip}>{t('onboarding.skip')}</button>
      <article className="onb__login">
        <span className="nd-eyebrow">{t('auth.title')}</span>
        <h2>{t('auth.subtitle')}</h2>
        <CedulaInput value={cedula} onChange={(v, ok) => { setCedula(v); setValid(ok); }} label={t('auth.cedula_label')} placeholder={t('auth.cedula_placeholder')} />
        <label className="onb__field">
          <span>{t('auth.otp_label')}</span>
          <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="nd-input nd-mono" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder={t('auth.otp_placeholder')} />
          <small>{t('auth.otp_hint')}</small>
        </label>
        {err ? <span className="onb__err">{err}</span> : null}
        <button type="button" className="nd-btn nd-btn--primary onb__submit" disabled={!valid || otp.length < 6 || loading} onClick={submitLogin}>
          {loading ? '…' : t('auth.submit')}
        </button>
        <a className="onb__via" href="#mock-oauth" onClick={(e) => { e.preventDefault(); onDone(); }}>{t('auth.via_mitic')}</a>
        <p className="onb__note">{t('auth.demo_note')}</p>
      </article>
      <style jsx>{`
        .onb { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 32px 24px; max-width: 460px; margin: 0 auto; position: relative; gap: 16px; }
        .onb__skip { position: absolute; top: 24px; right: 24px; background: transparent; border: none; color: var(--nd-t3); font-size: 13px; cursor: pointer; }
        .onb__login { width: 100%; display: flex; flex-direction: column; gap: 14px; padding: 28px; background: var(--nd-surface); border: 1px solid var(--nd-border); border-radius: 18px; }
        .onb__login h2 { font-size: 22px; margin: 0; color: var(--nd-t1); font-weight: 700; }
        .onb__field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--nd-t2); }
        .onb__field small { font-size: 11px; color: var(--nd-t3); }
        .onb__err { color: var(--nd-danger); font-size: 13px; }
        .onb__submit { width: 100%; }
        .onb__via { font-size: 13px; color: var(--nd-cyan); text-align: center; text-decoration: none; padding: 8px; }
        .onb__via:hover { text-decoration: underline; }
        .onb__note { font-size: 11px; color: var(--nd-t3); text-align: center; line-height: 1.5; }
      `}</style>
    </div>
  );
}
