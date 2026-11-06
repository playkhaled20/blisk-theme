import { useEffect, useState } from 'react';

/**
 * «السماح للعميل بتغيير لون الصفحة» (oc_customer_color): the customer's own page
 * colour, kept in this browser only. It never touches the theme settings.
 */
const KEY = 'oc_ubg';
const EVENT = 'oc-ubg';

export function readCustomerBg(): string {
  try {
    return window.localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function writeCustomerBg(v: string) {
  try {
    if (v) window.localStorage.setItem(KEY, v);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the colour lasts for this visit only */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: v }));
}

/** The customer's page colour, or '' (the merchant's). Follows the picker live. */
export function useCustomerBg(enabled: boolean): string {
  const [v, setV] = useState('');
  useEffect(() => {
    if (!enabled) {
      setV('');
      return;
    }
    setV(readCustomerBg());
    const on = (e: Event) => setV(String((e as CustomEvent).detail ?? ''));
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, [enabled]);
  return v;
}
