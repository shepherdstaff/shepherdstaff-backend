import { DateTime } from 'luxon';

export class Note {
  id: string;
  content: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
