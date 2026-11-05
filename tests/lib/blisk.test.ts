import { describe, expect, it } from 'vitest';
import {
  detectVertical,
  isDark,
  itemField,
  localText,
  resolveDesign,
  resolveVertical,
  settingValue,
} from '../../app/lib/blisk';

describe('helpers', () => {
  it('reads dropdowns, local text and collection fields', () => {
    expect(settingValue([{ value: 'navy' }])).toBe('navy');
    expect(localText({ ar: 'مرحبا', en: 'Hi' }, 'en')).toBe('Hi');
    expect(localText({ ar: 'مرحبا' }, 'en')).toBe('مرحبا');
    expect(localText('نص', 'ar')).toBe('نص');
    expect(itemField({ 'items.title': 'A' }, 'items', 'title')).toBe('A');
    expect(itemField({ title: 'B' }, 'items', 'title')).toBe('B');
  });
});

describe('vertical', () => {
  it('detects a specific vertical before the general one', () => {
    expect(detectVertical('متجر عطور فاخرة')).toBe('perfume');
    expect(detectVertical('سيروم وكريم مرطب للبشرة')).toBe('skincare');
    expect(detectVertical('متجر تجميل')).toBe('beauty');
  });

  it("uses the merchant's pick before detection", () => {
    expect(resolveVertical({ oc_vertical: 'nails' }, 'عطور')).toBe('nails');
    expect(resolveVertical({ oc_vertical: 'auto' }, 'عطور')).toBe('perfume');
  });
});

describe('resolveDesign', () => {
  it('defaults to the graphite background and the vertical accent', () => {
    const d = resolveDesign({ oc_vertical: 'makeup' }, '');
    expect(d.background).toBe('graphite');
    expect(d.light).toBe(false);
    expect(d.css).toContain('--oc-bg:#0b0b0d');
    expect(d.css).toContain('--oc-acc:#d99aa0');
  });

  it('switches to dark text on a light background', () => {
    const d = resolveDesign({ oc_bg: 'ivory' }, '');
    expect(d.light).toBe(true);
    expect(d.css).toContain('--oc-txt:#1d1a16');
    expect(d.css).toContain('color-scheme:light');
  });

  it('applies the merchant colour squares only when switched on', () => {
    const off = resolveDesign({ oc_skin_color: '#ffffff', oc_ink_color: '#ff0000' }, '');
    expect(off.css).not.toContain('#ff0000');
    const on = resolveDesign(
      { oc_skin_on: true, oc_skin_color: '#ffffff', oc_ink_on: true, oc_ink_color: '#ff0000' },
      ''
    );
    expect(on.light).toBe(true);
    expect(on.css).toContain('--oc-bg:#ffffff');
    expect(on.css).toContain('--oc-acc:#ff0000');
  });

  it('can follow the store colour or turn the cinematic layer off', () => {
    expect(resolveDesign({ oc_accent: 'store' }, '').css).toContain('--oc-acc:var(--color-primary)');
    expect(resolveDesign({ oc_cinema: false }, '').cinema).toBe(false);
  });

  it('knows dark from light', () => {
    expect(isDark('#0b0b0d')).toBe(true);
    expect(isDark('#fbf8f1')).toBe(false);
  });
});
