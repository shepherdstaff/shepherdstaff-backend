export class CalendarEvent {
  isFullDay: boolean;
  startDateTime: Date;
  endDateTime: Date;

  constructor(isFullDay: boolean, startDateTime: Date, endDateTime: Date) {
    this.isFullDay = isFullDay;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
  }
}

export type RecommendedAvailabilities = {
  [menteeId: string]: Date;
};
