import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note, NoteType } from '../entities/note.entity';
import { Mentee } from '../entities/mentee.entity';
import { prayerDb } from 'src/hacked-database';
import { Prayer } from 'src/interfaces/notes';
import { randomUUID } from 'crypto';

@Injectable()
export class NoteService {

  async getNotes(mentorId: string, menteeId: string): Promise<Prayer[]> {
    return prayerDb[mentorId][menteeId];
  }

  async createNote(mentorId: string, menteeId: string, content: string) {
    prayerDb[mentorId][menteeId].push(
      new Prayer( content, new Date())
    );
    return prayerDb[mentorId][menteeId];
  }

  async editNote(mentorId: string, menteeId: string, noteId: string, content: string) {
    const note = prayerDb[mentorId][menteeId].find(item => (item.id === noteId));
    note.content = content;
    return note;
  }

  // async toggleAnswered(id: string) {
  //   const note = await this.noteRepository.findOne({ where: { id } });
  //   note.isAnswered = !note.isAnswered;
  //   return this.noteRepository.save(note);
  // }

  async deleteNote(mentorId: string, menteeId: string, id: string) {
    const indexToRemove: number = prayerDb[mentorId][menteeId].findIndex( note => note.id === id );
    if (indexToRemove !== -1) {
      prayerDb[mentorId][menteeId].splice(indexToRemove,1)
    }
    return prayerDb[mentorId][menteeId];
  }
}