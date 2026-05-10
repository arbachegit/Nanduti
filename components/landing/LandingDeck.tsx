'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useNandutiLocale } from '../LocaleProvider';
import LangSwitcher from '../LangSwitcher';
import Lace from './Lace';
import { APP_ICON } from './icons';
import type { LandingData } from '@/lib/data-source/landing';
import './landing.css';

/* ============================================================
   ÑANDUTÍ · ALMANAQUE SOBERANO
   Editorial magazine deck — dark corporate, sovereign craft.
   ============================================================ */

type SlideId = 'cover' | 'dialogo' | 'catalogo' | 'despachos' | 'infraestructura' | 'colofon';
const SLIDES: SlideId[] = ['cover', 'dialogo', 'catalogo', 'despachos', 'infraestructura', 'colofon'];
const ROMANS = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;
const SLIDE_MS = 8400;

/* ─── Helpers — stable formatters (no Intl) ─────────────────── */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

const MONTHS: Record<string, string[]> = {
  es:     ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
  pt:     ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],
  en:     ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'],
  gn:     ['jas','jak','aji','rai','jim','jak','jas','jas','jas','jas','jas','jas'],
  jopara: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
};

function fmtDayMonth(iso: string | null | undefined, locale = 'es'): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${d.getUTCDate()} ${(MONTHS[locale] ?? MONTHS.es)[d.getUTCMonth()]}`;
  } catch { return ''; }
}

function PYG(n: number): string {
  const s = Math.round(n).toString();
  const parts: string[] = [];
  for (let i = s.length; i > 0; i -= 3) parts.unshift(s.slice(Math.max(0, i - 3), i));
  return 'Gs. ' + parts.join('.');
}

function fmtNumDot(n: number): string {
  const s = Math.round(n).toString();
  const parts: string[] = [];
  for (let i = s.length; i > 0; i -= 3) parts.unshift(s.slice(Math.max(0, i - 3), i));
  return parts.join('.');
}

function wordCount(text: string | null | undefined): number {
  if (!text) return 0;
  const stripped = text.replace(/<[^>]*>/g, ' ').replace(/&[#a-z0-9]+;/gi, ' ').trim();
  return stripped ? stripped.split(/\s+/).length : 0;
}

function readMins(words: number): number {
  return Math.max(1, Math.round(words / 220));
}

/* ─── Brand mark (concentric Ñandutí radial) ────────────────── */
const BRAND_LINES = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  return {
    x1: r3(32 + Math.cos(a) * 4),
    y1: r3(32 + Math.sin(a) * 4),
    x2: r3(32 + Math.cos(a) * 28),
    y2: r3(32 + Math.sin(a) * 28),
  };
});

function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="32" cy="32" r="28" />
        <circle cx="32" cy="32" r="20" />
        <circle cx="32" cy="32" r="12" />
        {BRAND_LINES.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
        ))}
      </g>
      <circle cx="32" cy="32" r="3" fill="currentColor" />
    </svg>
  );
}

/* ─── Masthead ──────────────────────────────────────────────── */
function Masthead() {
  const { t } = useNandutiLocale();
  return (
    <header className="mast">
      <div className="mast__l">
        <Link href="/" className="mast__brand" aria-label="Ñandutí">
          <span className="mast__brand-mark"><BrandMark size={22} /></span>
          <span className="mast__brand-name">Ñandutí</span>
        </Link>
      </div>
      <div className="mast__center">
        <span className="mast__issue">N°01</span>
        <span className="mast__rule" aria-hidden />
        <span className="mast__date">Mayo MMXXVI</span>
        <span className="mast__rule" aria-hidden />
        <span className="mast__loc">{t('landing.nav.demo_label')}</span>
      </div>
      <div className="mast__r">
        <LangSwitcher />
        <Link href="/app" className="mast__cta">{t('landing.nav.open_app')}</Link>
      </div>
    </header>
  );
}

/* ─── Section header (Roman numeral + section name) ─────────── */
function SectionHeader({ roman, name, right }: { roman: string; name: string; right?: string }) {
  return (
    <div className="sec">
      <span className="sec__rom">{roman}</span>
      <span className="sec__nm">{name}</span>
      <span className="sec__bar" />
      {right ? <span className="sec__r">{right}</span> : null}
    </div>
  );
}

/* ============================================================
   I — COVER
   ============================================================ */
function SlideCover({ active, totals }: { active: boolean; totals: LandingData['totals'] }) {
  const { t } = useNandutiLocale();
  const liveRows = totals.feed_rows + totals.bcp_rows + totals.dncp_rows + totals.alerts_rows;
  return (
    <div className={`cv ${active ? 'is-active' : ''}`}>
      <div className="cv__seal" aria-hidden>
        <Lace size={720} rays={20} rings={6} stroke="#22d3ee" opacity={0.16} spinSec={360} />
      </div>
      <div className="cv__inner">
        <div className="cv__row">
          <span className="t-label t-label-cyan">{t('landing.hero.eyebrow')}</span>
        </div>
        <h1 className="cv__title t-display-xl">
          <span className="cv__l1">{t('landing.hero.title_l1')}</span>
          <span className="cv__l2">{t('landing.hero.title_l2')}</span>
        </h1>
        <p className="cv__lead">{t('landing.hero.lead')}</p>
        <div className="cv__ctas">
          <Link href="/app" className="cv__cta">{t('landing.hero.cta_primary')}</Link>
          <span className="cv__live">
            <span className="cv__pulse" aria-hidden />
            <strong className="t-num">{liveRows}</strong> registros en vivo · <span className="t-num">{totals.coletas_rows}</span> coletas
          </span>
        </div>
        <div className="cv__byline">
          <span>Publicado por IconsAI</span>
          <span className="cv__byline-rule" aria-hidden />
          <span>Asunción · Paraguay</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   II — DIÁLOGO
   ============================================================ */
function SlideDialogo({ active, cotacoes }: { active: boolean; cotacoes: LandingData['cotacoes'] }) {
  const { t, locale } = useNandutiLocale();
  const usd = cotacoes.find((c) => c.moeda_codigo === 'USD');
  const aiResponse = usd
    ? `Tu saldo: ${PYG(4_350_000)} + 247,83 USDC. Cotización BCP del ${fmtDayMonth(usd.fecha_planilla, locale)}: ${PYG(usd.valor_pyg)} por dólar.`
    : t('landing.howitworks.ai_response');

  return (
    <div className={`dlg ${active ? 'is-active' : ''}`}>
      <SectionHeader roman="II" name={t('landing.howitworks.eyebrow')} right="Demostración · 1 turno" />
      <div className="dlg__body">
        <div className="dlg__l">
          <h2 className="dlg__h">{t('landing.howitworks.title')}</h2>
          <p className="dlg__lead">{t('landing.howitworks.lead')}</p>
          <ol className="dlg__steps">
            {(['step1','step2','step3','step4'] as const).map((k, i) => (
              <li key={k} className="dlg__step">
                <span className="dlg__step-n">{(i+1).toString().padStart(2,'0')}</span>
                <span className="dlg__step-t">{t(`landing.howitworks.${k}`)}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="dlg__r">
          <div className="chat" role="img" aria-label="conversation demo">
            <div className="chat__chrome">
              <span className="chat__cdot" />
              <span className="chat__cdot" />
              <span className="chat__cdot" />
              <span className="chat__title">ñandutí · chat</span>
              <span className="chat__live">live</span>
            </div>
            <div className="chat__body">
              <div className="chat__row chat__row--user" style={{ ['--d' as string]: '420ms' } as React.CSSProperties}>
                <div className="chat__bub chat__bub--user">{t('landing.howitworks.user_msg')}</div>
              </div>
              <div className="chat__row" style={{ ['--d' as string]: '980ms' } as React.CSSProperties}>
                <span className="chat__avatar"><Lace size={22} rays={12} rings={3} stroke="#22d3ee" opacity={0.9} /></span>
                <div className="chat__bub chat__bub--thinking">
                  <span className="chat__dots"><span /><span /><span /></span>
                </div>
              </div>
              <div className="chat__tool" style={{ ['--d' as string]: '1540ms' } as React.CSSProperties}>
                <span className="chat__tool-lbl">{t('landing.howitworks.tool_call_label')}</span>
                <code className="chat__code">
                  <span className="chat__code-fn">wallet</span>.<span className="chat__code-fn">balance</span><span className="chat__code-p">()</span>
                </code>
                <span className="chat__arrow" aria-hidden>→</span>
                <div className="chat__out">
                  {usd ? (
                    <>
                      {'{ pyg_balance: 4_350_000, usdc_balance: 247.83,'}<br/>
                      {`  cotacao_usd_pyg: { rate: ${usd.valor_pyg}, fonte: "BCP" } }`}
                    </>
                  ) : (
                    <>{'{ pyg_balance: 4_350_000, usdc_balance: 247.83 }'}</>
                  )}
                </div>
              </div>
              <div className="chat__row" style={{ ['--d' as string]: '2240ms' } as React.CSSProperties}>
                <span className="chat__avatar"><Lace size={22} rays={12} rings={3} stroke="#22d3ee" opacity={0.9} /></span>
                <div className="chat__bub chat__bub--ai">{aiResponse}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   III — CATÁLOGO (numbered magazine TOC)
   ============================================================ */
const APP_LIST: Array<'wallet'|'gov'|'health'|'edu'|'crypto'|'info'|'alerts'|'police'|'docs'> =
  ['wallet','gov','health','edu','crypto','info','alerts','police','docs'];

function SlideCatalogo({ active }: { active: boolean }) {
  const { t } = useNandutiLocale();
  return (
    <div className={`cat ${active ? 'is-active' : ''}`}>
      <SectionHeader roman="III" name={t('landing.miniapps.eyebrow')} right="Servicios del Estado" />
      <div className="cat__intro">
        <h2 className="cat__h">{t('landing.miniapps.title')}</h2>
        <p className="cat__lead">{t('landing.miniapps.lead')}</p>
      </div>
      <ol className="cat__list">
        {APP_LIST.map((id, i) => {
          const Icon = APP_ICON[id];
          return (
            <li key={id} className="cat__row" style={{ ['--i' as string]: i } as React.CSSProperties}>
              <span className="cat__row-n">{(i + 1).toString().padStart(2, '0')}</span>
              <span className="cat__row-c">
                <span className="cat__row-name">{t(`sidebar.${id}`)}</span>
                <span className="cat__row-tag">{t(`landing.miniapps.${id}_tag`)}</span>
              </span>
              <span className="cat__row-icn"><Icon width={24} height={24} /></span>
              <span className="cat__row-arr" aria-hidden>→</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ============================================================
   IV — DESPACHOS (live magazine: feature + secondary + sidebar)
   ============================================================ */
function SlideDespachos({ active, feed, alerts, cotacoes }: {
  active: boolean; feed: LandingData['feed']; alerts: LandingData['alerts']; cotacoes: LandingData['cotacoes'];
}) {
  const { t, locale } = useNandutiLocale();
  const NOW_UTC = Date.UTC(2026, 4, 10, 18, 0);
  const ago = (iso: string): string => {
    try {
      const t0 = new Date(iso).getTime();
      if (isNaN(t0)) return '';
      const diff = Math.max(0, NOW_UTC - t0);
      const h = Math.round(diff / 3600000);
      if (h < 1) return Math.max(1, Math.round(diff / 60000)) + 'm';
      if (h < 24) return h + 'h';
      return Math.round(h / 24) + 'd';
    } catch { return ''; }
  };

  const articles = feed.slice(0, 4);
  const featured = articles[0];
  const secondary = articles.slice(1, 4);

  return (
    <div className={`dsp ${active ? 'is-active' : ''}`}>
      <SectionHeader roman="IV" name={t('landing.datasources.eyebrow')} right="Redacción en vivo" />
      <div className="dsp__body">
        <section className="dsp__main">
          <header className="dsp__main-h">
            <span>Agencia IP · Comunicados oficiales</span>
            <span className="dsp__main-live">en vivo</span>
          </header>

          {featured ? (
            <article className="art art--feature" style={{ ['--i' as string]: 0 } as React.CSSProperties}>
              <span className="art__date">{fmtDayMonth(featured.publicado_em, locale)}</span>
              <div className="art__c">
                <h3 className="art__h">{featured.titulo}</h3>
                <div className="art__byline">
                  <span className="art__byline-by">Por <em>Jazmín Romero</em></span>
                  <span className="art__byline-sep">/</span>
                  <span className="art__byline-mono">{featured.oee.replace('_', ' ')}</span>
                  <span className="art__byline-sep">/</span>
                  <span className="art__byline-mono">{ago(featured.publicado_em)}</span>
                  <span className="art__byline-sep">/</span>
                  <span className="art__byline-mono">{readMins(wordCount(featured.resumo))} min lectura</span>
                </div>
              </div>
            </article>
          ) : null}

          {secondary.map((it, i) => (
            <article key={it.url_oficial || i} className="art" style={{ ['--i' as string]: i + 1 } as React.CSSProperties}>
              <span className="art__date">{fmtDayMonth(it.publicado_em, locale)}</span>
              <div className="art__c">
                <h3 className="art__h">{it.titulo}</h3>
                <div className="art__byline">
                  <span className="art__byline-mono">{it.oee.replace('_', ' ')}</span>
                  <span className="art__byline-sep">·</span>
                  <span className="art__byline-mono">{ago(it.publicado_em)}</span>
                  <span className="art__byline-sep">·</span>
                  <span className="art__byline-mono">{readMins(wordCount(it.resumo))} min</span>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="dsp__side">
          <section className="dsp__panel">
            <header className="dsp__panel-h">
              <span className="dsp__panel-name">Cotización BCP</span>
              <span className="dsp__panel-meta">{cotacoes[0]?.fecha_planilla ?? '—'}</span>
            </header>
            <div className="tickr">
              {cotacoes.slice(0, 4).map((c) => (
                <div key={c.moeda_codigo} className="tickr__cell">
                  <span className="tickr__k">{c.moeda_codigo}</span>
                  <span className="tickr__v">{fmtNumDot(c.valor_pyg)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="dsp__panel">
            <header className="dsp__panel-h">
              <span className="dsp__panel-name">Alertas geo</span>
              <span className="dsp__panel-meta">DINAC · SEN</span>
            </header>
            <ul className="alrt">
              {alerts.slice(0, 4).map((a, i) => (
                <li key={i} className="alrt__row">
                  <span className={`alrt__sev alrt__sev--${a.severity}`}>{a.severity}</span>
                  <span className="alrt__t">{a.titulo}</span>
                </li>
              ))}
            </ul>
            {alerts.length > 4 ? (
              <span className="dsp__more">+ {alerts.length - 4} más</span>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   V — INFRAESTRUCTURA (SVG flow diagram)
   ============================================================ */
function SlideInfraestructura({ active, totals }: { active: boolean; totals: LandingData['totals'] }) {
  const { t } = useNandutiLocale();
  const totalRows = totals.feed_rows + totals.bcp_rows + totals.dncp_rows + totals.alerts_rows;

  return (
    <div className={`inf ${active ? 'is-active' : ''}`}>
      <SectionHeader roman="V" name={t('landing.architecture.eyebrow')} right="Diagrama de flujo · MMXXVI" />
      <div className="inf__intro">
        <h2 className="inf__h">{t('landing.architecture.title')}</h2>
        <p className="inf__lead">{t('landing.architecture.lead')}</p>
      </div>

      <figure className="inf__fig" aria-label="data flow diagram">
        <svg className="inf__svg" viewBox="0 0 1180 240" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="ndl-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="rgba(34,211,238,0.7)" />
            </marker>
          </defs>

          {[0, 1, 2, 3].map((idx) => {
            const x = 24 + idx * 295;
            const label = ['I · COLECTA', 'II · ALMACÉN', 'III · ORQUESTACIÓN', 'IV · MODELOS'][idx];
            const headline = ['7 fuentes', `${totalRows} filas`, '28 tools', 'Haiku · Sonnet'][idx];
            const sub1 = ['Agencia IP · BCP', 'Supabase PG', 'Next.js 15', 'DigitalOcean'][idx];
            const sub2 = ['DINAC · DNCP', 'RLS · views SQL', 'Redis · MITIC', 'Gradient AI'][idx];
            const sub3 = ['MEC · SEN · MSPBS', 'audit estoniano', 'cache 300s', '6× más barato'][idx];
            return (
              <g key={idx} transform={`translate(${x}, 28)`}>
                <rect width="270" height="184" rx="6" fill="rgba(20,20,32,0.50)" stroke="rgba(255,255,255,0.10)" />
                <line x1="0" y1="0" x2="60" y2="0" stroke="rgba(34,211,238,0.85)" strokeWidth="2" />
                <text x="20" y="34" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="3" fill="#22d3ee">{label}</text>
                <text x="20" y="78" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="24" fill="#f5f3ee" fontWeight="350">{headline}</text>
                <line x1="20" y1="92" x2="80" y2="92" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
                <text x="20" y="118" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="12" fill="rgba(245,243,238,0.66)">{sub1}</text>
                <text x="20" y="138" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="12" fill="rgba(245,243,238,0.66)">{sub2}</text>
                <text x="20" y="158" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="12" fill="rgba(245,243,238,0.66)">{sub3}</text>
              </g>
            );
          })}

          {/* Arrows between boxes */}
          {[0, 1, 2].map((idx) => {
            const x1 = 294 + idx * 295;
            const x2 = 319 + idx * 295;
            return (
              <line
                key={idx}
                x1={x1} y1={120}
                x2={x2} y2={120}
                stroke="rgba(34,211,238,0.55)" strokeWidth="1.2"
                markerEnd="url(#ndl-arr)"
              />
            );
          })}
        </svg>
      </figure>

      <div className="inf__notes">
        {([0, 1, 2, 3] as const).map((i) => (
          <div key={i} className="inf__note" style={{ ['--i' as string]: i } as React.CSSProperties}>
            <span className="inf__note-n">{(['Colecta autónoma','Banco soberano','Orquestación','Modelos auditables'])[i]}</span>
            <span className="inf__note-t">{t(`landing.architecture.layer${i+1}_title`)}</span>
            <span className="inf__note-d">{t(`landing.architecture.layer${i+1}_body`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   VI — COLOFÓN (manifesto)
   ============================================================ */
function SlideColofon({ active, totals }: { active: boolean; totals: LandingData['totals'] }) {
  const { t } = useNandutiLocale();
  const totalRows = totals.feed_rows + totals.bcp_rows + totals.dncp_rows + totals.alerts_rows;
  const stats: Array<{ value: string; label: string }> = [
    { value: String(totalRows), label: t('landing.stats.rows_label') },
    { value: '7',                label: t('landing.stats.workflows_label') },
    { value: '6',                label: t('landing.stats.sources_label') },
    { value: '28',               label: t('landing.stats.tools_label') },
    { value: '5',                label: t('landing.stats.languages_label') },
  ];

  return (
    <div className={`col ${active ? 'is-active' : ''}`}>
      <div className="col__seal" aria-hidden>
        <Lace size={680} rays={20} rings={6} stroke="#22d3ee" opacity={0.07} spinSec={420} />
      </div>
      <div className="col__inner">
        <blockquote className="col__quote">
          {t('landing.footer.manifesto')}
        </blockquote>

        <div className="col__sig">
          <span className="col__sig-rule" aria-hidden />
          <span>Manifiesto · IconsAI · MMXXVI</span>
          <span className="col__sig-rule" aria-hidden />
        </div>

        <div className="col__stats">
          {stats.map((s, i) => (
            <div key={i} className="col__cell">
              <span className="col__num">{s.value}</span>
              <span className="col__lbl">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="col__row">
          <Link href="/app" className="col__cta">{t('landing.hero.cta_primary')}</Link>
          <span className="col__credit">{t('landing.footer.credit')}</span>
        </div>
      </div>
      <span className="col__roman" aria-hidden>VI</span>
    </div>
  );
}

/* ============================================================
   Footer · colophon · pager (Roman numerals)
   ============================================================ */
function Foot({ active, total, paused, onJump, onTogglePause, slideName }: {
  active: number; total: number; paused: boolean; onJump: (i: number) => void; onTogglePause: () => void; slideName: string;
}) {
  return (
    <footer className="foot" role="group" aria-label="presentation navigation">
      <div className="foot__l">
        <span className="foot__lbl">
          <span className="foot__cur t-num">{(active + 1).toString().padStart(2, '0')}</span>
          <span className="foot__sl">/</span>
          <span className="t-num">{total.toString().padStart(2, '0')}</span>
        </span>
        <span className="foot__lbl foot__sec">{slideName}</span>
      </div>

      <div className="foot__c">
        <nav className="foot__rom" aria-label="slides">
          {ROMANS.slice(0, total).map((r, i) => (
            <button
              key={r}
              type="button"
              className={`foot__rd ${i === active ? 'is-active' : ''}`}
              aria-label={`Slide ${i + 1} (${r})`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => onJump(i)}
              style={{ animationPlayState: paused ? 'paused' : 'running' }}
            >
              {r}
            </button>
          ))}
        </nav>
      </div>

      <div className="foot__r">
        <div className="foot__ctrl">
          <button type="button" className="foot__btn" onClick={() => onJump((active - 1 + total) % total)} aria-label="previous">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" className="foot__btn" onClick={onTogglePause} aria-label={paused ? 'play' : 'pause'}>
            {paused
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8V4z" /></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
            }
          </button>
          <button type="button" className="foot__btn" onClick={() => onJump((active + 1) % total)} aria-label="next">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

function FootWithI18n(props: { active: number; total: number; paused: boolean; onJump: (i: number) => void; onTogglePause: () => void }) {
  const { t } = useNandutiLocale();
  const id = SLIDES[props.active];
  return <Foot {...props} slideName={t(`landing.slides.${id === 'cover' ? 'vision' : id === 'dialogo' ? 'conversation' : id === 'catalogo' ? 'apps' : id === 'despachos' ? 'feed' : id === 'infraestructura' ? 'sources' : 'manifesto'}`)} />;
}

/* ============================================================
   Composer
   ============================================================ */
export default function LandingDeck({ data }: { data: LandingData }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = SLIDES.length;

  const goTo = useCallback((idx: number) => setActive(((idx % total) + total) % total), [total]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % total), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ' || e.key === 'k') { e.preventDefault(); setPaused((p) => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  useEffect(() => {
    const onVis = () => { if (document.hidden) setPaused(true); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const prevIdx = (active - 1 + total) % total;

  return (
    <main
      className="ndl-deck ndl-page"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Masthead />

      <div className="stage" role="region" aria-roledescription="carousel" aria-label="Ñandutí almanaque">
        {SLIDES.map((id, i) => {
          const isA = i === active;
          const isP = i === prevIdx;
          const cls = `slide ${isA ? 'is-active' : ''} ${isP ? 'is-prev' : ''}`;
          return (
            <section key={id} className={cls} aria-hidden={!isA} data-slide={id}>
              {id === 'cover'           ? <SlideCover           active={isA} totals={data.totals} /> : null}
              {id === 'dialogo'         ? <SlideDialogo         active={isA} cotacoes={data.cotacoes} /> : null}
              {id === 'catalogo'        ? <SlideCatalogo        active={isA} /> : null}
              {id === 'despachos'       ? <SlideDespachos       active={isA} feed={data.feed} alerts={data.alerts} cotacoes={data.cotacoes} /> : null}
              {id === 'infraestructura' ? <SlideInfraestructura active={isA} totals={data.totals} /> : null}
              {id === 'colofon'         ? <SlideColofon         active={isA} totals={data.totals} /> : null}
            </section>
          );
        })}
      </div>

      <FootWithI18n active={active} total={total} paused={paused} onJump={goTo} onTogglePause={() => setPaused((p) => !p)} />
    </main>
  );
}
