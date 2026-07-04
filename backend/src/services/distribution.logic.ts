// Pure distribution logic — no database or environment dependencies, so it is
// trivially unit-testable in isolation.

const EPSILON = 1e-9;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface DeficitCandidate {
  brokerId: string;
  percentage: number;
  sentToday: number;
}

/**
 * Given eligible candidates and the distribution-wide total sent today, return
 * the broker with the highest deficit against its target share. Ties are broken
 * by fewer leads sent today.
 *
 *   targetAfterLead = (totalSentToday + 1) * percentage / 100
 *   deficit         = targetAfterLead - sentToday
 */
export function selectBroker(
  candidates: DeficitCandidate[],
  totalSentToday: number,
): string | null {
  let best: { brokerId: string; deficit: number; sentToday: number } | null = null;

  for (const c of candidates) {
    const targetAfterLead = ((totalSentToday + 1) * c.percentage) / 100;
    const deficit = targetAfterLead - c.sentToday;

    const isBetter =
      best === null ||
      deficit > best.deficit + EPSILON ||
      (Math.abs(deficit - best.deficit) < EPSILON && c.sentToday < best.sentToday);

    if (isBetter) {
      best = { brokerId: c.brokerId, deficit, sentToday: c.sentToday };
    }
  }

  return best ? best.brokerId : null;
}
