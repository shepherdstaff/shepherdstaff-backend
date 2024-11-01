import { ApiProperty } from '@nestjs/swagger';

export class MessageRequestDto {
  @ApiProperty()
  content: string;

  @ApiProperty()
  context?: { mentorId: string; menteeId: string };
}

export class MessageDto {
  id: string;

  content: string;

  role: string;

  timestamp: string;
}
