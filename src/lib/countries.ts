export type CountryId = (typeof COUNTRIES)[number]['id'];

export type Country = {
  id: string;
  label: string;
  /** 0 Sunday … 6 Saturday */
  weekStart: number;
};

/** First weekday follows common calendars in each country. */
export const COUNTRIES: Country[] = [
  { id: 'IN', label: 'India', weekStart: 0 },
  { id: 'LK', label: 'Sri Lanka', weekStart: 1 },
  { id: 'BD', label: 'Bangladesh', weekStart: 0 },
  { id: 'NP', label: 'Nepal', weekStart: 0 },
  { id: 'PK', label: 'Pakistan', weekStart: 0 },
  { id: 'AE', label: 'United Arab Emirates', weekStart: 6 },
  { id: 'SA', label: 'Saudi Arabia', weekStart: 6 },
  { id: 'QA', label: 'Qatar', weekStart: 6 },
  { id: 'SG', label: 'Singapore', weekStart: 1 },
  { id: 'MY', label: 'Malaysia', weekStart: 1 },
  { id: 'GB', label: 'United Kingdom', weekStart: 1 },
  { id: 'US', label: 'United States', weekStart: 0 },
  { id: 'CA', label: 'Canada', weekStart: 0 },
  { id: 'AU', label: 'Australia', weekStart: 1 },
  { id: 'ZA', label: 'South Africa', weekStart: 0 },
];

export const DEFAULT_COUNTRY = 'IN';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export function asCountry(value: unknown): CountryId {
  return COUNTRIES.some((c) => c.id === value) ? (value as CountryId) : DEFAULT_COUNTRY;
}

export function countryOf(id: string) {
  return COUNTRIES.find((c) => c.id === id) ?? COUNTRIES[0];
}

export function weekdayShort(day: number) {
  return DAYS[((day % 7) + 7) % 7];
}

export function weekdayLong(day: number) {
  return DAY_NAMES[((day % 7) + 7) % 7];
}

/** Local midnight of the week's first day for `time`. */
export function startOfWeek(time: number, weekStart: number) {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);
  const back = (d.getDay() - weekStart + 7) % 7;
  d.setDate(d.getDate() - back);
  return d.getTime();
}
