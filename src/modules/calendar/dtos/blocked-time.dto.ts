import { Expose, plainToInstance } from 'class-transformer';
import { DayOfTheWeek } from '../constants/day-of-the-week.enum';
import { DateTime } from 'luxon';
import { BlockedTime } from '../domain/blocked-time.domain';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsISO8601, IsDateString } from 'class-validator';

export class BlockedTimeDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Start time in ISO 8601 format',
  })
  @IsString()
  @IsNotEmpty()
  @IsISO8601()
  @IsDateString()
  startTime: string; // ISO 8601 format

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Start time in ISO 8601 format',
  })
  @IsString()
  @IsNotEmpty()
  @IsISO8601()
  @IsDateString()
  endTime: string; // ISO 8601 format

  @Expose()
  @ApiProperty({
    enum: DayOfTheWeek,
    description: 'Day of the week for the blocked time',
  })
  @IsNotEmpty()
  day: DayOfTheWeek;

  toDomain(userId: string): BlockedTime {
    const domain = plainToInstance(BlockedTime, {
      startTime: null,
      endTime: null,
      day: this.day,
      userId,
    });

    domain.startTime = DateTime.fromISO(this.startTime);
    domain.endTime = DateTime.fromISO(this.endTime);
    return domain;
  }
}
