import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PreferenceModule } from '../preferences/preference.module';
import { UserModule } from '../users/user.module';
import { SeederController } from './seeder.controller';

@Module({
  imports: [UserModule, PreferenceModule, ConfigModule],
  controllers: [SeederController],
})
export class SeederModule {}
