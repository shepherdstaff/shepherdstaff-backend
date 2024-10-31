import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { NoteService } from '../services/note.service';
import { NoteType } from '../entities/note.entity';
import { Prayer } from 'src/interfaces/notes';

@Controller('api')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get(':mentorId/mentees/:menteeId/notes')
  async getNotes(
    @Param('mentorId') mentorId: string,
    @Param('menteeId') menteeId: string,
  ){
    return this.noteService.getNotes(mentorId, menteeId);
  }

  @Post(':mentorId/mentees/:menteeId/notes')
  async createNote(
    @Param('mentorId') mentorId: string,
    @Param('menteeId') menteeId: string,
    @Body() prayer: Prayer
  ) {
    return this.noteService.createNote(mentorId, menteeId, prayer.content);
  }

  @Patch(':mentorId/mentees/:menteeId/notes/:noteId')
  async editNote(
    @Param('mentorId') mentorId: string,
    @Param('menteeId') menteeId: string,
    @Param('noteId') noteId: string,
    @Body() prayer: Prayer
  ) {
    return this.noteService.editNote(mentorId, menteeId, noteId, prayer.content);
  }

  @Delete(':mentorId/mentees/:menteeId/notes/:noteId')
  async deleteNote(
    @Param('mentorId') mentorId: string,
    @Param('menteeId') menteeId: string,
    @Param('noteId') noteId: string
  ) {
    return this.noteService.deleteNote(mentorId, menteeId, noteId);
  }
}