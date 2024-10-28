import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Mentor } from './mentor.entity';
import { Mentee } from './mentee.entity';

export enum MeetingStatus {
  RECOMMENDED = 'recommended',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  MET = 'met'
}

@Entity()
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dateTime: Date;

  @Column({
    type: 'simple-enum',
    enum: MeetingStatus,
    default: MeetingStatus.RECOMMENDED
  })
  status: MeetingStatus;

  @ManyToOne(() => Mentor, mentor => mentor.meetings)
  mentor: Mentor;

  @ManyToOne(() => Mentee, mentee => mentee.meetings)
  mentee: Mentee;

  @Column({ nullable: true })
  notes: string;
}