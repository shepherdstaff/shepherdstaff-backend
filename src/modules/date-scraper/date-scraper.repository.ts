import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportantDateEntity } from './entities/important-date.entity';
import { ImportantDate } from './domain/important-date.domain';

@Injectable()
export class DateScraperRepository {
  constructor(
    @InjectRepository(ImportantDateEntity)
    private readonly dateScraperRepository: Repository<ImportantDateEntity>,
  ) {}

  async saveImportantDates(importantDates: ImportantDate[]): Promise<void> {
    await this.dateScraperRepository.save(
      importantDates.map((date) => ImportantDateEntity.from(date)),
    );
  }

  // Method to fetch all important dates from the database
  async getAllImportantDates(): Promise<ImportantDate[]> {
    const importantDates = await this.dateScraperRepository.find();
    return importantDates.map((date) => date.toImportantDate());
  }
}
