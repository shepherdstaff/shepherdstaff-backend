import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { AiService } from './ai.service';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
