import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  userName: string;

  @ApiProperty()
  pass: string;
}
