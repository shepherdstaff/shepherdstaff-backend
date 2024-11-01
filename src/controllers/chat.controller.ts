import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessageDto, MessageRequestDto } from 'src/dtos/message.dto';
import { v4 as uuidv4 } from 'uuid';
import { AIService } from '../services/ai.service';

@Controller('api/chat')
export class ChatController {
  private messages: MessageDto[] = [];

  constructor(private readonly aiService: AIService) {}

  @Get('messages')
  async getMessages() {
    return this.messages;
  }

  @Post('messages')
  async createMessage(
    @Body()
    body: MessageRequestDto,
  ) {
    // Add user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: body.content,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(userMessage);

    // Generate AI response
    const aiResponse = await this.aiService.generateChatbotResponse(
      body.content,
      body.context,
    );

    // Add AI message
    const aiMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(aiMessage);

    return aiMessage;
  }
}
