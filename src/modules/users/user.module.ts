import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferenceModule } from '../preferences/preference.module';
import { MenteeController } from './controllers/mentee.controller';
import { MentorController } from './controllers/mentor.controller';
import { UserAuthEntity } from './entities/user-auth.entity';
import { UserRelationEntity } from './entities/user-relation.entity';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { UserService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserRelationEntity, UserAuthEntity]),
    PreferenceModule,
  ],
  controllers: [MenteeController, MentorController],
  providers: [UserService, UsersRepository],
  exports: [UserService],
})
export class UserModule {}
