import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CalendarSource } from '../constants/calendar-source.enum';

@Entity({ name: 'calendar_omission' })
export class CalendarOmissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  calendarId: string;

  @Column()
  calendarSource: CalendarSource;
}
