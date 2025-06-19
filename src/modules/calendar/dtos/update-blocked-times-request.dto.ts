import { Expose } from 'class-transformer';
import { BlockedTimeDto } from './blocked-time.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBlockedTimesRequestDto {
  @Expose()
  @ApiProperty({
    type: [BlockedTimeDto],
    description: 'List of blocked times to update',
  })
  blockedTimes: BlockedTimeDto[];
}
