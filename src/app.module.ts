import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CalendarController } from './controllers/calendar.controller';
import { ChatController } from './controllers/chat.controller';
import { MeetingController } from './controllers/meeting.controller';
import { AIService } from './services/ai.service';
import { CalendarSyncService } from './services/calendar-sync.service';
import { MeetingRecommendationService } from './services/meeting-recommendation.service';
import { NoteService } from './services/note.service';
import { NoteController } from './controllers/note.controller';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [
    CalendarController,
    ChatController,
    MeetingController,
    NoteController
  ],
  providers: [
    AIService,
    CalendarSyncService,
    MeetingRecommendationService,
    NoteService
  ],
})
export class AppModule {}
