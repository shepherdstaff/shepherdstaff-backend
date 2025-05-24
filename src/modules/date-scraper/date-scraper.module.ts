import { Module } from '@nestjs/common';
import { DateScraperService } from './date-scraper.service';
import { DateScraperController } from './date-scraper.controller';
import { HttpModule } from '@nestjs/axios';
import { AiModule } from '../ai/ai.module';
import { ImportantDateEntity } from './entities/important-date.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DateScraperRepository } from './date-scraper.repository';

@Module({
  imports: [
    HttpModule,
    AiModule,
    TypeOrmModule.forFeature([ImportantDateEntity]),
  ],
  controllers: [DateScraperController],
  providers: [DateScraperService, DateScraperRepository],
  exports: [DateScraperService],
})
export class DateScraperModule {}
