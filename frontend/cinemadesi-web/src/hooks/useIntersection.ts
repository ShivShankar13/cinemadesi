"use client";

import * as React from "react";

/**
 * Calls {@code onIntersect} when the returned ref enters the viewport.
 *
 * <p>Designed for "load more" sentinels at the bottom of infinite feeds —
 * attach the returned ref to a small element below the last row and the
 * callback fires every time that element scrolls into view.</p>
 *
 * <p>Use it in tandem with TanStack's {@code useInfiniteQuery} —
 * <code>onIntersect = () => hasNextPage && !isFetchingNextPage && fetchNextPage()</code>.
 * The hook handles cleanup; the consumer guards re-entry.</p>
 */
export function useIntersection(
  onIntersect: () => void,
  options: IntersectionObserverInit = { rootMargin: "200px" }
) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const cbRef = React.useRef(onIntersect);

  // Keep the latest callback without re-creating the observer.
  React.useEffect(() => {
    cbRef.current = onIntersect;
  }, [onIntersect]);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) cbRef.current();
      }
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
    // We intentionally don't include `options` here — it's a config object
    // the caller is responsible for stabilising. Pass useMemo'd value to change it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
