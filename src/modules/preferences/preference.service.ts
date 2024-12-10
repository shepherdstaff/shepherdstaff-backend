import { Injectable } from '@nestjs/common';
import { Preferences } from './domain/preferences';
import { PreferenceRepository } from './preference.repository';

@Injectable()
export class PreferenceService {
  constructor(private readonly preferenceRepository: PreferenceRepository) {}

  async getGlobalPreferences(userId: string): Promise<Preferences> {
    const preferences =
      await this.preferenceRepository.getGlobalPreferences(userId);
    return preferences.toPreferences();
  }

  async getSpecificMenteePreferences(
    userId: string,
    menteeId: string,
  ): Promise<Preferences> {
    const preferences =
      await this.preferenceRepository.getSpecificMenteePreferences(
        userId,
        menteeId,
      );
    return preferences.toPreferences();
  }

  async setGlobalPreferences(
    userId: string,
    preferences: Preferences,
  ): Promise<void> {
    await this.preferenceRepository.setGlobalPreferences(userId, preferences);
  }
}
