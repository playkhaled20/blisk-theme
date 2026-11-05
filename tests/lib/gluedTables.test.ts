import { describe, expect, it } from 'vitest';
import { fixGluedTables, gluedTable, spaceLettersAndDigits } from '../../app/lib/gluedTables';

const GLUED = 'المقاس36الطول130الكم28.53813028.5401302942130294413029.5';

describe('gluedTables', () => {
  it('rebuilds a size chart saved as one glued line', () => {
    const html = gluedTable(GLUED)!;
    expect(html).toContain('<th>المقاس</th><th>الطول</th><th>الكم</th>');
    expect(html).toContain('<tr><td>36</td><td>130</td><td>28.5</td></tr>');
    expect(html).toContain('<tr><td>40</td><td>130</td><td>29</td></tr>');
    expect(html).toContain('<tr><td>44</td><td>130</td><td>29.5</td></tr>');
    expect(html.match(/<tr>/g)).toHaveLength(6);
  });

  it('only adds spaces when the rest does not split into rows', () => {
    expect(gluedTable('المقاس36الطول130الكم28.5381')).toBeNull();
    expect(spaceLettersAndDigits('الطول130سم')).toBe('الطول 130 سم');
  });

  it('touches only text between tags, and leaves plain text alone', () => {
    const html = `<p>${GLUED}</p><p>قماش ناعم</p><img alt="a1" src="x/36.jpg">`;
    const out = fixGluedTables(html);
    expect(out).toContain('<p><div class="glued-table">');
    expect(out).toContain('<p>قماش ناعم</p>');
    expect(out).toContain('<img alt="a1" src="x/36.jpg">');
    expect(fixGluedTables('<p>وصف بدون أرقام</p>')).toBe('<p>وصف بدون أرقام</p>');
  });
});
