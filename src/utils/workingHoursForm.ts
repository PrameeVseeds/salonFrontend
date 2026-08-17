import type { Weekday, WorkingHoursDraft } from "../types/workingHours";

export const weekdays: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const createDefaultWorkingHours = (): WorkingHoursDraft[] =>
  weekdays.map((dayOfWeek) => ({
    dayOfWeek,
    openingTime: "09:00",
    closingTime: "18:00",
    isClosed: dayOfWeek === "Sunday",
  }));

export const getWorkingHoursErrors = (row: WorkingHoursDraft) => ({
  opening: !row.openingTime ? "Opening time is required." : undefined,
  closing: !row.closingTime
    ? "Closing time is required."
    : row.openingTime && row.closingTime <= row.openingTime
      ? "Closing time must be later than opening time."
      : undefined,
});

export const workingHoursTouchKey = (
  day: Weekday,
  field: "opening" | "closing",
) => `${day}-${field}`;
