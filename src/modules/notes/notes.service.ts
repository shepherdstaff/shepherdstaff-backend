import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Note } from './domain/note.domain';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  async getNotes(mentorId: string, menteeId: string): Promise<Note[]> {
    return await this.notesRepository.getNotes(mentorId, menteeId);
  }

  async createNote(mentorId: string, menteeId: string, content: string) {
    const note = plainToInstance(Note, {
      content: content,
      createdAt: null, // Will be set by the repository
      updatedAt: null, // Will be set by the repository
    });

    return await this.notesRepository.createNote(mentorId, menteeId, note);
  }

  async updateNote(
    mentorId: string,
    menteeId: string,
    noteId: string,
    newContent: string,
  ) {
    await this.assertValidNote(mentorId, menteeId, noteId);
    await this.notesRepository.updateNote(noteId, newContent);
  }

  async deleteNote(mentorId: string, menteeId: string, noteId: string) {
    await this.assertValidNote(mentorId, menteeId, noteId);
    await this.notesRepository.deleteNote(noteId);
  }

  private async assertValidNote(
    mentorId: string,
    menteeId: string,
    noteId: string,
  ) {
    const note = await this.notesRepository.findNoteById(noteId);
    if (!note) {
      throw new BadRequestException('Note not found');
    }

    if (note.fromUser.id !== mentorId || note.toUser.id !== menteeId) {
      throw new BadRequestException(
        'You do not have permission to edit this note',
      );
    }
  }
}
