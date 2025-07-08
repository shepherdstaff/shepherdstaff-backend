import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { retrieveUserInfoFromRequest } from 'src/utils/helpers';
import { NoteDto } from './dto/note.dto';
import { Request } from 'express';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('/:menteeId')
  async getNotes(@Req() req: Request, @Param('menteeId') menteeId: string) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return (await this.notesService.getNotes(userPayload.userId, menteeId)).map(
      (note) => NoteDto.from(note),
    );
  }

  @Post('/:menteeId')
  async createNote(
    @Req() req: Request,
    @Param('menteeId') menteeId: string,
    @Body() noteDto: NoteDto,
  ) {
    const userPayload = retrieveUserInfoFromRequest(req);
    await this.notesService.createNote(
      userPayload.userId,
      menteeId,
      noteDto.content,
    );
  }

  @Patch('/:menteeId')
  async editNote(
    @Req() req: Request,
    @Param('menteeId') menteeId: string,
    @Body() noteDto: NoteDto,
  ) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return await this.notesService.updateNote(
      userPayload.userId,
      menteeId,
      noteDto.id,
      noteDto.content,
    );
  }

  @Delete('/:menteeId/:noteId')
  async deleteNote(
    @Req() req: Request,
    @Param('menteeId') menteeId: string,
    @Param('noteId') noteId: string,
  ) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return await this.notesService.deleteNote(
      userPayload.userId,
      menteeId,
      noteId,
    );
  }
}
