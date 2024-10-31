import { randomUUID } from 'crypto';

export class Prayer {
  id: string;
  content: string;
  date: Date;

  constructor(content: string, date: Date) {
    (this.id = randomUUID()), (this.content = content), (this.date = date);
  }

  toString(): string {
    return this.content;
  }
}
