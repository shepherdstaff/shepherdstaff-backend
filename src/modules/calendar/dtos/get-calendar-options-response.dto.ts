interface CalendarOption {
  id: string;
  name: string;
  source: string;
  isOmitted: boolean;
}

export class GetCalendarOptionsResponseDto {
  calendars: CalendarOption[];
}
