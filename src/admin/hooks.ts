import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";

type State<T> = { data: T | null; loading: boolean; error: Error | null };

/**
 * Loads a resource and re-loads it whenever `deps` change. A rejected token
 * signs the user out rather than leaving them on a broken screen.
 */
export function useResource<T>(
  loader: () => Promise<T>,
  deps: unknown[],
): State<T> & { reload: () => void; set: (data: T) => void } {
  const { handleError } = useAuth();
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    loader()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        handleError(error);
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  // Mutations answer with the updated record, so a screen can refresh itself
  // without a second round trip.
  const set = useCallback(
    (data: T) => setState({ data, loading: false, error: null }),
    [],
  );

  return { ...state, reload, set };
}
