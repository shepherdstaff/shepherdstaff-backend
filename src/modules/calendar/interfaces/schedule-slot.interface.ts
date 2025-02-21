import { DateTime } from 'luxon';

export abstract class ScheduleSlot {
  startDateTime: DateTime;
  endDateTime: DateTime;
}
