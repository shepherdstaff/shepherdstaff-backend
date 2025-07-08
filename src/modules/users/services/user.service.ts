// services/mentee.service.ts
import { Injectable } from '@nestjs/common';
import { PreferenceService } from 'src/modules/preferences/preference.service';
import { menteeDb } from '../../../hacked-database';
import { Mentee } from '../domain/mentee';
import { UsersRepository } from '../repositories/users.repository';
import { UserAuthEntity } from '../entities/user-auth.entity';
import { User } from '../domain/user';
import * as generator from 'generate-password';
import { encryptText } from 'src/utils/encrypt';

@Injectable()
export class UserService {
  constructor(
    private usersRepository: UsersRepository,
    private preferenceService: PreferenceService,
  ) {}

  async createNewMentee(
    mentorId: string,
    name: string,
    birthdate: Date,
    email: string,
  ) {
    const newMentee = new Mentee({ name, birthdate, email });

    const createdMenteeEntity =
      await this.usersRepository.createUser(newMentee);
    newMentee.id = createdMenteeEntity.id;

    await this.usersRepository.setMenteeForMentorUser(
      mentorId,
      createdMenteeEntity.id,
    );

    return createdMenteeEntity.toMentee();
  }

  generateNewMenteeId(): string {
    const newIndex = Object.keys(menteeDb).length + 1;
    return 'mentee-' + newIndex;
  }

  async createNewUser(
    name: string,
    birthdate: Date,
    email: string,
    phoneNumber: string,
    userName: string,
    pass: string,
  ) {
    const newUser = new User({ name, birthdate, email, phoneNumber });

    return await this.usersRepository.createUser(newUser, userName, pass);
  }

  async createNewMentor(
    name: string,
    birthdate: Date,
    email: string,
    phoneNumber: string,
    userName: string,
    pass: string,
  ) {
    // TODO: seed default preferences for mentor

    return (
      await this.createNewUser(
        name,
        birthdate,
        email,
        phoneNumber,
        userName,
        pass,
      )
    ).toMentor();
  }

  async getMentor(mentorId: string) {
    return this.usersRepository.findMentorById(mentorId);
  }

  async getUserAuthByUsername(userName: string) {
    return this.usersRepository.findUserAuthByUserName(userName);
  }

  async getUserAuthById(id: string) {
    return this.usersRepository.findUserAuthById(id);
  }

  async updateUserAuth(userAuth: Partial<UserAuthEntity>) {
    return this.usersRepository.updateUserAuth(userAuth);
  }

  async getAllMentors() {
    return this.usersRepository.findAllMentors();
  }

  async getMenteesForMentor(mentorId: string): Promise<Mentee[]> {
    const mentor = await this.getMentor(mentorId);
    return mentor.outgoingUserRelations.map((relation) =>
      relation.toUser.toMentee(),
    );
  }

  async getMentee(menteeId: string): Promise<Mentee> {
    const user = await this.usersRepository.findUserById(menteeId);
    return user.toMentee();
  }

  async getUserRelation(fromUserId: string, toUserId: string) {
    return this.usersRepository.getUserRelation(fromUserId, toUserId);
  }

  async getUserAuthByRefreshToken(refreshToken: string) {
    return this.usersRepository.findUserAuthByRefreshToken(refreshToken);
  }

  async generateInviteLinkForMentee(menteeId: string) {
    try {
      // Verify that mentee exists
      const mentee = (
        await this.usersRepository.findUserById(menteeId)
      )?.toMentee();

      if (!mentee) {
        throw new Error('Mentee does not exist');
      }

      // Verify that mentee is not already invited (i.e. no credentials)
      const menteeAuth = await this.usersRepository.findUserAuthById(menteeId);
      if (menteeAuth) {
        throw new Error('Invite link already generated for this mentee');
      }

      // Generate and save credentials for mentee
      const { userName, pass } = this.generateMenteeCredentials(mentee);
      await this.usersRepository.createUserAuth(menteeId, userName, pass);

      // Pass menteeId, credentials into invite link
      return await this.generateMenteeInviteLink(mentee.id, userName, pass);
    } catch (error) {
      throw new Error(
        'Error generating invite link for mentee: ' + error.message,
      );
    }
  }

  private generateMenteeCredentials(mentee: Mentee) {
    // Generate credentials for mentee
    const userName = mentee.email;
    const pass = generator.generate({ length: 10, numbers: true });

    return { userName, pass };
  }

  private async generateMenteeInviteLink(
    menteeId: string,
    username: string,
    pass: string,
  ) {
    const encryptedPass = await encryptText(pass);

    return {
      url: `${process.env.FRONTEND_URL}/invite-login?menteeId=${menteeId}&username=${username}&encryptedpass=${encryptedPass}`,
    };
  }
}
