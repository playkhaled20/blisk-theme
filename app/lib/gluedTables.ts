/**
 * Size charts that the store saved as one glued line, e.g.
 * «المقاس36الطول130الكم28.53813028.5401302942130294413029.5» (a table whose
 * cells lost every separator). The first «label value» pairs give the columns
 * and how many digits each value has; the rest is split into rows of the same
 * widths and shown as a real table. If the rest does not split exactly,
 * nothing is dropped: only a space goes between letters and digits.
 *
 * Works on the description HTML as a string (server and browser alike) and
 * only touches text between tags.
 */

const AR = 'ء-ي';
const DG = '0-9٠-٩';

const LINE = new RegExp(
  `^((?:[${AR}][${AR} ]*?\\s*[${DG}]{1,3}(?:[.٫][${DG}])?\\s*){2,6})([${DG}.٫ ]{5,})$`
);
const PAIR = new RegExp(`([${AR}][${AR} ]*?)\\s*([${DG}]{1,3})([.٫][${DG}])?`, 'g');
const LETTER_DIGIT = new RegExp(`([${AR}])(?=[${DG}])`, 'g');
const DIGIT_LETTER = new RegExp(`([${DG}])(?=[${AR}])`, 'g');

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The table for one glued line, or null when the line is not one. */
export function gluedTable(text: string): string | null {
  const m = text.trim().match(LINE);
  if (!m) return null;
  const pairs = [...m[1].matchAll(PAIR)];
  if (pairs.length < 2) return null;

  const cell = pairs.map((p) => `([${DG}]{${p[2].length}}(?:[.٫][${DG}])?)`).join('');
  const row = new RegExp('^' + cell);
  const rows: string[][] = [pairs.map((p) => p[2] + (p[3] ?? ''))];
  let rest = m[2].replace(/\s+/g, '');
  while (rest.length) {
    const r = rest.match(row);
    if (!r) return null;
    rows.push(r.slice(1));
    rest = rest.slice(r[0].length);
  }
  if (rows.length < 2) return null;

  const head = pairs.map((p) => `<th>${escapeHtml(p[1].trim())}</th>`).join('');
  const body = rows.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('');
  return `<div class="glued-table"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/** Spaces between Arabic letters and digits, so «الطول130» reads «الطول 130». */
export function spaceLettersAndDigits(text: string): string {
  return text.replace(LETTER_DIGIT, '$1 ').replace(DIGIT_LETTER, '$1 ');
}

/** Rebuild glued size charts in a description's HTML. */
export function fixGluedTables(html: string): string {
  if (!html || !/[0-9٠-٩]/.test(html)) return html;
  let skip = false;
  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith('<')) {
        if (/^<(script|style)\b/i.test(part)) skip = true;
        else if (/^<\/(script|style)\b/i.test(part)) skip = false;
        return part;
      }
      if (skip || !/[0-9٠-٩]/.test(part)) return part;
      return gluedTable(part) ?? spaceLettersAndDigits(part);
    })
    .join('');
}
