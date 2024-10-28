import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note, NoteType } from '../entities/note.entity';
import { Mentee } from '../entities/mentee.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(Mentee)
    private menteeRepository: Repository<Mentee>,
  ) {}

  async create(menteeId: string, data: { content: string; type: NoteType }) {
    const mentee = await this.menteeRepository.findOne({ where: { id: menteeId } });
    const note = this.noteRepository.create({
      ...data,
      mentee,
    });
    return this.noteRepository.save(note);
  }

  async toggleAnswered(id: string) {
    const note = await this.noteRepository.findOne({ where: { id } });
    note.isAnswered = !note.isAnswered;
    return this.noteRepository.save(note);
  }

  async delete(id: string) {
    return this.noteRepository.delete(id);
  }
}