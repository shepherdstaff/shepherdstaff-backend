import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Mentee } from './mentee.entity';

export enum NoteType {
  GENERAL = 'general',
  PRAYER = 'prayer'
}

@Entity()
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({
    type: 'simple-enum',
    enum: NoteType,
    default: NoteType.GENERAL
  })
  type: NoteType;

  @Column({ default: false })
  isAnswered: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Mentee, mentee => mentee.notes)
  mentee: Mentee;
}