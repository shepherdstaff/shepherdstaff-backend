import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SetCalendarOptionsRequestDto {
  @ApiProperty()
  @Expose()
  calendarsToOmit: string[];
}
