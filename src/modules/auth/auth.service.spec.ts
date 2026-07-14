import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../users/services/user.service';
import { compareInputPasswordWithHash } from 'src/utils/hash';

jest.mock('src/utils/hash');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  const compareInputPasswordWithHashMock =
    compareInputPasswordWithHash as jest.Mock;

  beforeEach(() => {
    userService = {
      createNewUser: jest.fn(),
      getUserAuthByUsername: jest.fn(),
      getUserAuthById: jest.fn(),
      updateUserAuth: jest.fn(),
      getUserAuthByRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    jwtService = {
      signAsync: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    service = new AuthService(userService, jwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('creates the user and returns freshly issued access and refresh tokens', async () => {
      userService.createNewUser.mockResolvedValue({ id: 'user-1' } as any);
      jwtService.signAsync.mockResolvedValue('access-token');
      jwtService.sign.mockReturnValue('refresh-token');
      userService.getUserAuthById.mockResolvedValue({
        id: 'auth-1',
      } as any);

      const result = await service.signUp(
        {
          name: 'Jane',
          birthdate: new Date('2000-01-01'),
          email: 'jane@example.com',
          phoneNumber: '12345678',
        } as any,
        'janedoe',
        'password123',
      );

      expect(userService.createNewUser).toHaveBeenCalledWith(
        'Jane',
        new Date('2000-01-01'),
        'jane@example.com',
        '12345678',
        'janedoe',
        'password123',
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        userId: 'user-1',
        username: 'janedoe',
      });
      expect(userService.updateUserAuth).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'auth-1', refreshToken: 'refresh-token' }),
      );
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
    });
  });

  describe('signIn', () => {
    it('returns null tokens when no user auth exists for the username', async () => {
      userService.getUserAuthByUsername.mockResolvedValue(null);

      const result = await service.signIn('unknown', 'password123');

      expect(result).toEqual({ access_token: null, refresh_token: null });
      expect(compareInputPasswordWithHashMock).not.toHaveBeenCalled();
    });

    it('returns null tokens when the password does not match the stored hash', async () => {
      userService.getUserAuthByUsername.mockResolvedValue({
        id: 'auth-1',
        hash: 'stored-hash',
        user: { id: 'user-1' },
      } as any);
      compareInputPasswordWithHashMock.mockResolvedValue(false);

      const result = await service.signIn('janedoe', 'wrong-password');

      expect(result).toEqual({ access_token: null, refresh_token: null });
    });

    it('returns access and refresh tokens when credentials are valid', async () => {
      userService.getUserAuthByUsername.mockResolvedValue({
        id: 'auth-1',
        hash: 'stored-hash',
        user: { id: 'user-1' },
      } as any);
      compareInputPasswordWithHashMock.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('access-token');
      jwtService.sign.mockReturnValue('refresh-token');
      userService.getUserAuthById.mockResolvedValue({ id: 'auth-1' } as any);

      const result = await service.signIn('janedoe', 'password123');

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        userId: 'user-1',
        username: 'janedoe',
      });
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('issues a new access token while reusing the same refresh token when it is still valid', async () => {
      jwtService.verify.mockReturnValue({ userId: 'user-1' } as any);
      userService.getUserAuthByRefreshToken.mockResolvedValue({
        userName: 'janedoe',
        user: { id: 'user-1' },
      } as any);
      jwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refreshAccessToken('old-refresh-token');

      expect(jwtService.verify).toHaveBeenCalledWith('old-refresh-token');
      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'old-refresh-token',
      });
    });

    it('throws UnauthorizedException when the refresh token is invalid or expired', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        service.refreshAccessToken('expired-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
