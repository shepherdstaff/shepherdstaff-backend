import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './domain/user';
import { UserRelationEntity } from './entities/user-relation.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserRelationEntity)
    private userRelationRepository: Repository<UserRelationEntity>,
  ) {}

  async createUser(user: User): Promise<UserEntity> {
    return this.userRepository.save(UserEntity.from(user));
  }

  async findUserById(id: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ id });
  }
}
