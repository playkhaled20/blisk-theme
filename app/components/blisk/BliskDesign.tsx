import { useMemo } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks/useDocumentClass';
import { resolveDesign, settingOn } from '../../lib/blisk';

/**
 * Puts the Blisk design on the page: the background palette, the accent and
 * the merchant's colour squares as CSS variables, and the body classes the
 * stylesheet keys on. With «cinematic mode» off the theme keeps Raed's look.
 */
export function BliskDesign() {
  const { theme, store } = useTwilight();
  const settings = theme?.settings as Record<string, unknown> | undefined;
  const storeText = `${store?.name ?? ''} ${store?.description ?? ''}`;
  const design = useMemo(() => resolveDesign(settings, storeText), [settings, storeText]);

  useDocumentClass({
    body: {
      class: design.cinema
        ? [
            'theme-blisk',
            design.light ? 'blisk-light' : 'blisk-dark',
            ...(settingOn(settings?.oc_grain) ? ['blisk-grain'] : []),
          ]
        : [],
      'data-blisk-v': design.vertical,
      'data-blisk-bg': design.background,
    },
  });

  if (!design.cinema) return null;
  return <style id="blisk-vars" dangerouslySetInnerHTML={{ __html: design.css }} />;
}
