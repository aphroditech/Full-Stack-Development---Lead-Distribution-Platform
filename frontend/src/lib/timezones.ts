// World timezones offered in the broker form, ordered from UTC-12 to UTC+14.
// The `value` is a real IANA zone so the backend keeps DST-correct open-hours
// and daily-cap math; the `label` shows a human-friendly city + UTC offset.
// Offsets shown are the zone's standard (non-DST) offset, by convention.
export interface TimezoneOption {
  value: string;
  label: string;
}

export const WORLD_TIMEZONES: TimezoneOption[] = [
  { value: "Etc/GMT+12", label: "(UTC-12:00) International Date Line West" },
  { value: "Pacific/Pago_Pago", label: "(UTC-11:00) Pago Pago" },
  { value: "Pacific/Honolulu", label: "(UTC-10:00) Hawaii" },
  { value: "Pacific/Marquesas", label: "(UTC-09:30) Marquesas Islands" },
  { value: "America/Anchorage", label: "(UTC-09:00) Alaska" },
  { value: "America/Los_Angeles", label: "(UTC-08:00) Los Angeles, Vancouver" },
  { value: "America/Phoenix", label: "(UTC-07:00) Arizona" },
  { value: "America/Denver", label: "(UTC-07:00) Denver, Mountain Time" },
  { value: "America/Chicago", label: "(UTC-06:00) Chicago, Central Time" },
  { value: "America/Mexico_City", label: "(UTC-06:00) Mexico City" },
  { value: "America/New_York", label: "(UTC-05:00) New York, Eastern Time" },
  { value: "America/Bogota", label: "(UTC-05:00) Bogota, Lima" },
  { value: "America/Halifax", label: "(UTC-04:00) Halifax, Atlantic Time" },
  { value: "America/Santiago", label: "(UTC-04:00) Santiago" },
  { value: "America/St_Johns", label: "(UTC-03:30) Newfoundland" },
  { value: "America/Sao_Paulo", label: "(UTC-03:00) São Paulo" },
  { value: "America/Argentina/Buenos_Aires", label: "(UTC-03:00) Buenos Aires" },
  { value: "America/Noronha", label: "(UTC-02:00) Fernando de Noronha" },
  { value: "Atlantic/Azores", label: "(UTC-01:00) Azores" },
  { value: "UTC", label: "(UTC+00:00) UTC" },
  { value: "Europe/London", label: "(UTC+00:00) London, Dublin, Lisbon" },
  { value: "Europe/Paris", label: "(UTC+01:00) Paris, Madrid, Rome" },
  { value: "Europe/Berlin", label: "(UTC+01:00) Berlin, Amsterdam" },
  { value: "Africa/Lagos", label: "(UTC+01:00) Lagos, West Africa" },
  { value: "Europe/Athens", label: "(UTC+02:00) Athens, Helsinki" },
  { value: "Africa/Cairo", label: "(UTC+02:00) Cairo" },
  { value: "Africa/Johannesburg", label: "(UTC+02:00) Johannesburg" },
  { value: "Europe/Moscow", label: "(UTC+03:00) Moscow" },
  { value: "Asia/Riyadh", label: "(UTC+03:00) Riyadh, Kuwait" },
  { value: "Africa/Nairobi", label: "(UTC+03:00) Nairobi, East Africa" },
  { value: "Asia/Tehran", label: "(UTC+03:30) Tehran" },
  { value: "Asia/Dubai", label: "(UTC+04:00) Dubai, Abu Dhabi" },
  { value: "Asia/Baku", label: "(UTC+04:00) Baku" },
  { value: "Asia/Kabul", label: "(UTC+04:30) Kabul" },
  { value: "Asia/Karachi", label: "(UTC+05:00) Karachi, Islamabad" },
  { value: "Asia/Tashkent", label: "(UTC+05:00) Tashkent" },
  { value: "Asia/Kolkata", label: "(UTC+05:30) India (Mumbai, New Delhi)" },
  { value: "Asia/Colombo", label: "(UTC+05:30) Colombo" },
  { value: "Asia/Kathmandu", label: "(UTC+05:45) Kathmandu" },
  { value: "Asia/Dhaka", label: "(UTC+06:00) Dhaka" },
  { value: "Asia/Almaty", label: "(UTC+06:00) Almaty" },
  { value: "Asia/Yangon", label: "(UTC+06:30) Yangon" },
  { value: "Asia/Bangkok", label: "(UTC+07:00) Bangkok, Hanoi" },
  { value: "Asia/Jakarta", label: "(UTC+07:00) Jakarta" },
  { value: "Asia/Ho_Chi_Minh", label: "(UTC+07:00) Ho Chi Minh City" },
  { value: "Asia/Manila", label: "(UTC+08:00) Manila" },
  { value: "Asia/Singapore", label: "(UTC+08:00) Singapore, Kuala Lumpur" },
  { value: "Asia/Hong_Kong", label: "(UTC+08:00) Hong Kong" },
  { value: "Asia/Shanghai", label: "(UTC+08:00) Beijing, Shanghai" },
  { value: "Asia/Taipei", label: "(UTC+08:00) Taipei" },
  { value: "Australia/Perth", label: "(UTC+08:00) Perth" },
  { value: "Australia/Eucla", label: "(UTC+08:45) Eucla" },
  { value: "Asia/Tokyo", label: "(UTC+09:00) Tokyo, Osaka" },
  { value: "Asia/Seoul", label: "(UTC+09:00) Seoul" },
  { value: "Australia/Darwin", label: "(UTC+09:30) Darwin" },
  { value: "Australia/Adelaide", label: "(UTC+09:30) Adelaide" },
  { value: "Australia/Brisbane", label: "(UTC+10:00) Brisbane" },
  { value: "Australia/Sydney", label: "(UTC+10:00) Sydney, Melbourne" },
  { value: "Pacific/Guam", label: "(UTC+10:00) Guam" },
  { value: "Australia/Lord_Howe", label: "(UTC+10:30) Lord Howe Island" },
  { value: "Pacific/Guadalcanal", label: "(UTC+11:00) Solomon Islands" },
  { value: "Pacific/Noumea", label: "(UTC+11:00) Noumea" },
  { value: "Pacific/Auckland", label: "(UTC+12:00) Auckland, Wellington" },
  { value: "Pacific/Fiji", label: "(UTC+12:00) Fiji" },
  { value: "Pacific/Chatham", label: "(UTC+12:45) Chatham Islands" },
  { value: "Pacific/Tongatapu", label: "(UTC+13:00) Nuku'alofa" },
  { value: "Pacific/Apia", label: "(UTC+13:00) Samoa" },
  { value: "Pacific/Kiritimati", label: "(UTC+14:00) Kiritimati" },
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
