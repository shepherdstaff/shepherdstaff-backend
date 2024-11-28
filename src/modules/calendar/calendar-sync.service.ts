import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth, google } from 'googleapis';
import {
  menteeAvailabilityDb,
  mentorAvailabilityDb,
} from 'src/hacked-database';
import { CalendarEvent } from 'src/interfaces/availability';
import { UserType } from 'src/interfaces/users';

@Injectable()
export class CalendarSyncService {
  private googleOauth2Client: Auth.OAuth2Client;

  constructor(private configService: ConfigService) {
    // Setup your API client
    this.googleOauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      'http://localhost:3000/api/calendar/google-oauth-callback',
    );
  }

  async initiateGoogleOAuth() {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    const url = this.googleOauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: 'test-state',
    });
    return url;
  }

  async googleOAuthCallback(code: string) {
    console.log('Received code:', code);
    return code;
  }

  async syncCalendar(token: string, userType: UserType, userId: string) {
    const calendar = google.calendar({ version: 'v3', auth: token });

    // Get events for the next month
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    const availability = this.processEvents(userId, userType, events);

    return availability;
  }

  private processEvents(userId: string, userType: UserType, events: any[]) {
    events.forEach((event) => {
      if (event.start?.dateTime && event.end?.dateTime) {
        // not full day
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);

        const currentEvent: CalendarEvent = new CalendarEvent(
          false,
          start,
          end,
        );

        if (userType === UserType.MENTOR) {
          mentorAvailabilityDb[userId].push(currentEvent);
        } else if (userType === UserType.MENTEE) {
          menteeAvailabilityDb[userId].push(currentEvent);
        }
      } else if (event.start?.date) {
        // full day
        const start = new Date(event.start.date);
        const end = new Date(event.end.date);

        const currentEvent: CalendarEvent = new CalendarEvent(true, start, end);

        if (userType === UserType.MENTOR) {
          mentorAvailabilityDb[userId].push(currentEvent);
        } else if (userType === UserType.MENTEE) {
          menteeAvailabilityDb[userId].push(currentEvent);
        }
      }
    });
  }
}
