import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';

export class TestNotificationRequestDto {
  @ApiProperty()
  @Expose()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @Expose()
  @IsString()
  title: string;

  @ApiProperty()
  @Expose()
  @IsString()
  message: string;
}
