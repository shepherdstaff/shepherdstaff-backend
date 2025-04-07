import { Injectable } from '@nestjs/common';
import { Preferences } from './domain/preferences';
import { PreferenceRepository } from './preference.repository';
import { PreferenceFieldName } from './constants/preference-field-names.enum';
import { DEFAULT_PREFERENCES } from './constants/default-preferences';

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

  async getSpecificGlobalPreferenceField(
    userId: string,
    preferenceName: PreferenceFieldName,
  ): Promise<string | boolean | number> {
    const preferences = (
      await this.preferenceRepository.getGlobalPreferences(userId)
    ).toPreferences();
    return (
      preferences.fields[preferenceName] ?? DEFAULT_PREFERENCES[preferenceName]
    );
  }

  async getSpecificMenteePreferenceField(
    userId: string,
    menteeId: string,
    preferenceName: PreferenceFieldName,
  ): Promise<string | boolean | number> {
    const preferences = (
      await this.preferenceRepository.getSpecificMenteePreferences(
        userId,
        menteeId,
      )
    ).toPreferences();
    return (
      preferences.fields[preferenceName] ?? DEFAULT_PREFERENCES[preferenceName]
    );
  }
}
