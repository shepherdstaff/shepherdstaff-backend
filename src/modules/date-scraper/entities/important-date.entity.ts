import { plainToInstance } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ImportantDate } from '../domain/important-date.domain';
import { DateTime } from 'luxon';

@Entity({ name: 'important_date' })
export class ImportantDateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  name: string;

  toImportantDate(): ImportantDate {
    return plainToInstance(ImportantDate, {
      date: DateTime.fromJSDate(this.date),
      startTime: this.startTime,
      endTime: this.endTime,
      name: this.name,
    });
  }

  static from(importantDate: ImportantDate): ImportantDateEntity {
    return plainToInstance(ImportantDateEntity, {
      date: importantDate.date.toJSDate(),
      startTime: importantDate.startTime,
      endTime: importantDate.endTime,
      name: importantDate.name,
    });
  }
}
