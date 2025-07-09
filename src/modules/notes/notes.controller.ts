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
import { NoteResponseDto } from './dto/response/note-response.dto';
import { Request } from 'express';
import { CreateNoteRequestDto } from './dto/request/create-note-request.dto';
import { UpdateNoteRequestDto } from './dto/request/update-note-request.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('/:menteeId')
  @ApiOperation({
    summary: 'Get all notes for a specific mentee',
    description: 'Retrieves all notes associated with the specified mentee ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all notes for the specified mentee',
    type: [NoteResponseDto],
  })
  async getNotes(
    @Req() req: Request,
    @Param('menteeId') menteeId: string,
  ): Promise<NoteResponseDto[]> {
    const userPayload = retrieveUserInfoFromRequest(req);
    return (await this.notesService.getNotes(userPayload.userId, menteeId)).map(
      (note) => NoteResponseDto.from(note),
    );
  }

  @Post('/:menteeId')
  @ApiOperation({
    summary: 'Create a new note for a mentee',
    description:
      'Creates a new note for the specified mentee with the given content.',
  })
  async createNote(
    @Req() req: Request,
    @Param('menteeId') menteeId: string,
    @Body() noteDto: CreateNoteRequestDto,
  ) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return await this.notesService.createNote(
      userPayload.userId,
      menteeId,
      noteDto.content,
    );
  }

  @Patch('/:menteeId')
  @ApiOperation({
    summary: 'Edit an existing note for a mentee',
    description:
      'Updates the content of an existing note for the specified mentee.',
  })
  async editNote(
    @Req() req: Request,
    @Param('menteeId') menteeId: string,
    @Body() noteDto: UpdateNoteRequestDto,
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
  @ApiOperation({
    summary: 'Delete a note for a mentee',
    description: 'Deletes the specified note for the given mentee.',
  })
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
