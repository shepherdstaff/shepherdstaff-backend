import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { IsString } from 'class-validator';
import { Note } from '../../domain/note.domain';

export class NoteResponseDto {
  @Expose()
  @ApiProperty({ description: 'Unique identifier of the note' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Content of the note' })
  @IsString()
  content: string;

  @Expose()
  @ApiProperty({ description: 'Creation date of the note' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last updated date of the note' })
  updatedAt: Date;

  static from(note: Note): NoteResponseDto {
    return plainToInstance(NoteResponseDto, {
      id: note.id,
      content: note.content,
      createdAt: note.createdAt.toJSDate(),
      updatedAt: note.updatedAt.toJSDate(),
    });
  }
}
