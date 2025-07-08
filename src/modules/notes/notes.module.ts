import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteEntity } from './entities/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoteEntity])],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
  exports: [NotesService],
})
export class NotesModule {}
