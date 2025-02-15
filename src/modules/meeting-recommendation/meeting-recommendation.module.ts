import { Module } from '@nestjs/common';
import { MeetingRecommendationController } from './meeting-recommendation.controller';
import { MeetingRecommendationService } from './meeting-recommendation.service';

@Module({
  controllers: [MeetingRecommendationController],
  providers: [MeetingRecommendationService],
  exports: [MeetingRecommendationService],
})
export class MeetingRecommendationModule {}
