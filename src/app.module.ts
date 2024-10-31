import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CalendarController } from './controllers/calendar.controller';
import { ChatController } from './controllers/chat.controller';
import { MeetingController } from './controllers/meeting.controller';
import { MenteeController } from './controllers/mentee.controller'; // Import MenteeController
import { AIService } from './services/ai.service';
import { CalendarSyncService } from './services/calendar-sync.service';
import { MeetingRecommendationService } from './services/meeting-recommendation.service';
import { MenteeService } from './services/mentee.service'; // Import MenteeService


@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [
    CalendarController,
    ChatController,
    MeetingController,
    MenteeController
    // NoteController,
  ],
  providers: [
    AIService,
    CalendarSyncService,
    MeetingRecommendationService,
    MenteeService,
    // NoteService,
  ],
})
export class AppModule {}
