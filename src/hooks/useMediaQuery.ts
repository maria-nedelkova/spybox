import { useEffect, useState } from "react";

/**
 * Tracks a CSS media query from JS, for the cases CSS alone cannot cover —
 * swapping one component for another rather than restyling the same one.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const list = window.matchMedia(query);
    // Re-read on subscribe: the query can have changed between the initial
    // render and the effect running.
    setMatches(list.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
