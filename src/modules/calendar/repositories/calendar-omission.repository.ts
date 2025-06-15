import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarOmissionEntity } from '../entities/calendar-omission.entity';
import { In, Repository } from 'typeorm';
import { CalendarSource } from '../constants/calendar-source.enum';

@Injectable()
export class CalendarOmissionRepository {
  constructor(
    @InjectRepository(CalendarOmissionEntity)
    private readonly calendarOmissionRepository: Repository<CalendarOmissionEntity>,
  ) {}

  async saveCalendarOmissions(
    userId: string,
    calendarIdsToOmit: string[],
  ): Promise<void> {
    const currentCalendarOmissions = await this.calendarOmissionRepository.find(
      {
        where: { userId },
      },
    );

    // Remove omissions for calendars that are no longer in the list
    const currentCalendarOmissionsIds = currentCalendarOmissions.map(
      (omission) => omission.calendarId,
    );
    const calendarIdsToUnomit = currentCalendarOmissionsIds.filter(
      (id) => !calendarIdsToOmit.includes(id),
    );

    await this.calendarOmissionRepository.delete({
      userId,
      calendarId: In(calendarIdsToUnomit),
    });

    // Add omissions for calendars that are in the new list
    const omissions = calendarIdsToOmit.map((calendarId) => {
      return this.calendarOmissionRepository.create({
        userId,
        calendarId,
        calendarSource: CalendarSource.GOOGLE, // TODO: change when we support other sources
      });
    });

    await this.calendarOmissionRepository.upsert(omissions, [
      'userId',
      'calendarId',
    ]);
  }
}
