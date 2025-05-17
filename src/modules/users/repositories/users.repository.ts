import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEnum } from '../constants/roles';
import { Mentor } from '../domain/mentor';
import { User } from '../domain/user';
import { UserAuthEntity } from '../entities/user-auth.entity';
import { UserRelationEntity } from '../entities/user-relation.entity';
import { UserEntity } from '../entities/user.entity';

import { hashPassword } from 'src/utils/hash';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserRelationEntity)
    private userRelationRepository: Repository<UserRelationEntity>,
    @InjectRepository(UserAuthEntity)
    private userAuthRepository: Repository<UserAuthEntity>,
  ) {}

  async createUser(
    user: User,
    userName?: string,
    pass?: string,
  ): Promise<UserEntity> {
    const createdUserEntity = await this.userRepository.save(
      UserEntity.from(user),
    );

    if (userName && pass) {
      await this.createUserAuth(createdUserEntity.id, userName, pass);
    }

    return createdUserEntity;
  }

  async createUserAuth(userId: string, userName: string, pass: string) {
    const userAuthEntity = new UserAuthEntity({
      userName,
      hash: await hashPassword(pass),
      user: { id: userId },
    });
    await this.userAuthRepository.save(userAuthEntity);
  }

  // Only user info, no relations
  async findUserById(id: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ id });
  }

  async findUserAuthByUserName(userName: string): Promise<UserAuthEntity> {
    const userAuthEntity = await this.userAuthRepository.findOne({
      where: { userName },
      relations: ['user'],
    });

    return userAuthEntity;
  }

  async findUserAuthById(id: string): Promise<UserAuthEntity> {
    const userAuthEntity = await this.userAuthRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return userAuthEntity;
  }

  async updateUserAuth(
    userAuth: Partial<UserAuthEntity>,
  ): Promise<UserAuthEntity> {
    if (!userAuth.id) {
      throw new Error('UserAuthEntity ID is required for update');
    }
    return this.userAuthRepository.save(userAuth);
  }

  async findUserAuthByRefreshToken(refreshToken: string) {
    return await this.userAuthRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });
  }

  // Find user from the perspective of a mentor - populate with mentees
  async findMentorById(id: string): Promise<UserEntity> {
    const mentorEntity = await this.userRepository.findOne({
      where: { id },
      relations: { outgoingUserRelations: { toUser: true } },
    });

    return mentorEntity;
  }

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

  async findAllMentors(): Promise<Mentor[]> {
    const mentors = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.outgoingUserRelations', 'userRelation')
      .where('userRelation.fromRole = :role', { role: RoleEnum.MENTOR })
      .getMany();

    return mentors.map((user) => user.toMentor());
  }

  async getUserRelation(
    fromUserId: string,
    toUserId: string,
  ): Promise<UserRelationEntity> {
    return this.userRelationRepository.findOne({
      where: { fromUser: { id: fromUserId }, toUser: { id: toUserId } },
    });
  }
}
