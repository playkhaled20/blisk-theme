import { useEffect, useRef } from 'react';
import { SallaMetadata } from '@salla.sa/twilight-components-react/metadata';

interface ProductMetadataProps {
  /** Extra classes on the wrapper (used for the responsive show/hide). */
  className?: string;
}

/**
 * `<SallaMetadata>` (product specs) rendered as collapsible accordion groups.
 *
 * The web component emits static `.s-metadata-box` blocks — this wires
 * click-to-toggle on their `.s-metadata-box-header`s (flips the header's
 * `aria-expanded`; the open/closed styling in `04-components/metadata.scss`
 * reads it with `:has()`) and
 * opens the first group once it appears. A MutationObserver handles the async
 * spec fetch; the click handler is delegated so it survives re-renders.
 *
 * Rendered under the gallery slider on `md`+ ({@link ProductGallery}) and at the
 * end of the description on mobile ({@link ProductDetails}); the `className`
 * carries the `hidden md:block` / `md:hidden` toggle.
 *
 * The headers are plain `<div>`s, so each one also gets `role="button"`,
 * `tabindex="0"` and `aria-expanded`, and Enter / Space toggle it — otherwise
 * keyboard and screen-reader users can only read the first group.
 */
export function ProductMetadata({ className }: ProductMetadataProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // The open state lives on each header's `aria-expanded`, which screen
    // readers need anyway; the styles read it with `:has()`, so no class is
    // toggled on the web component's markup.
    const isOpen = (header: Element) => header.getAttribute('aria-expanded') === 'true';

    // Runs on every change under the root: the specs arrive after an async fetch,
    // and the component can re-render its boxes.
    let opened = false;
    const setUp = () => {
      root.querySelectorAll('.s-metadata-box-header').forEach((header, index) => {
        if (!header.hasAttribute('role')) {
          header.setAttribute('role', 'button');
          header.setAttribute('tabindex', '0');
        }
        if (!header.hasAttribute('aria-expanded')) {
          // The first group starts open, once.
          const open = !opened && index === 0;
          if (open) opened = true;
          header.setAttribute('aria-expanded', String(open));
        }
      });
    };

    const observer = new MutationObserver(setUp);
    observer.observe(root, { childList: true, subtree: true });
    setUp();

    const headerOf = (event: Event) => {
      const header = (event.target as HTMLElement).closest('.s-metadata-box-header');
      return header && root.contains(header) ? header : null;
    };
    const toggle = (header: Element) => header.setAttribute('aria-expanded', String(!isOpen(header)));

    const onClick = (event: MouseEvent) => {
      const header = headerOf(event);
      if (header) toggle(header);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const header = headerOf(event);
      if (!header) return;
      // Space would otherwise scroll the page.
      event.preventDefault();
      toggle(header);
    };
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKeyDown);

    return () => {
      observer.disconnect();
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={`product-metadata${className ? ` ${className}` : ''}`}>
      <SallaMetadata />
    </div>
  );
}
