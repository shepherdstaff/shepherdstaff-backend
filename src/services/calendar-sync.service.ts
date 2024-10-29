import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { menteeAvailability, mentorAvailability } from 'src/hacked-database';
import { CalendarEvent } from 'src/interfaces/availability';
import { UserType } from 'src/interfaces/users';

@Injectable()
export class CalendarSyncService {
  constructor() {}

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
          mentorAvailability[userId].push(currentEvent);
        } else if (userType === UserType.MENTEE) {
          menteeAvailability[userId].push(currentEvent);
        }
      } else if (event.start?.date) {
        // full day
        const start = new Date(event.start.date);
        const end = new Date(event.end.date);

        const currentEvent: CalendarEvent = new CalendarEvent(true, start, end);

        if (userType === UserType.MENTOR) {
          mentorAvailability[userId].push(currentEvent);
        } else if (userType === UserType.MENTEE) {
          menteeAvailability[userId].push(currentEvent);
        }
      }
    });
  }
}
