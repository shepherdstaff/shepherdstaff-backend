import { Expose, plainToInstance } from 'class-transformer';
import { Note } from '../../domain/note.domain';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BaseNoteRequestDto {
  @Expose()
  @ApiProperty({ description: 'Content of the note' })
  @IsString()
  content: string;

  toDomain(): Note {
    const note = plainToInstance(Note, {
      content: this.content,
      createdAt: null,
      updatedAt: null,
    });

    return note;
  }
}
