import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarOmissionEntity } from '../entities/calendar-omission.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { CalendarSource } from '../constants/calendar-source.enum';
import { CalendarOmission } from '../domain/calendar-omission.domain';
import { TransactionalRepository } from 'src/common/transactional.repository';

@Injectable()
export class CalendarOmissionRepository extends TransactionalRepository<CalendarOmissionEntity> {
  constructor(
    @InjectRepository(CalendarOmissionEntity)
    private readonly calendarOmissionRepository: Repository<CalendarOmissionEntity>,
  ) {
    super();
  }

  async saveCalendarOmissions(
    userId: string,
    calendarIdsToOmit: string[],
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const repository = this.useRepository(
      this.calendarOmissionRepository,
      queryRunner,
    );

    const currentCalendarOmissions = await repository.find({
      where: { userId },
    });

    // Remove omissions for calendars that are no longer in the list
    const currentCalendarOmissionsIds = currentCalendarOmissions.map(
      (omission) => omission.calendarId,
    );
    const calendarIdsToUnomit = currentCalendarOmissionsIds.filter(
      (id) => !calendarIdsToOmit.includes(id),
    );

    await repository.delete({
      userId,
      calendarId: In(calendarIdsToUnomit),
    });

    // Add omissions for calendars that are in the new list
    const omissions = calendarIdsToOmit.map((calendarId) => {
      return repository.create({
        userId,
        calendarId,
        calendarSource: CalendarSource.GOOGLE, // TODO: change when we support other sources
      });
    });

    await repository.upsert(omissions, ['userId', 'calendarId']);
  }

  async getOmittedCalendars(userId: string): Promise<CalendarOmission[]> {
    const omissions = await this.calendarOmissionRepository.find({
      where: { userId },
    });

    return omissions.map((omission) => omission.toCalendarOmission());
  }
}
