// controllers/mentee.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NoteService } from 'src/modules/notes/notes.service';
import { CreateMenteeDto } from '../dto/mentee.dto';
import { UserService } from '../services/user.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('mentee')
export class MenteeController {
  constructor(
    private readonly userService: UserService,
    private readonly noteService: NoteService,
  ) {}

  @Post('/:mentorId')
  @ApiOperation({
    summary:
      'Create a new mentee user (no credentials) and add it as a new mentee for a mentor',
  })
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

  @Post('generate-invite-link/:menteeId')
  @ApiOperation({
    summary: 'Generate sign-up invite link (and credentials) for mentee user',
  })
  async generateInviteLinkForMentee(@Param('menteeId') menteeId: string) {
    return this.userService.generateInviteLinkForMentee(menteeId);
  }

  @Get('list/:mentorId/')
  @ApiOperation({ summary: 'Get all mentees for a mentor' })
  async listAllMentees(@Param('mentorId') mentorId: string) {
    return this.userService.getMenteesForMentor(mentorId);
  }

  @Get('/:menteeId')
  @ApiOperation({ summary: 'Get mentee by ID' })
  async getMentee(@Param('menteeId') menteeId: string) {
    return this.userService.getMentee(menteeId);
  }
}
