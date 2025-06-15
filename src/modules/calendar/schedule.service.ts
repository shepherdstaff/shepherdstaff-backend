import { Injectable, Logger } from '@nestjs/common';
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

        const eventsAreOverlapping = this.areEventsOverlapping(
          lastMergedEvent,
          event,
        );

        if (
          eventsAreOverlapping &&
          !this.doesEarlierStartingEventFullyOverlapLaterStartingEvent(
            lastMergedEvent,
            event,
          )
        ) {
          // Merge overlapping events by extending the end time
          lastMergedEvent.endDateTime = DateTime.fromJSDate(
            new Date(
              Math.max(
                lastMergedEvent.endDateTime.toJSDate().getTime(),
                event.endDateTime.toJSDate().getTime(),
              ),
            ),
          );
        } else if (!eventsAreOverlapping) {
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
        // Ensure each free slot is set amount of time
        // TODO: fetch user preferences (how long free slots should be) to determine how long each free slot should be
        // For now, we assume 60 minutes free slots

        const freeSlotDuration = 60; // in minutes
        for (
          let newFreeSlotStart = prevEvent.endDateTime;
          newFreeSlotStart < currentEvent.startDateTime;
          newFreeSlotStart = newFreeSlotStart.plus({
            minutes: freeSlotDuration,
          })
        ) {
          const newFreeSlotEnd = newFreeSlotStart.plus({
            minutes: freeSlotDuration,
          });
          if (newFreeSlotEnd <= currentEvent.startDateTime) {
            freeSlots.push({
              startDateTime: newFreeSlotStart,
              endDateTime: newFreeSlotEnd,
            });
          }
        }
      }
    }

    if (freeSlots.length === 0) {
      Logger.error(
        'No free slots found between busy timeslots - you may be fully booked!',
      );
      throw new Error('No free slots found between busy timeslots');
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

  private areEventsOverlapping(
    prevEvent: ScheduleSlot,
    currentEvent: ScheduleSlot,
  ): boolean {
    return (
      prevEvent.endDateTime > currentEvent.startDateTime &&
      prevEvent.startDateTime < currentEvent.endDateTime
    );
  }

  private doesEarlierStartingEventFullyOverlapLaterStartingEvent(
    earlierStartingEvent: ScheduleSlot,
    laterStartingEvent: ScheduleSlot,
  ): boolean {
    return earlierStartingEvent.endDateTime >= laterStartingEvent.endDateTime;
  }
}
