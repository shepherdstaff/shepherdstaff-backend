import { Controller } from '@nestjs/common';
import { NotesService } from './notes.service';

@Controller()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // @Get(':mentorId/mentees/:menteeId/notes')
  // async getNotes(
  //   @Param('mentorId') mentorId: string,
  //   @Param('menteeId') menteeId: string,
  // ) {
  //   return this.noteService.getNotes(mentorId, menteeId);
  // }

  // @Post(':mentorId/mentees/:menteeId/notes')
  // async createNote(
  //   @Param('mentorId') mentorId: string,
  //   @Param('menteeId') menteeId: string,
  //   @Body() prayer: Prayer,
  // ) {
  //   return this.noteService.createNote(mentorId, menteeId, prayer.content);
  // }

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
