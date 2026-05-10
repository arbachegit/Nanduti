'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useNandutiLocale } from '../LocaleProvider';
import LangSwitcher from '../LangSwitcher';
import Lace from './Lace';
import { APP_ICON } from './icons';
import type { LandingData } from '@/lib/data-source/landing';
import './landing.css';

type SlideId = 'vision' | 'conversation' | 'apps' | 'feed' | 'sources' | 'manifesto';
const SLIDES: SlideId[] = ['vision', 'conversation', 'apps', 'feed', 'sources', 'manifesto'];
const SLIDE_MS = 8200;

/* ============================================================
   Helpers
   ============================================================ */
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const fmt = new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  try { return fmt.format(new Date(iso)); } catch { return ''; }
}
const PYG = (n: number) => 'Gs. ' + Math.round(n).toLocaleString('es-PY').replace(/,/g, '.');

const BRAND_LINES = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  return {
    x1: r3(32 + Math.cos(a) * 4),
    y1: r3(32 + Math.sin(a) * 4),
    x2: r3(32 + Math.cos(a) * 28),
    y2: r3(32 + Math.sin(a) * 28),
  };
});

function BrandMark({ size = 26 }: { size?: number }) {
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

/* ============================================================
   Top bar
   ============================================================ */
function TopBar() {
  const { t } = useNandutiLocale();
  return (
    <header className="ndl-bar">
      <Link href="/" className="ndl-bar__brand" aria-label="Ñandutí">
        <span className="ndl-bar__mark"><BrandMark size={24} /></span>
        <span className="ndl-bar__name">Ñandutí</span>
        <span className="ndl-bar__tag">{t('landing.nav.demo_label')}</span>
      </Link>
      <div className="ndl-bar__r">
        <LangSwitcher />
        <Link href="/app" className="ndl-bar__cta">{t('landing.nav.open_app')}</Link>
      </div>
    </header>
  );
}

/* ============================================================
   Slide 01 — Vision
   ============================================================ */
function SlideVision({ active, totals }: { active: boolean; totals: LandingData['totals'] }) {
  const { t } = useNandutiLocale();
  return (
    <div className={`ndl-vsn ${active ? 'is-active' : ''}`}>
      <div className="ndl-vsn__lace" aria-hidden>
        <Lace size={780} rays={20} rings={6} stroke="#22d3ee" opacity={0.10} spinSec={240} />
      </div>
      <div className="ndl-vsn__inner">
        <span className="ndl-vsn__eb ndl-eyebrow">{t('landing.hero.eyebrow')}</span>
        <h1 className="ndl-vsn__h">
          <span className="ndl-vsn__l1">{t('landing.hero.title_l1')}</span>
          <span className="ndl-vsn__l2">{t('landing.hero.title_l2')}</span>
        </h1>
        <p className="ndl-vsn__lead">{t('landing.hero.lead')}</p>
        <div className="ndl-vsn__row">
          <Link href="/app" className="ndl-vsn__cta">{t('landing.hero.cta_primary')}</Link>
          <span className="ndl-vsn__live">
            <span className="ndl-vsn__pdot" />
            <span className="ndl-mono">{totals.coletas_rows} coletas · {totals.feed_rows + totals.bcp_rows + totals.dncp_rows} linhas reais · ao vivo</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Slide 02 — Conversation (demo with REAL BCP rate)
   ============================================================ */
function SlideConversation({ active, cotacoes }: { active: boolean; cotacoes: LandingData['cotacoes'] }) {
  const { t } = useNandutiLocale();
  const usd = cotacoes.find((c) => c.moeda_codigo === 'USD');
  const realResponse = usd
    ? `Tu saldo: ${PYG(4_350_000)} + 247,83 USDC. Cotación BCP del ${fmtDate(usd.fecha_planilla)}: ${PYG(usd.valor_pyg)} por dólar.`
    : t('landing.howitworks.ai_response');
  return (
    <div className={`ndl-cnv ${active ? 'is-active' : ''}`}>
      <div className="ndl-cnv__inner">
        <div className="ndl-cnv__left">
          <span className="ndl-eyebrow">{t('landing.howitworks.eyebrow')}</span>
          <h2 className="ndl-cnv__h">{t('landing.howitworks.title')}</h2>
          <p className="ndl-cnv__lead">{t('landing.howitworks.lead')}</p>
          <ol className="ndl-cnv__steps">
            {(['step1','step2','step3','step4'] as const).map((k, i) => (
              <li key={k} className="ndl-cnv__step">
                <span className="ndl-cnv__stepN">0{i+1}</span>
                <span>{t(`landing.howitworks.${k}`)}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="ndl-cnv__right">
          <div className="ndl-chat" role="img" aria-label="conversation demo">
            <div className="ndl-chat__chrome">
              <span className="ndl-chat__cdot" />
              <span className="ndl-chat__cdot" />
              <span className="ndl-chat__cdot" />
              <span className="ndl-chat__title">ñandutí · chat</span>
            </div>
            <div className="ndl-chat__body">
              <div className="ndl-chat__row ndl-chat__row--user" style={{ ['--d' as string]: '500ms' } as React.CSSProperties}>
                <div className="ndl-chat__bub ndl-chat__bub--user">{t('landing.howitworks.user_msg')}</div>
              </div>
              <div className="ndl-chat__row" style={{ ['--d' as string]: '1100ms' } as React.CSSProperties}>
                <span className="ndl-chat__avatar"><Lace size={22} rays={12} rings={3} stroke="#22d3ee" opacity={0.95} /></span>
                <div className="ndl-chat__bub ndl-chat__bub--thinking">
                  <span className="ndl-chat__dots"><span /><span /><span /></span>
                </div>
              </div>
              <div className="ndl-tool" style={{ ['--d' as string]: '1700ms' } as React.CSSProperties}>
                <span className="ndl-tool__lbl">{t('landing.howitworks.tool_call_label')}</span>
                <code className="ndl-tool__code">
                  <span className="ndl-tool__fn">wallet</span>.<span className="ndl-tool__fn">balance</span><span className="ndl-tool__p">()</span>
                </code>
                <span className="ndl-tool__arrow" aria-hidden>→</span>
                {usd ? (
                  <code className="ndl-tool__code ndl-tool__out">
                    {`{ pyg_balance: 4_350_000, usdc_balance: 247.83,`}<br/>
                    {`  cotacao_usd_pyg: { rate: ${usd.valor_pyg}, fonte: "BCP" } }`}
                  </code>
                ) : null}
              </div>
              <div className="ndl-chat__row" style={{ ['--d' as string]: '2400ms' } as React.CSSProperties}>
                <span className="ndl-chat__avatar"><Lace size={22} rays={12} rings={3} stroke="#22d3ee" opacity={0.95} /></span>
                <div className="ndl-chat__bub ndl-chat__bub--ai">{realResponse}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Slide 03 — Mini-apps with REAL data injected
   ============================================================ */
const APP_LIST: Array<'wallet'|'gov'|'health'|'edu'|'crypto'|'info'|'alerts'|'police'|'docs'> =
  ['wallet','gov','health','edu','crypto','info','alerts','police','docs'];

function makeMockup(id: string, data: LandingData): React.ReactElement {
  const { cotacoes, feed, alerts, datasets } = data;
  const usd = cotacoes.find((c) => c.moeda_codigo === 'USD');
  const topFeed = feed.slice(0, 3);
  const topAlert = alerts[0];
  const topMec = datasets.filter((d) => d.dominio === 'mec')[0];

  switch (id) {
    case 'wallet': return (
      <div className="mk mk-w">
        <span className="mk-w__pyg">{PYG(4_350_000)}</span>
        <span className="mk-w__usdc">
          247,83 USDC
          {usd ? <span className="mk-w__rate">·  {Math.round(usd.valor_pyg).toLocaleString('es-PY').replace(/,/g, '.')} BCP</span> : null}
        </span>
      </div>
    );
    case 'gov': {
      const tramites = ['Renovar cédula', 'Consultar RUC', 'Matrícula MEC'];
      const titles = topFeed.length > 0 ? [topFeed[0]?.titulo?.slice(0, 30) ?? tramites[0], tramites[1], tramites[2]] : tramites;
      return (
        <ul className="mk mk-g">
          <li><span className="mk-g__chk" /> {titles[0]} <span className="mk-g__min">15m</span></li>
          <li><span className="mk-g__chk is-on" /> {titles[1]} <span className="mk-g__min">2m</span></li>
          <li><span className="mk-g__chk" /> {titles[2]} <span className="mk-g__min">8m</span></li>
        </ul>
      );
    }
    case 'health': return (
      <div className="mk mk-h">
        <div className="mk-h__bar">
          <span className="mk-h__seg s-g" />
          <span className="mk-h__seg s-a" />
          <span className="mk-h__seg s-r" />
          <span className="mk-h__pin" style={{ left: '32%' }} />
        </div>
        <div className="mk-h__row"><span>USF Trinidad</span><span className="mk-h__d">1,2km</span></div>
      </div>
    );
    case 'edu': return (
      <ul className="mk mk-e">
        <li><span>{topMec ? topMec.titulo.split(' ').slice(0, 2).join(' ').toLowerCase() : 'Lengua'}</span><span className="mk-e__g">4,5</span></li>
        <li><span>Matemática</span><span className="mk-e__g is-ok">3,8</span></li>
        <li><span>CCNN</span><span className="mk-e__g">4,2</span></li>
      </ul>
    );
    case 'crypto': return (
      <div className="mk mk-c">
        <div className="mk-c__card">
          <div className="mk-c__chip" />
          <div className="mk-c__num">···· 4827</div>
          <div className="mk-c__lbl">Mastercard · USDC</div>
        </div>
      </div>
    );
    case 'info': {
      const items = topFeed.length >= 3 ? topFeed : [
        { titulo: 'Música y danza unen Paraguay y Japón', publicado_em: '2h' },
        { titulo: 'Paraguay explora innovación agrícola', publicado_em: '5h' },
        { titulo: 'Adjudicación de tierras en San Pedro', publicado_em: '2d' },
      ];
      return (
        <ul className="mk mk-i mk-i--text">
          {items.slice(0, 3).map((it, i) => (
            <li key={i}>
              <span className="mk-i__title">{it.titulo}</span>
            </li>
          ))}
        </ul>
      );
    }
    case 'alerts': {
      const a = topAlert;
      const sevLabel = a?.severity?.toUpperCase() ?? 'WATCH';
      const region = a?.geo_dpto ?? 'Concepción';
      const desc = a?.descricao?.slice(0, 50) ?? 'fresco a frío';
      return (
        <div className="mk mk-a">
          <span className="mk-a__pill"><span className="mk-a__pdot" /> {sevLabel} · {region}</span>
          <div className="mk-a__row"><span>{a?.fonte?.toUpperCase() ?? 'DINAC'}</span><span>{desc}</span></div>
          <div className="mk-a__row"><span>SEN</span><span>asistencia · Cateura</span></div>
        </div>
      );
    }
    case 'police': return (
      <div className="mk mk-p">
        <div className="mk-p__btn">SOS<span className="mk-p__ring" /></div>
        <div className="mk-p__d">DEAM · 1,4km</div>
      </div>
    );
    case 'docs': return (
      <div className="mk mk-d">
        <div className="mk-d__cards">
          <span className="mk-d__c s-3" />
          <span className="mk-d__c s-2" />
          <span className="mk-d__c s-1">
            <span className="mk-d__b" style={{ width: '60%' }} />
            <span className="mk-d__b" style={{ width: '85%' }} />
          </span>
        </div>
        <div className="mk-d__qr">
          <span /><span /><span /><span /><span /><span /><span /><span /><span />
        </div>
      </div>
    );
    default: return <div />;
  }
}

function SlideApps({ active, data }: { active: boolean; data: LandingData }) {
  const { t } = useNandutiLocale();
  return (
    <div className={`ndl-apps ${active ? 'is-active' : ''}`}>
      <div className="ndl-apps__inner">
        <header className="ndl-apps__h">
          <span className="ndl-eyebrow">{t('landing.miniapps.eyebrow')}</span>
          <h2 className="ndl-apps__t">{t('landing.miniapps.title')}</h2>
          <p className="ndl-apps__lead">{t('landing.miniapps.lead')}</p>
        </header>
        <div className="ndl-apps__grid">
          {APP_LIST.map((id, i) => {
            const Icon = APP_ICON[id];
            return (
              <article key={id} className="ndl-app" style={{ ['--i' as string]: i } as React.CSSProperties}>
                <div className="ndl-app__head">
                  <span className="ndl-app__icn"><Icon width={22} height={22} /></span>
                  <span className="ndl-app__nm">{t(`sidebar.${id}`)}</span>
                </div>
                <div className="ndl-app__mock">{makeMockup(id, data)}</div>
                <p className="ndl-app__tag">{t(`landing.miniapps.${id}_tag`)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Slide 04 — Live Feed (REAL articles + REAL alerts)
   ============================================================ */
function SlideFeed({ active, feed, alerts, cotacoes }: {
  active: boolean; feed: LandingData['feed']; alerts: LandingData['alerts']; cotacoes: LandingData['cotacoes'];
}) {
  const { t, locale } = useNandutiLocale();
  const dateFmt = new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-PY', { day: '2-digit', month: 'short' });
  const ago = (iso: string) => {
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const h = Math.round(diff / 3600000);
      if (h < 1) return Math.max(1, Math.round(diff / 60000)) + 'm';
      if (h < 24) return h + 'h';
      return Math.round(h / 24) + 'd';
    } catch { return ''; }
  };
  return (
    <div className={`ndl-fd ${active ? 'is-active' : ''}`}>
      <div className="ndl-fd__inner">
        <header className="ndl-fd__h">
          <span className="ndl-eyebrow">{t('landing.datasources.eyebrow')}</span>
          <h2 className="ndl-fd__t">{t('landing.datasources.title')}</h2>
          <p className="ndl-fd__lead">{t('landing.datasources.lead')}</p>
        </header>

        <div className="ndl-fd__cols">
          {/* Coluna 1: artigos reais Agencia IP / Presidência */}
          <section className="ndl-fd__col">
            <header className="ndl-fd__colH">
              <span className="ndl-mono ndl-fd__src">Agencia IP</span>
              <span className="ndl-fd__live"><span className="ndl-fd__lpd" />ao vivo</span>
            </header>
            <ul className="ndl-fd__list">
              {feed.slice(0, 5).map((it, i) => (
                <li key={i} className="ndl-fd__item" style={{ ['--i' as string]: i } as React.CSSProperties}>
                  <span className="ndl-fd__date ndl-mono">{dateFmt.format(new Date(it.publicado_em))}</span>
                  <span className="ndl-fd__title">{it.titulo}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Coluna 2: DINAC alertas reais */}
          <section className="ndl-fd__col">
            <header className="ndl-fd__colH">
              <span className="ndl-mono ndl-fd__src">DINAC · SEN</span>
              <span className="ndl-fd__live"><span className="ndl-fd__lpd" />ao vivo</span>
            </header>
            <ul className="ndl-fd__list">
              {alerts.slice(0, 5).map((it, i) => (
                <li key={i} className="ndl-fd__item ndl-fd__item--alert" style={{ ['--i' as string]: i } as React.CSSProperties}>
                  <span className={`ndl-fd__sev ndl-fd__sev--${it.severity}`}>{it.severity.toUpperCase()}</span>
                  <span className="ndl-fd__title">{it.titulo}</span>
                  <span className="ndl-fd__ago ndl-mono">{ago(it.ts_evento)}</span>
                </li>
              ))}
            </ul>

            {/* Mini ticker BCP cotação real */}
            <div className="ndl-fd__ticker">
              <span className="ndl-mono ndl-fd__tickerL">BCP · cotação · ao vivo</span>
              <div className="ndl-fd__rates">
                {cotacoes.map((c) => (
                  <span key={c.moeda_codigo} className="ndl-fd__rate">
                    <span className="ndl-fd__rateK ndl-mono">{c.moeda_codigo}</span>
                    <span className="ndl-fd__rateV">{Math.round(c.valor_pyg).toLocaleString('es-PY').replace(/,/g, '.')}</span>
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Slide 05 — Sources table (with REAL counts from totals)
   ============================================================ */
function SlideSources({ active, totals }: { active: boolean; totals: LandingData['totals'] }) {
  const { t } = useNandutiLocale();
  const SOURCES = [
    { name: 'Agencia IP',          kind: 'rss',      cron: '30m', rows: totals.feed_rows },
    { name: 'BCP cotação',         kind: 'scraping', cron: '1h',  rows: totals.bcp_rows },
    { name: 'SEN feed',            kind: 'rss',      cron: '30m', rows: 10 },
    { name: 'DINAC pronóstico',    kind: 'scraping', cron: '1h',  rows: totals.alerts_rows - 10 },
    { name: 'DNCP OCDS',           kind: 'api rest', cron: '1d',  rows: totals.dncp_rows },
    { name: 'datos.gov.py (DKAN)', kind: 'api rest', cron: '30d', rows: 24 },
    { name: 'github.com/mecpy',    kind: 'github',   cron: '7d',  rows: 4 },
  ];
  return (
    <div className={`ndl-src ${active ? 'is-active' : ''}`}>
      <div className="ndl-src__inner">
        <header className="ndl-src__h">
          <span className="ndl-eyebrow">{t('landing.architecture.eyebrow')}</span>
          <h2 className="ndl-src__t">{t('landing.architecture.title')}</h2>
          <p className="ndl-src__lead">{t('landing.architecture.lead')}</p>
        </header>
        <div className="ndl-src__table">
          <div className="ndl-src__head">
            <span>{t('landing.datasources.table_source')}</span>
            <span>{t('landing.datasources.table_kind')}</span>
            <span>{t('landing.datasources.table_cron')}</span>
            <span className="ndl-src__r-right">{t('landing.datasources.table_rows')}</span>
            <span className="ndl-src__r-right">{t('landing.datasources.live')}</span>
          </div>
          {SOURCES.map((s, i) => (
            <div key={s.name} className="ndl-src__row" style={{ ['--i' as string]: i } as React.CSSProperties}>
              <span className="ndl-src__name">{s.name}</span>
              <span className="ndl-src__kind">{s.kind}</span>
              <span className="ndl-src__cron">{s.cron}</span>
              <span className="ndl-src__rows">{s.rows}</span>
              <span className="ndl-src__r-right">
                <span className="ndl-src__live"><span className="ndl-src__pdot" />{t('landing.datasources.live')}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Slide 06 — Manifesto + REAL stats
   ============================================================ */
function SlideManifesto({ active, totals }: { active: boolean; totals: LandingData['totals'] }) {
  const { t } = useNandutiLocale();
  const totalRows = totals.feed_rows + totals.bcp_rows + totals.dncp_rows + totals.alerts_rows;
  const stats = [
    { value: String(totalRows), label: t('landing.stats.rows_label') },
    { value: '7',                label: t('landing.stats.workflows_label') },
    { value: '6',                label: t('landing.stats.sources_label') },
    { value: '28',               label: t('landing.stats.tools_label') },
    { value: '5',                label: t('landing.stats.languages_label') },
  ];
  return (
    <div className={`ndl-mfs ${active ? 'is-active' : ''}`}>
      <div className="ndl-mfs__lace" aria-hidden>
        <Lace size={620} rays={20} rings={6} stroke="#22d3ee" opacity={0.08} spinSec={180} />
      </div>
      <div className="ndl-mfs__inner">
        <p className="ndl-mfs__quote">
          <span className="ndl-mfs__q">"</span>
          {t('landing.footer.manifesto')}
          <span className="ndl-mfs__q">"</span>
        </p>
        <div className="ndl-mfs__stats">
          {stats.map((s, i) => (
            <div key={i} className="ndl-mfs__cell" style={{ ['--i' as string]: i } as React.CSSProperties}>
              <span className="ndl-mfs__num">{s.value}</span>
              <span className="ndl-mfs__lbl">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="ndl-mfs__row">
          <Link href="/app" className="ndl-mfs__cta">{t('landing.hero.cta_primary')}</Link>
          <span className="ndl-mfs__credit">{t('landing.footer.credit')}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Pager
   ============================================================ */
function Pager({ active, total, paused, onJump, onTogglePause }: {
  active: number; total: number; paused: boolean; onJump: (i: number) => void; onTogglePause: () => void;
}) {
  return (
    <div className="ndl-pgr" role="group" aria-label="presentation navigation">
      <div className="ndl-pgr__inner">
        <div className="ndl-pgr__count">
          <span className="ndl-pgr__cur">{(active + 1).toString().padStart(2,'0')}</span>
          <span className="ndl-pgr__sl">/</span>
          <span>{total.toString().padStart(2,'0')}</span>
        </div>

        <div className="ndl-pgr__dots">
          {Array.from({ length: total }, (_, i) => {
            const isA = i === active;
            return (
              <button
                key={i}
                type="button"
                className={`ndl-pgr__dot ${isA ? 'is-active' : ''}`}
                onClick={() => onJump(i)}
                aria-label={`Slide ${i + 1}`}
                aria-current={isA ? 'true' : undefined}
              >
                <span className="ndl-pgr__bar">
                  {isA ? <span className="ndl-pgr__fill" style={{ animationPlayState: paused ? 'paused' : 'running' }} /> : null}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ndl-pgr__ctrl">
          <button type="button" className="ndl-pgr__btn" onClick={() => onJump((active - 1 + total) % total)} aria-label="previous">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" className="ndl-pgr__btn ndl-pgr__btn--play" onClick={onTogglePause} aria-label={paused ? 'play' : 'pause'}>
            {paused ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8V4z" /></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
            )}
          </button>
          <button type="button" className="ndl-pgr__btn" onClick={() => onJump((active + 1) % total)} aria-label="next">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Composer principal
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
      <TopBar />

      <div className="ndl-stage" role="region" aria-roledescription="carousel" aria-label="Ñandutí presentation">
        {SLIDES.map((id, i) => {
          const isA = i === active;
          const isP = i === prevIdx;
          const cls = `ndl-slide ${isA ? 'is-active' : ''} ${isP ? 'is-prev' : ''}`;
          return (
            <section key={id} className={cls} aria-hidden={!isA} data-slide={id}>
              {id === 'vision'        ? <SlideVision        active={isA} totals={data.totals} /> : null}
              {id === 'conversation'  ? <SlideConversation  active={isA} cotacoes={data.cotacoes} /> : null}
              {id === 'apps'          ? <SlideApps          active={isA} data={data} /> : null}
              {id === 'feed'          ? <SlideFeed          active={isA} feed={data.feed} alerts={data.alerts} cotacoes={data.cotacoes} /> : null}
              {id === 'sources'       ? <SlideSources       active={isA} totals={data.totals} /> : null}
              {id === 'manifesto'     ? <SlideManifesto     active={isA} totals={data.totals} /> : null}
            </section>
          );
        })}
      </div>

      <Pager active={active} total={total} paused={paused} onJump={goTo} onTogglePause={() => setPaused((p) => !p)} />
    </main>
  );
}
