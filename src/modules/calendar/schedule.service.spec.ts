import { InternalServerErrorException } from '@nestjs/common';
import { DateTime, Settings } from 'luxon';
import { ScheduleService } from './schedule.service';
import { ScheduleRepository } from './repositories/schedule.repository';
import { CalendarSyncService } from './calendar-sync.service';
import { DayOfTheWeek } from './constants/day-of-the-week.enum';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let scheduleRepository: jest.Mocked<ScheduleRepository>;
  let calendarSyncService: jest.Mocked<CalendarSyncService>;

  const fixedNow = DateTime.fromObject({
    year: 2026,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  const originalSettingsNow = Settings.now;

  beforeEach(() => {
    Settings.now = () => fixedNow.toMillis();

    scheduleRepository = {
      getSavedCalendarEventsForUser: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<ScheduleRepository>;

    calendarSyncService = {
      retrieveLatestCalendarEvents: jest.fn(),
      getBlockedTimes: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<CalendarSyncService>;

    service = new ScheduleService(scheduleRepository, calendarSyncService);
  });

  afterEach(() => {
    Settings.now = originalSettingsNow;
    jest.clearAllMocks();
  });

  describe('syncLatestCalendarEvents', () => {
    it('asks the calendar sync service to refresh events up to the current time', async () => {
      await service.syncLatestCalendarEvents('user-1');

      expect(
        calendarSyncService.retrieveLatestCalendarEvents,
      ).toHaveBeenCalledWith('user-1', expect.any(DateTime));
      const [, limitArg] =
        calendarSyncService.retrieveLatestCalendarEvents.mock.calls[0];
      expect((limitArg as DateTime).toMillis()).toBe(fixedNow.toMillis());
    });
  });

  describe('findFreeSlotsInSchedule', () => {
    const earliestFreeSlotStart = fixedNow.plus({ weeks: 1 });

    it('returns the earliest available 60-minute slot when both users have no conflicting events', async () => {
      scheduleRepository.getSavedCalendarEventsForUser
        .mockResolvedValueOnce([
          {
            startDateTime: fixedNow.plus({ weeks: 1, days: 2, hours: 9 }),
            endDateTime: fixedNow.plus({ weeks: 1, days: 2, hours: 10 }),
          } as any,
        ])
        .mockResolvedValueOnce([]);

      const result = await service.findFreeSlotsInSchedule(
        'mentor-1',
        'mentee-1',
        1,
        [],
      );

      expect(scheduleRepository.getSavedCalendarEventsForUser).toHaveBeenCalledWith(
        'mentor-1',
        expect.any(DateTime),
      );
      expect(scheduleRepository.getSavedCalendarEventsForUser).toHaveBeenCalledWith(
        'mentee-1',
        expect.any(DateTime),
      );
      expect(calendarSyncService.getBlockedTimes).toHaveBeenCalledWith(
        'mentor-1',
      );

      expect(result).toHaveLength(1);
      expect(result[0].startDateTime.toMillis()).toBe(
        earliestFreeSlotStart.toMillis(),
      );
      expect(result[0].endDateTime.toMillis()).toBe(
        earliestFreeSlotStart.plus({ hours: 1 }).toMillis(),
      );
    });

    it('skips over reserved free slots (existing pending/rejected recommendations)', async () => {
      const reservedFreeSlots = [
        {
          startDateTime: earliestFreeSlotStart.plus({ hours: 1 }),
          endDateTime: earliestFreeSlotStart.plus({ hours: 2 }),
        },
      ];

      const result = await service.findFreeSlotsInSchedule(
        'mentor-1',
        'mentee-1',
        2,
        reservedFreeSlots,
      );

      expect(result).toHaveLength(2);
      expect(result[0].startDateTime.toMillis()).toBe(
        earliestFreeSlotStart.toMillis(),
      );
      expect(result[1].startDateTime.toMillis()).toBe(
        earliestFreeSlotStart.plus({ hours: 2 }).toMillis(),
      );
    });

    it('filters out slots that fall within the mentor blocked times for that weekday', async () => {
      calendarSyncService.getBlockedTimes.mockResolvedValue([
        {
          userId: 'mentor-1',
          day: earliestFreeSlotStart.weekday as DayOfTheWeek,
          startTime: DateTime.fromObject({ hour: 0, minute: 0 }),
          endTime: DateTime.fromObject({ hour: 1, minute: 0 }),
        },
      ]);

      const result = await service.findFreeSlotsInSchedule(
        'mentor-1',
        'mentee-1',
        1,
        [],
      );

      expect(result).toHaveLength(1);
      expect(result[0].startDateTime.toMillis()).toBe(
        earliestFreeSlotStart.plus({ hours: 1 }).toMillis(),
      );
    });

    it('throws InternalServerErrorException when there are no free slots in the schedule', async () => {
      scheduleRepository.getSavedCalendarEventsForUser
        .mockResolvedValueOnce([
          {
            startDateTime: fixedNow,
            endDateTime: fixedNow.plus({ months: 2 }),
          } as any,
        ])
        .mockResolvedValueOnce([]);

      await expect(
        service.findFreeSlotsInSchedule('mentor-1', 'mentee-1', 1, []),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
