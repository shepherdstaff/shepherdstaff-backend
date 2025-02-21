import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { CalendarSyncService } from './calendar-sync.service';
import { FreeSlot } from './interfaces/free-slot.domain';
import { ScheduleSlot } from './interfaces/schedule-slot.interface';
import { ScheduleRepository } from './repositories/schedule.repository';

@Injectable()
export class ScheduleService {
  constructor(
    private scheduleRepository: ScheduleRepository,
    private calendarSyncService: CalendarSyncService,
  ) {}

  private findFreeSlotFromListOfBusyScheduleSlots(
    events: ScheduleSlot[],
  ): FreeSlot[] {
    // Sort events by their start times
    events.sort(
      (a, b) =>
        a.startDateTime.toJSDate().getTime() -
        b.startDateTime.toJSDate().getTime(),
    );

    // Merge overlapping or contiguous busy timeslots
    const mergedEvents: ScheduleSlot[] = [];

    for (const event of events) {
      if (mergedEvents.length === 0) {
        mergedEvents.push(event);
      } else {
        const lastMergedEvent = mergedEvents[mergedEvents.length - 1];

        if (event.startDateTime <= lastMergedEvent.endDateTime) {
          // Merge overlapping events by extending the end time
          lastMergedEvent.endDateTime = DateTime.fromJSDate(
            new Date(
              Math.max(
                lastMergedEvent.endDateTime.toJSDate().getTime(),
                event.endDateTime.toJSDate().getTime(),
              ),
            ),
          );
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
          startDateTime: prevEvent.endDateTime,
          endDateTime: currentEvent.startDateTime,
        });
      }
    }

    return freeSlots;
  }

  async syncLatestCalendarEvents(userId: string) {
    await this.calendarSyncService.retrieveLatestCalendarEvents(
      userId,
      DateTime.now(),
    );
  }

  async findFreeSlotsInSchedule(
    fromUserId: string,
    toUserId: string,
    numberOfSlotsToFind: number,
    reservedFreeSlots: FreeSlot[],
  ): Promise<FreeSlot[]> {
    // Retrieve user's calendar events
    const fromUserCalendarEvents =
      await this.scheduleRepository.getSavedCalendarEventsForUser(
        fromUserId,
        DateTime.now().plus({ months: 1 }),
      );

    const toUserCalendarEvents =
      await this.scheduleRepository.getSavedCalendarEventsForUser(
        toUserId,
        DateTime.now().plus({ months: 1 }),
      );

    // Merge the two users' calendar events + reserved free slots of the fromUser
    const mergedCalendarEvents: ScheduleSlot[] = [
      ...fromUserCalendarEvents,
      ...toUserCalendarEvents,
      ...reservedFreeSlots,
    ];
    // Find free slots between busy timeslots
    const freeSlots =
      this.findFreeSlotFromListOfBusyScheduleSlots(mergedCalendarEvents);

    // Return the first n free slots
    return freeSlots.slice(0, numberOfSlotsToFind);
  }
}
