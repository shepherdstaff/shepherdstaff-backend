import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarController } from './controllers/calendar.controller';
import { ChatController } from './controllers/chat.controller';
import { MeetingController } from './controllers/meeting.controller';
import { NoteController } from './controllers/note.controller';
import { AIService } from './services/ai.service';
import { CalendarSyncService } from './services/calendar-sync.service';
import { MeetingRecommendationService } from './services/meeting-recommendation.service';
import { NoteService } from './services/note.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 3306,
      username: 'postgres',
      password: '1',
      database: 'fellowship',
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [
    CalendarController,
    ChatController,
    MeetingController,
    NoteController,
  ],
  providers: [
    AIService,
    CalendarSyncService,
    MeetingRecommendationService,
    NoteService,
  ],
})
export class AppModule {}
