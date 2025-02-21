import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { EventEntity } from '../entities/event.entity';
import { CalendarEvent } from '../interfaces/calendar-event.domain';

/**
 * Service class responsible for handling operations related to saving scheduled events.
 */
@Injectable()
export class ScheduleRepository {
  /**
   * Creates an instance of ScheduleRepository.
   * @param eventsRepository - The repository used to interact with the `EventEntity` in the database.
   */
  constructor(
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,
  ) {}

  /**
   * Saves an array of calendar events associated with a specific user to the database.
   *
   * @param calendarEvents - An array of `CalendarEvent` objects to be saved.
   * @param userId - The ID of the user to whom the events belong.
   * @returns An array of saved `EventEntity` objects.
   */
  public async saveCalendarEvents(
    calendarEvents: CalendarEvent[],
    userId: string,
  ) {
    // Transform CalendarEvent objects into EventEntity objects
    const eventEntities = calendarEvents.map((event) =>
      EventEntity.from(event, userId),
    );

    // Save the array of EventEntity objects to the database
    return await this.eventsRepository.save(eventEntities);
  }

  public async upsertCalendarEvents(
    calendarEvents: CalendarEvent[],
    userId: string,
  ) {
    // Transform CalendarEvent objects into EventEntity objects
    const eventEntities = calendarEvents.map((event) =>
      EventEntity.from(event, userId),
    );

    // Upsert based on sourceId
    await this.eventsRepository.upsert(eventEntities, ['sourceId']);
  }

  public async getSavedCalendarEventsForUser(
    userId: string,
    limitDate: DateTime,
  ): Promise<CalendarEvent[]> {
    const events = await this.eventsRepository
      .createQueryBuilder('events')
      .where('events.user = :userId', { userId })
      .andWhere('events.startDateTime <= :limitDate', {
        limitDate: limitDate.toJSDate(),
      })
      .andWhere('events.startDateTime >= :now', {
        now: DateTime.now().toJSDate(),
      })
      .getMany();

    return events.map((event) => event.toCalendarEvent());
  }
}
