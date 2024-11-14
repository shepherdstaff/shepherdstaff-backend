import { Inject, Injectable } from '@nestjs/common';
import { Mentor } from '../domain/mentor';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class MentorService {
  constructor(
    @Inject(UsersRepository) private usersRepository: UsersRepository,
  ) {}

  async createNewMentor(name: string, birthdate: Date, email: string) {
    const newMentor = new Mentor({ name, birthdate, email });

    return this.usersRepository.createUser(newMentor);
  }

  async getMentor(mentorId: string) {
    return this.usersRepository.findMentorById(mentorId);
  }
}
