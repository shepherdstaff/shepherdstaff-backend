import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  menteeAvailabilityDb,
  mentorAvailabilityDb,
} from 'src/hacked-database';

const RECOMMENDED_DATE_RESULT_PREFIX = '==RESULT==';
@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateRecommendedDate(mentorId: string, menteeId: string) {
    const mentorEvents = mentorAvailabilityDb[mentorId];
    const menteeEvents = menteeAvailabilityDb[menteeId];

    const prompt = `You are an appointment scheduler that recommends dates and timings for a mentor and mentee based on their availabilities. 
      All persons have an array of events representing the events that they already have scheduled. These is the array for the mentor: \n
      ${JSON.stringify(mentorEvents)}\n
      
      This is the array for the mentee:\n
      ${JSON.stringify(menteeEvents)}\n
      
      Please recommend the next closest available date time for the two persons to meet. 
      The recommended date time should take place between 9am to 8pm. 
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

  async generateResponse(
    message: string,
    context?: {
      menteeId?: string;
      menteeName?: string;
      recentNotes?: string[];
      recentPrayerRequests?: string[];
    },
  ) {
    const systemPrompt = this.buildSystemPrompt(context);

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

  private buildSystemPrompt(context?: {
    menteeId?: string;
    menteeName?: string;
    recentNotes?: string[];
    recentPrayerRequests?: string[];
  }): string {
    let prompt = `You are a Christian mentoring assistant, trained to provide biblical guidance and counseling advice. 
    Your responses should:
    - Be grounded in biblical principles
    - Include relevant Bible verses when appropriate
    - Be compassionate and understanding
    - Provide practical, actionable advice
    - Maintain confidentiality and ethical boundaries`;

    if (context?.menteeName) {
      prompt += `\n\nYou are currently helping with mentoring ${context.menteeName}.`;

      if (context.recentNotes?.length) {
        prompt += `\n\nRecent notes about ${context.menteeName}:\n${context.recentNotes.join('\n')}`;
      }

      if (context.recentPrayerRequests?.length) {
        prompt += `\n\nRecent prayer requests from ${context.menteeName}:\n${context.recentPrayerRequests.join('\n')}`;
      }
    }

    return prompt;
  }
}
