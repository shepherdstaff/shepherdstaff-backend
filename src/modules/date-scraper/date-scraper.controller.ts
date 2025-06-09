import { Controller, Get } from '@nestjs/common';
import { DateScraperService } from './date-scraper.service';

@Controller('date-scraper')
export class DateScraperController {
  constructor(private readonly dateScraperService: DateScraperService) {}

  @Get()
  async scrapeAllDates() {
    // Call the date scraper service to scrape all dates
    const scrapedDates = await this.dateScraperService.processDatesFromPdf();
    return scrapedDates;
  }
}
