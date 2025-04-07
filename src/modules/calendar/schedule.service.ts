import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { CalendarSyncService } from './calendar-sync.service';
import { FreeSlot } from './interfaces/free-slot.domain';
import { ScheduleSlot } from './interfaces/schedule-slot.interface';
import { ScheduleRepository } from './repositories/schedule.repository';
import { PreferenceService } from '../preferences/preference.service';
import { PreferenceFieldName } from '../preferences/constants/preference-field-names.enum';

@Injectable()
export class ScheduleService {
  constructor(
    private scheduleRepository: ScheduleRepository,
    private calendarSyncService: CalendarSyncService,
    private preferenceService: PreferenceService,
  ) {}

  private findFreeSlotFromListOfBusyScheduleSlots(
    events: ScheduleSlot[],
    freeSlotDuration: number,
    numberOfSlotsToFind: number,
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

    // Find free slots between merged busy timeslots
    const freeSlots: FreeSlot[] = [];
    let freeSlotCount = 0;
    for (let i = 1; i < mergedEvents.length; i++) {
      const prevEvent = mergedEvents[i - 1];
      const currentEvent = mergedEvents[i];

      const areEventsNonOverlapping =
        prevEvent.endDateTime < currentEvent.startDateTime;
      const isFreeSlotLongEnough =
        currentEvent.startDateTime.diff(prevEvent.endDateTime).as('minutes') >=
        freeSlotDuration;

      if (areEventsNonOverlapping && isFreeSlotLongEnough) {
        freeSlots.push({
          startDateTime: prevEvent.endDateTime,
          endDateTime: currentEvent.startDateTime,
        });
        freeSlotCount++;
      }

      if (freeSlotCount >= numberOfSlotsToFind) {
        break;
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

    const preferredFreeSlotDuration =
      (await this.preferenceService.getSpecificMenteePreferenceField(
        fromUserId,
        toUserId,
        PreferenceFieldName.SCHEDULE_SLOT_LENGTH,
      )) as number;

    // Find free slots between busy timeslots
    const freeSlots = this.findFreeSlotFromListOfBusyScheduleSlots(
      mergedCalendarEvents,
      preferredFreeSlotDuration,
      numberOfSlotsToFind,
    );

    return freeSlots;
  }
}
