import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferenceModule } from '../preferences/preference.module';
import { MenteeController } from './controllers/mentee.controller';
import { MentorController } from './controllers/mentor.controller';
import { NoteController } from '../notes/notes.controller';
import { UserAuthEntity } from './entities/user-auth.entity';
import { UserRelationEntity } from './entities/user-relation.entity';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { NoteService } from '../notes/notes.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserRelationEntity, UserAuthEntity]),
    PreferenceModule,
  ],
  controllers: [NoteController, MenteeController, MentorController],
  providers: [NoteService, UserService, UsersRepository],
  exports: [NoteService, UserService],
})
export class UserModule {}
