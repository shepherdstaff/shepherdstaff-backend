import { Injectable } from '@nestjs/common';
import { CalendarEvent } from './interfaces/calendar-event.domain';
import { FreeSlot } from './interfaces/free-slot.domain';
import { ScheduleRepository } from './repositories/schedule.repository'

@Injectable()
export class ScheduleService {

  constructor(private scheduleRepository: ScheduleRepository) {}

  public findFreeSlotFromListOfBusyTimeslots(events: CalendarEvent[]): { start: Date; end: Date }[] {
    // Sort events by their start times
    events.sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

    // Merge overlapping or contiguous busy timeslots
    const mergedEvents: CalendarEvent[] = [];

    for (const event of events) {
      if (mergedEvents.length === 0) {
        mergedEvents.push(event);
      } else {
        const lastMergedEvent = mergedEvents[mergedEvents.length - 1];

        if (event.startDateTime <= lastMergedEvent.endDateTime) {
          // Merge overlapping events by extending the end time
          lastMergedEvent.endDateTime = new Date(Math.max(lastMergedEvent.endDateTime.getTime(), event.endDateTime.getTime()));
        } else {
          // No overlap: add the event to the list
          mergedEvents.push(event);
        }
      }
    }

    // TODO: fetch user preferences (how many recommendations they want on each try) to determine how many free slots to present

    // Find free slots between merged busy timeslots
    const freeSlots: FreeSlot[] = [];

    for (let i = 1; i < mergedEvents.length; i++) {
      const prevEvent = mergedEvents[i - 1];
      const currentEvent = mergedEvents[i];

      if (prevEvent.endDateTime < currentEvent.startDateTime) {
        freeSlots.push({
          start: new Date(prevEvent.endDateTime),
          end: new Date(currentEvent.startDateTime),
        });
      }
    }

    return freeSlots;
  }

  public async storeCalendarEvents(calendarEvent: CalendarEvent[], userId: string) {
    await this.scheduleRepository.saveCalendarEvents(calendarEvent, userId);
  }
}