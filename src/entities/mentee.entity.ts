import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Mentor } from './mentor.entity';
import { Meeting } from './meeting.entity';
import { Note } from './note.entity';

@Entity()
export class Mentee {
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
    exceptions: {
      date: string;
      available: boolean;
    }[];
  };

  @Column()
  meetingFrequencyDays: number;

  @ManyToOne(() => Mentor, mentor => mentor.mentees)
  mentor: Mentor;

  @OneToMany(() => Meeting, meeting => meeting.mentee)
  meetings: Meeting[];

  @OneToMany(() => Note, note => note.mentee)
  notes: Note[];
}