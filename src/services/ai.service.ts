import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  menteeAvailabilityDb,
  menteeDb,
  mentorAvailabilityDb,
} from 'src/hacked-database';
import { NoteService } from '../modules/users/services/note.service';

const RECOMMENDED_DATE_RESULT_PREFIX = '==RESULT==';
@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    @Inject(NoteService) private noteService: NoteService,
  ) {
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
    context?: {
      mentorId: string;
      menteeId: string;
    },
  ) {
    const systemPrompt = await this.buildSystemPrompt(context);

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

  private async buildSystemPrompt(context?: {
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
      const prayerRequests = await this.noteService.getNotes(
        mentorId,
        menteeId,
      );

      prompt += `\n\nYou are currently helping with mentoring ${menteeName}.`;

      prompt += `\n\nRecent prayer requests from ${menteeName}:\n${prayerRequests.map((prayer) => prayer.toString()).join('\n')}`;
    }

    return prompt;
  }
}
