import { BaseUserDto } from './user.dto';

export class CreateMenteeDto extends BaseUserDto {}

export class MenteeDto extends BaseUserDto {
  id: string;
  mentorId: string;
}
