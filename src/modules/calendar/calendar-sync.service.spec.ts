import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { google } from 'googleapis';
import { DateTime } from 'luxon';
import { CalendarSyncService } from './calendar-sync.service';
import { ScheduleRepository } from './repositories/schedule.repository';
import { CalendarTokenRepository } from './repositories/calendar-token.repository';
import { CalendarOmissionRepository } from './repositories/calendar-omission.repository';
import { CalendarToken } from './interfaces/calendar-token.domain';
import { RefreshTokenExpiredException } from 'src/common/exceptions/refresh-token-expired.exception';
import { BlockedTimeDto } from './dtos/blocked-time.dto';
import { DayOfTheWeek } from './constants/day-of-the-week.enum';

const mockOAuth2Client = {
  generateAuthUrl: jest.fn(),
  getToken: jest.fn(),
  setCredentials: jest.fn(),
  refreshAccessToken: jest.fn(),
};
const mockCalendarClient = {
  calendarList: { list: jest.fn() },
  events: { list: jest.fn() },
};

jest.mock('googleapis', () => ({
  google: {
    auth: { OAuth2: jest.fn(() => mockOAuth2Client) },
    calendar: jest.fn(() => mockCalendarClient),
  },
}));

describe('CalendarSyncService', () => {
  let service: CalendarSyncService;
  let configService: jest.Mocked<ConfigService>;
  let scheduleRepository: jest.Mocked<ScheduleRepository>;
  let calendarTokenRepository: jest.Mocked<CalendarTokenRepository>;
  let calendarOmissionRepository: jest.Mocked<CalendarOmissionRepository>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
  };

  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();

    configService = {
      get: jest.fn((key: string) => `config-${key}`),
    } as unknown as jest.Mocked<ConfigService>;

    scheduleRepository = {
      upsertCalendarEvents: jest.fn(),
      clearSavedCalendarEventsOfSourceCalendarIds: jest.fn(),
      clearBlockedTimesForUser: jest.fn(),
      saveBlockedTimes: jest.fn(),
      getBlockedTimesForUser: jest.fn(),
    } as unknown as jest.Mocked<ScheduleRepository>;

    calendarTokenRepository = {
      saveCalendarToken: jest.fn(),
      findTokenByUserId: jest.fn(),
    } as unknown as jest.Mocked<CalendarTokenRepository>;

    calendarOmissionRepository = {
      getOmittedCalendars: jest.fn().mockResolvedValue([]),
      saveCalendarOmissions: jest.fn(),
    } as unknown as jest.Mocked<CalendarOmissionRepository>;

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as jest.Mocked<DataSource>;

    service = new CalendarSyncService(
      configService,
      scheduleRepository,
      calendarTokenRepository,
      calendarOmissionRepository,
      dataSource,
    );
  });

  describe('initiateGoogleOAuth', () => {
    it('generates a Google consent URL scoped to calendar access with offline access', async () => {
      mockOAuth2Client.generateAuthUrl.mockReturnValue('https://google.example/auth');

      const url = await service.initiateGoogleOAuth({
        userId,
        username: 'janedoe',
      } as any);

      expect(url).toBe('https://google.example/auth');
      expect(mockOAuth2Client.generateAuthUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          access_type: 'offline',
          scope: ['https://www.googleapis.com/auth/calendar'],
          state: expect.any(String),
        }),
      );
    });
  });

  describe('googleOAuthCallback', () => {
    beforeEach(() => {
      mockCalendarClient.calendarList.list.mockResolvedValue({
        data: { items: [{ id: 'primary', summary: 'Primary' }] },
      });
      mockCalendarClient.events.list.mockResolvedValue({
        data: {
          items: [
            {
              id: 'event-1',
              summary: 'Meeting',
              organizer: { email: 'primary' },
              start: { dateTime: '2026-01-10T09:00:00Z' },
              end: { dateTime: '2026-01-10T10:00:00Z' },
            },
          ],
        },
      });
    });

    it('saves the new refresh token and syncs calendar events when a refresh token is returned', async () => {
      const state = await captureOAuthState(service);
      mockOAuth2Client.getToken.mockResolvedValue({
        tokens: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expiry_date: Date.now() + 3600_000,
        },
      });

      await service.googleOAuthCallback('auth-code', state);

      expect(calendarTokenRepository.saveCalendarToken).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        }),
      );
      expect(scheduleRepository.upsertCalendarEvents).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Meeting', sourceId: 'event-1' }),
        ]),
        userId,
      );
    });

    it('does not persist a new token when Google does not return a refresh token, but still syncs events', async () => {
      const state = await captureOAuthState(service);
      mockOAuth2Client.getToken.mockResolvedValue({
        tokens: {
          access_token: 'access-token',
          expiry_date: Date.now() + 3600_000,
        },
      });
      calendarTokenRepository.findTokenByUserId.mockResolvedValue({
        toCalendarToken: () =>
          new CalendarToken({
            userId,
            accessToken: 'existing-access-token',
            refreshToken: 'existing-refresh-token',
            expiryDate: new Date(Date.now() + 3600_000),
          }),
      } as any);

      await service.googleOAuthCallback('auth-code', state);

      expect(calendarTokenRepository.saveCalendarToken).not.toHaveBeenCalled();
      expect(scheduleRepository.upsertCalendarEvents).toHaveBeenCalledWith(
        expect.any(Array),
        userId,
      );
    });

    async function captureOAuthState(
      calendarSyncService: CalendarSyncService,
    ): Promise<string> {
      mockOAuth2Client.generateAuthUrl.mockImplementation(
        (options: { state: string }) =>
          `https://google.example/auth?state=${options.state}`,
      );
      const url = await calendarSyncService.initiateGoogleOAuth({
        userId,
        username: 'janedoe',
      } as any);
      return new URL(url).searchParams.get('state');
    }
  });

  describe('getCalendarOptions', () => {
    it('returns calendars marked as omitted based on saved omissions', async () => {
      calendarTokenRepository.findTokenByUserId.mockResolvedValue({
        toCalendarToken: () =>
          new CalendarToken({
            userId,
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            expiryDate: new Date(Date.now() + 3600_000),
          }),
      } as any);
      mockCalendarClient.calendarList.list.mockResolvedValue({
        data: {
          items: [
            { id: 'cal-1', summary: 'Personal' },
            { id: 'cal-2', summary: 'Work' },
          ],
        },
      });
      calendarOmissionRepository.getOmittedCalendars.mockResolvedValue([
        { calendarId: 'cal-2', source: 'GOOGLE' } as any,
      ]);

      const result = await service.getCalendarOptions(userId);

      expect(result.calendars).toEqual([
        expect.objectContaining({ id: 'cal-1', isOmitted: false }),
        expect.objectContaining({ id: 'cal-2', isOmitted: true }),
      ]);
    });

    it('returns an empty calendar list when the user has no saved calendar token', async () => {
      calendarTokenRepository.findTokenByUserId.mockRejectedValue(
        new Error('not found'),
      );

      const result = await service.getCalendarOptions(userId);

      expect(result.calendars).toEqual([]);
    });
  });

  describe('setCalendarOptions', () => {
    it('commits the transaction after saving omissions and clearing omitted events', async () => {
      await service.setCalendarOptions(userId, ['cal-2']);

      expect(calendarOmissionRepository.saveCalendarOmissions).toHaveBeenCalledWith(
        userId,
        ['cal-2'],
        queryRunner,
      );
      expect(
        scheduleRepository.clearSavedCalendarEventsOfSourceCalendarIds,
      ).toHaveBeenCalledWith(userId, ['cal-2'], queryRunner);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('rolls back the transaction and throws when saving omissions fails', async () => {
      calendarOmissionRepository.saveCalendarOmissions.mockRejectedValue(
        new Error('db error'),
      );

      await expect(
        service.setCalendarOptions(userId, ['cal-2']),
      ).rejects.toThrow(InternalServerErrorException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('updateBlockedTimes', () => {
    const blockedTimeDtos = [
      Object.assign(new BlockedTimeDto(), {
        startTime: '2026-01-05T09:00:00.000Z',
        endTime: '2026-01-05T10:00:00.000Z',
        day: DayOfTheWeek.MONDAY,
      }),
    ];

    it('clears existing blocked times and saves the new ones within a transaction', async () => {
      await service.updateBlockedTimes(userId, blockedTimeDtos);

      expect(scheduleRepository.clearBlockedTimesForUser).toHaveBeenCalledWith(
        userId,
        queryRunner,
      );
      expect(scheduleRepository.saveBlockedTimes).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ userId, day: DayOfTheWeek.MONDAY }),
        ]),
        queryRunner,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('rolls back and throws when saving blocked times fails', async () => {
      scheduleRepository.saveBlockedTimes.mockRejectedValue(
        new Error('db error'),
      );

      await expect(
        service.updateBlockedTimes(userId, blockedTimeDtos),
      ).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('getBlockedTimes', () => {
    it('returns the blocked times saved for the user', async () => {
      const blockedTimes = [{ userId, day: DayOfTheWeek.TUESDAY }] as any;
      scheduleRepository.getBlockedTimesForUser.mockResolvedValue(
        blockedTimes,
      );

      const result = await service.getBlockedTimes(userId);

      expect(result).toBe(blockedTimes);
    });

    it('wraps repository failures in an InternalServerErrorException', async () => {
      scheduleRepository.getBlockedTimesForUser.mockRejectedValue(
        new Error('db error'),
      );

      await expect(service.getBlockedTimes(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('access token refresh (exercised through getCalendarOptions)', () => {
    beforeEach(() => {
      mockCalendarClient.calendarList.list.mockResolvedValue({
        data: { items: [] },
      });
    });

    it('does not call Google to refresh a token that has not expired yet', async () => {
      calendarTokenRepository.findTokenByUserId.mockResolvedValue({
        toCalendarToken: () =>
          new CalendarToken({
            userId,
            accessToken: 'still-valid-access-token',
            refreshToken: 'refresh-token',
            expiryDate: new Date(Date.now() + 3600_000),
          }),
      } as any);

      await service.getCalendarOptions(userId);

      expect(mockOAuth2Client.refreshAccessToken).not.toHaveBeenCalled();
    });

    it('refreshes and persists a new access token when the saved token has expired', async () => {
      calendarTokenRepository.findTokenByUserId.mockResolvedValue({
        toCalendarToken: () =>
          new CalendarToken({
            userId,
            accessToken: 'expired-access-token',
            refreshToken: 'refresh-token',
            expiryDate: new Date(Date.now() - 3600_000),
          }),
      } as any);
      mockOAuth2Client.refreshAccessToken.mockResolvedValue({
        credentials: {
          access_token: 'refreshed-access-token',
          refresh_token: 'refresh-token',
          expiry_date: Date.now() + 3600_000,
        },
      });

      await service.getCalendarOptions(userId);

      expect(calendarTokenRepository.saveCalendarToken).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: 'refreshed-access-token' }),
      );
    });

    it('throws RefreshTokenExpiredException when Google rejects the refresh token', async () => {
      calendarTokenRepository.findTokenByUserId.mockResolvedValue({
        toCalendarToken: () =>
          new CalendarToken({
            userId,
            accessToken: 'expired-access-token',
            refreshToken: 'stale-refresh-token',
            expiryDate: new Date(Date.now() - 3600_000),
          }),
      } as any);
      mockOAuth2Client.refreshAccessToken.mockRejectedValue({
        error: 'invalid_grant',
      });

      // getCalendarOptions swallows the failure and falls back to an empty
      // calendar list, so we exercise retrieveLatestCalendarEvents instead,
      // which lets the refresh failure surface directly.
      await expect(
        service.retrieveLatestCalendarEvents(userId, DateTime.now()),
      ).rejects.toThrow(RefreshTokenExpiredException);
    });
  });
});
