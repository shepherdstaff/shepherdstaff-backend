export class CalendarEvent {
  isFullDay: boolean;
  startDateTime: Date;
  endDateTime: Date;
  isAppointment: boolean;

  constructor(
    isFullDay: boolean,
    startDateTime: Date,
    endDateTime: Date,
    isAppointment = false,
  ) {
    this.isFullDay = isFullDay;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
    this.isAppointment = isAppointment;
  }
}

export type RecommendedAvailabilities = {
  [menteeId: string]: Date;
};
