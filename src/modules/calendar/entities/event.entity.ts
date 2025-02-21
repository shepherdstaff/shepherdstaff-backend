import { DateTime } from 'luxon';
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

  @Column({ unique: true })
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
      id: calendarEvent.id,
      sourceId: calendarEvent.sourceId, // Assuming you want to keep the same ID if provided
      name: calendarEvent.name,
      startDateTime: calendarEvent.startDateTime.toJSDate(),
      endDateTime: calendarEvent.endDateTime.toJSDate(),
      hasTimings: calendarEvent.hasTimings,
      user: new UserEntity({ id: userId }),
    });
  }

  toCalendarEvent(): CalendarEvent {
    return {
      sourceId: this.sourceId,
      id: this.id,
      name: this.name,
      startDateTime: DateTime.fromJSDate(this.startDateTime),
      endDateTime: DateTime.fromJSDate(this.endDateTime),
      hasTimings: this.hasTimings,
    };
  }
}
