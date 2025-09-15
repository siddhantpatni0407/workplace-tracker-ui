// src/constants/userSettingsOptions.ts
import { 
  WeekStartDay, 
  WeekStartDayLabels, 
  Language, 
  LanguageLabels, 
  DateFormat, 
  DateFormatLabels 
} from '../enums';

export type Option<T = string> = {
  value: T | null; // null used for "empty" option
  label: string;
};

export const TIMEZONES: Option<string>[] = [
  { value: null, label: "-- Select timezone --" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  // add more as needed
];

export const WORK_WEEK_STARTS: Option<WeekStartDay>[] = [
  { value: null, label: "-- Select start day --" },
  { value: WeekStartDay.MONDAY, label: `${WeekStartDay.MONDAY} – ${WeekStartDayLabels[WeekStartDay.MONDAY]}` },
  { value: WeekStartDay.TUESDAY, label: `${WeekStartDay.TUESDAY} – ${WeekStartDayLabels[WeekStartDay.TUESDAY]}` },
  { value: WeekStartDay.WEDNESDAY, label: `${WeekStartDay.WEDNESDAY} – ${WeekStartDayLabels[WeekStartDay.WEDNESDAY]}` },
  { value: WeekStartDay.THURSDAY, label: `${WeekStartDay.THURSDAY} – ${WeekStartDayLabels[WeekStartDay.THURSDAY]}` },
  { value: WeekStartDay.FRIDAY, label: `${WeekStartDay.FRIDAY} – ${WeekStartDayLabels[WeekStartDay.FRIDAY]}` },
  { value: WeekStartDay.SATURDAY, label: `${WeekStartDay.SATURDAY} – ${WeekStartDayLabels[WeekStartDay.SATURDAY]}` },
  { value: WeekStartDay.SUNDAY, label: `${WeekStartDay.SUNDAY} – ${WeekStartDayLabels[WeekStartDay.SUNDAY]}` },
];

export const LANGUAGES: Option<Language>[] = [
  { value: null, label: "-- Select language --" },
  { value: Language.ENGLISH, label: LanguageLabels[Language.ENGLISH] },
  { value: Language.HINDI, label: LanguageLabels[Language.HINDI] },
  { value: Language.SPANISH, label: LanguageLabels[Language.SPANISH] },
  // add more as needed
];

export const DATE_FORMATS: Option<DateFormat>[] = [
  { value: null, label: "-- Select date format --" },
  { value: DateFormat.ISO, label: DateFormatLabels[DateFormat.ISO] },
  { value: DateFormat.EU, label: DateFormatLabels[DateFormat.EU] },
  { value: DateFormat.US, label: DateFormatLabels[DateFormat.US] },
  { value: DateFormat.LONG, label: DateFormatLabels[DateFormat.LONG] },
];
