export interface BusinessBreak {
  id: number;
  breakDate: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface SaveBusinessBreakInput {
  breakDate: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}
export interface ClosedDate {
  id: number;
  closedDate: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface SaveClosedDateInput {
  closedDate: string;
  reason: string | null;
}
export interface BusinessBreakResponseData {
  businessBreak: BusinessBreak;
}
export interface BusinessBreaksResponseData {
  businessBreaks: BusinessBreak[];
}
export interface ClosedDateResponseData {
  closedDate: ClosedDate;
}
export interface ClosedDatesResponseData {
  closedDates: ClosedDate[];
}
