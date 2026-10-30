/* Preview prices: Saudi riyals and Western digits.
   Salla's demo store formats the visitor's currency (often USD) with Arabic-Indic digits.
   Live stores keep their own currency and numbering; only the preview path uses formatSar. */

const DIGIT = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
};

export function toWesternDigits(s) {
  return String(s == null ? '' : s).replace(/[٠-٩۰-۹]/g, d => DIGIT[d] || d);
}

export function parseAmount(x) {
  if (x && typeof x === 'object') x = x.amount ?? x.value;
  const n = parseFloat(toWesternDigits(x).replace(/[^\d.]/g, ''));
  return isNaN(n) ? null : n;
}

/* whole riyals, Western digits — never the demo store's $ / ٣٤٩ mix */
export function formatSar(n, ar) {
  const v = Math.round(Number(n) || 0).toLocaleString('en-US');
  return `${v} ${ar ? 'ر.س' : 'SAR'}`;
}

export function looksForeignMoney(text) {
  return /\$|USD|US\$|EUR|GBP|[٠-٩۰-۹]/.test(String(text || ''));
}

export function isSarText(text) {
  const t = String(text || '');
  return /ر\.س|\bSAR\b/.test(t) && !looksForeignMoney(t);
}
