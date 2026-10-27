interface Window {
  count: number;
  resetAt: number;
}

export interface WindowLimiter {
  /** Counts one attempt for `key`; returns the seconds to wait, or 0 when allowed. */
  hit(key: string): number;
}

/** Fixed-window counter kept in memory, so each API process counts on its own. */
export function createWindowLimiter(max: number, windowMs: number): WindowLimiter {
  const windows = new Map<string, Window>();

  return {
    hit(key) {
      const now = Date.now();
      const window = windows.get(key);
      if (!window || window.resetAt <= now) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return 0;
      }
      window.count += 1;
      return window.count > max ? Math.ceil((window.resetAt - now) / 1000) : 0;
    },
  };
}
