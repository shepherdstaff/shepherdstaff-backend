import { ScheduleSlot } from './schedule-slot.interface';

export class CalendarEvent extends ScheduleSlot {
  name: string;
  id: string;
  sourceId: string;
  hasTimings: boolean;
}
