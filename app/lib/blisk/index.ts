/**
 * Blisk design layer: picks the store vertical, the background palette, the
 * metallic accent and the merchant's own two colours, and turns them into CSS
 * custom properties on `body.theme-blisk`. Pure functions, so the server and
 * the browser agree.
 *
 * Precedence (same as the Twig theme): merchant colour squares > background
 * palette; accent: merchant ink > chosen metal > the vertical's own metal.
 */
import {
  ACCENTS,
  BACKGROUNDS,
  LIGHT_BACKGROUNDS,
  VERTICALS,
  VERTICAL_IDS,
  type VerticalId,
} from './data';

export { VERTICALS, VERTICAL_IDS, BACKGROUNDS, LIGHT_BACKGROUNDS, type VerticalId };

type Settings = Record<string, unknown> | undefined | null;

/** A dropdown value arrives as a string, `{ value }` or `[{ value }]`. */
export function settingValue(raw: unknown): string {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first === 'string') return first.trim();
  if (first && typeof first === 'object' && 'value' in first) {
    const v = (first as { value?: unknown }).value;
    return typeof v === 'string' ? v.trim() : '';
  }
  return '';
}

/** A switch that is on unless the merchant turned it off. */
export function settingOn(raw: unknown, fallback = true): boolean {
  if (raw === undefined || raw === null || raw === '') return fallback;
  return raw !== false && raw !== 'false' && raw !== 0;
}

/** Text that may arrive per language (`{ ar, en }`) or as a plain string. */
export function localText(raw: unknown, locale: string): string {
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'number') return String(raw);
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const v = o[locale] ?? o.ar ?? o.en;
    return typeof v === 'string' ? v.trim() : '';
  }
  return '';
}

/** A field of a collection item, saved either as `title` or `items.title`. */
export function itemField(item: Record<string, unknown>, prefix: string, key: string): unknown {
  return item[key] ?? item[`${prefix}.${key}`];
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function fold(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

/**
 * The vertical whose words appear most in the text. The general «beauty»
 * vertical only wins when no specific one matches.
 */
export function detectVertical(text: string): VerticalId {
  const t = fold(text);
  let best: VerticalId = 'beauty';
  let bestHits = 0;
  for (const id of VERTICAL_IDS) {
    if (id === 'beauty') continue;
    const hits = VERTICALS[id].kw.filter((w) => t.includes(fold(w))).length;
    if (hits > bestHits) {
      best = id;
      bestHits = hits;
    }
  }
  return best;
}

export function resolveVertical(settings: Settings, storeText: string): VerticalId {
  const raw = settingValue(settings?.oc_vertical) || 'auto';
  if ((VERTICAL_IDS as readonly string[]).includes(raw)) return raw as VerticalId;
  return detectVertical(storeText);
}

/** Perceived brightness below the middle: treat the colour as dark. */
export function isDark(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114 < 128000;
}

const DARK_TEXT = {
  txt: '#e9e6df',
  mut: '#9a968e',
  line: 'rgba(255,236,200,.14)',
  glass: 'rgba(255,255,255,.05)',
};
const LIGHT_TEXT = {
  txt: '#1d1a16',
  mut: '#6b645a',
  line: 'rgba(60,45,20,.16)',
  glass: 'rgba(0,0,0,.035)',
};

export interface BliskDesign {
  vertical: VerticalId;
  background: string;
  light: boolean;
  cinema: boolean;
  css: string;
}

export function resolveDesign(settings: Settings, storeText: string): BliskDesign {
  const vertical = resolveVertical(settings, storeText);
  const bgKey = settingValue(settings?.oc_bg);
  const background = BACKGROUNDS[bgKey] ? bgKey : 'graphite';
  const [bg, bg2, bg3] = BACKGROUNDS[background];
  let light = LIGHT_BACKGROUNDS.includes(background);

  const vars: Record<string, string> = { 'oc-bg': bg, 'oc-bg2': bg2, 'oc-bg3': bg3 };

  // The merchant's background square replaces the palette.
  const skin = settingValue(settings?.oc_skin_color) || String(settings?.oc_skin_color ?? '');
  if (settingOn(settings?.oc_skin_on, false) && HEX.test(skin)) {
    light = !isDark(skin);
    vars['oc-bg'] = skin;
    vars['oc-bg2'] = `color-mix(in srgb, ${skin}, #808080 9%)`;
    vars['oc-bg3'] = `color-mix(in srgb, ${skin}, #808080 16%)`;
  }

  const text = light ? LIGHT_TEXT : DARK_TEXT;
  vars['oc-txt'] = text.txt;
  vars['oc-mut'] = text.mut;
  vars['oc-line'] = text.line;
  vars['oc-glass'] = text.glass;

  // Accent: merchant ink > chosen metal > the vertical's own metal. On a light
  // background the default gold is darkened so it reads.
  const accentKey = settingValue(settings?.oc_accent) || 'champagne';
  let acc =
    accentKey === 'store'
      ? 'var(--color-primary)'
      : (ACCENTS[accentKey] ?? VERTICALS[vertical].acc);
  if (light && accentKey === 'champagne') acc = `color-mix(in srgb, ${acc}, #000 38%)`;
  const ink = settingValue(settings?.oc_ink_color) || String(settings?.oc_ink_color ?? '');
  if (settingOn(settings?.oc_ink_on, false) && HEX.test(ink)) acc = ink;
  vars['oc-acc'] = acc;
  vars['oc-acc2'] = `color-mix(in srgb, ${acc}, ${light ? '#000 30%' : '#fff 45%'})`;
  vars['oc-glow'] = `color-mix(in srgb, ${acc} 35%, transparent)`;

  const decl = Object.entries(vars)
    .map(([k, v]) => `--${k}:${v}`)
    .concat(`color-scheme:${light ? 'light' : 'dark'}`)
    .join(';');

  return {
    vertical,
    background,
    light,
    cinema: settingOn(settings?.oc_cinema),
    css: `body.theme-blisk{${decl}}`,
  };
}
