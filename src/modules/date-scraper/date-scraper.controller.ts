import { Controller, Get } from '@nestjs/common';
import { DateScraperService } from './date-scraper.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('date-scraper')
export class DateScraperController {
  constructor(private readonly dateScraperService: DateScraperService) {}

  @Get()
  @ApiOperation({
    summary: 'Scrape all important dates from the exam timetable PDFs',
    description:
      'This endpoint triggers the scraping of all important dates from the PDF file and saves them in DB. URLs to PDF files are currently hardcoded within the DateScraperService. To be improved on in the future.',
  })
  async processDatesFromPdf() {
    // Call the date scraper service to scrape all dates
    const scrapedDates = await this.dateScraperService.processDatesFromPdf();
    return scrapedDates;
  }

  @Get('important-dates')
  @ApiOperation({
    summary: 'Get all important dates stored in the database',
    description:
      'This endpoint retrieves all important dates that have been saved in DB.',
  })
  async getAllImportantDates() {
    const importantDates = await this.dateScraperService.getAllImportantDates();
    return importantDates;
  }
}
