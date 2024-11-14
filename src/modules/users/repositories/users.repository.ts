import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEnum } from '../constants/roles';
import { User } from '../domain/user';
import { UserRelationEntity } from '../entities/user-relation.entity';
import { UserEntity } from '../entities/user.entity';

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

  // Only user info, no relations
  async findUserById(id: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ id });
  }

  // Find user from the perspective of a mentor - populate with mentees
  async findMentorById(id: string): Promise<UserEntity> {
    const mentorEntity = await this.userRepository.find({
      where: { id },
      relations: {
        outgoingUserRelations: {
          toUser: true,
        },
      },
    });

    return mentorEntity[0];
  }

  // async findUserMentees(id: string): Promise<UserEntity[]> {}

  // async findUserMentors(id: string): Promise<UserEntity[]> {}

  async setMenteeForMentorUser(mentorId: string, menteeId: string) {
    const mentor = await this.userRepository.findOneBy({ id: mentorId });
    const mentee = await this.userRepository.findOneBy({ id: menteeId });

    const userRelation = new UserRelationEntity({
      fromUser: mentor,
      toUser: mentee,
      fromRole: RoleEnum.MENTOR,
      toRole: RoleEnum.MENTEE,
    });

    return this.userRelationRepository.save(userRelation);
  }
}
