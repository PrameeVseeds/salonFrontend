export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";
export interface WorkingHours {
  id: number;
  dayOfWeek: Weekday;
  openingTime: string;
  closingTime: string;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface SaveWorkingHoursInput {
  dayOfWeek: Weekday;
  openingTime: string;
  closingTime: string;
  isClosed: boolean;
}
export interface WorkingHoursResponseData {
  workingHours: WorkingHours;
}
export interface WorkingHoursListResponseData {
  workingHours: WorkingHours[];
}
export interface WorkingHoursDraft {
  id?: number;
  dayOfWeek: Weekday;
  openingTime: string;
  closingTime: string;
  isClosed: boolean;
}
