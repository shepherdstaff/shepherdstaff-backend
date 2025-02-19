export class CalendarEvent {
  constructor(props: Partial<CalendarEvent>) {
    if (props) Object.assign(this, props);
  }

  name: string;
  id: string;
  sourceId: string;
  startDateTime: Date;
  endDateTime: Date;
  hasTimings: boolean;
}
