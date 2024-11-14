import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { CreateMentorDto } from '../dto/mentor.dto';
import { MentorService } from '../services/mentor.service';

@Controller('mentor')
export class MentorController {
  constructor(
    @Inject(MentorService) private readonly mentorService: MentorService,
  ) {}

  @Post()
  async createNewMentor(@Body() mentorDto: CreateMentorDto) {
    const { name, birthdate, email } = mentorDto;
    return this.mentorService.createNewMentor(name, new Date(birthdate), email);
  }

  @Get()
  async getMentor(@Param('mentorId') mentorId: string) {
    return this.mentorService.getMentor(mentorId);
  }
}
