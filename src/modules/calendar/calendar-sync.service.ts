import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Auth, google } from 'googleapis';
import { DateTime } from 'luxon';
import { UserPayload } from '../auth/interfaces/user-payload';
import { GoogleCalendarEvent } from './interfaces/google-calendar-event.interface';
import { ScheduleRepository } from './repositories/schedule.repository';

// TODO: move to redis
const userStateMap: { [state: string]: string } = {};
const userGoogleTokenMap: { [userId: string]: any } = {};

@Injectable()
export class CalendarSyncService {
  private googleOauth2Client: Auth.OAuth2Client;

  constructor(
    private configService: ConfigService,
    private scheduleRepository: ScheduleRepository,
  ) {
    // Setup your API client
    this.googleOauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      'http://localhost:3000/api/calendar/google-oauth-callback',
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

    // TODO: store user's refresh token in database -> for cron job sync method to use to sync calendar events

    // Retrieve user's calendar events
    const googleCalendar = google.calendar({
      version: 'v3',
      auth: this.googleOauth2Client,
    });

    const now = DateTime.now();
    const limit = now.plus({ months: 1 }); // TODO: check how often mentor wants to meet mentee, then limit to that

    const calendars = (await googleCalendar.calendarList.list()).data.items;

    // TODO: allow users to omit calendars

    const userCalendarEvents: GoogleCalendarEvent[] = [];
    for (const calendar of calendars) {
      const eventsResponse = await googleCalendar.events.list({
        calendarId: calendar.id,
        timeMin: now.toISO(),
        timeMax: limit.toISO(),
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

    const savedEvents = await this.scheduleRepository.saveCalendarEvents(
      userCalendarEvents.map((gCalEvent) => gCalEvent.toCalendarEventDomain()),
      userId,
    );

    return savedEvents;
  }

  // TODO: Cron job to sync calendar of mentors WHEN it is time to recommend meeting for a mentor-mentee pair
  // for the specified mentor and mentee -> (meeting rec service has knowledge of this)
  // 1. retrieve stored oauth refresh token (schedule service calls calendar sync service)
  // 2. retrieve latest calendar events from google calendar api (schedule service calls calendar sync service)
  // 3. deconflict - add new events, compare and remove events in DB that dont exist anymore in google cal (calendar sync service does the update/decon)
}
