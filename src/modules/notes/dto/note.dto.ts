import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { Note } from '../domain/note.domain';
import { DateTime } from 'luxon';

export class NoteDto {
  @Expose()
  @ApiProperty({ description: 'Unique identifier of the note' })
  @IsOptional()
  id?: string;

  @Expose()
  @ApiProperty({ description: 'Content of the note' })
  @IsString()
  content: string;

  @Expose()
  @ApiProperty({ description: 'Creation date of the note' })
  @IsOptional()
  createdAt?: Date;

  @Expose()
  @ApiProperty({ description: 'Last updated date of the note' })
  @IsOptional()
  updatedAt?: Date;

  toDomain(): Note {
    const note = plainToInstance(Note, {
      content: this.content,
      createdAt: null,
      updatedAt: null,
    });

    // Hacky way to get around deep copy issues with DateTime
    note.createdAt = note.createdAt
      ? DateTime.fromJSDate(this.createdAt)
      : DateTime.now();
    note.updatedAt = note.updatedAt
      ? DateTime.fromJSDate(this.updatedAt)
      : DateTime.now();
    return note;
  }

  static from(note: Note): NoteDto {
    return plainToInstance(NoteDto, {
      id: note.id,
      content: note.content,
      createdAt: note.createdAt.toJSDate(),
      updatedAt: note.updatedAt.toJSDate(),
    });
  }
}
