// src/constants/userSettingsOptions.ts
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

export const WORK_WEEK_STARTS: Option<number>[] = [
  { value: null, label: "-- Select start day --" },
  { value: 1, label: "1 – Monday" },
  { value: 2, label: "2 – Tuesday" },
  { value: 3, label: "3 – Wednesday" },
  { value: 4, label: "4 – Thursday" },
  { value: 5, label: "5 – Friday" },
  { value: 6, label: "6 – Saturday" },
  { value: 7, label: "7 – Sunday" },
];

export const LANGUAGES: Option<string>[] = [
  { value: null, label: "-- Select language --" },
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "Spanish", label: "Spanish" },
  // add more as needed
];

export const DATE_FORMATS: Option<string>[] = [
  { value: null, label: "-- Select date format --" },
  { value: "yyyy-MM-dd", label: "yyyy-MM-dd (2025-09-06)" },
  { value: "dd-MM-yyyy", label: "dd-MM-yyyy (06-09-2025)" },
  { value: "MM/dd/yyyy", label: "MM/dd/yyyy (09/06/2025)" },
];
