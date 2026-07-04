// Common IANA timezones offered in the broker form. The backend accepts any
// valid IANA zone, so this is a convenience list, not a restriction.
export const COMMON_TIMEZONES = [
  "UTC",
  "Asia/Manila",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
];

export const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

export function formatWorkingDays(days: number[]): string {
  const map = new Map(WEEKDAYS.map((d) => [d.value, d.label]));
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => map.get(d) ?? d)
    .join(", ");
}
