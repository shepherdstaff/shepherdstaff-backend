import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Mentee } from './mentee.entity';
import { Meeting } from './meeting.entity';

@Entity()
export class Mentor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column('simple-json')
  availability: {
    weeklySchedule: {
      [key: string]: { start: string; end: string }[];
    };
  };

  @OneToMany(() => Mentee, mentee => mentee.mentor)
  mentees: Mentee[];

  @OneToMany(() => Meeting, meeting => meeting.mentor)
  meetings: Meeting[];
}