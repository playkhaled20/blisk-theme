import { useState } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { BACKGROUNDS, LIGHT_BACKGROUNDS, settingOn } from '../lib/blisk';
import { useCustomerBg, writeCustomerBg } from './customerColour';

/** The page-colour picker the merchant can offer customers (oc_customer_color): dark and light palettes, saved in the browser. */
const NAMES: Record<string, [string, string]> = {
  graphite: ['جرافيت', 'Graphite'],
  midnight: ['منتصف الليل', 'Midnight'],
  onyx: ['أونيكس', 'Onyx'],
  titanium: ['تيتانيوم', 'Titanium'],
  espresso: ['إسبريسو', 'Espresso'],
  navy: ['كحلي', 'Navy'],
  emerald: ['زمردي ليلي', 'Emerald night'],
  plum: ['برقوقي', 'Plum'],
  wine: ['عنابي', 'Wine'],
  ocean: ['محيطي', 'Ocean'],
  ivory: ['عاجي', 'Ivory'],
  sand: ['رملي', 'Sand'],
  pearl: ['لؤلؤي', 'Pearl'],
  softblue: ['أزرق ناعم', 'Soft blue'],
  mint: ['نعناعي', 'Mint'],
  blush: ['وردي فاتح', 'Blush'],
  lavender: ['لافندر', 'Lavender'],
  cloud: ['سحابي', 'Cloud'],
};

export function ColourPicker() {
  const { theme } = useTwilight();
  const { locale } = useTranslation();
  const ar = locale !== 'en';
  const on = settingOn((theme?.settings as Record<string, unknown> | undefined)?.oc_customer_color, false);
  const cur = useCustomerBg(on);
  const [open, setOpen] = useState(false);
  if (!on) return null;
  const keys = Object.keys(BACKGROUNDS);
  const groups: [string, string[]][] = [
    [ar ? 'داكن' : 'Dark', keys.filter((k) => !LIGHT_BACKGROUNDS.includes(k))],
    [ar ? 'فاتح' : 'Light', keys.filter((k) => LIGHT_BACKGROUNDS.includes(k))],
  ];
  return (
    <div className={`oc-cc${open ? ' is-open' : ''}`} dir={ar ? 'rtl' : 'ltr'}>
      <button type="button" className="oc-cc__fab" aria-expanded={open} aria-label={ar ? 'لون الصفحة' : 'Page colour'} title={ar ? 'لون الصفحة' : 'Page colour'} onClick={() => setOpen(!open)}>
        <i aria-hidden="true" />
      </button>
      {open && (
        <div className="oc-cc__pop" role="dialog" aria-label={ar ? 'اختر لون صفحتك' : 'Pick your page colour'}>
          <b>{ar ? 'اختر لون صفحتك' : 'Pick your page colour'}</b>
          <small>{ar ? 'يُحفظ في متصفحك فقط' : 'Saved in your browser only'}</small>
          {groups.map(([title, list]) => (
            <div key={title}>
              <em className="oc-cc__g">{title}</em>
              <div className="oc-cc__row">
                {list.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={k === cur ? 'is-on' : undefined}
                    aria-pressed={k === cur}
                    aria-label={ar ? NAMES[k]?.[0] : NAMES[k]?.[1]}
                    title={ar ? NAMES[k]?.[0] : NAMES[k]?.[1]}
                    style={{ background: BACKGROUNDS[k][0] }}
                    onClick={() => writeCustomerBg(k)}
                  />
                ))}
              </div>
            </div>
          ))}
          <button type="button" className="oc-cc__reset" onClick={() => writeCustomerBg('')}>
            {ar ? 'لون المتجر' : 'Store colour'}
          </button>
        </div>
      )}
    </div>
  );
}
