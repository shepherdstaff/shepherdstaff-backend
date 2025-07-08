import { InjectRepository } from '@nestjs/typeorm';
import { NoteEntity } from './entities/note.entity';
import { Repository } from 'typeorm';
import { Note } from './domain/note.domain';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotesRepository {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly notesRepository: Repository<NoteEntity>,
  ) {}

  async createNote(
    mentorId: string,
    menteeId: string,
    note: Note,
  ): Promise<void> {
    const noteEntity = NoteEntity.fromNote(note, mentorId, menteeId);
    noteEntity.createdAt = new Date();
    noteEntity.updatedAt = new Date();
    await this.notesRepository.save(noteEntity);
  }

  async getNotes(mentorId: string, menteeId: string): Promise<Note[]> {
    const notes = await this.notesRepository.find({
      where: {
        fromUser: { id: mentorId },
        toUser: { id: menteeId },
      },
    });
    return notes.map((noteEntity) => noteEntity.toDomain());
  }
}
