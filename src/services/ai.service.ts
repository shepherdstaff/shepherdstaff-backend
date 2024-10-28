import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
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
