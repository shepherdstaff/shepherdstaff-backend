import { Injectable } from '@nestjs/common';
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
  // async updateNote(
  //   mentorId: string,
  //   menteeId: string,
  //   noteId: string,
  //   content: string,
  // ) {
  //   if (prayerDb[mentorId] && prayerDb[mentorId][menteeId]) {
  //     const note = prayerDb[mentorId][menteeId].find(
  //       (item) => item.id === noteId,
  //     );
  //     if (note !== null && note !== undefined) {
  //       note.content = content;
  //       return note;
  //     }
  //   }
  //   return;
  // }
  // async deleteNote(mentorId: string, menteeId: string, id: string) {
  //   const indexToRemove: number = prayerDb[mentorId][menteeId].findIndex(
  //     (note) => note.id === id,
  //   );
  //   if (indexToRemove !== -1) {
  //     prayerDb[mentorId][menteeId].splice(indexToRemove, 1);
  //   }
  //   return prayerDb[mentorId][menteeId];
  // }
  // async deleteAllNotes(mentorId: string, menteeId: string) {
  //   if (prayerDb[mentorId] && prayerDb[mentorId][menteeId])
  //     delete prayerDb[mentorId][menteeId];
  //   return prayerDb;
  // }
}
