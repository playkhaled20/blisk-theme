import DATA from './data.json';

/** Data and wording for the smart panel (Twig `obsidian/addons.js`), per store type. */
export const ADDON_IDS = ['stylist', 'voice', 'listen', 'tryon', 'recolour', 'photocoach', 'colorbook', 'look', 'quiz', 'undertone', 'giftfinder', 'presets'] as const;
export type AddonId = (typeof ADDON_IDS)[number];

export interface Bi {
  ar: string;
  en: string;
}
export interface PanelData {
  words: string[];
  quiz: { q: Bi; opts: (Bi & { kw: string })[] }[];
  kit: (Bi & { kw: string })[];
  compat: (Bi & { kw: string })[];
  finish: (Bi & { hex: string })[];
  mm: [number, number] | null;
  sizeLabel: Bi;
  gift: number[];
  photo: Bi[];
  bundle: (Bi & { kw: string[] })[];
  /** What the read-aloud helper is about («طريقة الاستخدام»). */
  listen: string;
}

const ALL = DATA as unknown as Record<string, PanelData>;
const FIRST = Object.keys(ALL)[0];

/** This store type's data, and the helpers it has nothing for. */
export function adaptFor(v: string): PanelData & { skip: AddonId[] } {
  const D = ALL[v] ?? ALL[FIRST];
  const skip: AddonId[] = [];
  if (!D.mm) skip.push('tryon');
  if (!D.finish?.length) skip.push('recolour', 'colorbook');
  if (!D.photo?.length) skip.push('photocoach');
  return { ...D, skip };
}

/** «shade / scent / colour» wording by store type: [singular, plural, English]. */
export function shadeWords(v: string): [string, string, string] {
  const scent: [string, string, string] = ['الرائحة', 'الروائح', 'scent'];
  const colour: [string, string, string] = ['اللون', 'الألوان', 'colour'];
  const M: Record<string, [string, string, string]> = { perfume: scent, mens: scent, bodycare: scent, gifts: scent, haircare: colour, devices: colour, nails: colour };
  return M[v] ?? ['الدرجة', 'الدرجات', 'shade'];
}
