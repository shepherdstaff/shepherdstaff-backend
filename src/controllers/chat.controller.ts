import { Controller, Get, Post, Body } from '@nestjs/common';
import { AIService } from '../services/ai.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('api/chat')
export class ChatController {
  private messages: any[] = [];

  constructor(private readonly aiService: AIService) {}

  @Get('messages')
  async getMessages() {
    return this.messages;
  }

  @Post('messages')
  async createMessage(@Body() body: { content: string; context?: any }) {
    // Add user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: body.content,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(userMessage);

    // Generate AI response
    const aiResponse = await this.aiService.generateResponse(body.content, body.context);
    
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