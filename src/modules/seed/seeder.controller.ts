import { Controller, Get, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { Public } from 'src/decorators/public.decorator';
import { UserService } from '../users/services/user.service';

@Controller('seeder')
export class SeederController {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  @Get()
  @Public()
  async seedTestData() {
    // Check if env is not test or dev, if so then block seeder from running
    const currentEnv = this.configService.get<string>('NODE_ENV');
    if (currentEnv !== 'test' && currentEnv !== 'dev') {
      Logger.error('Attempt to run seeder failed - non-development env');
      return new UnauthorizedException('Attempt to run seeder failed');
    }

    const mentor1Name = 'John Doe';
    const mentor1Email = 'mentor1@shepherdstaff.com';
    const mentor1BirthDate = DateTime.fromISO(
      '1990-01-10T16:08:49Z',
    ).toJSDate();
    const mentor1User = 'mentor1';
    const mentor1Pass = 'mentor1';

    const mentor1 = await this.userService.createNewMentor(
      mentor1Name,
      mentor1BirthDate,
      mentor1Email,
      mentor1User,
      mentor1Pass,
    );

    const mentee1Name = 'Bob Smith';
    const mentee1Email = 'mentee1@shepherdstaff.com';
    const mentee1BirthDate = DateTime.fromISO(
      '2010-01-10T16:08:49Z',
    ).toJSDate();
    await this.userService.createNewMentee(
      mentor1.id,
      mentee1Name,
      mentee1BirthDate,
      mentee1Email,
    );
  }
}
