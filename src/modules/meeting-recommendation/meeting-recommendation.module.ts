import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MeetingRecommendationService } from './meeting-recommendation.service';
import { MeetingRecommendationController } from './meeting-recommendation.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MeetingRecommendationController],
  providers: [MeetingRecommendationService],
})
export class MeetingRecommendation {}