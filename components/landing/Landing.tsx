'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useNandutiLocale } from '../LocaleProvider';
import LangSwitcher from '../LangSwitcher';
import Lace from './Lace';
import { APP_ICON } from './icons';
import './landing.css';

type SlideId = 'vision' | 'conversation' | 'apps' | 'sources' | 'architecture' | 'manifesto';
const SLIDES: SlideId[] = ['vision', 'conversation', 'apps', 'sources', 'architecture', 'manifesto'];
const SLIDE_MS = 7800;

/* ===========================================================
   Brand mark — Ñandutí radial (coordenadas pré-calc fixas)
   =========================================================== */
const BRAND_LINES = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const r3 = (n: number) => Math.round(n * 1000) / 1000;
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

/* ===========================================================
   Top bar — brand · lang dropdown · CTA
   =========================================================== */
function TopBar() {
  const { t } = useNandutiLocale();
  return (
    <header className="ndl-bar">
      <Link href="/" className="ndl-bar__brand" aria-label="Ñandutí">
        <span className="ndl-bar__mark"><BrandMark size={26} /></span>
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

/* ===========================================================
   Slide 01 — Vision
   =========================================================== */
function SlideVision({ active }: { active: boolean }) {
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
          <span className="ndl-vsn__meta ndl-mono">{t('landing.hero.meta')}</span>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   Slide 02 — Conversation
   =========================================================== */
function SlideConversation({ active }: { active: boolean }) {
  const { t } = useNandutiLocale();
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
                <code className="ndl-tool__code ndl-tool__out">
                  {'{ pyg_balance: 4_350_000, usdc_balance: 247.83,'}<br/>
                  {'  cotacao_usd_pyg: { rate: 6159.41, fonte: "BCP" } }'}
                </code>
              </div>
              <div className="ndl-chat__row" style={{ ['--d' as string]: '2400ms' } as React.CSSProperties}>
                <span className="ndl-chat__avatar"><Lace size={22} rays={12} rings={3} stroke="#22d3ee" opacity={0.95} /></span>
                <div className="ndl-chat__bub ndl-chat__bub--ai">{t('landing.howitworks.ai_response')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   Slide 03 — Mini-apps
   =========================================================== */
const APP_LIST: Array<'wallet'|'gov'|'health'|'edu'|'crypto'|'info'|'alerts'|'police'|'docs'> =
  ['wallet','gov','health','edu','crypto','info','alerts','police','docs'];

function SlideApps({ active }: { active: boolean }) {
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
                  <span className="ndl-app__icn"><Icon width={16} height={16} /></span>
                  <span className="ndl-app__nm">{t(`sidebar.${id}`)}</span>
                </div>
                <p className="ndl-app__tag">{t(`landing.miniapps.${id}_tag`)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   Slide 04 — Data sources
   =========================================================== */
const SOURCES = [
  { name: 'Agencia IP',           kind: 'rss',      cron: '30m', rows: 10 },
  { name: 'BCP cotação',          kind: 'scraping', cron: '1h',  rows: 78 },
  { name: 'SEN feed',             kind: 'rss',      cron: '30m', rows: 10 },
  { name: 'DINAC pronóstico',     kind: 'scraping', cron: '1h',  rows: 17 },
  { name: 'DNCP OCDS',            kind: 'api rest', cron: '1d',  rows: 50 },
  { name: 'datos.gov.py (DKAN)',  kind: 'api rest', cron: '30d', rows: 24 },
  { name: 'github.com/mecpy',     kind: 'github',   cron: '7d',  rows:  4 },
];

function SlideSources({ active }: { active: boolean }) {
  const { t } = useNandutiLocale();
  return (
    <div className={`ndl-src ${active ? 'is-active' : ''}`}>
      <div className="ndl-src__inner">
        <header className="ndl-src__h">
          <span className="ndl-eyebrow">{t('landing.datasources.eyebrow')}</span>
          <h2 className="ndl-src__t">{t('landing.datasources.title')}</h2>
          <p className="ndl-src__lead">{t('landing.datasources.lead')}</p>
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

/* ===========================================================
   Slide 05 — Architecture
   =========================================================== */
function SlideArchitecture({ active }: { active: boolean }) {
  const { t } = useNandutiLocale();
  const layers = [
    { title: t('landing.architecture.layer1_title'), body: t('landing.architecture.layer1_body'), tags: ['GitHub Actions','Python','Pydantic'] },
    { title: t('landing.architecture.layer2_title'), body: t('landing.architecture.layer2_body'), tags: ['Supabase','Postgres','RLS','Views'] },
    { title: t('landing.architecture.layer3_title'), body: t('landing.architecture.layer3_body'), tags: ['Next.js 15','Redis','MITIC'] },
    { title: t('landing.architecture.layer4_title'), body: t('landing.architecture.layer4_body'), tags: ['DO Gradient','Haiku 3.5','Sonnet 4'] },
  ];
  return (
    <div className={`ndl-arc ${active ? 'is-active' : ''}`}>
      <div className="ndl-arc__inner">
        <header className="ndl-arc__h">
          <span className="ndl-eyebrow">{t('landing.architecture.eyebrow')}</span>
          <h2 className="ndl-arc__t">{t('landing.architecture.title')}</h2>
          <p className="ndl-arc__lead">{t('landing.architecture.lead')}</p>
        </header>
        <div className="ndl-arc__flow">
          {layers.map((l, i) => (
            <div key={i} className="ndl-arc__layer" style={{ ['--i' as string]: i } as React.CSSProperties}>
              <div className="ndl-arc__num">{(i+1).toString().padStart(2,'0')}</div>
              <div className="ndl-arc__card">
                <h3 className="ndl-arc__cT">{l.title}</h3>
                <p className="ndl-arc__cB">{l.body}</p>
                <div className="ndl-arc__tags">
                  {l.tags.map((g) => <span key={g} className="ndl-arc__tag">{g}</span>)}
                </div>
              </div>
              {i < layers.length - 1 ? (
                <div className="ndl-arc__cn" aria-hidden>
                  <svg width="48" height="14" viewBox="0 0 48 14" fill="none">
                    <path d="M0 7 H44 M44 7 L40 3 M44 7 L40 11" stroke="rgba(34,211,238,0.5)" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   Slide 06 — Manifesto + stats
   =========================================================== */
function SlideManifesto({ active }: { active: boolean }) {
  const { t } = useNandutiLocale();
  const stats = [
    { value: '199', label: t('landing.stats.rows_label') },
    { value: '7',   label: t('landing.stats.workflows_label') },
    { value: '6',   label: t('landing.stats.sources_label') },
    { value: '28',  label: t('landing.stats.tools_label') },
    { value: '5',   label: t('landing.stats.languages_label') },
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

/* ===========================================================
   Pager — barra inferior com 6 dots/progress + controls
   =========================================================== */
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

/* ===========================================================
   Composer principal
   =========================================================== */
export default function Landing() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = SLIDES.length;

  const goTo = useCallback((idx: number) => setActive(((idx % total) + total) % total), [total]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Auto-rotate
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % total), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, total]);

  // Keyboard
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

  // Pause on tab hidden
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
              {id === 'vision'        ? <SlideVision        active={isA} /> : null}
              {id === 'conversation'  ? <SlideConversation  active={isA} /> : null}
              {id === 'apps'          ? <SlideApps          active={isA} /> : null}
              {id === 'sources'       ? <SlideSources       active={isA} /> : null}
              {id === 'architecture'  ? <SlideArchitecture  active={isA} /> : null}
              {id === 'manifesto'     ? <SlideManifesto     active={isA} /> : null}
            </section>
          );
        })}
      </div>

      <Pager active={active} total={total} paused={paused} onJump={goTo} onTogglePause={() => setPaused((p) => !p)} />
    </main>
  );
}
