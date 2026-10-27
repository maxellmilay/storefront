const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatCents(cents: number): string {
  return formatter.format(cents / 100);
}

/** A percentage of an amount, rounded to the nearest cent. */
export function percentOf(cents: number, percent: number): number {
  return Math.round((cents * percent) / 100);
}
