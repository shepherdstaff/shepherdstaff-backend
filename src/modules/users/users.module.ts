import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenteeController } from './controllers/mentee.controller';
import { MentorController } from './controllers/mentor.controller';
import { NoteController } from './controllers/note.controller';
import { UserRelationEntity } from './entities/user-relation.entity';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { MenteeService } from './services/mentee.service';
import { MentorService } from './services/mentor.service';
import { NoteService } from './services/note.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRelationEntity])],
  controllers: [NoteController, MenteeController, MentorController],
  providers: [NoteService, MenteeService, MentorService, UsersRepository],
  exports: [NoteService],
})
export class UsersModule {}
