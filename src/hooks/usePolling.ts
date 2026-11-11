import { useState, useEffect, useRef, useCallback } from 'react';

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number,
  active: boolean
): { data: T | null; error: string | null; isLoading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    if (active) {
      const interval = setInterval(fetchData, intervalMs);
      return () => {
        mountedRef.current = false;
        clearInterval(interval);
      };
    }

    return () => { mountedRef.current = false; };
  }, [fetchData, intervalMs, active]);

  return { data, error, isLoading };
}
