"use client";

import * as React from "react";

/**
 * Returns a value that only updates after {@code delayMs} has passed
 * without a fresh change. Used by FilmSearch to throttle API calls.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
