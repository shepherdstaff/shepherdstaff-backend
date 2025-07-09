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
  ): Promise<Partial<Note>> {
    const noteEntity = NoteEntity.fromNote(note, mentorId, menteeId);
    noteEntity.createdAt = new Date();
    noteEntity.updatedAt = new Date();
    const response = await this.notesRepository.save(noteEntity);
    return {
      id: response.id,
    };
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

  async updateNote(noteId: string, newContent: string): Promise<void> {
    await this.notesRepository.update(noteId, {
      content: newContent,
      updatedAt: new Date(),
    });
  }

  async findNoteById(noteId: string): Promise<NoteEntity> {
    const noteEntity = await this.notesRepository.findOne({
      where: { id: noteId },
      relations: ['fromUser', 'toUser'],
    });
    return noteEntity;
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.notesRepository.delete(noteId);
  }
}
