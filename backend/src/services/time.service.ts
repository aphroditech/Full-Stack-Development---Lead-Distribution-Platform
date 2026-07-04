import { DateTime } from "luxon";

/** Parse "1,2,3,4,5" into ISO weekday numbers (Mon=1 .. Sun=7). */
export function parseWorkingDays(csv: string): number[] {
  return csv
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
}

/** Convert "HH:mm" to minutes-since-midnight, or null if malformed. */
export function timeToMinutes(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export interface BrokerSchedule {
  timezone: string;
  openingTime: string;
  closingTime: string;
  workingDays: string;
}

/**
 * Is the broker currently open, evaluated in the broker's own timezone?
 * Checks working day + [openingTime, closingTime). Supports overnight windows
 * (e.g. 22:00–06:00). A zero-length window is treated as closed.
 */
export function isBrokerOpen(schedule: BrokerSchedule, now: DateTime = DateTime.now()): boolean {
  const local = now.setZone(schedule.timezone);
  if (!local.isValid) return false;

  const days = parseWorkingDays(schedule.workingDays);
  if (!days.includes(local.weekday)) return false;

  const open = timeToMinutes(schedule.openingTime);
  const close = timeToMinutes(schedule.closingTime);
  if (open === null || close === null || open === close) return false;

  const cur = local.hour * 60 + local.minute;
  if (close > open) return cur >= open && cur < close;
  // Overnight window
  return cur >= open || cur < close;
}

/** UTC [start, end] instants for "today" in the given timezone. */
export function dayRangeInZone(
  timezone: string,
  now: DateTime = DateTime.now(),
): { start: Date; end: Date } {
  const local = now.setZone(timezone);
  return {
    start: local.startOf("day").toUTC().toJSDate(),
    end: local.endOf("day").toUTC().toJSDate(),
  };
}
