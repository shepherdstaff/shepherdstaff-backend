import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { CreateMentorDto } from '../dto/mentor.dto';
import { UserService } from '../services/user.service';

@Controller('mentor')
export class MentorController {
  constructor(private readonly userService: UserService) {}

  // TODO: Move to AuthController
  @Public()
  @Post()
  async createNewMentor(@Body() mentorDto: CreateMentorDto) {
    const { name, birthdate, email, userName, pass } = mentorDto;
    return this.userService.createNewMentor(
      name,
      new Date(birthdate),
      email,
      userName,
      pass,
    );
  }

  @Get('/:mentorId')
  async getMentor(@Param('mentorId') mentorId: string) {
    return this.userService.getMentor(mentorId);
  }
}
