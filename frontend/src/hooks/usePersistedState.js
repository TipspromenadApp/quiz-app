import { useEffect, useRef, useState } from "react";
import { loadJSON, saveJSON } from "../utils/storage";

export function usePersistedState(key, initialValue) {
  const didHydrate = useRef(false);
  const [value, setValue] = useState(() => {
    const saved = loadJSON(key);
    return saved ?? initialValue;
  });

  useEffect(() => {
    
    if (!didHydrate.current) {
      didHydrate.current = true;
      return;
    }
    saveJSON(key, value);
  }, [key, value]);

  return [value, setValue];
}
