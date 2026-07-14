import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiService } from './ai.service';

jest.mock('openai');

describe('AiService', () => {
  let service: AiService;
  let configService: jest.Mocked<ConfigService>;
  let createCompletion: jest.Mock;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('fake-api-key'),
    } as unknown as jest.Mocked<ConfigService>;

    createCompletion = jest.fn();
    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: { completions: { create: createCompletion } },
    }));

    service = new AiService(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('initializes the OpenAI client with the configured API key', () => {
      expect(configService.get).toHaveBeenCalledWith('OPENAI_API_KEY');
      expect(OpenAI).toHaveBeenCalledWith({ apiKey: 'fake-api-key' });
    });
  });

  describe('generateChatbotResponse', () => {
    it('returns the stubbed placeholder response without calling OpenAI', async () => {
      const result = await service.generateChatbotResponse('hello');

      expect(result).toBe('To be implemented');
      expect(createCompletion).not.toHaveBeenCalled();
    });
  });

  describe('extractFormattedDatesFromRawPdf', () => {
    it('parses the JSON content returned by the chat completion', async () => {
      const extractedDates = [
        {
          date: '2025-01-01',
          startTime: '09:00',
          endTime: '11:00',
          name: 'Paper 1',
        },
      ];
      createCompletion.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(extractedDates) } }],
      });

      const result = await service.extractFormattedDatesFromRawPdf(
        'raw pdf text',
      );

      expect(result).toEqual(extractedDates);
      expect(createCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'o4-mini',
          messages: [
            expect.objectContaining({ role: 'system' }),
            { role: 'user', content: 'raw pdf text' },
          ],
        }),
      );
    });

    it('propagates a JSON parse error when the model response is not valid JSON', async () => {
      createCompletion.mockResolvedValue({
        choices: [{ message: { content: 'not valid json' } }],
      });

      await expect(
        service.extractFormattedDatesFromRawPdf('raw pdf text'),
      ).rejects.toThrow();
    });
  });
});
