// controllers/mentee.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NoteService } from 'src/modules/users/services/note.service';
import { CreateMenteeDto } from '../dto/mentee.dto';
import { UserService } from '../services/user.service';

@Controller('mentee')
export class MenteeController {
  constructor(
    private readonly userService: UserService,
    private readonly noteService: NoteService,
  ) {}

  @Post('/:mentorId')
  async addNewMentee(
    @Param('mentorId') mentorId: string,
    @Body() menteeData: CreateMenteeDto,
  ) {
    return this.userService.createNewMentee(
      mentorId,
      menteeData.name,
      new Date(menteeData.birthdate),
      menteeData.email,
    );
  }

  @Get('generate-invite-link/:menteeId')
  async generateInviteLinkForMentee(@Param('menteeId') menteeId: string) {
    return this.userService.generateInviteLinkForMentee(menteeId);
  }

  @Get('list/:mentorId/')
  async listAllMentees(@Param('mentorId') mentorId: string) {
    return this.userService.getMenteesForMentor(mentorId);
  }
}
