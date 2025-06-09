import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarTokenEntity } from '../entities/calendar-token.entity';
import { CalendarToken } from '../interfaces/calendar-token.domain';

@Injectable()
export class CalendarTokenRepository {
  constructor(
    @InjectRepository(CalendarTokenEntity)
    private calendarTokenRepository: Repository<CalendarTokenEntity>,
  ) {}

  async saveCalendarToken(token: CalendarToken): Promise<void> {
    await this.calendarTokenRepository.upsert(CalendarTokenEntity.from(token), [
      'userId',
    ]);
  }

  async findTokenByUserId(userId: string): Promise<CalendarTokenEntity> {
    return this.calendarTokenRepository.findOneOrFail({
      where: { userId },
    });
  }
}
