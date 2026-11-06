import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { VERTICALS, resolveVertical, settingOn } from '../lib/blisk';
import { ADDON_IDS, NAMES, adaptFor, FAQ, shadeWords, type AddonId, type Bi } from './panel';

/**
 * «إضافاتي الذكية»: a floating ✦ button that opens twelve small helpers for the
 * store's type (advisor, voice search, read-aloud, true size, shades, use & care,
 * shade guide, complete the routine, quiz, skin match, gift finder, ready
 * routines). Everything runs in the visitor's browser and searches the store's
 * own products. The merchant switches the panel (`oc_addons`) and each helper
 * (`oc_addon_<id>`) off in the theme settings.
 */

type View = { kind: 'idle' } | { kind: 'text'; title?: string; lines: string[] } | { kind: 'chips'; title: string; items: { label: string; kw: string; n?: number; hex?: string }[] } | { kind: 'search'; kw: string; budget?: number } | { kind: 'ask' } | { kind: 'quiz'; step: number; ans: string[] } | { kind: 'ruler'; w: number; h: number; label: string };

const priceOf = (p: Product) => Number((p.is_on_sale ? p.sale_price : p.price) ?? 0) || 0;
const imgOf = (p: Product) => p.image?.url ?? '';

function Results({ kw, budget, ar }: { kw: string; budget?: number; ar: boolean }) {
  const { data, isLoading } = useQuery(productApi.queries.list({ source: 'search', keyword: kw, perPage: 8 }));
  const all = (data?.items ?? []) as Product[];
  const within = budget ? all.filter((p) => priceOf(p) <= budget) : all;
  const list = (within.length ? within : all).slice(0, 6);
  if (isLoading) return <p>{ar ? 'نبحث في متجرك…' : 'Searching your store…'}</p>;
  if (!list.length)
    return (
      <Link to={`/search?q=${encodeURIComponent(kw)}`}>
        {ar ? 'اعرض النتائج لـ' : 'See results for'} «{kw}»
      </Link>
    );
  return (
    <>
      {list.map((p) => (
        <Link key={p.id} className="oc-ai__res" to={new URL(p.url, 'https://x').pathname}>
          {imgOf(p) && <img src={imgOf(p)} alt="" width={48} height={48} loading="lazy" decoding="async" />}
          <span>
            {p.name}
            <small>{priceOf(p).toLocaleString(ar ? 'ar-SA-u-nu-latn' : 'en')} {ar ? 'ر.س' : 'SAR'}</small>
          </span>
        </Link>
      ))}
    </>
  );
}

export function SmartPanel() {
  const { theme, store } = useTwilight();
  const { locale } = useTranslation();
  const ar = locale !== 'en';
  const settings = theme?.settings as Record<string, unknown> | undefined;
  const v = resolveVertical(settings, `${store?.name ?? ''} ${store?.description ?? ''}`);
  const D = useMemo(() => adaptFor(v), [v]);
  const V = VERTICALS[v] ?? VERTICALS.beauty;
  const male = v === 'mens';
  const g = (f: string, m: string) => (male ? m : f);
  const L = (o: Bi) => (ar ? o.ar : o.en);
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState<AddonId | ''>('');
  const [view, setView] = useState<View>({ kind: 'idle' });
  const [q, setQ] = useState('');
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!settingOn(settings?.oc_addons, true)) return null;
  const W = shadeWords(v);
  const ids = ADDON_IDS.filter((k) => settingOn(settings?.[`oc_addon_${k}`], true) && !D.skip.includes(k));
  if (!ids.length) return null;
  const name = (k: AddonId) => {
    const n = NAMES(g, W)[k];
    return ar ? n[0] : n[1];
  };

  const run = (k: AddonId) => {
    setCur(k);
    if (k === 'stylist') return setView({ kind: 'ask' });
    if (k === 'quiz') return setView({ kind: 'quiz', step: 0, ans: [] });
    if (k === 'tryon' && D.mm) return setView({ kind: 'ruler', w: D.mm[0], h: D.mm[1], label: L(D.sizeLabel) });
    if (k === 'recolour') return setView({ kind: 'chips', title: ar ? `${g('اختاري', 'اختر')} ${W[0]}` : `Pick a ${W[2]}`, items: D.finish.map((f) => ({ label: L(f), kw: `${L(f)} ${ar ? V.ar : V.en}`, hex: f.hex })) });
    if (k === 'colorbook') return setView({ kind: 'chips', title: ar ? `دليل ${W[1]} المتوفرة` : `${W[2]} guide`, items: D.finish.map((f) => ({ label: L(f), kw: L(f), hex: f.hex })) });
    if (k === 'photocoach') return setView({ kind: 'text', title: ar ? g('استخدميه صح واحفظيه صح', 'استخدمه صح واحفظه صح') : 'Use it right, store it right', lines: D.photo.map(L) });
    if (k === 'look') return setView({ kind: 'chips', title: ar ? g('أكملي روتينك', 'أكمل روتينك') : 'Complete your routine', items: D.kit.map((x) => ({ label: `+ ${L(x)}`, kw: x.kw })) });
    if (k === 'presets') return setView({ kind: 'chips', title: ar ? 'روتينات جاهزة' : 'Ready routines', items: D.bundle.map((b) => ({ label: L(b), kw: b.kw[0] })) });
    if (k === 'undertone') return setView({ kind: 'chips', title: ar ? 'وش نوع بشرتك؟' : 'Your skin type?', items: D.compat.map((c) => ({ label: L(c), kw: `${c.kw} ${ar ? V.ar : V.en}` })) });
    if (k === 'giftfinder') return setView({ kind: 'chips', title: ar ? 'ميزانية الهدية' : 'Gift budget', items: D.gift.map((n) => ({ label: `≤ ${n} ${ar ? 'ر.س' : 'SAR'}`, kw: ar ? V.ar : V.en, n })) });
    if (k === 'voice') {
      const w = window as unknown as { SpeechRecognition?: new () => SpeechLike; webkitSpeechRecognition?: new () => SpeechLike };
      const R = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (!R) return setView({ kind: 'text', lines: [ar ? 'المتصفح لا يدعم البحث الصوتي' : 'Voice search is not supported in this browser'] });
      const r = new R();
      r.lang = ar ? 'ar-SA' : 'en-US';
      setView({ kind: 'text', lines: [ar ? g('تكلّمي الحين…', 'تكلّم الحين…') : 'Speak now…'] });
      r.onresult = (e) => setView({ kind: 'search', kw: e.results[0][0].transcript });
      r.onerror = () => setView({ kind: 'text', lines: [ar ? g('ما قدرنا نسمعك — جرّبي الكتابة', 'ما قدرنا نسمعك — جرّب الكتابة') : 'Could not hear you — try typing'] });
      try {
        r.start();
      } catch {
        setView({ kind: 'text', lines: [ar ? 'تعذّر تشغيل الميكروفون' : 'Microphone unavailable'] });
      }
      return;
    }
    if (k === 'listen') {
      if (!('speechSynthesis' in window)) return setView({ kind: 'text', lines: [ar ? 'المتصفح لا يدعم القراءة الصوتية' : 'Read-aloud is not supported'] });
      // Reads the use & care lines of this store type aloud.
      const lines = D.photo.map(L);
      const u = new SpeechSynthesisUtterance(lines.join('. ').slice(0, 600));
      u.lang = ar ? 'ar-SA' : 'en-US';
      u.onend = () => setSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      setSpeaking(true);
      return setView({ kind: 'text', title: ar ? D.listen : 'How to use', lines });
    }
  };

  const body = () => {
    switch (view.kind) {
      case 'idle':
        return (
          <p>
            {ar ? g('اختاري أداة — المحتوى مخصص لقسم', 'اختر أداة — المحتوى مخصص لقسم') : 'Pick a tool — tailored to'} {ar ? V.ar : V.en}
          </p>
        );
      case 'text':
        return (
          <>
            {view.title && <b>{view.title}</b>}
            {view.lines.map((l, i) => (
              <p key={i}>• {l}</p>
            ))}
            {cur === 'listen' && speaking && (
              <button
                type="button"
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setSpeaking(false);
                }}
              >
                {ar ? 'إيقاف' : 'Stop'}
              </button>
            )}
          </>
        );
      case 'chips':
        return (
          <>
            <b>{view.title}</b>
            {view.items.map((x, i) => (
              <button key={i} type="button" onClick={() => setView({ kind: 'search', kw: x.kw, budget: x.n })}>
                {x.hex && <i className="oc-ai__sw" style={{ background: /^#[0-9a-f]{3,8}$/i.test(x.hex) ? x.hex : '#888' }} aria-hidden="true" />}
                {x.label}
              </button>
            ))}
          </>
        );
      case 'search':
        return <Results kw={view.kw} budget={view.budget} ar={ar} />;
      case 'ruler':
        return (
          <>
            <b>{view.label}</b>
            <div className="oc-ai__ruler" style={{ width: `${view.w}mm`, height: `${view.h}mm` }} aria-hidden="true" />
            <small>{ar ? `حجم العبوة التقريبي ≈ ${view.w}×${view.h} ملم. قارنها بيدك — تقريبي ويختلف حسب الشاشة.` : `About ${view.w}×${view.h} mm. Compare with your hand — approximate, varies by screen.`}</small>
          </>
        );
      case 'quiz': {
        if (view.step >= D.quiz.length) return <Results kw={view.ans.join(' ')} ar={ar} />;
        const Q = D.quiz[view.step];
        return (
          <>
            <small>
              {view.step + 1}/{D.quiz.length}
            </small>
            <b>{L(Q.q)}</b>
            {Q.opts.map((o, j) => (
              <button key={j} type="button" onClick={() => setView({ kind: 'quiz', step: view.step + 1, ans: [...view.ans, o.kw] })}>
                {L(o)}
              </button>
            ))}
          </>
        );
      }
      case 'ask':
        return (
          <>
            <b>{ar ? g('اسألي عن منتج أو نوع بشرة أو ميزانية أو سياسة', 'اسأل عن منتج أو نوع بشرة أو ميزانية أو سياسة') : 'Ask about a product, skin type, budget or policy'}</b>
            <form
              className="oc-ai__ask"
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim()) setView({ kind: 'search', kw: q.trim() });
              }}
            >
              <input type="search" className="oc-ai__q" maxLength={80} placeholder={ar ? 'مثال: سيروم للبشرة الجافة' : 'e.g. serum for dry skin'} aria-label={ar ? g('اسألي المستشارة', 'اسأل المستشار') : 'Ask the advisor'} value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="submit">{ar ? 'ابحث' : 'Search'}</button>
            </form>
            {FAQ.map((f, i) => (
              <button key={i} type="button" onClick={() => setView({ kind: 'text', title: ar ? f[0] : f[1], lines: [ar ? f[2] : f[3]] })}>
                {ar ? f[0] : f[1]}
              </button>
            ))}
          </>
        );
    }
  };

  return (
    <div className={`oc-ai${open ? ' is-open' : ''}`} dir={ar ? 'rtl' : 'ltr'}>
      <button type="button" className="oc-ai__fab" aria-expanded={open} onClick={() => setOpen(!open)}>
        ✦ {ar ? 'إضافاتي الذكية' : 'Smart add-ons'}
      </button>
      {open && (
        <div className="oc-ai__p" role="dialog" aria-label={ar ? 'الإضافات الذكية' : 'Smart add-ons'}>
          <header>
            <b>
              {ar ? 'مساعد' : 'Assistant'} {ar ? V.ar : V.en}
            </b>
            <button type="button" className="oc-ai__x" aria-label={ar ? 'إغلاق' : 'Close'} onClick={() => setOpen(false)}>
              ×
            </button>
          </header>
          <nav>
            {ids.map((k) => (
              <button key={k} type="button" className={k === cur ? 'is-on' : undefined} aria-pressed={k === cur} onClick={() => run(k)}>
                {name(k)}
              </button>
            ))}
          </nav>
          <div className="oc-ai__body" aria-live="polite">
            {body()}
          </div>
        </div>
      )}
    </div>
  );
}

interface SpeechLike {
  lang: string;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
}
