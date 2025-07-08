import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Note } from '../domain/note.domain';
import { plainToInstance } from 'class-transformer';
import { DateTime } from 'luxon';

export enum NoteType {
  GENERAL = 'general',
  PRAYER = 'prayer',
}

@Entity()
export class NoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  type: NoteType;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'fk_from_user_id' })
  // This is the user who created the note
  // In the context of a mentor-mentee relationship, this is the mentor
  fromUser: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'fk_to_user_id' })
  // This is the user who the note is about
  // In the context of a mentor-mentee relationship, this is the mentee
  toUser: UserEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  toDomain(): Note {
    const note = plainToInstance(Note, {
      id: this.id,
      content: this.content,
      createdAt: null,
      updatedAt: null,
    });

    note.createdAt = DateTime.fromJSDate(this.createdAt);
    note.updatedAt = DateTime.fromJSDate(this.updatedAt);
    return note;
  }

  static fromNote(
    note: Note,
    fromUserId: string,
    toUserId: string,
  ): NoteEntity {
    return plainToInstance(NoteEntity, {
      content: note.content,
      type: NoteType.GENERAL,
      createdAt: note.createdAt?.toJSDate(),
      updatedAt: note.updatedAt?.toJSDate(),
      fromUser: new UserEntity({ id: fromUserId }),
      toUser: new UserEntity({ id: toUserId }),
    });
  }
}
