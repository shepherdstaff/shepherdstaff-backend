import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { google } from 'googleapis';
import { Repository } from 'typeorm';
import { Mentee } from '../entities/mentee.entity';
import { Mentor } from '../entities/mentor.entity';

@Injectable()
export class CalendarSyncService {
  constructor(
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    @InjectRepository(Mentee)
    private menteeRepository: Repository<Mentee>,
  ) {}

  async syncCalendar(
    token: string,
    userType: 'mentor' | 'mentee',
    userId: string,
  ) {
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
    const availability = this.processEvents(events);

    if (userType === 'mentor') {
      await this.mentorRepository.update(userId, { availability });
    } else {
      await this.menteeRepository.update(userId, { availability });
    }

    return availability;
  }

  private processEvents(events: any[]) {
    const weeklySchedule: { [key: string]: { start: string; end: string }[] } =
      {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };

    events.forEach((event) => {
      if (event.start?.dateTime && event.end?.dateTime) {
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);
        const day = start.toLocaleDateString('en-US', { weekday: 'short' });

        weeklySchedule[day].push({
          start: start.toLocaleTimeString('en-US', { hour12: false }),
          end: end.toLocaleTimeString('en-US', { hour12: false }),
        });
      }
    });

    return { weeklySchedule };
  }
}
