import { BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { UsersRepository } from '../repositories/users.repository';
import { PreferenceService } from 'src/modules/preferences/preference.service';
import { encryptText } from 'src/utils/encrypt';
import * as generator from 'generate-password';

jest.mock('src/utils/encrypt');
jest.mock('generate-password');

describe('UserService', () => {
  let service: UserService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let preferenceService: jest.Mocked<PreferenceService>;
  const encryptTextMock = encryptText as jest.Mock;
  const generatorGenerateMock = generator.generate as jest.Mock;

  beforeEach(() => {
    usersRepository = {
      createUser: jest.fn(),
      createUserAuth: jest.fn(),
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      findUserAuthByUserName: jest.fn(),
      findUserAuthById: jest.fn(),
      updateUserAuth: jest.fn(),
      findUserAuthByRefreshToken: jest.fn(),
      findMentorById: jest.fn(),
      setMenteeForMentorUser: jest.fn(),
      findAllMentors: jest.fn(),
      getUserRelation: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    preferenceService = {} as unknown as jest.Mocked<PreferenceService>;

    service = new UserService(usersRepository, preferenceService);

    process.env.FRONTEND_URL = 'https://app.example.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNewMentee', () => {
    it('creates the mentee, links it to the mentor, and returns the domain mentee', async () => {
      const toMentee = jest.fn().mockReturnValue({ id: 'mentee-1' });
      usersRepository.createUser.mockResolvedValue({
        id: 'mentee-1',
        toMentee,
      } as any);

      const result = await service.createNewMentee(
        'mentor-1',
        'Jane',
        new Date('2010-01-01'),
        'jane@example.com',
        '12345678',
      );

      expect(usersRepository.createUser).toHaveBeenCalled();
      expect(usersRepository.setMenteeForMentorUser).toHaveBeenCalledWith(
        'mentor-1',
        'mentee-1',
      );
      expect(toMentee).toHaveBeenCalled();
      expect(result).toEqual({ id: 'mentee-1' });
    });
  });

  describe('createNewUser', () => {
    it('throws BadRequestException when the username is already taken', async () => {
      usersRepository.findUserAuthByUserName.mockResolvedValue({
        id: 'existing-auth',
      } as any);

      await expect(
        service.createNewUser(
          'Jane',
          new Date('2000-01-01'),
          'jane@example.com',
          '12345678',
          'JaneDoe',
          'password123',
        ),
      ).rejects.toThrow(BadRequestException);
      expect(usersRepository.findUserByEmail).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the email is already used', async () => {
      usersRepository.findUserAuthByUserName.mockResolvedValue(null);
      usersRepository.findUserByEmail.mockResolvedValue({
        id: 'existing-user',
      } as any);

      await expect(
        service.createNewUser(
          'Jane',
          new Date('2000-01-01'),
          'jane@example.com',
          '12345678',
          'janedoe',
          'password123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('normalizes the username and creates the user when unique', async () => {
      usersRepository.findUserAuthByUserName.mockResolvedValue(null);
      usersRepository.findUserByEmail.mockResolvedValue(null);
      usersRepository.createUser.mockResolvedValue({ id: 'user-1' } as any);

      await service.createNewUser(
        'Jane',
        new Date('2000-01-01'),
        'jane@example.com',
        '12345678',
        '  JaneDoe  ',
        'password123',
      );

      expect(usersRepository.findUserAuthByUserName).toHaveBeenCalledWith(
        'janedoe',
      );
      expect(usersRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane', email: 'jane@example.com' }),
        'janedoe',
        'password123',
      );
    });
  });

  describe('createNewMentor', () => {
    it('creates the user and returns it as a mentor', async () => {
      const toMentor = jest.fn().mockReturnValue({ id: 'mentor-1' });
      usersRepository.findUserAuthByUserName.mockResolvedValue(null);
      usersRepository.findUserByEmail.mockResolvedValue(null);
      usersRepository.createUser.mockResolvedValue({ toMentor } as any);

      const result = await service.createNewMentor(
        'John',
        new Date('1990-01-01'),
        'john@example.com',
        '12345678',
        'johndoe',
        'password123',
      );

      expect(toMentor).toHaveBeenCalled();
      expect(result).toEqual({ id: 'mentor-1' });
    });
  });

  describe('getMenteesForMentor', () => {
    it('maps the mentor outgoing relations to mentee domain objects', async () => {
      const menteeA = { toMentee: jest.fn().mockReturnValue({ id: 'a' }) };
      const menteeB = { toMentee: jest.fn().mockReturnValue({ id: 'b' }) };
      usersRepository.findMentorById.mockResolvedValue({
        outgoingUserRelations: [
          { toUser: menteeA },
          { toUser: menteeB },
        ],
      } as any);

      const result = await service.getMenteesForMentor('mentor-1');

      expect(result).toEqual([{ id: 'a' }, { id: 'b' }]);
    });
  });

  describe('getMentee', () => {
    it('returns the mentee domain object for the given user', async () => {
      const toMentee = jest.fn().mockReturnValue({ id: 'mentee-1' });
      usersRepository.findUserById.mockResolvedValue({ toMentee } as any);

      const result = await service.getMentee('mentee-1');

      expect(usersRepository.findUserById).toHaveBeenCalledWith('mentee-1');
      expect(result).toEqual({ id: 'mentee-1' });
    });
  });

  describe('generateInviteLinkForMentee', () => {
    it('generates credentials and returns an invite link when the mentee has no auth yet', async () => {
      const toMentee = jest
        .fn()
        .mockReturnValue({ id: 'mentee-1', email: 'mentee@example.com' });
      usersRepository.findUserById.mockResolvedValue({ toMentee } as any);
      usersRepository.findUserAuthById.mockResolvedValue(null);
      generatorGenerateMock.mockReturnValue('random-pass');
      encryptTextMock.mockResolvedValue('encrypted-pass');

      const result = await service.generateInviteLinkForMentee('mentee-1');

      expect(usersRepository.createUserAuth).toHaveBeenCalledWith(
        'mentee-1',
        'mentee@example.com',
        'random-pass',
      );
      expect(result).toEqual({
        url: 'https://app.example.com/invite-login?menteeId=mentee-1&username=mentee@example.com&encryptedpass=encrypted-pass',
      });
    });

    it('throws when the mentee does not exist', async () => {
      usersRepository.findUserById.mockResolvedValue(null);

      await expect(
        service.generateInviteLinkForMentee('missing-mentee'),
      ).rejects.toThrow('Mentee does not exist');
    });

    it('throws when an invite link has already been generated for the mentee', async () => {
      const toMentee = jest.fn().mockReturnValue({ id: 'mentee-1' });
      usersRepository.findUserById.mockResolvedValue({ toMentee } as any);
      usersRepository.findUserAuthById.mockResolvedValue({
        id: 'existing-auth',
      } as any);

      await expect(
        service.generateInviteLinkForMentee('mentee-1'),
      ).rejects.toThrow('Invite link already generated for this mentee');
      expect(usersRepository.createUserAuth).not.toHaveBeenCalled();
    });
  });
});
