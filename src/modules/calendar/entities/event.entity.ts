import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CalendarEvent } from '../interfaces/calendar-event.domain';

@Entity({
  name: 'event',
})
export class EventEntity {
  constructor(props?: Partial<EventEntity>) {
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  // The ID assigned by the calendar source (i.e. Google cal or Apple cal)
  sourceId: string;

  @Column()
  name: string;

  @Column()
  startDateTime: Date;

  @Column()
  endDateTime: Date;

  @Column()
  hasTimings: boolean;

  @ManyToOne(
    () => UserEntity,
    (user) => user.id, //reverse relation
  )
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  static from(calendarEvent: CalendarEvent, userId: string): EventEntity {
    return new EventEntity({
      sourceId: calendarEvent.id, // Assuming you want to keep the same ID if provided
      name: calendarEvent.name,
      startDateTime: calendarEvent.startDateTime,
      endDateTime: calendarEvent.endDateTime,
      hasTimings: calendarEvent.hasTimings,
      user: new UserEntity({ id: userId }),
    });
  }
}
