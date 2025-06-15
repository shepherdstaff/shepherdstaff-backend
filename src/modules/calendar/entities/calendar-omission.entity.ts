import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { CalendarSource } from '../constants/calendar-source.enum';
import { CalendarOmission } from '../domain/calendar-omission.domain';
import { plainToInstance } from 'class-transformer';

@Entity({ name: 'calendar_omission' })
@Index(['userId', 'calendarId'], { unique: true })
export class CalendarOmissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  calendarId: string;

  @Column()
  calendarSource: CalendarSource;

  toCalendarOmission(): CalendarOmission {
    return plainToInstance(CalendarOmission, {
      calendarId: this.calendarId,
      source: this.calendarSource,
    });
  }
}
