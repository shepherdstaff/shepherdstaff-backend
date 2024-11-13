import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatController } from './controllers/chat.controller';
import { MeetingController } from './controllers/meeting.controller';
import { MenteeController } from './controllers/mentee.controller'; // Import MenteeController
import { CalendarModule } from './modules/calendar/calendar.module';
import { UsersModule } from './modules/users/users.module';
import { AIService } from './services/ai.service';
import { MeetingRecommendationService } from './services/meeting-recommendation.service';
import { MenteeService } from './services/mentee.service'; // Import MenteeService

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    UsersModule,
    CalendarModule,
  ],
  controllers: [ChatController, MeetingController, MenteeController],
  providers: [AIService, MeetingRecommendationService, MenteeService],
})
export class AppModule {}
