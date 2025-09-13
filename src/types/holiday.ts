// src/types/holiday.ts
export interface HolidayDTO {
  holidayId?: number;          // optional for create
  holidayDate: string;         // format: yyyy-MM-dd (ISO date)
  name: string;
  holidayType: "MANDATORY" | "OPTIONAL";
  description?: string | null;
}
