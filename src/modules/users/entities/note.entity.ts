import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum NoteType {
  GENERAL = 'general',
  PRAYER = 'prayer',
}

@Entity()
export class NoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;
}
