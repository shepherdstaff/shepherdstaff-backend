import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferencesEntity } from './entities/preference.entity';
import { PreferencesFieldEntity } from './entities/preferences-field.entity';
import { PreferenceController } from './preference.controller';
import { PreferenceRepository } from './preference.repository';
import { PreferenceService } from './preference.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PreferencesEntity, PreferencesFieldEntity]),
  ],
  controllers: [PreferenceController],
  providers: [PreferenceService, PreferenceRepository],
})
export class PreferenceModule {}
