import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import * as pdf from 'pdf-parse';
import { AiService } from 'src/modules/ai/ai.service';
import { DateScraperRepository } from './date-scraper.repository';
import { ImportantDate } from './domain/important-date.domain';
import { DateTime } from 'luxon';

const oLevelPdfUrl =
  'https://file.go.gov.sg/2025-gce-o-level-exam-timetable.pdf';
const oLevelPdfDest = './olvl.pdf';

const nLevelPdfUrl =
  'https://file.go.gov.sg/2025-gce-na-nt-level-exam-timetable.pdf';
const nLevelPdfDest = './nlevel.pdf';

const aLevelPdfUrl =
  'https://file.go.gov.sg/2025-gce-a-level-exam-timetable.pdf';
const aLevelPdfDest = './alevel.pdf';

const pdfs = [
  { pdfDest: oLevelPdfDest, pdfUrl: oLevelPdfUrl, prefix: 'O Level - ' },
  { pdfDest: nLevelPdfDest, pdfUrl: nLevelPdfUrl, prefix: 'N Level - ' },
  { pdfDest: aLevelPdfDest, pdfUrl: aLevelPdfUrl, prefix: 'A Level - ' },
];

@Injectable()
export class DateScraperService {
  constructor(
    private readonly httpService: HttpService,
    private readonly aiService: AiService,
    private readonly dateScraperRepository: DateScraperRepository,
  ) {}

  async scrapeAllDates(): Promise<any> {
    // Implement the logic to scrape all dates from the calendar
    // This is a placeholder implementation
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.sp.edu.sg/student-services/academic-calendar');

    return [
      { date: '2023-10-01', event: 'Event 1' },
      { date: '2023-10-02', event: 'Event 2' },
    ];
  }

  async processDatesFromPdf(): Promise<any> {
    try {
      for (const { pdfDest, pdfUrl, prefix } of pdfs) {
        // Fetch PDF
        const writer = fs.createWriteStream(pdfDest);

        const finished = promisify(stream.finished);

        const response = await this.httpService
          .axiosRef({
            url: pdfUrl,
            method: 'GET',
            responseType: 'stream',
          })
          .then((response) => {
            response.data.pipe(writer);
            return finished(writer);
          })
          .catch((error) => {
            console.error('Error downloading file:', error);
            throw error;
          });

        // Parse PDF
        const dataBuffer = fs.readFileSync(pdfDest);
        const pdfData = await pdf(dataBuffer);
        const pdfPages = this.splitPdfRawTextIntoPages(pdfData.text);

        // Feed into AI to extract dates
        let currentBatchOfPages: string[] = [];
        const maxBatchSize = 5;
        const scrapedDates = [];
        Logger.log(
          `Processing ${pdfPages.length} pages from the PDF document at ${pdfDest}.`,
          'DateScraperService',
        );
        for (const page of pdfPages) {
          currentBatchOfPages.push(page);
          if (currentBatchOfPages.length >= maxBatchSize) {
            await this.extractDatesFromPdfPages(
              currentBatchOfPages,
              scrapedDates,
              prefix,
            );
            currentBatchOfPages = [];
          }
        }
        if (currentBatchOfPages.length > 0) {
          await this.extractDatesFromPdfPages(
            currentBatchOfPages,
            scrapedDates,
            prefix,
          );
        }

        // Save scraped dates to DB
        Logger.log(
          `Saving ${scrapedDates.length} scraped dates to the database.`,
          'DateScraperService',
        );
        await this.dateScraperRepository.saveImportantDates(scrapedDates);
      }
    } catch (error) {
      Logger.error('Error processing dates from examination PDFs:', error);
      throw error;
    } finally {
      // Clean up the downloaded PDF files
      for (const { pdfDest } of pdfs) {
        if (fs.existsSync(pdfDest)) {
          fs.unlinkSync(pdfDest);
        }
      }
    }
  }

  private splitPdfRawTextIntoPages(rawPdfText: string): string[] {
    // Split the raw PDF text into pages based on the page break pattern
    const pageBreakPattern = /Page \d+ of \d+/g;
    const pages = rawPdfText.split(pageBreakPattern);
    return pages.map((page) => page.trim()).filter((page) => page.length > 0);
  }

  private async extractDatesFromPdfPages(
    batchOfPages: string[],
    existingDates: ImportantDate[],
    prefix: string,
  ): Promise<ImportantDate[]> {
    // Call AI service to extract dates from the batch of pages
    const extractedDates = (
      await this.aiService.extractFormattedDatesFromRawPdf(batchOfPages.join())
    ).map((d) => ({
      ...d,
      date: DateTime.fromISO(d.date),
      name: prefix + d.name,
    }));

    existingDates.push(...extractedDates);
    return existingDates;
  }
}
