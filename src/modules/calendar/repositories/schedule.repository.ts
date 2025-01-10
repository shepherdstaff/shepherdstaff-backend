import { Injectable } from "@nestjs/common";
import { CalendarEvent } from "../interfaces/calendar-event.domain";
import { Repository } from "typeorm";
import { EventEntity } from "../entities/event.entity";

/**
 * Service class responsible for handling operations related to saving scheduled events.
 */
@Injectable()
export class ScheduleRepository {
    /**
     * Creates an instance of ScheduleRepository.
     * @param eventsRepository - The repository used to interact with the `EventEntity` in the database.
     */
    constructor(private eventsRepository: Repository<EventEntity>){}

    /**
     * Saves an array of calendar events associated with a specific user to the database.
     * 
     * @param calendarEvents - An array of `CalendarEvent` objects to be saved.
     * @param userId - The ID of the user to whom the events belong.
     * @returns An array of saved `EventEntity` objects.
     */
    public async saveCalendarEvents(calendarEvents: CalendarEvent[], userId: string) {
        // Transform CalendarEvent objects into EventEntity objects
        const eventEntities = calendarEvents.map(event => {
            const newEvent = new EventEntity();
            newEvent.id = event.id; // Assuming you want to keep the same ID if provided
            newEvent.name = event.name;
            newEvent.startDateTime = event.startDateTime;
            newEvent.endDateTime = event.endDateTime;
            newEvent.hasTimings = event.hasTimings;            
            return newEvent;
        });
    
        // Save the array of EventEntity objects to the database
        return await this.eventsRepository.save(eventEntities);
    }
}