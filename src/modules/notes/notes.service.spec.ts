import { BadRequestException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';

describe('NotesService', () => {
  let service: NotesService;
  let notesRepository: jest.Mocked<NotesRepository>;

  const mentorId = 'mentor-1';
  const menteeId = 'mentee-1';
  const noteId = 'note-1';

  beforeEach(() => {
    notesRepository = {
      getNotes: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
      findNoteById: jest.fn(),
    } as unknown as jest.Mocked<NotesRepository>;

    service = new NotesService(notesRepository);
  });

  describe('getNotes', () => {
    it('returns notes from the repository for the mentor-mentee pair', async () => {
      const notes = [{ id: noteId, content: 'hello' }] as any;
      notesRepository.getNotes.mockResolvedValue(notes);

      const result = await service.getNotes(mentorId, menteeId);

      expect(notesRepository.getNotes).toHaveBeenCalledWith(
        mentorId,
        menteeId,
      );
      expect(result).toBe(notes);
    });
  });

  describe('createNote', () => {
    it('builds a Note domain object and persists it via the repository', async () => {
      notesRepository.createNote.mockResolvedValue({ id: noteId });

      const result = await service.createNote(
        mentorId,
        menteeId,
        'some content',
      );

      expect(notesRepository.createNote).toHaveBeenCalledWith(
        mentorId,
        menteeId,
        expect.objectContaining({ content: 'some content' }),
      );
      expect(result).toEqual({ id: noteId });
    });
  });

  describe('updateNote', () => {
    it('updates the note when it belongs to the mentor-mentee pair', async () => {
      notesRepository.findNoteById.mockResolvedValue({
        fromUser: { id: mentorId },
        toUser: { id: menteeId },
      } as any);

      await service.updateNote(mentorId, menteeId, noteId, 'new content');

      expect(notesRepository.updateNote).toHaveBeenCalledWith(
        noteId,
        'new content',
      );
    });

    it('throws BadRequestException when the note does not exist', async () => {
      notesRepository.findNoteById.mockResolvedValue(null);

      await expect(
        service.updateNote(mentorId, menteeId, noteId, 'new content'),
      ).rejects.toThrow(BadRequestException);
      expect(notesRepository.updateNote).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the note belongs to a different mentor-mentee pair', async () => {
      notesRepository.findNoteById.mockResolvedValue({
        fromUser: { id: 'someone-else' },
        toUser: { id: menteeId },
      } as any);

      await expect(
        service.updateNote(mentorId, menteeId, noteId, 'new content'),
      ).rejects.toThrow(BadRequestException);
      expect(notesRepository.updateNote).not.toHaveBeenCalled();
    });
  });

  describe('deleteNote', () => {
    it('deletes the note when it belongs to the mentor-mentee pair', async () => {
      notesRepository.findNoteById.mockResolvedValue({
        fromUser: { id: mentorId },
        toUser: { id: menteeId },
      } as any);

      await service.deleteNote(mentorId, menteeId, noteId);

      expect(notesRepository.deleteNote).toHaveBeenCalledWith(noteId);
    });

    it('throws BadRequestException and does not delete when the note belongs to another mentee', async () => {
      notesRepository.findNoteById.mockResolvedValue({
        fromUser: { id: mentorId },
        toUser: { id: 'different-mentee' },
      } as any);

      await expect(
        service.deleteNote(mentorId, menteeId, noteId),
      ).rejects.toThrow(BadRequestException);
      expect(notesRepository.deleteNote).not.toHaveBeenCalled();
    });
  });
});
