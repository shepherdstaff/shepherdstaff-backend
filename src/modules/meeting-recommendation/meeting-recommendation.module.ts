import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../calendar/entities/event.entity';
import { MeetingRecommendationController } from './meeting-recommendation.controller';
import { MeetingRecommendationService } from './meeting-recommendation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity]),
  ],
  controllers: [MeetingRecommendationController],
  providers: [MeetingRecommendationService],
  exports: [MeetingRecommendationService],
})
export class MeetingRecommendationModule {}



