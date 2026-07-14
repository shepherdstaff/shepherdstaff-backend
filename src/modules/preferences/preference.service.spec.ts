import { PreferenceService } from './preference.service';
import { PreferenceRepository } from './preference.repository';
import { Preferences } from './domain/preferences';

describe('PreferenceService', () => {
  let service: PreferenceService;
  let preferenceRepository: jest.Mocked<PreferenceRepository>;

  beforeEach(() => {
    preferenceRepository = {
      getGlobalPreferences: jest.fn(),
      getSpecificMenteePreferences: jest.fn(),
      setGlobalPreferences: jest.fn(),
    } as unknown as jest.Mocked<PreferenceRepository>;

    service = new PreferenceService(preferenceRepository);
  });

  describe('getGlobalPreferences', () => {
    it('returns the domain object produced by the stored preferences entity', async () => {
      const preferences = new Preferences({ fields: { theme: 'dark' } });
      const entity = { toPreferences: jest.fn().mockReturnValue(preferences) };
      preferenceRepository.getGlobalPreferences.mockResolvedValue(
        entity as any,
      );

      const result = await service.getGlobalPreferences('user-1');

      expect(preferenceRepository.getGlobalPreferences).toHaveBeenCalledWith(
        'user-1',
      );
      expect(entity.toPreferences).toHaveBeenCalled();
      expect(result).toBe(preferences);
    });
  });

  describe('getSpecificMenteePreferences', () => {
    it('returns the domain object for the mentor-mentee pair', async () => {
      const preferences = new Preferences({ fields: { frequency: 'weekly' } });
      const entity = { toPreferences: jest.fn().mockReturnValue(preferences) };
      preferenceRepository.getSpecificMenteePreferences.mockResolvedValue(
        entity as any,
      );

      const result = await service.getSpecificMenteePreferences(
        'mentor-1',
        'mentee-1',
      );

      expect(
        preferenceRepository.getSpecificMenteePreferences,
      ).toHaveBeenCalledWith('mentor-1', 'mentee-1');
      expect(result).toBe(preferences);
    });
  });

  describe('setGlobalPreferences', () => {
    it('delegates to the repository with the user id and preferences', async () => {
      const preferences = new Preferences({ fields: { theme: 'light' } });

      await service.setGlobalPreferences('user-1', preferences);

      expect(preferenceRepository.setGlobalPreferences).toHaveBeenCalledWith(
        'user-1',
        preferences,
      );
    });
  });
});
