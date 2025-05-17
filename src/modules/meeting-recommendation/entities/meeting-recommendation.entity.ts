import { AppointmentStatus } from 'src/interfaces/appointments';
import { UserRelationEntity } from 'src/modules/users/entities/user-relation.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MeetingRecommendation } from '../domain/meeting-recommendation.domain';
import { DateTime } from 'luxon';

@Entity({ name: 'meeting_recommendation' })
export class MeetingRecommendationEntity {
  constructor(props?: Partial<MeetingRecommendationEntity>) {
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserRelationEntity, (userRelation) => userRelation.id)
  @JoinColumn({ name: 'fk_user_relation_id' })
  userRelation: UserRelationEntity;

  @Column()
  startDateTime: Date;

  @Column()
  endDateTime: Date;

  @Column()
  status: AppointmentStatus;

  static from(
    userRelationId: string,
    meetingRecommendation: MeetingRecommendation,
  ): MeetingRecommendationEntity {
    const userRelation = new UserRelationEntity({ id: userRelationId });

    return new MeetingRecommendationEntity({
      userRelation,
      startDateTime: meetingRecommendation.startDateTime.toJSDate(),
      endDateTime: meetingRecommendation.endDateTime.toJSDate(),
      status: meetingRecommendation.status,
    });
  }

  toMeetingRecommendation(): MeetingRecommendation {
    return new MeetingRecommendation({
      id: this.id,
      fromUserId: this.userRelation.fromUser.id,
      toUserId: this.userRelation.toUser.id,
      startDateTime: DateTime.fromJSDate(this.startDateTime),
      endDateTime: DateTime.fromJSDate(this.endDateTime),
      status: this.status,
    });
  }
}
