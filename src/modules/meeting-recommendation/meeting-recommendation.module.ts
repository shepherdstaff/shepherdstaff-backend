import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarModule } from '../calendar/calendar.module';
import { UserModule } from '../users/user.module';
import { MeetingRecommendationEntity } from './entities/meeting-recommendation.entity';
import { MeetingRecommendationController } from './meeting-recommendation.controller';
import { MeetingRecommendationRepository } from './meeting-recommendation.repository';
import { MeetingRecommendationService } from './meeting-recommendation.service';
import { PreferenceModule } from '../preferences/preference.module';

@Module({
  imports: [
    UserModule,
    CalendarModule,
    TypeOrmModule.forFeature([MeetingRecommendationEntity]),
    PreferenceModule,
  ],
  controllers: [MeetingRecommendationController],
  providers: [MeetingRecommendationService, MeetingRecommendationRepository],
  exports: [MeetingRecommendationService],
})
export class MeetingRecommendationModule {}
