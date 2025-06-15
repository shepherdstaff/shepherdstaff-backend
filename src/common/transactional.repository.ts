import { QueryRunner, Repository } from 'typeorm';

export class TransactionalRepository<T> {
  useRepository(localRepository: Repository<T>, queryRunner?: QueryRunner) {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(localRepository.target)
      : localRepository;
    return repo;
  }
}
