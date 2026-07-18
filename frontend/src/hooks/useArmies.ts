import { useState, useEffect, useCallback } from "react";
import type { Army } from "@/types";
import * as api from "@/lib/api";

export function useArmies() {
  const [armies, setArmies] = useState<Army[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getArmies();
      setArmies(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { armies, setArmies, loading, error, reload };
}
