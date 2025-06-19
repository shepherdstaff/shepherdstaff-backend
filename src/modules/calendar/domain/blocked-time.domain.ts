import { DateTime } from 'luxon';
import { DayOfTheWeek } from '../constants/day-of-the-week.enum';

export class BlockedTime {
  userId: string;
  day: DayOfTheWeek;
  startTime: DateTime; // Start time of the blocked period
  endTime: DateTime; // End time of the blocked period
}
