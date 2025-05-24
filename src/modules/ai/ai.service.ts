import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  menteeAvailabilityDb,
  menteeDb,
  mentorAvailabilityDb,
} from 'src/hacked-database';

const RECOMMENDED_DATE_RESULT_PREFIX = '==RESULT==';
@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  // DEPRECATED: This function is not used anymore - was part of legacy code for #HACK2024 prototype
  async generateRecommendedDate(mentorId: string, menteeId: string) {
    const mentorEvents = mentorAvailabilityDb[mentorId];
    const menteeEvents = menteeAvailabilityDb[menteeId];

    const prompt = `You are an appointment scheduler that recommends dates and timings for a mentor and mentee based on their availabilities. 
      All persons have an array of events representing the events that they already have scheduled. These is the array for the mentor: \n
      ${JSON.stringify(mentorEvents)}\n
      
      This is the array for the mentee:\n
      ${JSON.stringify(menteeEvents)}\n
      
      Please recommend the next closest available date time for the two persons to meet. Assume that the meeting will take place for 2 hours.
      The recommended date time should take place between 9am to 8pm. Please check carefully that the recommended date time does not clash with any existing scheduled event.
      The current date time is ${new Date().toISOString()}. Provide the date time as an ISO string prefixed with ${RECOMMENDED_DATE_RESULT_PREFIX}. 
      Only recommend the date time, no code or explanation is needed.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return new Date(
      response.choices[0].message.content
        .replace(RECOMMENDED_DATE_RESULT_PREFIX, '')
        .trim(),
    );
  }

  async generateChatbotResponse(
    message: string,
    context?: { mentorId: string; menteeId: string },
  ) {
    const systemPrompt = await this.buildSystemPromptForChatbot(context);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  }

  async extractFormattedDatesFromRawPdf(rawPdfText: string) {
    const systemPrompt = `You will be given raw, unformatted text extracted from the parsing of a PDF file. 
    This text represents a timetable or schedule of examination dates, and other important dates. 
    Your task is to extract the dates and return them in a structured format.
    Please provide the scraped data as a list of JSON objects, with each object having the following structure:
    {
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "name": "Event name/description"
    }
      
    Extract dates from the entire text. Do not include any other text or explanation.`;

    const response = await this.openai.chat.completions.create({
      model: 'o4-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: rawPdfText,
        },
      ],
    });

    return JSON.parse(response.choices[0].message.content);
  }

  private async buildSystemPromptForChatbot(context?: {
    mentorId: string;
    menteeId: string;
  }): Promise<string> {
    let prompt = `You are a Christian mentoring assistant, trained to provide biblical guidance and counseling advice. 
    Your responses should:
    - Be grounded in biblical principles
    - Include relevant Bible verses when appropriate
    - Be compassionate and understanding
    - Provide practical, actionable advice
    - Maintain confidentiality and ethical boundaries`;

    if (context) {
      const { menteeId, mentorId } = context;
      const menteeName = menteeDb[menteeId][0];
      // TODO: reimplement ai chatbot to include prayer requests
      // const prayerRequests = await this.noteService.getNotes(
      //   mentorId,
      //   menteeId,
      // );

      prompt += `\n\nYou are currently helping with mentoring ${menteeName}.`;

      // prompt += `\n\nRecent prayer requests from ${menteeName}:\n${prayerRequests.map((prayer) => prayer.toString()).join('\n')}`;
    }

    return prompt;
  }
}
