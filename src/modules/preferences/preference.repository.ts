import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreferencesEntity } from './entities/preference.entity';

@Injectable()
export class PreferenceRepository {
  constructor(
    @InjectRepository(PreferencesEntity)
    private preferenceRepository: Repository<PreferencesEntity>,
  ) {}

  async getGlobalPreferences(userId: string) {
    return this.preferenceRepository.findOne({
      where: {
        user: { id: userId },
      },
    });
  }

  async getSpecificMenteePreferences(userId: string, menteeId: string) {
    return this.preferenceRepository.findOne({
      where: {
        user: { id: userId },
        preferencesForUser: { id: menteeId },
      },
    });
  }

  async setGlobalPreferences(userId: string, preferences: any) {
    return this.preferenceRepository.save({
      user: { id: userId },
      preferences,
    });
  }
}
