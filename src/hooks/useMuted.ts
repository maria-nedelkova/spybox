import { useCallback, useState } from "react";

const STORAGE_KEY = "spybox:muted";

function readMuted(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function useMuted() {
  const [muted, setMuted] = useState(readMuted);

  const toggle = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { muted, toggle };
}
