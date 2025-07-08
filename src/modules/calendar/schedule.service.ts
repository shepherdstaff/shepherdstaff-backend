import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { CalendarSyncService } from './calendar-sync.service';
import { FreeSlot } from './interfaces/free-slot.domain';
import { ScheduleSlot } from './interfaces/schedule-slot.interface';
import { ScheduleRepository } from './repositories/schedule.repository';
import { BlockedTime } from './domain/blocked-time.domain';

@Injectable()
export class ScheduleService {
  constructor(
    private scheduleRepository: ScheduleRepository,
    private calendarSyncService: CalendarSyncService,
  ) {}

  private findFreeSlotFromListOfBusyScheduleSlots(
    events: ScheduleSlot[],
    blockedTimes: BlockedTime[] = [],
  ): FreeSlot[] {
    // Form map of blocked times for quick lookup
    const blockedTimesMap = {};
    for (const blockedTime of blockedTimes) {
      if (!blockedTimesMap[blockedTime.day]) {
        blockedTimesMap[blockedTime.day] = [];
      }
      blockedTimesMap[blockedTime.day].push(blockedTime);
    }

    // Corner case: we want to consider free slots that are before the first busy timeslot
    // and after the last busy timeslot, so we add them to the events
    // Assume 1 week lead time for the earliest free slot
    // TODO: fetch user preferences (how far ahead to recommend meetings) to determine latest free slot end
    const earliestFreeSlotStart = DateTime.now().plus({ weeks: 1 });
    const latestFreeSlotEnd = DateTime.now().plus({ months: 1 });
    events.push({
      startDateTime: earliestFreeSlotStart,
      endDateTime: earliestFreeSlotStart,
    });
    events.push({
      startDateTime: latestFreeSlotEnd,
      endDateTime: latestFreeSlotEnd,
    });

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

    // Filter out free slots that fall within blocked times
    const filteredFreeSlots = freeSlots.filter(
      (freeSlot) =>
        !this.doesFreeSlotOverlapWithBlockedTimesOfDay(
          freeSlot,
          blockedTimesMap[freeSlot.startDateTime.weekday] || [],
        ),
    );

    if (filteredFreeSlots.length === 0) {
      Logger.error(
        'No free slots found between busy timeslots - you may be fully booked!',
      );
      throw new InternalServerErrorException(
        'No free slots found between busy timeslots',
      );
    }

    return filteredFreeSlots;
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
    reservedFreeSlots: FreeSlot[], // This should include open (pending) meetings + rejected meetings
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

    // Retrieve blocked times of the mentor and mentee
    const fromUserBlockedTimes =
      await this.calendarSyncService.getBlockedTimes(fromUserId);

    // Merge the two users' calendar events + reserved free slots of the fromUser
    const mergedCalendarEvents: ScheduleSlot[] = [
      ...fromUserCalendarEvents,
      ...toUserCalendarEvents,
      ...reservedFreeSlots,
    ];
    // Find free slots between busy timeslots
    const freeSlots = this.findFreeSlotFromListOfBusyScheduleSlots(
      mergedCalendarEvents,
      fromUserBlockedTimes,
    );

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

  private doesFreeSlotOverlapWithBlockedTimesOfDay(
    freeSlot: FreeSlot,
    blockedTimes: BlockedTime[],
  ): boolean {
    const freeSlotStart = freeSlot.startDateTime;
    const freeSlotEnd = freeSlot.endDateTime;
    const minsFreeSlotStart = this.getMinutesSinceMidnight(freeSlotStart);
    const minsFreeSlotEnd = this.getMinutesSinceMidnight(freeSlotEnd);

    for (const blockedTime of blockedTimes) {
      const blockedTimeStart = blockedTime.startTime;
      const blockedTimeEnd = blockedTime.endTime;

      const minsBlockedTimeStart =
        this.getMinutesSinceMidnight(blockedTimeStart);
      const minsBlockedTimeEnd = this.getMinutesSinceMidnight(blockedTimeEnd);

      if (
        minsFreeSlotEnd > minsBlockedTimeStart &&
        minsFreeSlotStart < minsBlockedTimeEnd
      ) {
        return true;
      }
    }

    return false;
  }

  private getMinutesSinceMidnight(dt: DateTime): number {
    return dt.hour * 60 + dt.minute;
  }

  private doesEarlierStartingEventFullyOverlapLaterStartingEvent(
    earlierStartingEvent: ScheduleSlot,
    laterStartingEvent: ScheduleSlot,
  ): boolean {
    return earlierStartingEvent.endDateTime >= laterStartingEvent.endDateTime;
  }
}
