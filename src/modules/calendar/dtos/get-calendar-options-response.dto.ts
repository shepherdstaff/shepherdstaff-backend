interface CalendarOption {
  id: string;
  name: string;
  source: string;
}

export class GetCalendarOptionsResponseDto {
  calendars: CalendarOption[];
}
