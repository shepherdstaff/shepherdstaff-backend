import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { BaseNoteRequestDto } from './base-note-request.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNoteRequestDto extends BaseNoteRequestDto {
  @Expose()
  @ApiProperty({ description: 'ID of the note to update' })
  @IsUUID()
  id: string;
}
