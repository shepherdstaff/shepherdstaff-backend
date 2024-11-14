import { RoleEnum } from '../constants/roles';
import { Mentor } from './mentor';
import { User } from './user';

export class Mentee extends User {
  mentor: Mentor;

  constructor(props?: Partial<Mentee>) {
    super(props);
  }

  getRole(): RoleEnum {
    return RoleEnum.MENTEE;
  }
}
