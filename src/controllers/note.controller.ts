import { Controller, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { NoteService } from '../services/note.service';
import { NoteType } from '../entities/note.entity';

@Controller('api')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post('mentees/:menteeId/notes')
  async createNote(
    @Param('menteeId') menteeId: string,
    @Body() data: { content: string; type: NoteType }
  ) {
    return this.noteService.create(menteeId, data);
  }

  @Patch('notes/:id/toggle-answered')
  async toggleAnswered(@Param('id') id: string) {
    return this.noteService.toggleAnswered(id);
  }

  @Delete('notes/:id')
  async deleteNote(@Param('id') id: string) {
    return this.noteService.delete(id);
  }
}