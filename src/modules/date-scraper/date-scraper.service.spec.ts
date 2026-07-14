import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as pdf from 'pdf-parse';
import puppeteer from 'puppeteer';
import { DateScraperService } from './date-scraper.service';
import { AiService } from 'src/modules/ai/ai.service';
import { DateScraperRepository } from './date-scraper.repository';

jest.mock('fs');
jest.mock('pdf-parse');
jest.mock('puppeteer', () => ({
  __esModule: true,
  default: { launch: jest.fn() },
}));
jest.mock('stream', () => ({
  ...jest.requireActual('stream'),
  finished: jest.fn((_stream, callback) => callback()),
}));

describe('DateScraperService', () => {
  let service: DateScraperService;
  let httpService: jest.Mocked<HttpService>;
  let aiService: jest.Mocked<AiService>;
  let dateScraperRepository: jest.Mocked<DateScraperRepository>;

  beforeEach(() => {
    httpService = {
      axiosRef: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    aiService = {
      extractFormattedDatesFromRawPdf: jest.fn(),
    } as unknown as jest.Mocked<AiService>;

    dateScraperRepository = {
      saveImportantDates: jest.fn(),
      getAllImportantDates: jest.fn(),
    } as unknown as jest.Mocked<DateScraperRepository>;

    service = new DateScraperService(
      httpService,
      aiService,
      dateScraperRepository,
    );

    (fs.createWriteStream as jest.Mock).mockReturnValue({
      on: jest.fn(),
    });
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('pdf-bytes'));
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
    (httpService.axiosRef as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: { pipe: jest.fn() } }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('splitPdfRawTextIntoPages', () => {
    it('splits raw PDF text on page-break markers and trims empty segments', () => {
      const rawText =
        '  Header info \nPage 1 of 3\nFirst page content\nPage 2 of 3\nSecond page content\nPage 3 of 3\n  ';

      const pages = (service as any).splitPdfRawTextIntoPages(rawText);

      expect(pages).toEqual([
        'Header info',
        'First page content',
        'Second page content',
      ]);
    });

    it('returns an empty array when the text is only whitespace', () => {
      const pages = (service as any).splitPdfRawTextIntoPages('   \n  ');

      expect(pages).toEqual([]);
    });
  });

  describe('getAllImportantDates', () => {
    it('returns the important dates from the repository', async () => {
      const dates = [{ name: 'Paper 1' }] as any;
      dateScraperRepository.getAllImportantDates.mockResolvedValue(dates);

      const result = await service.getAllImportantDates();

      expect(result).toBe(dates);
    });
  });

  describe('processDatesFromPdf', () => {
    beforeEach(() => {
      (pdf as unknown as jest.Mock).mockResolvedValue({
        text: 'Page 1 of 1\nSome exam schedule text',
      });
      aiService.extractFormattedDatesFromRawPdf.mockResolvedValue([
        {
          date: '2025-11-01',
          startTime: '08:00',
          endTime: '10:00',
          name: 'Paper 1',
        },
      ]);
    });

    it('downloads, parses, and extracts dates for each timetable PDF, prefixing the level', async () => {
      await service.processDatesFromPdf();

      expect(httpService.axiosRef).toHaveBeenCalledTimes(3);
      expect(httpService.axiosRef).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://file.go.gov.sg/2025-gce-o-level-exam-timetable.pdf',
          method: 'GET',
          responseType: 'stream',
        }),
      );

      expect(aiService.extractFormattedDatesFromRawPdf).toHaveBeenCalledTimes(
        3,
      );

      expect(dateScraperRepository.saveImportantDates).toHaveBeenCalledTimes(
        3,
      );
      const [savedOLevelDates] =
        dateScraperRepository.saveImportantDates.mock.calls[0];
      expect(savedOLevelDates[0]).toEqual(
        expect.objectContaining({ name: 'O Level - Paper 1' }),
      );
    });

    it('cleans up downloaded PDF files even when processing succeeds', async () => {
      await service.processDatesFromPdf();

      expect(fs.unlinkSync).toHaveBeenCalledWith('./olvl.pdf');
      expect(fs.unlinkSync).toHaveBeenCalledWith('./nlevel.pdf');
      expect(fs.unlinkSync).toHaveBeenCalledWith('./alevel.pdf');
    });

    it('propagates errors from the download step and still cleans up files', async () => {
      (httpService.axiosRef as unknown as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error('network error')),
      );

      await expect(service.processDatesFromPdf()).rejects.toThrow(
        'network error',
      );
      expect(fs.unlinkSync).toHaveBeenCalledWith('./olvl.pdf');
      expect(dateScraperRepository.saveImportantDates).not.toHaveBeenCalled();
    });
  });
});
