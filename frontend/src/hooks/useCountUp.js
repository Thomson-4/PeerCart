import { useState, useLayoutEffect, useRef } from 'react';

/**
 * Animates from `start` to `end` over `duration` ms (ease-out cubic).
 * Updates happen inside requestAnimationFrame callbacks (not sync in the effect body).
 */
export default function useCountUp(end, options = {}) {
  const { duration = 1600, start = 0, enabled = true } = options;
  const [value, setValue] = useState(() => (enabled ? start : end));
  const raf = useRef(0);

  useLayoutEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const t0 = performance.now();
    const span = end - start;

    const tick = (now) => {
      if (cancelled) return;
      const elapsed = now - t0;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - p) ** 3;
      setValue(start + span * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
    };
  }, [end, duration, start, enabled]);

  if (!enabled) return end;
  return value;
}
