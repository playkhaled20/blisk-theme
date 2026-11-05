import { useEffect, useState } from 'react';
import { afterNextPaint } from '../lib/afterNextPaint';

/**
 * `BottomSheet`'s enter transition is 300ms (`04-components/bottom-sheet.scss`),
 * plus its own ~2-frame delay before that starts. Starting the row stagger
 * partway through had the two motions overlapping and the stagger was easy to
 * miss, so wait for the sheet to settle, then a clear pause, and the two
 * reveals read as separate beats.
 */
export const ROWS_IN_DELAY_MS = 350;

/**
 * Whether a sheet's rows should play their staggered entrance (`.is-in`).
 * `false` while closed, so it replays from the top on every open.
 *
 * For a sheet whose rows come from a web component (`<salla-menu>`,
 * `<salla-user-menu>`): two things can still be missing when `open` flips
 * true. `BottomSheet` defers its own mount to an effect, so the container may
 * not exist yet, and the component renders its rows asynchronously on top of
 * that (registering the custom element, fetching data). A fixed delay can't
 * cover either reliably, so the caller hands over the container element through
 * a callback ref (`ref={setContainer}`), and this watches that element until a
 * `rowSelector` match shows up inside it, then releases the stagger.
 */
export function useStaggeredRows(
  open: boolean,
  container: HTMLElement | null,
  rowSelector: string
): boolean {
  const [rowsIn, setRowsIn] = useState(false);

  useEffect(() => {
    if (!open) {
      setRowsIn(false);
      return;
    }
    if (!container) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelPaint: (() => void) | undefined;
    let observer: MutationObserver | undefined;

    const release = () => {
      timer = setTimeout(() => {
        // Force a reflow so the web component's closed state is painted before
        // `.is-in` flips it; otherwise a just-inserted row never transitions.
        void container.offsetWidth;
        cancelPaint = afterNextPaint(() => setRowsIn(true));
      }, ROWS_IN_DELAY_MS);
    };

    if (container.querySelector(rowSelector)) {
      release();
    } else {
      observer = new MutationObserver(() => {
        if (container.querySelector(rowSelector)) {
          observer?.disconnect();
          release();
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      clearTimeout(timer);
      cancelPaint?.();
    };
  }, [open, container, rowSelector]);

  return rowsIn;
}
