import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Auth, google } from 'googleapis';
import { DateTime } from 'luxon';
import { UserPayload } from '../auth/interfaces/user-payload';
import { CalendarToken } from './interfaces/calendar-token.domain';
import { GoogleCalendarEvent } from './interfaces/google-calendar-event.interface';
import { CalendarTokenRepository } from './repositories/calendar-token.repository';
import { ScheduleRepository } from './repositories/schedule.repository';
import {
  EXPIRED_GOOGLE_OAUTH_REFRESH_TOKEN_ERROR,
  RefreshTokenExpiredException,
} from 'src/common/exceptions/refresh-token-expired.exception';
import { CalendarOmissionRepository } from './repositories/calendar-omission.repository';
import { CalendarSource } from './constants/calendar-source.enum';
import { plainToInstance } from 'class-transformer';
import { GetCalendarOptionsResponseDto } from './dtos/get-calendar-options-response.dto';

// TODO: move to redis
const userStateMap: { [state: string]: string } = {};
const userGoogleTokenMap: { [userId: string]: any } = {};

@Injectable()
export class CalendarSyncService {
  private googleOauth2Client: Auth.OAuth2Client;

  constructor(
    private configService: ConfigService,
    private scheduleRepository: ScheduleRepository,
    private calendarTokenRepository: CalendarTokenRepository,
    private calendarOmissionRepository: CalendarOmissionRepository,
  ) {
    // Setup your API client
    this.googleOauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      `${this.configService.get<string>('BACKEND_URL')}/api/calendar/google-oauth-callback`,
    );
  }

  async initiateGoogleOAuth(userPayload: UserPayload) {
    const userState = crypto.randomBytes(32).toString('hex');
    userStateMap[userState] = userPayload.userId;

    const scopes = ['https://www.googleapis.com/auth/calendar'];
    const url = this.googleOauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userState,
    });
    return url;
  }

  async googleOAuthCallback(code: string, state: string) {
    const userId = userStateMap[state];

    const { tokens } = await this.googleOauth2Client.getToken(code);
    this.googleOauth2Client.setCredentials(tokens);

    const now = DateTime.now();
    const limit = now.plus({ months: 1 }); // TODO: check how often mentor wants to meet mentee, then limit to that

    // Check if refresh token is present, if not, sync calendar events using existing saved access token
    if (!tokens.refresh_token) {
      return await this.retrieveLatestCalendarEvents(userId, limit);
    }

    // Check if access token returned is same as saved one for user
    // Replace the existing token if different

    await this.calendarTokenRepository.saveCalendarToken(
      new CalendarToken({
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date),
      }),
    );

    return await this.fetchAndSaveGoogleCalendarEvents(userId, limit);
  }

  async retrieveLatestCalendarEvents(userId: string, limit: DateTime) {
    await this.setGoogleOauth2ClientCredentials(userId);

    await this.fetchAndSaveGoogleCalendarEvents(userId, limit);
  }

  async getCalendarOptions(userId: string) {
    await this.setGoogleOauth2ClientCredentials(userId);

    const googleCalendar = google.calendar({
      version: 'v3',
      auth: this.googleOauth2Client,
    });

    const calendars = (await googleCalendar.calendarList.list()).data.items;
    const parsedCalendars = calendars.map((cal) => ({
      id: cal.id,
      name: cal.summary,
      source: CalendarSource.GOOGLE, // TODO: change when we support other sources
    }));

    return plainToInstance(GetCalendarOptionsResponseDto, {
      calendars: parsedCalendars,
    });
  }

  async setCalendarOptions(userId: string, calendarsToOmit: string[]) {
    await this.calendarOmissionRepository.saveCalendarOmissions(
      userId,
      calendarsToOmit,
    );
  }

  private async setGoogleOauth2ClientCredentials(userId: string) {
    let calendarToken: CalendarToken;
    try {
      calendarToken = (
        await this.calendarTokenRepository.findTokenByUserId(userId)
      ).toCalendarToken();
    } catch (error) {
      // Could not find user's calendar token - user possibly has not initiated calendar sync yet
      Logger.error(
        `User ${userId} does not have a calendar token saved, calendar sync not initiated yet.`,
      );
      return;
    }

    const latestToken = await this.refreshAccessToken(calendarToken);
    this.googleOauth2Client.setCredentials({
      access_token: latestToken.accessToken,
      refresh_token: latestToken.refreshToken,
      expiry_date: latestToken.expiryDate.getTime(),
    });
  }

  private async fetchAndSaveGoogleCalendarEvents(
    userId: string,
    limit: DateTime,
  ) {
    // Retrieve user's calendar events
    const userCalendarEvents = await this.fetchGoogleCalendarEvents(
      userId,
      limit,
    );
    const userCalendarEventsDomain = userCalendarEvents.map((gCalEvent) =>
      gCalEvent.toCalendarEventDomain(),
    );

    // Save and deconflict with existing saved calendar events in DB
    await this.scheduleRepository.upsertCalendarEvents(
      userCalendarEventsDomain,
      userId,
    );

    return userCalendarEventsDomain;
  }

  private async refreshAccessToken(calendarToken: CalendarToken) {
    const now = DateTime.now().toJSDate();
    if (calendarToken.expiryDate > now) {
      return calendarToken;
    }

    this.googleOauth2Client.setCredentials({
      refresh_token: calendarToken.refreshToken,
    });

    try {
      const { credentials } =
        await this.googleOauth2Client.refreshAccessToken();
      calendarToken.accessToken = credentials.access_token;
      calendarToken.refreshToken =
        credentials.refresh_token ?? calendarToken.refreshToken;
      calendarToken.expiryDate = new Date(credentials.expiry_date);

      await this.calendarTokenRepository.saveCalendarToken(calendarToken);
      return calendarToken;
    } catch (error) {
      Logger.error(
        `Failed to refresh access token for user ${calendarToken.userId}: ${error}`,
      );
      if (error.error === EXPIRED_GOOGLE_OAUTH_REFRESH_TOKEN_ERROR) {
        throw new RefreshTokenExpiredException();
      }
      throw new InternalServerErrorException('Failed to refresh access token');
    }
  }

  private async fetchGoogleCalendarEvents(
    userId: string,
    limitToDate: DateTime,
  ): Promise<GoogleCalendarEvent[]> {
    const googleCalendar = google.calendar({
      version: 'v3',
      auth: this.googleOauth2Client,
    });

    const now = DateTime.now();
    const calendars = (await googleCalendar.calendarList.list()).data.items;

    // Ignore events from omitted calendars
    const omittedCalendars =
      await this.calendarOmissionRepository.getOmittedCalendars(userId);
    const omittedCalendarsSet = new Set(
      omittedCalendars.map((omission) => omission.calendarId),
    );

    const userCalendarEvents: GoogleCalendarEvent[] = [];
    for (const calendar of calendars) {
      if (omittedCalendarsSet.has(calendar.id)) {
        Logger.debug(
          `Skipping omitted calendar: ${calendar.summary} (${calendar.id})`,
        );
        continue;
      }
      const eventsResponse = await googleCalendar.events.list({
        calendarId: calendar.id,
        timeMin: now.toISO(),
        timeMax: limitToDate.toISO(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = eventsResponse.data.items.map(
        (schemaEvent) => new GoogleCalendarEvent(schemaEvent),
      );
      userCalendarEvents.push(...events);
    }

    userCalendarEvents.sort((a, b) => {
      const aComparison = a.start?.dateTime
        ? DateTime.fromISO(a.start.dateTime).toMillis()
        : DateTime.fromSQL(a.start.date).toMillis();
      const bComparison = b.start?.dateTime
        ? DateTime.fromISO(b.start.dateTime).toMillis()
        : DateTime.fromSQL(b.start.date).toMillis();

      return aComparison - bComparison;
    });

    return userCalendarEvents;
  }
}
