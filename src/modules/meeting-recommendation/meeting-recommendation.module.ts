import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { MeetingRecommendationController } from './meeting-recommendation.controller';
import { MeetingRecommendationService } from './meeting-recommendation.service';

@Module({
  imports: [UserModule],
  controllers: [MeetingRecommendationController],
  providers: [MeetingRecommendationService],
  exports: [MeetingRecommendationService],
})
export class MeetingRecommendationModule {}
