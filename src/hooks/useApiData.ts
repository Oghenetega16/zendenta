import { useEffect, useState } from "react";

/**
 * Fetches data on mount (and whenever `reload()` is called) using the
 * ignore-flag pattern React recommends for effects that fetch data,
 * so a stale response from a superseded request can never overwrite
 * newer state. See: https://react.dev/learn/you-might-not-need-an-effect
 */
export function useApiData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetcher()
      .then((result) => {
        if (!ignore) {
          setData(result);
          setError(null);
        }
      })
      .catch(() => {
        if (!ignore) setError("Couldn't reach the server. Please try again.");
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  function reload() {
    setData(null);
    setError(null);
    setVersion((v) => v + 1);
  }

  return { data, error, reload };
}
