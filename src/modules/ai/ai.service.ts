import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

const RECOMMENDED_DATE_RESULT_PREFIX = '==RESULT==';
@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateChatbotResponse(
    message: string,
    context?: { mentorId: string; menteeId: string },
  ) {
    // const systemPrompt = await this.buildSystemPromptForChatbot(context);

    // const response = await this.openai.chat.completions.create({
    //   model: 'gpt-4',
    //   messages: [
    //     { role: 'system', content: systemPrompt },
    //     { role: 'user', content: message },
    //   ],
    //   temperature: 0.7,
    //   max_tokens: 500,
    // });

    // return response.choices[0].message.content;
    return 'To be implemented';
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

  // private async buildSystemPromptForChatbot(context?: {
  //   mentorId: string;
  //   menteeId: string;
  // }): Promise<string> {
  //   let prompt = `You are a Christian mentoring assistant, trained to provide biblical guidance and counseling advice.
  //   Your responses should:
  //   - Be grounded in biblical principles
  //   - Include relevant Bible verses when appropriate
  //   - Be compassionate and understanding
  //   - Provide practical, actionable advice
  //   - Maintain confidentiality and ethical boundaries`;

  //   if (context) {
  //     const { menteeId, mentorId } = context;
  //     const menteeName = menteeDb[menteeId][0];
  //     // TODO: reimplement ai chatbot to include prayer requests
  //     // const prayerRequests = await this.noteService.getNotes(
  //     //   mentorId,
  //     //   menteeId,
  //     // );

  //     prompt += `\n\nYou are currently helping with mentoring ${menteeName}.`;

  //     // prompt += `\n\nRecent prayer requests from ${menteeName}:\n${prayerRequests.map((prayer) => prayer.toString()).join('\n')}`;
  //   }

  //   return prompt;
  // }
}
