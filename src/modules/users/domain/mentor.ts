import { RoleEnum } from '../constants/roles';
import { Mentee } from './mentee';
import { User } from './user';

export class Mentor extends User {
  mentees: Mentee[];

  constructor(props?: Partial<Mentor>) {
    super(props);
  }

  getRole(): RoleEnum {
    return RoleEnum.MENTOR;
  }
}
