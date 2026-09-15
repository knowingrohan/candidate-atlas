"use client";
import { useEffect, useState } from "react";
import type { CandidatePage } from "./types";
interface Result {
  key: string;
  data?: CandidatePage;
  error?: string;
}
export function useCandidates(queryString: string) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result>();
  const key = `${queryString}|${attempt}`;
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(new Error("Request timed out.")),
      10000,
    );
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/candidates?${queryString}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load candidates.");
        const data: CandidatePage = await response.json();
        if (active) setResult({ key, data });
      } catch {
        if (active)
          setResult({
            key,
            error:
              "We couldn’t load the candidates. Check your connection and try again.",
          });
      } finally {
        clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [queryString, key]);
  return {
    data: result?.key === key ? result.data : undefined,
    portfolio: result?.data?.portfolio,
    error: result?.key === key ? result.error : undefined,
    loading: result?.key !== key,
    retry: () => setAttempt((a) => a + 1),
  };
}
