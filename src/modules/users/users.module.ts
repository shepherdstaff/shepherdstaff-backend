import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRelationEntity } from './entities/user-relation.entity';
import { UserEntity } from './entities/user.entity';
import { MenteeController } from './mentee.controller';
import { MenteeService } from './mentee.service';
import { MentorController } from './mentor.controller';
import { MentorService } from './mentor.service';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRelationEntity])],
  controllers: [NoteController, MenteeController, MentorController],
  providers: [NoteService, MenteeService, MentorService, UsersRepository],
  exports: [NoteService],
})
export class UsersModule {}
