import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { NotesService } from './notes.service';
import { retrieveUserInfoFromRequest } from 'src/utils/helpers';
import { NoteDto } from './dto/note.dto';
import { Request } from 'express';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('/:menteeId')
  async getNotes(@Req() req: Request, @Param('menteeId') menteeId: string) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return (await this.notesService.getNotes(userPayload.userId, menteeId)).map(
      (note) => NoteDto.from(note),
    );
  }

  @Post('/:menteeId')
  async createNote(
    @Req() req: Request,
    @Param('menteeId') menteeId: string,
    @Body() noteDto: NoteDto,
  ) {
    const userPayload = retrieveUserInfoFromRequest(req);
    await this.notesService.createNote(
      userPayload.userId,
      menteeId,
      noteDto.content,
    );
  }

  // @Patch(':mentorId/mentees/:menteeId/notes/:noteId')
  // async editNote(
  //   @Param('mentorId') mentorId: string,
  //   @Param('menteeId') menteeId: string,
  //   @Param('noteId') noteId: string,
  //   @Body() prayer: Prayer,
  // ) {
  //   return this.noteService.editNote(
  //     mentorId,
  //     menteeId,
  //     noteId,
  //     prayer.content,
  //   );
  // }

  // @Delete(':mentorId/mentees/:menteeId/notes/:noteId')
  // async deleteNote(
  //   @Param('mentorId') mentorId: string,
  //   @Param('menteeId') menteeId: string,
  //   @Param('noteId') noteId: string,
  // ) {
  //   return this.noteService.deleteNote(mentorId, menteeId, noteId);
  // }
}
