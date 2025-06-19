import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DayOfTheWeek } from '../constants/day-of-the-week.enum';
import { BlockedTime } from '../domain/blocked-time.domain';
import { plainToInstance } from 'class-transformer';
import { DateTime } from 'luxon';

@Entity({ name: 'blocked_time' })
export class BlockedTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  day: DayOfTheWeek;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @ManyToOne(
    () => UserEntity,
    (user) => user.id, //reverse relation
  )
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  toDomain(): BlockedTime {
    return plainToInstance(BlockedTime, {
      day: this.day,
      startTime: DateTime.fromJSDate(this.startTime),
      endTime: DateTime.fromJSDate(this.endTime),
      userId: this.user.id,
    });
  }

  static from(blockedTime: BlockedTime): BlockedTimeEntity {
    return plainToInstance(BlockedTimeEntity, {
      day: blockedTime.day,
      startTime: blockedTime.startTime.toJSDate(),
      endTime: blockedTime.endTime.toJSDate(),
      user: new UserEntity({ id: blockedTime.userId }),
    });
  }
}
